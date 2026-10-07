import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { Activity, Atom, Bell, BookOpen, BrainCircuit, ChartNoAxesCombined, ChevronLeft, ChevronRight, CircleDot, Command as CommandIcon, Compass, Dna, FileText, FlaskConical, FolderKanban, Hexagon, Lightbulb, Menu, Microscope, Network, Search, Settings, ShieldCheck, Users, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export const nav = [
  { label: 'Command Center', path: '/command-center', icon: Activity, group: 'WORKSPACE', ready: true },
  { label: 'AI Copilot', path: '/copilot', icon: BrainCircuit, group: 'WORKSPACE', ready: true },
  { label: 'Data Lab', path: '/data-lab', icon: ChartNoAxesCombined, group: 'LABORATORY' },
  { label: 'BioSim', path: '/biosim', icon: CircleDot, group: 'LABORATORY' },
  { label: 'Molecular Lab', path: '/molecular-lab', icon: Atom, group: 'LABORATORY' },
  { label: 'Research Studio', path: '/research', icon: Microscope, group: 'DISCOVERY' },
  { label: 'Hypothesis Engine', path: '/hypothesis', icon: Lightbulb, group: 'DISCOVERY' },
  { label: 'Knowledge Graph', path: '/knowledge', icon: Network, group: 'DISCOVERY' },
  { label: 'Innovation Radar', path: '/innovation', icon: Compass, group: 'DISCOVERY' },
  { label: 'Evidence Center', path: '/evidence', icon: BookOpen, group: 'DISCOVERY' },
  { label: 'Validation Center', path: '/validation', icon: ShieldCheck, group: 'DISCOVERY' },
  { label: 'Report Studio', path: '/reports', icon: FileText, group: 'WORK MANAGEMENT' },
  { label: 'Projects', path: '/projects', icon: FolderKanban, group: 'WORK MANAGEMENT' },
  { label: 'Collaboration', path: '/collaboration', icon: Users, group: 'WORK MANAGEMENT' },
  { label: 'Insights', path: '/insights', icon: Dna, group: 'WORK MANAGEMENT' },
  { label: 'Notifications', path: '/notifications', icon: Bell, group: 'ACCOUNT' },
  { label: 'Settings', path: '/settings', icon: Settings, group: 'ACCOUNT' },
  { label: 'Profile', path: '/profile', icon: UserRound, group: 'ACCOUNT' },
] as const;

type Path = (typeof nav)[number]['path'];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const [time, setTime] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const page = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('reduce-motion')) return;
    const animation = page.current?.animate(
      [{ opacity: 0.7, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 180, easing: 'ease-out' },
    );
    return () => animation?.cancel();
  }, [pathname]);
  useEffect(() => {
    const update = () => setTime(new Date().toISOString().slice(11, 16)); update(); const interval = setInterval(update, 30000);
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(!!session?.user));
    return () => { clearInterval(interval); listener.subscription.unsubscribe(); };
  }, []);
  useEffect(() => { const handler = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(v => !v); } }; window.addEventListener('keydown',handler); return () => window.removeEventListener('keydown',handler); }, []);
  const active = nav.find(item => pathname === item.path || pathname.startsWith(item.path + '/'));
  const go = (path: Path) => { setPalette(false); setMobileOpen(false); navigate({ to: path }); };
  return <div className="min-h-screen bg-background text-foreground lg:flex">
    {mobileOpen && <div className="fixed inset-0 z-40 bg-background/80 lg:hidden" onClick={() => setMobileOpen(false)} />}
    <aside className={cn('fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-sidebar transition-all duration-300 lg:sticky lg:top-0 lg:h-screen', collapsed ? 'w-[76px]' : 'w-[250px]', mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-border px-5">
        <Link to="/command-center" className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center border border-primary/60 text-primary"><Hexagon className="size-5" strokeWidth={1.4} /></span>{!collapsed && <span className="text-[18px] font-semibold tracking-[.12em]">SYNTRIX</span>}</Link>
        <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X /></Button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-5 [scrollbar-width:thin]">
        {['WORKSPACE','LABORATORY','DISCOVERY','WORK MANAGEMENT','ACCOUNT'].map(group => <div key={group} className="mb-5">
          {!collapsed && <div className="mb-2 px-3 font-mono text-[10px] tracking-[.18em] text-muted-foreground">{group}</div>}
          <div className="space-y-0.5">{nav.filter(item => item.group === group).map(item => <Link key={item.path} to={item.path} title={item.label} aria-current={pathname === item.path ? 'page' : undefined} onClick={() => setMobileOpen(false)} className={cn('relative flex h-10 items-center gap-3 rounded-sm px-3 text-[13px] transition-colors hover:bg-sidebar-accent hover:text-foreground', pathname === item.path ? 'bg-primary/10 text-primary' : 'text-muted-foreground', collapsed && 'justify-center px-0')}>
            {pathname === item.path && <span className="absolute inset-y-2 left-0 w-0.5 bg-primary shadow-[0_0_12px_var(--cyan)]" />}<item.icon className="size-[17px] shrink-0" strokeWidth={1.7} />{!collapsed && <><span className="truncate">{item.label}</span></>}
          </Link>)}</div></div>)}
      </div>
      <div className="border-t border-border p-3"><Button variant="ghost" size="icon" className="hidden w-full justify-center text-muted-foreground lg:flex" onClick={() => setCollapsed(v => !v)} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} title={collapsed ? 'Expand navigation' : 'Collapse navigation'}>{collapsed ? <ChevronRight /> : <ChevronLeft />}</Button></div>
    </aside>
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-30 flex h-[64px] shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-7 lg:px-9">
        <div className="flex min-w-0 items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu /></Button><nav aria-label="Breadcrumb" className="min-w-0"><ol className="flex min-w-0 items-center gap-2 text-[13px]"><li className="hidden sm:block"><Link to="/command-center" className="font-mono text-[10px] tracking-[.16em] text-muted-foreground hover:text-primary">SYNTRIX</Link></li>{active && <li className="hidden items-center gap-2 font-mono text-[10px] tracking-[.16em] text-muted-foreground md:flex"><ChevronRight className="size-3" />{active.group}</li>}<li className="flex min-w-0 items-center gap-2"><ChevronRight className="hidden size-3 text-muted-foreground sm:block" /><span aria-current="page" className="truncate font-medium text-foreground">{active?.label ?? (pathname.startsWith('/auth') ? 'Sign in' : 'Command Center')}</span></li></ol></nav></div>
        <div className="flex items-center gap-2 sm:gap-5"><span className="hidden items-center gap-2 font-mono text-[10px] text-muted-foreground xl:flex"><span className="size-1.5 rounded-full bg-emerald shadow-[0_0_8px_var(--emerald)]" /> SYSTEM ONLINE <span className="mx-2 text-border">/</span> {time} UTC</span><Button variant="outline" size="sm" onClick={() => setPalette(true)} className="h-8 gap-2 border-border bg-surface text-muted-foreground hover:text-foreground" aria-label="Open command palette"><Search className="size-3.5" /><span className="hidden sm:inline">Search anything</span><kbd className="ml-2 hidden border border-border px-1.5 py-0.5 font-mono text-[10px] lg:inline">⌘ K</kbd></Button><span title={signedIn ? 'Cloud session active' : 'Sign in for saved research'} className="flex size-8 items-center justify-center rounded-full border border-border bg-surface-high font-mono text-[10px] text-primary">{signedIn ? 'ON' : 'SX'}</span></div>
      </header>
      <main className="min-w-0 flex-1"><div ref={page} className="page-transition">{children}</div></main>
    </div>
    <CommandDialog open={palette} onOpenChange={setPalette}><CommandInput placeholder="Search pages and commands..." /><CommandList><CommandEmpty>No matching destination.</CommandEmpty>{['WORKSPACE','LABORATORY','DISCOVERY','WORK MANAGEMENT','ACCOUNT'].map(group => <CommandGroup key={group} heading={group}>{nav.filter(item => item.group === group).map(item => <CommandItem key={item.path} onSelect={() => go(item.path)}><item.icon className="mr-2 size-4" />{item.label}{item.path === '/copilot' && <CommandShortcut>Ask AI</CommandShortcut>}</CommandItem>)}</CommandGroup>)}</CommandList></CommandDialog>
  </div>;
}
