import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getCopilotHistory = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from('copilot_conversations').select('messages').eq('user_id', context.userId).maybeSingle();
    if (error) throw new Error('Could not load your conversation.');
    return (Array.isArray(data?.messages) ? data.messages : []).map(message => {
      if (!message || typeof message !== 'object' || Array.isArray(message)) return null;
      const item = message as Record<string, unknown>;
      if (typeof item['id'] !== 'string' || (item['role'] !== 'user' && item['role'] !== 'assistant') || !Array.isArray(item['parts'])) return null;
      return { id: item['id'], role: item['role'], parts: item['parts'].filter((p): p is { type: 'text' | 'reasoning'; text: string; providerMetadata?: Record<string, unknown> } => !!p && typeof p === 'object' && !Array.isArray(p) && (p.type === 'text' || p.type === 'reasoning') && typeof p.text === 'string').map(p => ({ type: p.type, text: p.text, ...(p.providerMetadata ? { providerMetadata: p.providerMetadata } : {}) })) };
    }).filter((m): m is { id: string; role: 'user' | 'assistant'; parts: { type: 'text' | 'reasoning'; text: string; providerMetadata?: Record<string, unknown> }[] } => m !== null);
  });
