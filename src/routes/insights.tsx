import { createFileRoute } from '@tanstack/react-router';
import { Insights } from '@/components/workspaces/OtherWorkspaces';
export const Route = createFileRoute('/insights')({
  head: () => ({ meta: [{ title: 'Insights | SYNTRIX' }, { name: 'description', content: 'Review your research insights.' }, { property: 'og:title', content: 'Insights | SYNTRIX' }, { property: 'og:description', content: 'Review your research insights.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Insights,
});
