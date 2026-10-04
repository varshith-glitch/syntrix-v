import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getCopilotHistory = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from('copilot_conversations').select('messages').eq('user_id', context.userId).maybeSingle();
    if (error) throw new Error('Could not load your conversation.');
    return Array.isArray(data?.messages) ? data.messages : [];
  });
