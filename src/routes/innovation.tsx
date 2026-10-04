import { createFileRoute } from '@tanstack/react-router';
import { InnovationRadar } from '@/components/workspaces/OtherWorkspaces';
export const Route = createFileRoute('/innovation')({
  head: () => ({ meta: [{ title: 'Innovation Radar | SYNTRIX' }, { name: 'description', content: 'Track emerging opportunities in biotechnology.' }, { property: 'og:title', content: 'Innovation Radar | SYNTRIX' }, { property: 'og:description', content: 'Track emerging opportunities in biotechnology.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: InnovationRadar,
});
