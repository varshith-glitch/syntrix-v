import { createFileRoute } from '@tanstack/react-router';
import { BioSim } from '@/components/workspaces/OtherWorkspaces';
export const Route = createFileRoute('/biosim')({
  head: () => ({ meta: [{ title: 'BioSim | SYNTRIX' }, { name: 'description', content: 'Model biological systems and experiments.' }, { property: 'og:title', content: 'BioSim | SYNTRIX' }, { property: 'og:description', content: 'Model biological systems and experiments.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: BioSim,
});
