import { createFileRoute } from '@tanstack/react-router';
import { Projects } from '@/components/workspaces/OtherWorkspaces';
export const Route = createFileRoute('/projects')({
  head: () => ({ meta: [{ title: 'Projects | SYNTRIX' }, { name: 'description', content: 'Manage your research projects.' }, { property: 'og:title', content: 'Projects | SYNTRIX' }, { property: 'og:description', content: 'Manage your research projects.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Projects,
});
