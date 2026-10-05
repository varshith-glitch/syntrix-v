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
  const [error, setError] = useState('');
  useEffect(() => {
    let done = false;
    const finish = () => { if (!done) { done = true; navigate({ to: '/copilot', replace: true }); } };
    const run = async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.slice(1));
      const err = url.searchParams.get('error_description') || hash.get('error_description');
      if (err) { setError(err.replace(/\+/g, ' ')); return; }
      const code = url.searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) { setError(error.message); return; }
      }
      const tokenHash = url.searchParams.get('token_hash');
      const type = url.searchParams.get('type');
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as 'signup' | 'email' | 'magiclink' | 'recovery' | 'invite' | 'email_change' });
        if (error) { setError(error.message); return; }
      }
      const access = hash.get('access_token'); const refresh = hash.get('refresh_token');
      if (access && refresh) {
        const { error } = await supabase.auth.setSession({ access_token: access, refresh_token: refresh });
        if (error) { setError(error.message); return; }
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) finish();
      else setTimeout(async () => { const { data: again } = await supabase.auth.getSession(); if (again.session) finish(); else setError('This link has expired or was already used. Please sign in again.'); }, 1500);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => { if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) finish(); });
    run();
    return () => { done = true; sub.subscription.unsubscribe(); };
  }, [navigate]);
  return <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-5"><div className="max-w-sm text-center"><div className="mx-auto w-fit"><Core compact /></div>
    {error ? <><h1 className="mt-5 text-xl font-medium">We couldn’t finish signing you in</h1><p role="alert" className="mt-3 text-sm text-destructive">{error}</p><Button asChild className="mt-6"><Link to="/copilot">Back to sign in</Link></Button></>
      : <><h1 className="mt-5 text-xl font-medium">Verifying your account…</h1><p className="mt-3 font-mono text-[10px] tracking-[.16em] text-muted-foreground">ESTABLISHING SECURE SESSION</p></>}
  </div></div>;
}
