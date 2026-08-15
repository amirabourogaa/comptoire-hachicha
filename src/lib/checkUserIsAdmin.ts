import { supabase } from '@/integrations/supabase/client';

export async function checkUserIsAdmin(userId: string): Promise<boolean> {
  const { data: isAdmin, error } = await supabase.rpc('is_admin', {
    _user_id: userId,
  });

  if (!error) {
    return Boolean(isAdmin);
  }

  console.warn('RPC is_admin unavailable, fallback to user_roles:', error);

  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (rolesError) {
    console.error('Fallback admin check failed:', rolesError);
    return false;
  }

  return (roles?.length ?? 0) > 0;
}
