/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building2,
  CircleDollarSign,
  ClipboardList,
  Users,
  Save,
  Trash2,
  Plus,
  FileText,
  Briefcase,
  ChevronsUpDown,
  X,
  FileCheck,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CountryCodeSelect } from "@/components/ui/country-code-select";
import { TeamPaymentModal } from "@/components/projects/team-payment-modal";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { createProject, updateProject } from "../actions";

interface MilestoneItem {
  name: string;
  description: string;
  payment_percent: string;
  expected_complete_date: string;
  status: string;
  team_payments?: Record<string, { amount?: string; status: "paid" | "due"; paid_date?: string; proof_url?: string }>;
}

export function ProjectForm({ 
  initialProject, 
  allMembers,
}: { 
  initialProject?: any; 
  allMembers: { id: string; name: string }[];
}) {
  const router = useRouter();

  // Core states
  const [projectName, setProjectName] = useState(initialProject?.name ?? "");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(initialProject?.expected_delivery_date ?? "");
  const [budget, setBudget] = useState(initialProject?.budget ? String(initialProject.budget) : "");
  const [projectManager, setProjectManager] = useState(initialProject?.manager_id ?? "");
  const [network, setNetwork] = useState(initialProject?.network ?? "");

  // Client states
  const [clientName, setClientName] = useState(initialProject?.client_name ?? "");
  const [clientContactEmail, setClientContactEmail] = useState(initialProject?.client_email ?? "");

  const initialPhoneParts = (initialProject?.client_phone ?? "").trim().split(" ");
  const [clientPhoneCountry, setClientPhoneCountry] = useState(initialPhoneParts.length > 1 ? initialPhoneParts[0] : "+1");
  const [clientContactPhone, setClientContactPhone] = useState(initialPhoneParts.length > 1 ? initialPhoneParts.slice(1).join("") : (initialProject?.client_phone ?? ""));

  // Services state
  const [selectedServices, setSelectedServices] = useState<string[]>(initialProject?.services ?? []);

  // Dynamic states
  const [documents, setDocuments] = useState(initialProject?.documents?.length ? initialProject.documents : [{ name: "", url: "" }]);
  const [milestones, setMilestones] = useState<MilestoneItem[]>(
    initialProject?.milestones?.length ? initialProject.milestones : [
      {
        name: "",
        description: "",
        payment_percent: "",
        expected_complete_date: "",
        status: "pending",
        team_payments: {},
      },
    ]
  );
  const [teams, setTeams] = useState(initialProject?.teams?.length ? initialProject.teams : [
    { name: "", budget: "", members: [] as string[] },
  ]);

  const [saving, setSaving] = useState(false);

  // Handlers for Services
  const handleServiceToggle = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service],
    );
  };

  // Handlers for Teams
  const addTeam = () =>
    setTeams([...teams, { name: "", budget: "", members: [] }]);
  const removeTeam = (index: number) =>
    setTeams(teams.filter((_: any, i: number) => i !== index));
  const handleTeamChange = (index: number, field: string, value: string) => {
    const newTeams = [...teams];
    newTeams[index] = { ...newTeams[index], [field]: value };
    setTeams(newTeams);
  };
  const addTeamMember = (teamIndex: number, memberId: string) => {
    const newTeams = [...teams];
    if (newTeams[teamIndex].members.includes(memberId)) return;
    newTeams[teamIndex].members = [...newTeams[teamIndex].members.filter(Boolean), memberId];
    setTeams(newTeams);
  };
  const removeTeamMember = (teamIndex: number, memberIndex: number) => {
    const newTeams = [...teams];
    newTeams[teamIndex].members = newTeams[teamIndex].members.filter((_: any, i: number) => i !== memberIndex);
    setTeams(newTeams);
  };

  // Handlers for Documents/Links
  const addDocument = () => setDocuments([...documents, { name: "", url: "" }]);
  const removeDocument = (index: number) =>
    setDocuments(documents.filter((_: any, i: number) => i !== index));
  const handleDocumentChange = (
    index: number,
    field: string,
    value: string,
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
        status: "pending",
        team_payments: {},
      },
    ]);
  const removeMilestone = (index: number) =>
    setMilestones(milestones.filter((_, i) => i !== index));
  const handleMilestoneChange = (
    index: number,
    field: keyof MilestoneItem,
    value: MilestoneItem[keyof MilestoneItem],
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

  const openPaymentModal = (milestoneIndex: number, teamName: string, amount: string) => {
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
        router.push(`/dashboard/projects/${initialProject.id}`);
      } else {
        await createProject(projectData);
        router.push("/dashboard/projects");
      }
    } catch (error: any) {
      console.error("Error saving project:", error);
      alert("Failed to save project: " + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-10 bg-card border border-border shadow-sm rounded-xl p-6 sm:p-8"
    >
      {/* Section 1: Core Project Details */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-3">
          <ClipboardList className="w-5 h-5 text-primary" />
          Project Information
        </h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
          <div className="sm:col-span-3 space-y-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-foreground">
              Project Name
            </label>
            <Input
              type="text"
              name="name"
              id="name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Website Redesign"
              required
              className="h-10 text-sm"
            />
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label htmlFor="budget" className="block text-sm font-medium text-foreground">
              Total Budget ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground pointer-events-none text-sm">
                $
              </span>
              <Input
                type="number"
                name="budget"
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0.00"
                step="any"
                className="pl-7 h-10 text-sm"
                required
              />
            </div>
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label htmlFor="expected_delivery_date" className="block text-sm font-medium text-foreground">
              Expected Delivery Date
            </label>
            <Input
              type="date"
              name="expected_delivery_date"
              id="expected_delivery_date"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              className="h-10 text-sm"
            />
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label htmlFor="project_manager" className="block text-sm font-medium text-foreground">
              Project Manager
            </label>
            <Select value={projectManager} onValueChange={(val) => setProjectManager(val as string)}>
              <SelectTrigger className="w-full h-10">
                <span className={projectManager ? "text-foreground" : "text-muted-foreground"}>
                  {projectManager ? allMembers.find(m => m.id === projectManager)?.name : "Select a manager"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {allMembers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label htmlFor="network" className="block text-sm font-medium text-foreground">
              Network
            </label>
            <Select value={network} onValueChange={(val) => setNetwork(val as string)}>
              <SelectTrigger className="w-full h-10">
                {network ? network : <span className="text-muted-foreground">Select a network</span>}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Upwork">Upwork</SelectItem>
                <SelectItem value="Fiverr">Fiverr</SelectItem>
                <SelectItem value="Freelancer">Freelancer</SelectItem>
                <SelectItem value="Direct">Direct</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Section 2: Client Details */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-3">
          <Building2 className="w-5 h-5 text-primary" />
          Client Information
        </h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
          <div className="sm:col-span-2 space-y-1.5">
            <label htmlFor="client_name" className="block text-sm font-medium text-foreground">
              Client Name
            </label>
            <Input
              type="text"
              name="client_name"
              id="client_name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="h-10 text-sm"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label htmlFor="client_contact_email" className="block text-sm font-medium text-foreground">
              Contact Email
            </label>
            <Input
              type="email"
              name="client_contact_email"
              id="client_contact_email"
              value={clientContactEmail}
              onChange={(e) => setClientContactEmail(e.target.value)}
              placeholder="client@example.com"
              className="h-10 text-sm"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label htmlFor="client_contact_phone" className="block text-sm font-medium text-foreground">
              Contact Phone
            </label>
            <div className="flex gap-2">
              <CountryCodeSelect
                value={clientPhoneCountry}
                onChange={(dialCode) => setClientPhoneCountry(dialCode)}
              />
              <Input
                type="tel"
                name="client_contact_phone"
                id="client_contact_phone"
                value={clientContactPhone}
                onChange={(e) => setClientContactPhone(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="5550000000"
                className="flex-1 h-10 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Services */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-3">
          <Briefcase className="w-5 h-5 text-primary" />
          Services
        </h2>
        <div>
          <label className="block text-sm font-medium text-foreground mb-4">
            Service Types (Select all that apply)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              "Brand Strategy",
              "UI/UX Design",
              "Web Development",
              "Mobile App Development",
              "3D & Motion",
              "Digital Marketing",
              "SEO",
              "QA & Security",
            ].map((service) => (
              <div key={service} className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <Checkbox
                    id={`service-${service.replace(/[^a-zA-Z0-9]/g, "")}`}
                    checked={selectedServices.includes(service)}
                    onCheckedChange={() => handleServiceToggle(service)}
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label
                    htmlFor={`service-${service.replace(/[^a-zA-Z0-9]/g, "")}`}
                    className="font-medium text-foreground cursor-pointer select-none"
                  >
                    {service}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4: Documents Links */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Documents Links
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDocument}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Link
          </Button>
        </div>

        <div className="space-y-4">
          {documents.map((doc: any, index: number) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/20"
            >
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground">
                    File/Link Name
                  </label>
                  <Input
                    type="text"
                    value={doc.name}
                    onChange={(e) =>
                      handleDocumentChange(index, "name", e.target.value)
                    }
                    placeholder="e.g. Github Repo, Assets Drive"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground">
                    URL
                  </label>
                  <Input
                    type="url"
                    value={doc.url}
                    onChange={(e) =>
                      handleDocumentChange(index, "url", e.target.value)
                    }
                    placeholder="https://..."
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeDocument(index)}
                disabled={documents.length === 1}
                className="mt-5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Dynamic Milestones */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-primary" />
            Milestones
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMilestone}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Milestone
          </Button>
        </div>

        <div className="space-y-6">
          {milestones.map((milestone, index) => {
            const amountNum = budget && milestone.payment_percent
              ? (parseFloat(budget) * (parseFloat(milestone.payment_percent) / 100))
              : 0;
            const amount = amountNum.toFixed(2);

            return (
              <div
                key={index}
                className="relative p-5 rounded-xl border border-border bg-card shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between pr-8 border-b border-border pb-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Milestone {index + 1}
                  </h3>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    Payable: ${amount}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMilestone(index)}
                  disabled={milestones.length === 1}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                  <div className="sm:col-span-3 space-y-1">
                    <label className="block text-xs font-medium text-muted-foreground">
                      Milestone Name
                    </label>
                    <Input
                      type="text"
                      value={milestone.name}
                      onChange={(e) =>
                        handleMilestoneChange(index, "name", e.target.value)
                      }
                      placeholder="e.g. Phase 1 - UI & UX"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-3 space-y-1">
                    <label className="block text-xs font-medium text-muted-foreground">
                      Payment Percent (%)
                    </label>
                    <Input
                      type="number"
                      value={milestone.payment_percent}
                      onChange={(e) =>
                        handleMilestoneChange(
                          index,
                          "payment_percent",
                          e.target.value,
                        )
                      }
                      placeholder="e.g. 25"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-6 space-y-1">
                    <label className="block text-xs font-medium text-muted-foreground">
                      Description
                    </label>
                    <Textarea
                      value={milestone.description}
                      onChange={(e) =>
                        handleMilestoneChange(index, "description", e.target.value)
                      }
                      placeholder="Enter milestone scope, objectives, or notes..."
                      className="min-h-[80px] text-sm"
                    />
                  </div>
                  <div className="sm:col-span-3 space-y-1">
                    <label className="block text-xs font-medium text-muted-foreground">
                      Expected Complete Date
                    </label>
                    <Input
                      type="date"
                      value={milestone.expected_complete_date}
                      onChange={(e) =>
                        handleMilestoneChange(
                          index,
                          "expected_complete_date",
                          e.target.value,
                        )
                      }
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-3 space-y-1">
                    <label className="block text-xs font-medium text-muted-foreground">
                      Milestone Status
                    </label>
                    <Select value={milestone.status} onValueChange={(val) => handleMilestoneChange(index, "status", val as string)}>
                        <SelectTrigger className="h-9 w-full">
                          {milestone.status ? milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1).replace("_", " ") : <span className="text-muted-foreground">Status</span>}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
                </div>

                {teams.length > 0 && milestone.payment_percent && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Team Payables for this Milestone ({milestone.payment_percent}%)
                      </h4>
                      <span className="text-[11px] text-muted-foreground">
                        Status updates & payment proof
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {teams.map((team: any, i: number) => {
                        if (!team.name || !team.budget) return null;
                        const teamBudget = parseFloat(team.budget) || 0;
                        const percent = parseFloat(milestone.payment_percent) || 0;
                        const payable = (teamBudget * (percent / 100)).toFixed(2);
                        const paymentInfo = milestone.team_payments?.[team.name];
                        const isPaid = paymentInfo?.status === "paid";

                        return (
                          <div
                            key={i}
                            className="p-3 bg-card rounded-lg border border-border flex flex-col justify-between gap-2.5 shadow-xs"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-foreground truncate mr-2 font-medium text-sm">
                                {team.name}
                              </span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm font-mono">
                                ${payable}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                              {isPaid ? (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    Paid • {paymentInfo.paid_date}
                                  </span>
                                  {paymentInfo.proof_url && (
                                    <a
                                      href={paymentInfo.proof_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline flex items-center gap-0.5 text-[11px] font-medium"
                                    >
                                      <FileCheck className="w-3.5 h-3.5" /> Proof
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  Payment Due
                                </span>
                              )}

                              <div className="flex items-center gap-1.5 ml-auto">
                                {isPaid ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => openPaymentModal(index, team.name, payable)}
                                      className="text-[11px] text-muted-foreground hover:text-foreground underline font-medium"
                                    >
                                      Edit
                                    </button>
                                    <span className="text-border">|</span>
                                    <button
                                      type="button"
                                      onClick={() => handleMarkPaymentDue(index, team.name)}
                                      className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-medium"
                                    >
                                      Mark Due
                                    </button>
                                  </>
                                ) : (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openPaymentModal(index, team.name, payable)}
                                    className="text-xs h-6 px-2 text-primary border-primary/30 hover:bg-primary/10"
                                  >
                                    Mark Paid
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 6: Dynamic Teams */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Teams
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTeam}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Team
          </Button>
        </div>

        <div className="space-y-4">
          {teams.map((team: any, index: number) => (
            <div
              key={index}
              className="flex items-start gap-3 p-5 rounded-xl border border-border bg-card shadow-xs"
            >
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-muted-foreground">
                      Team Name
                    </label>
                    <Input
                      type="text"
                      value={team.name}
                      onChange={(e) =>
                        handleTeamChange(index, "name", e.target.value)
                      }
                      placeholder="e.g. Frontend Team"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-muted-foreground">
                      Team Budget ($)
                    </label>
                    <Input
                      type="number"
                      value={team.budget}
                      onChange={(e) =>
                        handleTeamChange(index, "budget", e.target.value)
                      }
                      placeholder="0.00"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Team Members
                  </label>
                  {team.members.filter(Boolean).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {team.members.map((memberId: string, mIdx: number) => {
                        const m = allMembers.find(
                          (item) => item.id === memberId,
                        );
                        if (!m) return null;
                        return (
                          <span
                            key={mIdx}
                            className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                          >
                            {m.name}
                            <button
                              type="button"
                              onClick={() => removeTeamMember(index, mIdx)}
                              className="hover:text-destructive transition-colors ml-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          role="combobox"
                          type="button"
                          className="w-full justify-between font-normal rounded-lg border-input px-3 h-9 text-muted-foreground hover:text-foreground text-sm"
                        />
                      }
                    >
                      <span className="flex items-center gap-1.5">
                        <Plus className="h-3.5 w-3.5" /> Add member...
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[280px]" align="start">
                      <Command>
                        <CommandInput placeholder="Search team members..." />
                        <CommandList>
                          <CommandEmpty>No member found.</CommandEmpty>
                          <CommandGroup>
                            {allMembers.map((m) => (
                              <CommandItem
                                key={m.id}
                                value={m.name}
                                onSelect={() => addTeamMember(index, m.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    team.members.includes(m.id)
                                      ? "opacity-100 text-primary"
                                      : "opacity-0",
                                  )}
                                />
                                {m.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTeam(index)}
                disabled={teams.length === 1}
                className="mt-5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="pt-6 border-t border-border flex items-center justify-end gap-3">
        <Link href={initialProject?.id ? `/dashboard/projects/${initialProject.id}` : "/dashboard/projects"}>
          <Button variant="ghost" type="button" className="h-10 px-6">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={saving} className="h-10 px-6 gap-2">
          {saving ? (
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : initialProject?.id ? "Save Changes" : "Create Project"}
        </Button>
      </div>

      <TeamPaymentModal
        open={paymentModal.open}
        onOpenChange={(val) => setPaymentModal((prev) => ({ ...prev, open: val }))}
        teamName={paymentModal.teamName}
        amount={paymentModal.amount}
        initialPaidDate={paymentModal.paidDate}
        initialProofUrl={paymentModal.proofUrl}
        onConfirm={handleConfirmTeamPayment}
      />
    </form>
  );
}
