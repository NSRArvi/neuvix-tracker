import { createClient } from "@/lib/supabase/server";
import TeamClient from "./_components/TeamClient";
import { Team, Role, TeamMember } from "./_components/TeamClient";

export default async function TeamsPage() {
  const supabase = await createClient();

  const [teamsRes, rolesRes, membersRes] = await Promise.all([
    supabase.from("teams").select("*").order("created_at", { ascending: false }),
    supabase.from("roles").select("*").order("created_at", { ascending: false }),
    supabase.from("team_members").select("*, roles(name), teams(name)").order("created_at", { ascending: false }),
  ]);

  const teams = (teamsRes.data as Team[]) || [];
  const roles = (rolesRes.data as Role[]) || [];
  const members = (membersRes.data as TeamMember[]) || [];

  return (
    <TeamClient 
      initialTeams={teams} 
      initialRoles={roles} 
      initialMembers={members} 
    />
  );
}
