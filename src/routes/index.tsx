import { createFileRoute, redirect } from '@tanstack/react-router';
export const Route = createFileRoute('/')({
  beforeLoad: () => { throw redirect({ to: '/command-center' }); },
  head: () => ({ meta: [{ title: 'SYNTRIX | Biotechnology Research Environment' }, { name: 'description', content: 'SYNTRIX is an AI-powered biotechnology research environment.' }, { property: 'og:title', content: 'SYNTRIX' }, { property: 'og:description', content: 'AI for a brighter biology.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
});
