import { createFileRoute, Link } from '@tanstack/react-router';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Database, Dna, FlaskConical, FolderOpen, LockKeyhole, MessageSquareText, ShieldCheck, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Core } from '@/components/syntrix/Core';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, type PromptInputMessage } from '@/components/ai-elements/prompt-input';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/tool';
import { supabase } from '@/integrations/supabase/client';
import { getCopilotHistory } from '@/lib/copilot.functions';

export const Route = createFileRoute('/copilot')({
  head: () => ({ meta: [{ title: 'AI Copilot | SYNTRIX' }, { name: 'description', content: 'Explore biotechnology questions with the SYNTRIX AI research copilot.' }, { property: 'og:title', content: 'SYNTRIX AI Copilot' }, { property: 'og:description', content: 'An AI research workspace for exploring biology and bioinformatics.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Copilot,
});
const prompts = ['Explain CRISPR off-target effects', 'How does RNA-seq analysis work?', 'Compare PCR and qPCR', 'Help structure a research hypothesis'];
function Copilot() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<UIMessage[]>([]);
  const [authError, setAuthError] = useState('');
  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setUserId(data.user?.id ?? null);
      if (data.user) {
        try { const messages = await getCopilotHistory(); if (active) setHistory(messages); }
        catch { if (active) setAuthError('Your saved conversation could not be loaded.'); }
      }
      if (active) setLoading(false);
    };
    load();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => { if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') { setLoading(true); load(); } });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);
  return <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1700px] flex-col"><div className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-9"><div><div className="font-mono text-[10px] tracking-[.18em] text-primary">RESEARCH INTELLIGENCE / LIVE</div><h1 className="mt-1 text-2xl font-medium">SYNTRIX <span className="text-muted-foreground">Copilot</span></h1></div><span className="hidden items-center gap-2 font-mono text-[10px] text-muted-foreground sm:flex"><span className="size-1.5 rounded-full bg-emerald" /> GROUNDED IN CURIOSITY</span></div>
    {loading ? <div className="flex flex-1 items-center justify-center font-mono text-xs text-muted-foreground">CONNECTING TO RESEARCH ENVIRONMENT...</div> : userId ? <ChatWorkspace key={userId} history={history} authError={authError} /> : <SignInPanel />}</div>;
}
function ChatWorkspace({ history, authError }: { history: UIMessage[]; authError: string }) {
  const transport = useMemo(() => new DefaultChatTransport({ api: '/api/chat', headers: async () => { const { data } = await supabase.auth.getSession(); return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}; } }), []);
  const { messages, sendMessage, status, stop, error } = useChat({ messages: history, transport });
  const input = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState('');
  const busy = status === 'submitted' || status === 'streaming';
  useEffect(() => { if (!busy) input.current?.focus(); }, [busy]);
  const submit = (message: PromptInputMessage) => { const value = (message.text || text).trim(); if (!value || busy) return; setText(''); sendMessage({ text: value }); input.current?.focus(); };
  return <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_260px]">
    <div className="flex min-h-[calc(100vh-150px)] min-w-0 flex-col lg:min-h-0"><div className="flex items-center justify-between border-b border-border px-5 py-3 sm:px-9"><div className="flex items-center gap-2 text-xs text-foreground"><MessageSquareText className="size-4 text-primary" /> Research conversation</div><span className="font-mono text-[10px] text-muted-foreground">PRIVATE · SAVED TO CLOUD</span></div>
      <Conversation className="min-h-[400px] flex-1"><ConversationContent className="mx-auto w-full max-w-[820px] gap-7 px-5 py-8 sm:px-9">{messages.length === 0 && <div className="flex min-h-[360px] flex-col items-start justify-center"><Core compact /><div className="mt-5 font-mono text-[10px] tracking-[.2em] text-primary">SYNTRIX INTELLIGENCE ONLINE</div><h2 className="mt-3 text-3xl font-medium">What are you exploring?</h2><p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">Ask about biological concepts, experimental approaches or data interpretation. Bring the question; we’ll work through the evidence together.</p><div className="mt-7 flex max-w-2xl flex-wrap gap-2">{prompts.map(prompt => <Button key={prompt} variant="outline" onClick={() => sendMessage({ text: prompt })} disabled={busy} className="h-auto whitespace-normal border-border bg-surface px-3 py-2 text-left text-xs font-normal hover:border-primary/40">{prompt} <ArrowUpRight className="size-3" /></Button>)}</div></div>}
      {messages.map(message => <Message key={message.id} from={message.role} className="max-w-[90%]"><div className="mb-1 font-mono text-[10px] tracking-[.12em] text-muted-foreground">{message.role === 'user' ? 'YOU' : 'SYNTRIX / COPILOT'}</div><MessageContent className={message.role === 'user' ? 'border border-border bg-secondary text-secondary-foreground' : 'w-full bg-transparent'}>{message.parts.map((part, i) => part.type === 'text' ? <MessageResponse key={i}>{part.text}</MessageResponse> : part.type === 'reasoning' ? <div key={i} className="border-l border-violet pl-3 text-xs text-muted-foreground">{part.text}</div> : part.type.startsWith('tool-') || part.type === 'dynamic-tool' ? <Tool key={i} defaultOpen={false}><ToolHeader type={part.type as 'dynamic-tool'} state={'state' in part ? part.state as 'input-available' : 'input-available'} toolName={part.type === 'dynamic-tool' && 'toolName' in part ? String(part.toolName) : part.type.slice(5)} /><ToolContent><ToolInput input={'input' in part ? part.input : {}} /><ToolOutput output={'output' in part ? part.output : undefined} errorText={'errorText' in part ? String(part.errorText) : undefined} /></ToolContent></Tool> : null)}</MessageContent></Message>)}
      {status === 'submitted' && <div className="flex items-center gap-2 font-mono text-xs text-primary"><span className="size-1.5 animate-pulse rounded-full bg-primary" /><Shimmer>Thinking through the evidence...</Shimmer></div>}
      </ConversationContent><ConversationScrollButton /></Conversation>
      <div className="border-t border-border bg-background px-5 py-4 sm:px-9"><div className="mx-auto max-w-[820px]">{(error || authError) && <div role="alert" className="mb-3 border-l-2 border-destructive bg-destructive/10 px-3 py-2 text-xs text-destructive">{error?.message || authError}</div>}<PromptInput onSubmit={submit} className="border-border bg-surface"><PromptInputTextarea ref={input} autoFocus value={text} onChange={e => setText(e.target.value)} placeholder="Ask a biology or research question..." className="min-h-[70px] resize-none" /><PromptInputFooter className="justify-between px-3 pb-2"><span className="font-mono text-[10px] text-muted-foreground">EVIDENCE FIRST · ALWAYS VERIFY</span><PromptInputSubmit status={status} onStop={stop} disabled={!text.trim() && !busy} className="size-8" /></PromptInputFooter></PromptInput><p className="mt-2 text-center text-[10px] text-muted-foreground">AI-generated research guidance can be mistaken. Verify important claims independently.</p></div></div>
    </div>
    <aside className="hidden border-l border-border bg-sidebar/60 px-5 py-6 lg:block"><div className="font-mono text-[10px] tracking-[.18em] text-primary">RESEARCH CONTEXT</div><h2 className="mt-2 text-lg font-medium">Workspace</h2><p className="mt-2 text-xs leading-6 text-muted-foreground">Your active research context appears here when projects and datasets are available.</p><div className="mt-8 space-y-0">{[[FolderOpen,'Current project'],[Database,'Current dataset'],[FlaskConical,'Current experiment'],[Dna,'Relevant concepts'],[ShieldCheck,'Saved insights']].map(([Icon,label]) => { const IconComponent = Icon as typeof FolderOpen; return <div key={label as string} className="flex items-center gap-3 border-t border-border py-4 text-xs"><IconComponent className="size-4 text-muted-foreground" /><span>{label as string}</span><span className="ml-auto font-mono text-[10px] text-muted-foreground">NONE</span></div>; })}</div><div className="mt-8 border border-border bg-surface p-4"><LockKeyhole className="size-4 text-emerald" /><div className="mt-3 text-xs font-medium">Private by design</div><p className="mt-2 text-xs leading-5 text-muted-foreground">This conversation is saved to your account, not shared with other researchers.</p></div></aside>
  </div>;
}
function SignInPanel() {
  const [email,setEmail] = useState(''); const [password,setPassword] = useState(''); const [mode,setMode] = useState<'sign-in'|'sign-up'>('sign-in'); const [error,setError] = useState(''); const [notice,setNotice] = useState(''); const [pending,setPending] = useState(false);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setPending(true); setError(''); setNotice(''); const result = mode === 'sign-in' ? await supabase.auth.signInWithPassword({ email,password }) : await supabase.auth.signUp({ email,password }); if (result.error) setError(result.error.message); else if (mode === 'sign-up' && !result.data.session) setNotice('Check your email to confirm your account, then sign in.'); setPending(false); };
  const google = async () => { setError(''); const { lovable } = await import('@/integrations/lovable'); const result = await lovable.auth.signInWithOAuth('google',{ redirect_uri: window.location.origin + '/copilot' }); if (result.error) setError(result.error.message); };
  return <div className="flex flex-1 items-center justify-center px-5 py-12"><div className="w-full max-w-[410px]"><div className="mx-auto w-fit"><Core compact /></div><div className="mt-5 text-center font-mono text-[10px] tracking-[.18em] text-primary">PRIVATE RESEARCH WORKSPACE</div><h2 className="mt-3 text-center text-2xl font-medium">Sign in to SYNTRIX</h2><p className="mt-3 text-center text-sm leading-6 text-muted-foreground">Your Copilot conversation stays with your account, across sessions and devices.</p><form onSubmit={submit} className="mt-8 space-y-3"><label className="block text-xs text-muted-foreground">Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 h-10 w-full border border-input bg-surface px-3 text-foreground outline-none focus:border-primary" /></label><label className="block text-xs text-muted-foreground">Password<input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="mt-2 h-10 w-full border border-input bg-surface px-3 text-foreground outline-none focus:border-primary" /></label>{error && <p role="alert" className="text-xs text-destructive">{error}</p>}{notice && <p role="status" className="text-xs text-emerald">{notice}</p>}<Button className="h-10 w-full" disabled={pending}>{pending ? 'Please wait...' : mode === 'sign-in' ? 'Sign in' : 'Create account'}</Button></form><div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />OR<span className="h-px flex-1 bg-border" /></div><Button type="button" variant="outline" className="h-10 w-full border-border" onClick={google}>Continue with Google</Button><Button type="button" variant="ghost" className="mt-4 w-full text-xs text-muted-foreground" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setError(''); }}>{mode === 'sign-in' ? 'New here? Create an account' : 'Already have an account? Sign in'}</Button><div className="mt-6 text-center"><Link to="/command-center" className="text-xs text-muted-foreground hover:text-primary">Back to Command Center</Link></div></div></div>;
}
