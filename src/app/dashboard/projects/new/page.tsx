"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = createClient();
  const [allMembers, setAllMembers] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchMembers = async () => {
      const { data } = await supabase.from("team_members").select("id, name");
      if (isMounted && data) setAllMembers(data);
    };
    fetchMembers();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // Core states
  const [projectName, setProjectName] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [budget, setBudget] = useState("");
  const [projectManager, setProjectManager] = useState("");
  const [network, setNetwork] = useState("");

  // Client states
  const [clientName, setClientName] = useState("");
  const [clientContactEmail, setClientContactEmail] = useState("");
  const [clientPhoneCountry, setClientPhoneCountry] = useState("+1");
  const [clientContactPhone, setClientContactPhone] = useState("");

  // Services state
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Dynamic states
  const [documents, setDocuments] = useState([{ name: "", url: "" }]);
  const [milestones, setMilestones] = useState([
    {
      name: "",
      description: "",
      payment_percent: "",
      expected_complete_date: "",
      status: "pending",
    },
  ]);
  const [teams, setTeams] = useState([
    { name: "", budget: "", members: [""] },
  ]);

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
    setTeams([...teams, { name: "", budget: "", members: [""] }]);
  const removeTeam = (index: number) =>
    setTeams(teams.filter((_, i) => i !== index));
  const handleTeamChange = (index: number, field: string, value: string) => {
    const newTeams = [...teams];
    newTeams[index] = { ...newTeams[index], [field]: value };
    setTeams(newTeams);
  };
  const addTeamMember = (teamIndex: number, memberId: string) => {
    const newTeams = [...teams];
    // Prevent duplicate selections
    if (newTeams[teamIndex].members.includes(memberId)) return;
    newTeams[teamIndex].members = [...newTeams[teamIndex].members.filter(Boolean), memberId];
    setTeams(newTeams);
  };
  const removeTeamMember = (teamIndex: number, memberIndex: number) => {
    const newTeams = [...teams];
    newTeams[teamIndex].members = newTeams[teamIndex].members.filter((_, i) => i !== memberIndex);
    setTeams(newTeams);
  };

  // Handlers for Documents/Links
  const addDocument = () => setDocuments([...documents, { name: "", url: "" }]);
  const removeDocument = (index: number) =>
    setDocuments(documents.filter((_, i) => i !== index));
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
      },
    ]);
  const removeMilestone = (index: number) =>
    setMilestones(milestones.filter((_, i) => i !== index));
  const handleMilestoneChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const newMilestones = [...milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setMilestones(newMilestones);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("projects").insert([{
      name: projectName,
      budget: parseFloat(budget) || 0,
      expected_delivery_date: expectedDeliveryDate || null,
      manager_id: projectManager || null,
      network: network,
      client_name: clientName,
      client_email: clientContactEmail,
      client_phone: `${clientPhoneCountry} ${clientContactPhone}`,
      services: selectedServices,
      // For simplicity in this demo, saving nested arrays as JSONB columns
      documents: documents,
      milestones: milestones,
      teams: teams
    }]).select().single();

    if (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project.");
      return;
    }

    router.push("/dashboard/projects");
  };

  // Input common class for no x-padding (underline style)
  const inputClass =
    "block w-full border-0 border-b-2 border-slate-200 bg-transparent px-4 py-2 text-slate-900 focus:border-indigo-600 focus:ring-0 sm:text-sm sm:leading-6";

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        <p className="mt-2 text-sm text-gray-600">
          Fill in the details below to add a new project to your workspace.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-10 bg-white border border-slate-200 shadow-sm rounded-xl p-6 sm:p-8"
      >
        {/* Section 1: Core Project Details */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ClipboardList className="w-5 h-5 text-indigo-500" />
            Project Information
          </h2>

          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Project Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className={inputClass}
                placeholder="e.g. Website Redesign"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="budget"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Total Budget
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center text-slate-500">
                  $
                </span>
                <input
                  type="number"
                  name="budget"
                  id="budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className={`pl-4 ${inputClass.replace("px-0", "")}`}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="expected_delivery_date"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Expected Delivery Date
              </label>
              <input
                type="date"
                name="expected_delivery_date"
                id="expected_delivery_date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="project_manager"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Project Manager
              </label>
              <select
                id="project_manager"
                name="project_manager"
                value={projectManager}
                onChange={(e) => setProjectManager(e.target.value)}
                className={inputClass}
              >
                <option value="">Select a manager</option>
                {allMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="network"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Network
              </label>
              <select
                id="network"
                name="network"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className={inputClass}
              >
                <option value="">Select a network</option>
                <option value="Upwork">Upwork</option>
                <option value="Fiverr">Fiverr</option>
                <option value="Referral">Referral</option>
                <option value="Direct">Direct</option>
              </select>
            </div>

          </div>
        </div>

        {/* Section 2: Client Details */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-indigo-500" />
            Client Information
          </h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label
                htmlFor="client_name"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Client Name
              </label>
              <input
                type="text"
                name="client_name"
                id="client_name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className={inputClass}
                placeholder="e.g. Acme Corp"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="client_contact_email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Contact Email
              </label>
              <input
                type="email"
                name="client_contact_email"
                id="client_contact_email"
                value={clientContactEmail}
                onChange={(e) => setClientContactEmail(e.target.value)}
                className={inputClass}
                placeholder="client@example.com"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="client_contact_phone"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Contact Phone
              </label>
              <div className="flex gap-2">
                <select
                  value={clientPhoneCountry}
                  onChange={(e) => setClientPhoneCountry(e.target.value)}
                  className={cn(inputClass, "px-0 w-[100px]")}
                >
                  <option value="+1">US (+1)</option>
                  <option value="+44">UK (+44)</option>
                  <option value="+91">IN (+91)</option>
                  <option value="+880">BD (+880)</option>
                  <option value="+61">AU (+61)</option>
                  <option value="+49">DE (+49)</option>
                  <option value="+33">FR (+33)</option>
                </select>
                <input
                  type="tel"
                  name="client_contact_phone"
                  id="client_contact_phone"
                  value={clientContactPhone}
                  onChange={(e) => setClientContactPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className={cn(inputClass, "flex-1")}
                  placeholder="5550000000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Services */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            Services
          </h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-4">
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
                    <input
                      id={`service-${service.replace(/[^a-zA-Z0-9]/g, "")}`}
                      name="service_type"
                      type="checkbox"
                      value={service}
                      checked={selectedServices.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                    />
                  </div>
                  <div className="ml-3 text-sm leading-6">
                    <label
                      htmlFor={`service-${service.replace(/[^a-zA-Z0-9]/g, "")}`}
                      className="font-medium text-slate-700 cursor-pointer"
                    >
                      {service}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Documents & Links */}
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Documents & Links
            </h2>
            <button
              type="button"
              onClick={addDocument}
              className="inline-flex items-center gap-x-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              <Plus className="-ml-0.5 h-4 w-4" />
              Add Link
            </button>
          </div>

          <div className="space-y-4">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      File/Link Name
                    </label>
                    <input
                      type="text"
                      value={doc.name}
                      onChange={(e) =>
                        handleDocumentChange(index, "name", e.target.value)
                      }
                      className={inputClass}
                      placeholder="e.g. Github Repo, Assets Drive"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      URL
                    </label>
                    <input
                      type="url"
                      value={doc.url}
                      onChange={(e) =>
                        handleDocumentChange(index, "url", e.target.value)
                      }
                      className={inputClass}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(index)}
                  disabled={documents.length === 1}
                  className="mt-6 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Dynamic Milestones */}
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <CircleDollarSign className="w-5 h-5 text-indigo-500" />
              Milestones
            </h2>
            <button
              type="button"
              onClick={addMilestone}
              className="inline-flex items-center gap-x-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              <Plus className="-ml-0.5 h-4 w-4" />
              Add Milestone
            </button>
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
                  className="relative p-5 rounded-xl border border-slate-200 bg-slate-50/30"
                >
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    disabled={milestones.length === 1}
                    className="absolute top-4 right-4 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex items-center justify-between mb-4 pr-8">
                    <h3 className="text-sm font-medium text-slate-800">
                      Milestone {index + 1}
                    </h3>
                    <div className="text-sm font-semibold text-indigo-600">
                      Amount: ${amount}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={milestone.name}
                        onChange={(e) =>
                          handleMilestoneChange(index, "name", e.target.value)
                        }
                        className={inputClass}
                        placeholder="e.g. Phase 1 - Design"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Payment Percent (%)
                      </label>
                      <input
                        type="number"
                        value={milestone.payment_percent}
                        onChange={(e) =>
                          handleMilestoneChange(
                            index,
                            "payment_percent",
                            e.target.value,
                          )
                        }
                        className={inputClass}
                        placeholder="e.g. 25"
                      />
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Description
                      </label>
                      <div className="border border-slate-200 rounded-md overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-2">
                          <button type="button" onClick={(e) => { e.preventDefault(); document.execCommand('bold', false, ''); }} className="p-1 hover:bg-slate-200 rounded text-slate-700 font-bold px-2 text-xs">B</button>
                          <button type="button" onClick={(e) => { e.preventDefault(); document.execCommand('italic', false, ''); }} className="p-1 hover:bg-slate-200 rounded text-slate-700 italic px-2 text-xs">I</button>
                          <button type="button" onClick={(e) => { e.preventDefault(); document.execCommand('underline', false, ''); }} className="p-1 hover:bg-slate-200 rounded text-slate-700 underline px-2 text-xs">U</button>
                        </div>
                        <div
                          className="p-3 min-h-[100px] outline-none text-sm text-slate-700 bg-white"
                          contentEditable
                          onInput={(e) => handleMilestoneChange(index, 'description', e.currentTarget.innerHTML)}
                          dangerouslySetInnerHTML={{ __html: milestone.description }}
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Expected Complete Date
                      </label>
                      <input
                        type="date"
                        value={milestone.expected_complete_date}
                        onChange={(e) =>
                          handleMilestoneChange(
                            index,
                            "expected_complete_date",
                            e.target.value,
                          )
                        }
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Status
                      </label>
                      <select
                        value={milestone.status}
                        onChange={(e) =>
                          handleMilestoneChange(index, "status", e.target.value)
                        }
                        className={inputClass}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {teams.length > 0 && milestone.payment_percent && (
                    <div className="mt-6 p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
                      <h4 className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wider">Team Payables for this Milestone</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {teams.map((team, i) => {
                          if (!team.name || !team.budget) return null;
                          const teamBudget = parseFloat(team.budget) || 0;
                          const percent = parseFloat(milestone.payment_percent) || 0;
                          const payable = (teamBudget * (percent / 100)).toFixed(2);
                          return (
                            <div key={i} className="flex justify-between items-center text-sm p-2.5 bg-slate-50 rounded-md border border-slate-100">
                              <span className="text-slate-600 truncate mr-2 font-medium">{team.name}</span>
                              <span className="text-emerald-600 font-semibold">${payable}</span>
                            </div>
                          )
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
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Teams
            </h2>
            <button
              type="button"
              onClick={addTeam}
              className="inline-flex items-center gap-x-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              <Plus className="-ml-0.5 h-4 w-4" />
              Add Team
            </button>
          </div>

          <div className="space-y-4">
            {teams.map((team, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-5 rounded-xl border border-slate-100 bg-slate-50/50"
              >
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Team Name
                      </label>
                      <input
                        type="text"
                        value={team.name}
                        onChange={(e) =>
                          handleTeamChange(index, "name", e.target.value)
                        }
                        className={inputClass}
                        placeholder="e.g. Frontend Team"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Team Budget ($)
                      </label>
                      <input
                        type="number"
                        value={team.budget}
                        onChange={(e) =>
                          handleTeamChange(index, "budget", e.target.value)
                        }
                        className={inputClass}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Team Members multi-select */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium text-slate-500">
                        Team Members
                      </label>
                    </div>

                    {/* Selected member chips */}
                    {team.members.filter(Boolean).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {team.members.map((memberId, mIndex) => {
                          const m = allMembers.find(m => m.id === memberId);
                          if (!m) return null;
                          return (
                            <span
                              key={mIndex}
                              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                            >
                              {m.name}
                              <button
                                type="button"
                                onClick={() => removeTeamMember(index, mIndex)}
                                className="ml-0.5 rounded-full p-0.5 hover:bg-indigo-200 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Add member combobox */}
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="outline"
                            role="combobox"
                            type="button"
                            className="w-full justify-between font-normal rounded-md border border-slate-300 px-3 py-1.5 h-auto text-slate-500"
                          />
                        }
                      >
                        <span className="flex items-center gap-1.5">
                          <Plus className="h-3.5 w-3.5" />
                          Add member...
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-0"
                        align="start"
                        style={{ width: 'var(--radix-popover-trigger-width)' }}
                      >
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
                                  <Plus className="mr-2 h-4 w-4 text-slate-400" />
                                  {m.name}
                                  {team.members.includes(m.id) && (
                                    <span className="ml-auto text-[10px] text-indigo-500 font-medium">
                                      {team.members.filter(id => id === m.id).length}×
                                    </span>
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeTeam(index)}
                  disabled={teams.length === 1}
                  className="mt-6 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-x-4">
          <Link
            href="/dashboard"
            className="text-sm font-semibold leading-6 text-slate-600 hover:text-slate-900"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-x-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            <Save className="-ml-0.5 h-4 w-4" aria-hidden="true" />
            Save Project
          </button>
        </div>
      </form>
    </div>
  );
}
