import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';
import { convertToModelMessages, type UIMessage } from 'ai';
import type { Database, Json } from '@/integrations/supabase/types';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const Route = createFileRoute('/api/chat')({
  server: { handlers: { POST: async ({ request }) => {
    const token = request.headers.get('authorization')?.replace(/^Bearer /, '');
    if (!token || token.split('.').length !== 3) return Response.json({ message: 'Sign in to use SYNTRIX Copilot.' }, { status: 401 });
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    const aiKey = process.env['LOVABLE_API_KEY'];
    if (!url || !key || !aiKey) return Response.json({ message: 'Copilot is not configured yet.' }, { status: 503 });
    const db = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` }, fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
        headers.set('apikey', key);
        return fetch(input, { ...init, headers });
      } },
    });
    const { data: identity, error: authError } = await db.auth.getUser(token);
    if (authError || !identity.user) return Response.json({ message: 'Your session has expired. Sign in again.' }, { status: 401 });
    let body: { messages?: UIMessage[] };
    try { body = await request.json(); } catch { return Response.json({ message: 'Invalid request.' }, { status: 400 }); }
    const messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 40 || JSON.stringify(messages).length > 120000 || messages.at(-1)?.role !== 'user') return Response.json({ message: 'Please send a shorter message.' }, { status: 400 });
    if (messages.some(m => !m || typeof m.id !== 'string' || (m.role !== 'user' && m.role !== 'assistant') || !Array.isArray(m.parts))) return Response.json({ message: 'Invalid conversation.' }, { status: 400 });
    const clean: UIMessage[] = messages.map(message => ({
      id: message.id, role: message.role,
      parts: message.parts.reduce<UIMessage['parts']>((parts, part) => {
        if (part.type === 'text' && typeof part.text === 'string') return [...parts, { type: 'text', text: part.text }];
        if (message.role === 'assistant' && part.type === 'reasoning' && typeof part.text === 'string') return [...parts, { type: 'reasoning', text: part.text, ...(part.providerMetadata ? { providerMetadata: part.providerMetadata } : {}) }];
        return parts;
      }, []),
    }));
    const latest = clean.at(-1);
    if (!latest?.parts.some(part => part.type === 'text' && part.text.trim())) return Response.json({ message: 'Enter a question first.' }, { status: 400 });
    const { error: saveError } = await db.from('copilot_conversations').upsert({ user_id: identity.user.id, messages: clean as unknown as Json }, { onConflict: 'user_id' });
    if (saveError) return Response.json({ message: 'Could not save your question.' }, { status: 500 });
    try {
      const modelMessages = await convertToModelMessages(clean);
      const { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId, withLovableAiGatewayRunIdHeader } = await import('@/lib/run-id.server');
      const run = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
      const provider = createOpenAI({ baseURL: 'https://ai.gateway.lovable.dev/v1', apiKey: aiKey, headers: { 'Lovable-API-Key': aiKey, 'X-Lovable-AIG-SDK': 'vercel-ai-sdk' }, fetch: run.fetch });
      const result = streamText({
        model: provider.responses('openai/gpt-6-astra'),
        system: 'You are SYNTRIX, a rigorous biotechnology research copilot. Explain biology, bioinformatics and experimental design clearly. Distinguish established evidence from hypotheses. Never invent publications, datasets, citations, results or experiments. If asked for medical advice, provide educational context and encourage qualified clinical advice. Do not claim access to a project or dataset unless content was actually provided. Keep responses concise and useful.',
        messages: modelMessages,
        abortSignal: request.signal,
        providerOptions: { openai: { forceReasoning: true, reasoningEffort: 'medium', reasoningSummary: 'auto', store: false, include: ['reasoning.encrypted_content'] } },
      });
      const stream = result.toUIMessageStreamResponse({
        originalMessages: clean,
        sendReasoning: true,
        onFinish: async ({ messages: completed }) => {
          const stored = completed.map(m => ({ id: m.id, role: m.role, parts: m.parts.flatMap(p => { if (p.type === 'text') return [{ type: 'text', text: p.text }]; if (p.type === 'reasoning') return [{ type: 'reasoning', text: p.text, ...(p.providerMetadata ? { providerMetadata: p.providerMetadata } : {}) }]; return []; }) }));
          const { error } = await db.from('copilot_conversations').upsert({ user_id: identity.user.id, messages: stored as Json }, { onConflict: 'user_id' });
          if (error) console.error('Copilot save failed:', error.message);
        },
        onError: error => error instanceof Error ? error.message : 'The AI request failed.',
      });
      return withLovableAiGatewayRunIdHeader(stream, run);
    } catch (error) {
      console.error('Copilot request failed:', error);
      return Response.json({ message: error instanceof Error ? error.message : 'Copilot is unavailable.' }, { status: 500 });
    }
  } } },
});
