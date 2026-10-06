import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Core } from '@/components/syntrix/Core';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/auth/callback')({
  ssr: false,
  head: () => ({ meta: [{ title: 'Signing in | SYNTRIX' }, { name: 'description', content: 'Completing your SYNTRIX sign-in.' }, { property: 'og:title', content: 'Signing in | SYNTRIX' }, { property: 'og:description', content: 'Completing your SYNTRIX account verification.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [state, setState] = useState<'working' | 'success' | 'expired' | 'error'>('working');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [resend, setResend] = useState('');
  useEffect(() => {
    let done = false; let timer: ReturnType<typeof setTimeout> | undefined;
    const fail = (msg: string) => { if (done) return; done = true; const expired = /expired|invalid|already|used|otp/i.test(msg); setError(msg); setState(expired ? 'expired' : 'error'); };
    const succeed = () => { if (done) return; done = true; setState('success'); timer = setTimeout(() => navigate({ to: '/copilot', replace: true }), 1600); };
    const run = async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.slice(1));
      const err = url.searchParams.get('error_description') || hash.get('error_description');
      if (err) return fail(err.replace(/\+/g, ' '));
      const code = url.searchParams.get('code');
      if (code) { const { error } = await supabase.auth.exchangeCodeForSession(code); if (error) { const { data } = await supabase.auth.getSession(); return data.session ? succeed() : fail(error.message); } }
      const tokenHash = url.searchParams.get('token_hash'); const type = url.searchParams.get('type');
      if (tokenHash && type) { const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as 'signup' | 'email' | 'magiclink' | 'recovery' | 'invite' | 'email_change' }); if (error) return fail(error.message); }
      const access = hash.get('access_token'); const refresh = hash.get('refresh_token');
      if (access && refresh) { const { error } = await supabase.auth.setSession({ access_token: access, refresh_token: refresh }); if (error) return fail(error.message); }
      const { data } = await supabase.auth.getSession();
      if (data.session) succeed();
      else setTimeout(async () => { const { data: again } = await supabase.auth.getSession(); if (again.session) succeed(); else fail('This verification link has expired or was already used.'); }, 1500);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => { if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) succeed(); });
    run();
    return () => { done = true; if (timer) clearTimeout(timer); sub.subscription.unsubscribe(); };
  }, [navigate]);
  const sendAgain = async (e: React.FormEvent) => { e.preventDefault(); setResend('Sending…'); const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: window.location.origin + '/auth/callback' } }); setResend(error ? error.message : 'New verification link sent. Check your inbox (and spam).'); };
  return <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-5"><div className="w-full max-w-sm text-center"><div className="mx-auto w-fit"><Core compact /></div>
    {state === 'working' && <><h1 className="mt-5 text-xl font-medium">Verifying your account…</h1><p className="mt-3 font-mono text-[10px] tracking-[.16em] text-muted-foreground">ESTABLISHING SECURE SESSION</p></>}
    {state === 'success' && <><h1 className="mt-5 text-xl font-medium text-emerald">Email verified</h1><p className="mt-3 text-sm text-muted-foreground">You're signed in. Taking you to Copilot…</p><Button asChild className="mt-6"><Link to="/copilot">Continue now</Link></Button></>}
    {state === 'expired' && <><h1 className="mt-5 text-xl font-medium">This link has expired</h1><p className="mt-3 text-sm text-muted-foreground">Verification links work once and expire after a while. If you already verified, just sign in. Otherwise, get a new link.</p>
      <form onSubmit={sendAgain} className="mt-5 flex gap-2"><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@lab.org" className="h-9 min-w-0 flex-1 border border-border bg-surface px-3 text-sm" /><Button type="submit" size="sm" className="h-9">Resend</Button></form>
      {resend && <p role="status" className="mt-3 text-xs text-muted-foreground">{resend}</p>}<Button asChild variant="outline" className="mt-5"><Link to="/copilot">Go to sign in</Link></Button></>}
    {state === 'error' && <><h1 className="mt-5 text-xl font-medium">We couldn't finish signing you in</h1><p role="alert" className="mt-3 text-sm text-destructive">{error}</p><Button asChild className="mt-6"><Link to="/copilot">Back to sign in</Link></Button></>}
  </div></div>;
}
