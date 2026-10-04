import { createFileRoute } from '@tanstack/react-router';
import { ReportStudio } from '@/components/workspaces/OtherWorkspaces';
export const Route = createFileRoute('/reports')({
  head: () => ({ meta: [{ title: 'Report Studio | SYNTRIX' }, { name: 'description', content: 'Create research reports and summaries.' }, { property: 'og:title', content: 'Report Studio | SYNTRIX' }, { property: 'og:description', content: 'Create research reports and summaries.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: ReportStudio,
});
