import { createFileRoute } from '@tanstack/react-router';
import { EvidenceCenter } from '@/components/workspaces/OtherWorkspaces';
export const Route = createFileRoute('/evidence')({
  head: () => ({ meta: [{ title: 'Evidence Center | SYNTRIX' }, { name: 'description', content: 'Review research evidence and sources.' }, { property: 'og:title', content: 'Evidence Center | SYNTRIX' }, { property: 'og:description', content: 'Review research evidence and sources.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: EvidenceCenter,
});
