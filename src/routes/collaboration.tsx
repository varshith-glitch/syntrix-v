import { createFileRoute } from '@tanstack/react-router';
import { Collaboration } from '@/components/workspaces/OtherWorkspaces';
export const Route = createFileRoute('/collaboration')({
  head: () => ({ meta: [{ title: 'Collaboration | SYNTRIX' }, { name: 'description', content: 'Work with your research team.' }, { property: 'og:title', content: 'Collaboration | SYNTRIX' }, { property: 'og:description', content: 'Work with your research team.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Collaboration,
});
