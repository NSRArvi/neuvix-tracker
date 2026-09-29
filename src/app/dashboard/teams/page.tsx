import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAccessLevel } from "@/lib/auth";
import { redirect } from "next/navigation";
import TeamClient from "./_components/TeamClient";
import { Team, Role, TeamMember, AuthUser } from "./_components/TeamClient";

export default async function TeamsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const currentUserAccessLevel = await getCurrentUserAccessLevel();

  if (!currentUserAccessLevel || !user) {
    redirect("/auth");
  }

  const [teamsRes, rolesRes, membersRes, authUsersRes] = await Promise.all([
    supabase.from("teams").select("*").order("created_at", { ascending: false }),
    supabase.from("roles").select("*").order("created_at", { ascending: false }),
    supabase.from("team_members").select("*, roles(name), teams(name)").order("created_at", { ascending: false }),
    supabase.from("auth_users_view").select("*").order("created_at", { ascending: false }),
  ]);

  const teams = (teamsRes.data as Team[]) || [];
  const roles = (rolesRes.data as Role[]) || [];
  const members = (membersRes.data as TeamMember[]) || [];
  const authUsers = (authUsersRes.data as AuthUser[]) || [];

  return (
    <TeamClient 
      initialTeams={teams} 
      initialRoles={roles} 
      initialMembers={members}
      initialAuthUsers={authUsers}
      currentUserAccessLevel={currentUserAccessLevel}
    />
  );
}
