import { createFileRoute } from '@tanstack/react-router';
import { Profile } from '@/components/workspaces/OtherWorkspaces';
export const Route = createFileRoute('/profile')({
  head: () => ({ meta: [{ title: 'Profile | SYNTRIX' }, { name: 'description', content: 'View your research profile.' }, { property: 'og:title', content: 'Profile | SYNTRIX' }, { property: 'og:description', content: 'View your research profile.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Profile,
});
