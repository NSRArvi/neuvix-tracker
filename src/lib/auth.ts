import { createClient } from "./supabase/server";

export async function getCurrentUserAccessLevel(): Promise<'admin' | 'manager' | 'member'> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || !user.email) return 'member';
  
  const { data } = await supabase
    .from('team_members')
    .select('access_level')
    .eq('email', user.email)
    .single();
    
  if (data?.access_level === 'admin' || data?.access_level === 'manager') {
    return data.access_level;
  }
  
  return 'member';
}
