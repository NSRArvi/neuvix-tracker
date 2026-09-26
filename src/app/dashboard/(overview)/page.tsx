import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAccessLevel } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { StatsGrid } from "../_components/StatsGrid";
import { FinancialOverview } from "../_components/FinancialOverview";
import { RecentProjects } from "../_components/RecentProjects";

export default async function OverviewPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email ?? "admin@neuvix.io";
  const userName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    userEmail.split("@")[0];

  const accessLevel = await getCurrentUserAccessLevel();

  // Fetch all projects first
  let { data: allProjects } = await supabase
    .from("projects")
    .select("*, manager:team_members!manager_id(name)");

  let memberId: string | null = null;
  if (accessLevel === "member" && user?.email) {
    const { data: member } = await supabase
      .from("team_members")
      .select("id")
      .eq("email", user.email)
      .single();

    if (member) {
      memberId = member.id;
      allProjects = (allProjects || []).filter((p: any) =>
        p.teams?.some((t: any) => t.members?.includes(member.id)),
      );
    } else {
      allProjects = [];
    }
  }

  const projectsCount = allProjects?.length || 0;
  // Planners map 1:1 with projects for access purposes
  const plannersCount = projectsCount;

  // Count Teams & Members globally
  const [{ count: membersCountRes }] = await Promise.all([
    supabase.from("team_members").select("*", { count: "exact", head: true }),
  ]);

  const membersCount = membersCountRes || 0;

  // Count Tasks
  let tasksCount = 0;
  if (accessLevel === "member" && memberId) {
    const { data: allTasks } = await supabase
      .from("planner_tasks")
      .select("*, planner:planners(teams)");
    tasksCount = (allTasks || []).filter((task) => {
      const planner = task.planner as any;
      if (!planner || !planner.teams) return false;
      const memberTeams = planner.teams
        .filter((t: any) => t.members?.includes(memberId!))
        .map((t: any) => t.name);
      if (memberTeams.length === 0) return false;
      if (task.assigned_team) return memberTeams.includes(task.assigned_team);
      return true;
    }).length;
  } else {
    const { count: taskCountRes } = await supabase
      .from("planner_tasks")
      .select("*", { count: "exact", head: true });
    tasksCount = taskCountRes || 0;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <PageHeader 
        title={`Welcome back, ${userName}!`} 
        subtitle="Here is your agency performance summary, projects, and pipeline overview."
      />

      {/* 1. TOP STATS: COUNTERS */}
      <StatsGrid
        tasksCount={tasksCount}
        membersCount={membersCount}
        projectsCount={projectsCount}
        plannersCount={plannersCount}
      />

      {/* 2. FINANCIAL / VALUE METRICS & CHART */}
      <FinancialOverview projects={allProjects || []} />

      {/* 3. RECENT ACTIVE PROJECTS OVERVIEW */}
      <RecentProjects projects={allProjects || []} />
    </div>
  );
}
