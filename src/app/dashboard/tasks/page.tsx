import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAccessLevel } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TasksClient } from "./_components/TasksClient";

export default async function TasksPage() {
  const supabase = await createClient();
  const accessLevel = await getCurrentUserAccessLevel();
  const { data: { user } } = await supabase.auth.getUser();

  if (!accessLevel || !user) {
    redirect("/auth");
  }

  // Fetch all tasks with planner info
  const { data: allTasks } = await supabase
    .from("planner_tasks")
    .select("*, planner:planners(id, project_name, teams)")
    .order("created_at", { ascending: false });

  let visibleTasks = allTasks || [];

  if (accessLevel === "member" && user?.email) {
    const { data: member } = await supabase
      .from("team_members")
      .select("id")
      .eq("email", user.email)
      .single();

    if (member) {
      visibleTasks = visibleTasks.filter((task) => {
        const planner = task.planner as any;
        if (!planner || !planner.teams) return false;
        
        // Find which team(s) in this planner the member belongs to
        const memberTeams = planner.teams
          .filter((t: any) => t.members?.includes(member.id))
          .map((t: any) => t.name);

        // If member is not in any team on this project, they can't see its tasks
        if (memberTeams.length === 0) return false;

        // If task is assigned to a specific team, check if member is in that team
        if (task.assigned_team) {
          return memberTeams.includes(task.assigned_team);
        }

        // If task has no team assigned, any member of the project can see it
        return true;
      });
    } else {
      visibleTasks = [];
    }
  }

  return <TasksClient initialTasks={visibleTasks} accessLevel={accessLevel} />;
}
