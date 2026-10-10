import { createFileRoute } from '@tanstack/react-router';
import { KnowledgeGraph } from '@/components/workspaces/ResearchSuite';
export const Route = createFileRoute('/knowledge')({
  head: () => ({ meta: [{ title: 'Knowledge Graph | SYNTRIX' }, { name: 'description', content: 'See how your saved questions, sources and hypotheses connect.' }, { property: 'og:title', content: 'Knowledge Graph | SYNTRIX' }, { property: 'og:description', content: 'See how your saved questions, sources and hypotheses connect.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: KnowledgeGraph,
});
