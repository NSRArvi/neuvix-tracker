/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  FileText,
  CircleDollarSign,
  Users,
  Save,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TeamPaymentModal } from "@/components/projects/team-payment-modal";
import { cn } from "@/lib/utils";
import { createProject, updateProject, sendMilestoneInvoice } from "../actions";

// Form Section Components
import { ProjectInformationsTab } from "./form-sections/ProjectInformationsTab";
import { ProjectDocumentsTab } from "./form-sections/ProjectDocumentsTab";
import { ProjectMilestonesTab, type MilestoneItem } from "./form-sections/ProjectMilestonesTab";
import { ProjectTeamsTab } from "./form-sections/ProjectTeamsTab";

type TabId = "informations" | "documents" | "milestones" | "teams";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "informations", label: "Informations", icon: ClipboardList },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "milestones", label: "Milestones", icon: CircleDollarSign },
  { id: "teams", label: "Teams", icon: Users },
];

export function ProjectForm({
  initialProject,
  allMembers,
  dbTeams = [],
}: {
  initialProject?: any;
  allMembers: { id: string; name: string; team_id?: string }[];
  dbTeams?: { id: string; name: string }[];
}) {
  const router = useRouter();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<TabId>("informations");

  // Core states
  const [projectName, setProjectName] = useState(initialProject?.name ?? "");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    initialProject?.expected_delivery_date ?? ""
  );
  const [budget, setBudget] = useState(
    initialProject?.budget ? String(initialProject.budget) : ""
  );
  const [projectManager, setProjectManager] = useState(
    initialProject?.manager_id ?? ""
  );
  const [network, setNetwork] = useState(initialProject?.network ?? "");

  // Client states
  const [clientName, setClientName] = useState(initialProject?.client_name ?? "");
  const [clientContactEmail, setClientContactEmail] = useState(
    initialProject?.client_email ?? ""
  );

  const initialPhoneParts = (initialProject?.client_phone ?? "").trim().split(" ");
  const [clientPhoneCountry, setClientPhoneCountry] = useState(
    initialPhoneParts.length > 1 ? initialPhoneParts[0] : "+1"
  );
  const [clientContactPhone, setClientContactPhone] = useState(
    initialPhoneParts.length > 1
      ? initialPhoneParts.slice(1).join("")
      : (initialProject?.client_phone ?? "")
  );

  // Services state
  const [selectedServices, setSelectedServices] = useState<string[]>(
    initialProject?.services ?? []
  );

  // Dynamic states
  const [documents, setDocuments] = useState(
    initialProject?.documents?.length
      ? initialProject.documents
      : [{ name: "", url: "" }]
  );
  const [milestones, setMilestones] = useState<MilestoneItem[]>(
    initialProject?.milestones?.length
      ? initialProject.milestones
      : [
          {
            name: "",
            description: "",
            payment_percent: "",
            expected_complete_date: "",
            status: "Planning",
            team_payments: {},
          },
        ]
  );
  const [teams, setTeams] = useState(
    initialProject?.teams?.length
      ? initialProject.teams
      : [{ name: "", budget: "", members: [] as string[] }]
  );

  const [saving, setSaving] = useState(false);
  const [sendingInvoiceIndex, setSendingInvoiceIndex] = useState<number | null>(null);

  const handleSendInvoice = async (index: number, amount: string) => {
    if (!initialProject?.id) return;
    try {
      setSendingInvoiceIndex(index);
      await sendMilestoneInvoice(initialProject.id, index, amount);
      alert("Invoice sent successfully!");
      const newMilestones = [...milestones];
      newMilestones[index].status = "Invoice Sent";
      setMilestones(newMilestones);
    } catch (error: any) {
      alert(error.message || "Failed to send invoice");
    } finally {
      setSendingInvoiceIndex(null);
    }
  };

  // Handlers for Services
  const handleServiceToggle = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  // Handlers for Teams
  const addTeam = () =>
    setTeams([...teams, { name: "", budget: "", members: [] }]);
  const removeTeam = (index: number) =>
    setTeams(teams.filter((_: any, i: number) => i !== index));
  const handleTeamChange = (index: number, field: string, value: string | any) => {
    const newTeams = [...teams];
    newTeams[index] = { ...newTeams[index], [field]: value };
    setTeams(newTeams);
  };
  const addTeamMember = (teamIndex: number, memberId: string) => {
    const newTeams = [...teams];
    if (newTeams[teamIndex].members.includes(memberId)) return;
    newTeams[teamIndex].members = [
      ...newTeams[teamIndex].members.filter(Boolean),
      memberId,
    ];
    setTeams(newTeams);
  };
  const removeTeamMember = (teamIndex: number, memberIndex: number) => {
    const newTeams = [...teams];
    newTeams[teamIndex].members = newTeams[teamIndex].members.filter(
      (_: any, i: number) => i !== memberIndex
    );
    setTeams(newTeams);
  };

  // Handlers for Documents/Links
  const addDocument = () => setDocuments([...documents, { name: "", url: "" }]);
  const removeDocument = (index: number) =>
    setDocuments(documents.filter((_: any, i: number) => i !== index));
  const handleDocumentChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newDocs = [...documents];
    newDocs[index] = { ...newDocs[index], [field]: value };
    setDocuments(newDocs);
  };

  // Handlers for Milestones
  const addMilestone = () =>
    setMilestones([
      ...milestones,
      {
        name: "",
        description: "",
        payment_percent: "",
        expected_complete_date: "",
        status: "Planning",
        team_payments: {},
      },
    ]);
  const removeMilestone = (index: number) =>
    setMilestones(milestones.filter((_, i) => i !== index));
  const handleMilestoneChange = (
    index: number,
    field: keyof MilestoneItem,
    value: MilestoneItem[keyof MilestoneItem]
  ) => {
    const newMilestones = [...milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setMilestones(newMilestones);
  };

  // Team Payment Proof Modal State
  const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    milestoneIndex: number;
    teamName: string;
    amount: string;
    proofUrl: string;
    paidDate: string;
  }>({
    open: false,
    milestoneIndex: -1,
    teamName: "",
    amount: "0",
    proofUrl: "",
    paidDate: new Date().toISOString().split("T")[0],
  });

  const openPaymentModal = (
    milestoneIndex: number,
    teamName: string,
    amount: string
  ) => {
    const current = milestones[milestoneIndex]?.team_payments?.[teamName];
    setPaymentModal({
      open: true,
      milestoneIndex,
      teamName,
      amount,
      proofUrl: current?.proof_url || "",
      paidDate: current?.paid_date || new Date().toISOString().split("T")[0],
    });
  };

  const handleConfirmTeamPayment = (data: { paidDate: string; proofUrl: string }) => {
    const { milestoneIndex, teamName, amount } = paymentModal;
    const currentMilestone = milestones[milestoneIndex];
    const currentPayments = currentMilestone.team_payments || {};

    const updatedPayments: MilestoneItem["team_payments"] = {
      ...currentPayments,
      [teamName]: {
        amount,
        status: "paid",
        paid_date: data.paidDate || new Date().toISOString().split("T")[0],
        proof_url: data.proofUrl,
      },
    };
    handleMilestoneChange(milestoneIndex, "team_payments", updatedPayments);
  };

  const handleMarkPaymentDue = (milestoneIndex: number, teamName: string) => {
    const currentMilestone = milestones[milestoneIndex];
    const currentPayments = { ...(currentMilestone.team_payments || {}) };
    delete currentPayments[teamName];
    handleMilestoneChange(milestoneIndex, "team_payments", currentPayments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const projectData = {
      name: projectName,
      budget: parseFloat(budget) || 0,
      expected_delivery_date: expectedDeliveryDate || null,
      manager_id: projectManager || null,
      network: network,
      client_name: clientName,
      client_email: clientContactEmail,
      client_phone: `${clientPhoneCountry} ${clientContactPhone}`.trim(),
      services: selectedServices,
      documents: documents,
      milestones: milestones,
      teams: teams,
    };

    try {
      if (initialProject?.id) {
        await updateProject(initialProject.id, projectData);
      } else {
        await createProject(projectData);
      }
      router.push("/dashboard/projects");
      router.refresh();
    } catch (error: any) {
      alert(error.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  // Quick helper to get counts for tab badges
  const getTabBadge = (id: TabId) => {
    if (id === "documents") {
      const validDocs = documents.filter((d: any) => d.name || d.url).length;
      return validDocs > 0 ? validDocs : null;
    }
    if (id === "milestones") {
      const validM = milestones.filter((m) => m.name || m.payment_percent).length;
      return validM > 0 ? validM : null;
    }
    if (id === "teams") {
      const validT = teams.filter((t: any) => t.name).length;
      return validT > 0 ? validT : null;
    }
    return null;
  };

  // Navigation handlers between tabs
  const tabIndex = TABS.findIndex((t) => t.id === activeTab);
  const hasPrev = tabIndex > 0;
  const hasNext = tabIndex < TABS.length - 1;

  const goToPrevTab = () => {
    if (hasPrev) setActiveTab(TABS[tabIndex - 1].id);
  };

  const goToNextTab = () => {
    if (hasNext) setActiveTab(TABS[tabIndex + 1].id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tab Navigation Header */}
      <div className="bg-muted/40 p-1.5 rounded-2xl border border-border">
        <nav
          className="grid grid-cols-2 sm:grid-cols-4 gap-1.5"
          aria-label="Project Tabs"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const badge = getTabBadge(tab.id);

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer",
                  isActive
                    ? "bg-card text-foreground shadow-xs border border-border/80 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span className="truncate">{tab.label}</span>
                {badge !== null && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-mono shrink-0",
                      isActive
                        ? "bg-primary/15 text-primary font-bold"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-7 shadow-xs">
        {activeTab === "informations" && (
          <ProjectInformationsTab
            projectName={projectName}
            setProjectName={setProjectName}
            budget={budget}
            setBudget={setBudget}
            expectedDeliveryDate={expectedDeliveryDate}
            setExpectedDeliveryDate={setExpectedDeliveryDate}
            projectManager={projectManager}
            setProjectManager={setProjectManager}
            network={network}
            setNetwork={setNetwork}
            allMembers={allMembers}
            clientName={clientName}
            setClientName={setClientName}
            clientContactEmail={clientContactEmail}
            setClientContactEmail={setClientContactEmail}
            clientPhoneCountry={clientPhoneCountry}
            setClientPhoneCountry={setClientPhoneCountry}
            clientContactPhone={clientContactPhone}
            setClientContactPhone={setClientContactPhone}
            selectedServices={selectedServices}
            handleServiceToggle={handleServiceToggle}
          />
        )}

        {activeTab === "documents" && (
          <ProjectDocumentsTab
            documents={documents}
            addDocument={addDocument}
            removeDocument={removeDocument}
            handleDocumentChange={handleDocumentChange}
          />
        )}

        {activeTab === "milestones" && (
          <ProjectMilestonesTab
            milestones={milestones}
            budget={budget}
            teams={teams}
            initialProjectId={initialProject?.id}
            sendingInvoiceIndex={sendingInvoiceIndex}
            handleSendInvoice={handleSendInvoice}
            addMilestone={addMilestone}
            removeMilestone={removeMilestone}
            handleMilestoneChange={handleMilestoneChange}
            openPaymentModal={openPaymentModal}
            handleMarkPaymentDue={handleMarkPaymentDue}
          />
        )}

        {activeTab === "teams" && (
          <ProjectTeamsTab
            teams={teams}
            dbTeams={dbTeams}
            allMembers={allMembers}
            addTeam={addTeam}
            removeTeam={removeTeam}
            handleTeamChange={handleTeamChange}
            addTeamMember={addTeamMember}
            removeTeamMember={removeTeamMember}
          />
        )}

        {/* Tab-to-Tab Quick Steppers */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
          {hasPrev ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={goToPrevTab}
              className="gap-1.5 text-xs h-9"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous: {TABS[tabIndex - 1].label}
            </Button>
          ) : (
            <div />
          )}

          {hasNext && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={goToNextTab}
              className="gap-1.5 text-xs h-9 ml-auto"
            >
              Next: {TABS[tabIndex + 1].label}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Global Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={saving}
          className="w-full sm:w-auto h-10 px-5"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto h-10 px-6 gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : initialProject ? "Save Changes" : "Create Project"}
        </Button>
      </div>

      {/* Proof Modal */}
      <TeamPaymentModal
        open={paymentModal.open}
        onOpenChange={(open) => setPaymentModal((prev) => ({ ...prev, open }))}
        teamName={paymentModal.teamName}
        amount={paymentModal.amount}
        initialPaidDate={paymentModal.paidDate}
        initialProofUrl={paymentModal.proofUrl}
        onConfirm={handleConfirmTeamPayment}
      />
    </form>
  );
}
