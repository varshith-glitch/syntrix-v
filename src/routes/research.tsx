import { createFileRoute } from '@tanstack/react-router';
import { ResearchStudio } from '@/components/workspaces/ResearchSuite';
export const Route = createFileRoute('/research')({
  head: () => ({ meta: [{ title: 'Research Studio | SYNTRIX' }, { name: 'description', content: 'Organize research questions and discoveries.' }, { property: 'og:title', content: 'Research Studio | SYNTRIX' }, { property: 'og:description', content: 'Organize research questions and discoveries.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: ResearchStudio,
});
