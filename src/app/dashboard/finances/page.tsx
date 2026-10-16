import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAccessLevel } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FinancesClient } from "./_components/FinancesClient";
import { AgencyFinanceItem } from "./actions";

export const metadata = {
  title: "Agency Finances | Agency Tracker",
};

export default async function FinancesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/auth");
  }

  const accessLevel = await getCurrentUserAccessLevel();
  if (!accessLevel) {
    redirect("/auth");
  }

  // Finances are strictly restricted to admin and manager only
  if (accessLevel === "member") {
    redirect("/dashboard");
  }

  // 1. Fetch Projects (to compute automatic Neuvix cuts from milestones and provide project picker)
  const { data: allProjects } = await supabase
    .from("projects")
    .select("id, name, budget, milestones, teams");

  // 2. Fetch manual Agency Finances items (handling table not yet created gracefully)
  let manualItems: AgencyFinanceItem[] = [];
  try {
    const { data: financesData, error: financesError } = await supabase
      .from("agency_finances")
      .select("*")
      .order("date", { ascending: false });

    if (!financesError && financesData) {
      manualItems = financesData as AgencyFinanceItem[];
    }
  } catch (e) {
    console.warn("agency_finances table query failed:", e);
  }

  // 3. Compute Auto Neuvix Cuts from Projects
  // Only Neuvix cuts from different projects will be added automatically with status paid or due
  const autoNeuvixCuts: {
    id: string;
    projectId: string;
    projectName: string;
    milestoneIndex: number;
    milestoneName: string;
    amount: number;
    status: "paid" | "due";
    paidDate?: string;
    proofUrl?: string;
  }[] = [];

  (allProjects || []).forEach((proj: any) => {
    const teams = proj.teams || [];
    const milestones = proj.milestones || [];

    // Find if project has a team with "neuvix"
    const neuvixTeam = teams.find((t: any) =>
      String(t.name || "").toLowerCase().includes("neuvix")
    );

    if (neuvixTeam) {
      const teamBudget = parseFloat(String(neuvixTeam.budget || 0)) || 0;

      milestones.forEach((m: any, mIdx: number) => {
        const percent = parseFloat(String(m.payment_percent || 0)) || 0;
        const payable = teamBudget * (percent / 100);

        if (payable > 0) {
          const paymentInfo = m.team_payments?.[neuvixTeam.name];
          const isPaid = paymentInfo?.status === "paid";

          autoNeuvixCuts.push({
            id: `${proj.id}-${mIdx}`,
            projectId: proj.id,
            projectName: proj.name,
            milestoneIndex: mIdx,
            milestoneName: m.name || `Milestone ${mIdx + 1}`,
            amount: Number(payable.toFixed(2)),
            status: isPaid ? "paid" : "due",
            paidDate: paymentInfo?.paid_date,
            proofUrl: paymentInfo?.proof_url,
          });
        }
      });
    }
  });

  const projectList = (allProjects || []).map((p: any) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <FinancesClient
      manualItems={manualItems}
      autoNeuvixCuts={autoNeuvixCuts}
      projects={projectList}
      currentUserAccessLevel={accessLevel}
    />
  );
}

