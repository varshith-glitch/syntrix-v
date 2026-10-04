import { createFileRoute } from '@tanstack/react-router';
import { KnowledgeGraph } from '@/components/workspaces/OtherWorkspaces';
export const Route = createFileRoute('/knowledge')({
  head: () => ({ meta: [{ title: 'Knowledge Graph | SYNTRIX' }, { name: 'description', content: 'Connect biological concepts and evidence.' }, { property: 'og:title', content: 'Knowledge Graph | SYNTRIX' }, { property: 'og:description', content: 'Connect biological concepts and evidence.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: KnowledgeGraph,
});
