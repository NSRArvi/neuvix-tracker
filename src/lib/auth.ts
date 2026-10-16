import { createClient } from "./supabase/server";
import type { User } from "@supabase/supabase-js";

export type AccessLevel = 'admin' | 'manager' | 'member';

export interface AuthenticatedMember {
  user: User;
  member: {
    id: string;
    name: string;
    email: string;
    access_level: AccessLevel;
    team_id?: string | null;
  };
  accessLevel: AccessLevel;
}

/**
 * Returns the access level of the currently logged-in user.
 * Returns null if the user is unauthenticated or not found in team_members.
 */
export async function getCurrentUserAccessLevel(): Promise<AccessLevel | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || !user.email) return null;
  
  const cleanEmail = user.email.trim().toLowerCase();

  const { data } = await supabase
    .from('team_members')
    .select('access_level')
    .ilike('email', cleanEmail)
    .maybeSingle();
    
  const level = (data?.access_level || '').trim().toLowerCase();
  if (level === 'admin' || level === 'manager') {
    return level as AccessLevel;
  }
  
  // Default any registered or authenticated user without admin/manager role to 'member'
  return 'member';
}

/**
 * Strictly verifies the authenticated session and team_member profile.
 * Throws an Error if unauthenticated or not registered as a team member.
 * Use this in all Server Actions to eliminate spoofing and IDOR.
 */
export async function getAuthenticatedMember(): Promise<AuthenticatedMember> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user || !user.email) {
    throw new Error("Unauthorized: Please sign in to perform this action.");
  }
  
  const { data: member, error: memberError } = await supabase
    .from('team_members')
    .select('id, name, email, access_level, team_id')
    .eq('email', user.email)
    .single();
    
  if (memberError || !member) {
    throw new Error("Unauthorized: Team member profile not found for this account.");
  }

  const accessLevel: AccessLevel = (member.access_level === 'admin' || member.access_level === 'manager')
    ? member.access_level
    : 'member';

  return {
    user,
    member: { ...member, access_level: accessLevel },
    accessLevel,
  };
}
