import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
export const Route = createFileRoute('/collaboration')({
  head: () => ({ meta: [{ title: 'Collaboration | SYNTRIX' }, { name: 'description', content: 'Work with your research team.' }, { property: 'og:title', content: 'Collaboration | SYNTRIX' }, { property: 'og:description', content: 'Work with your research team.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Page,
});
function Page() { return <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-9 lg:px-12"><div className="font-mono text-[10px] tracking-[.18em] text-primary">SYNTRIX / RESEARCH ENVIRONMENT</div><h1 className="mt-3 text-3xl font-medium">Collaboration</h1><p className="mt-3 text-sm text-muted-foreground">Work with your research team.</p><div className="mt-10 border-t border-border pt-16"><FlaskConical className="size-7 text-primary" strokeWidth={1.4} /><h2 className="mt-5 text-xl font-medium">A space for what's next.</h2><p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">This workspace is being prepared. Start exploring your research questions with SYNTRIX Copilot in the meantime.</p><Button asChild className="mt-6"><Link to="/copilot">Ask SYNTRIX <ArrowRight className="ml-1 size-4" /></Link></Button></div></div>; }
