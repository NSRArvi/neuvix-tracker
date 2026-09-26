"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Save,
  Building2,
  CircleDollarSign,
  Users,
  FileText,
  Briefcase,
  ClipboardList,
  Plus,
  Trash2,
  Check,
  ChevronsUpDown,
  X,
} from "lucide-react";
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

export default function ProjectEditPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [allMembers, setAllMembers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    { name: "", description: "", payment_percent: "", expected_complete_date: "", status: "pending" },
  ]);
  const [teams, setTeams] = useState([{ name: "", budget: "", members: [] as string[] }]);

  useEffect(() => {
    const fetchData = async () => {
      const [projectRes, membersRes] = await Promise.all([
        supabase.from("projects").select("*").eq("id", params.id).single(),
        supabase.from("team_members").select("id, name"),
      ]);

      if (projectRes.data) {
        const p = projectRes.data;
        setProjectName(p.name ?? "");
        setBudget(String(p.budget ?? ""));
        setExpectedDeliveryDate(p.expected_delivery_date ?? "");
        setProjectManager(p.manager_id ?? "");
        setNetwork(p.network ?? "");
        setClientName(p.client_name ?? "");
        setClientContactEmail(p.client_email ?? "");
        // split stored phone
        const phoneParts = (p.client_phone ?? "").split(" ");
        if (phoneParts.length > 1) {
          setClientPhoneCountry(phoneParts[0]);
          setClientContactPhone(phoneParts.slice(1).join(" "));
        } else {
          setClientContactPhone(p.client_phone ?? "");
        }
        setSelectedServices(p.services ?? []);
        setDocuments(p.documents?.length ? p.documents : [{ name: "", url: "" }]);
        setMilestones(p.milestones?.length ? p.milestones : [{ name: "", description: "", payment_percent: "", expected_complete_date: "", status: "pending" }]);
        setTeams(p.teams?.length ? p.teams : [{ name: "", budget: "", members: [] }]);
      }
      if (membersRes.data) setAllMembers(membersRes.data);
      setLoading(false);
    };
    fetchData();
  }, [params.id, supabase]);

  // Service toggle
  const handleServiceToggle = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  // Team handlers
  const addTeam = () => setTeams([...teams, { name: "", budget: "", members: [] }]);
  const removeTeam = (i: number) => setTeams(teams.filter((_, idx) => idx !== i));
  const handleTeamChange = (i: number, field: string, value: string) => {
    const t = [...teams]; t[i] = { ...t[i], [field]: value }; setTeams(t);
  };
  const addTeamMember = (teamIndex: number, memberId: string) => {
    const t = [...teams];
    if (t[teamIndex].members.includes(memberId)) return;
    t[teamIndex].members = [...t[teamIndex].members.filter(Boolean), memberId];
    setTeams(t);
  };
  const removeTeamMember = (teamIndex: number, memberIndex: number) => {
    const t = [...teams];
    t[teamIndex].members = t[teamIndex].members.filter((_, i) => i !== memberIndex);
    setTeams(t);
  };

  // Document handlers
  const addDocument = () => setDocuments([...documents, { name: "", url: "" }]);
  const removeDocument = (i: number) => setDocuments(documents.filter((_, idx) => idx !== i));
  const handleDocumentChange = (i: number, field: string, value: string) => {
    const d = [...documents]; d[i] = { ...d[i], [field]: value }; setDocuments(d);
  };

  // Milestone handlers
  const addMilestone = () => setMilestones([...milestones, { name: "", description: "", payment_percent: "", expected_complete_date: "", status: "pending" }]);
  const removeMilestone = (i: number) => setMilestones(milestones.filter((_, idx) => idx !== i));
  const handleMilestoneChange = (i: number, field: string, value: string) => {
    const m = [...milestones]; m[i] = { ...m[i], [field]: value }; setMilestones(m);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from("projects").update({
      name: projectName,
      budget: parseFloat(budget) || 0,
      expected_delivery_date: expectedDeliveryDate || null,
      manager_id: projectManager || null,
      network,
      client_name: clientName,
      client_email: clientContactEmail,
      client_phone: `${clientPhoneCountry} ${clientContactPhone}`,
      services: selectedServices,
      documents,
      milestones,
      teams,
    }).eq("id", params.id);

    setSaving(false);
    if (error) { alert("Failed to save changes."); return; }
    router.push(`/dashboard/projects/${params.id}`);
  };

  const inputClass = "block w-full border-0 border-b-2 border-slate-200 bg-transparent px-4 py-2 text-slate-900 focus:border-indigo-600 focus:ring-0 sm:text-sm sm:leading-6";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
        <p className="mt-1 text-sm text-gray-500">Update the details for <span className="font-semibold">{projectName}</span>.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 bg-white border border-slate-200 shadow-sm rounded-xl p-6 sm:p-8">

        {/* Section 1: Project Info */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ClipboardList className="w-5 h-5 text-indigo-500" /> Project Information
          </h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
              <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className={inputClass} required />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Budget</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center text-slate-500">$</span>
                <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className={`pl-4 ${inputClass}`} required />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Expected Delivery Date</label>
              <input type="date" value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Project Manager</label>
              <select value={projectManager} onChange={(e) => setProjectManager(e.target.value)} className={inputClass}>
                <option value="">Select a manager</option>
                {allMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Network</label>
              <select value={network} onChange={(e) => setNetwork(e.target.value)} className={inputClass}>
                <option value="">Select a network</option>
                <option value="Upwork">Upwork</option>
                <option value="Fiverr">Fiverr</option>
                <option value="Referral">Referral</option>
                <option value="Direct">Direct</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Client Info */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-indigo-500" /> Client Information
          </h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Client Name</label>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
              <input type="email" value={clientContactEmail} onChange={(e) => setClientContactEmail(e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
              <div className="flex gap-2">
                <select value={clientPhoneCountry} onChange={(e) => setClientPhoneCountry(e.target.value)} className={cn(inputClass, "px-0 w-[100px]")}>
                  <option value="+1">US (+1)</option>
                  <option value="+44">UK (+44)</option>
                  <option value="+91">IN (+91)</option>
                  <option value="+880">BD (+880)</option>
                  <option value="+61">AU (+61)</option>
                  <option value="+49">DE (+49)</option>
                  <option value="+33">FR (+33)</option>
                </select>
                <input type="tel" value={clientContactPhone} onChange={(e) => setClientContactPhone(e.target.value.replace(/[^0-9]/g, ""))} className={cn(inputClass, "flex-1")} placeholder="5550000000" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Services */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Briefcase className="w-5 h-5 text-indigo-500" /> Services
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["Brand Strategy", "UI/UX Design", "Web Development", "Mobile App Development", "3D & Motion", "Digital Marketing", "SEO", "QA & Security"].map((service) => (
              <div key={service} className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input id={`svc-${service}`} type="checkbox" checked={selectedServices.includes(service)} onChange={() => handleServiceToggle(service)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer" />
                </div>
                <label htmlFor={`svc-${service}`} className="ml-3 text-sm font-medium text-slate-700 cursor-pointer">{service}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Documents */}
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-500" /> Documents & Links</h2>
            <button type="button" onClick={addDocument} className="inline-flex items-center gap-x-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors">
              <Plus className="-ml-0.5 h-4 w-4" /> Add Link
            </button>
          </div>
          <div className="space-y-4">
            {documents.map((doc, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Link Name</label>
                    <input type="text" value={doc.name} onChange={(e) => handleDocumentChange(i, "name", e.target.value)} className={inputClass} placeholder="e.g. Github Repo" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">URL</label>
                    <input type="url" value={doc.url} onChange={(e) => handleDocumentChange(i, "url", e.target.value)} className={inputClass} placeholder="https://..." />
                  </div>
                </div>
                <button type="button" onClick={() => removeDocument(i)} disabled={documents.length === 1} className="mt-6 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Milestones */}
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><CircleDollarSign className="w-5 h-5 text-indigo-500" /> Milestones</h2>
            <button type="button" onClick={addMilestone} className="inline-flex items-center gap-x-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors">
              <Plus className="-ml-0.5 h-4 w-4" /> Add Milestone
            </button>
          </div>
          <div className="space-y-6">
            {milestones.map((milestone, i) => {
              const amount = budget && milestone.payment_percent
                ? (parseFloat(budget) * parseFloat(milestone.payment_percent) / 100).toFixed(2) : "0.00";
              return (
                <div key={i} className="relative p-5 rounded-xl border border-slate-200 bg-slate-50/30">
                  <button type="button" onClick={() => removeMilestone(i)} disabled={milestones.length === 1} className="absolute top-4 right-4 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center justify-between mb-4 pr-8">
                    <h3 className="text-sm font-medium text-slate-800">Milestone {i + 1}</h3>
                    <div className="text-sm font-semibold text-indigo-600">Amount: ${amount}</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
                      <input type="text" value={milestone.name} onChange={(e) => handleMilestoneChange(i, "name", e.target.value)} className={inputClass} placeholder="e.g. Phase 1" />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Payment Percent (%)</label>
                      <input type="number" value={milestone.payment_percent} onChange={(e) => handleMilestoneChange(i, "payment_percent", e.target.value)} className={inputClass} placeholder="e.g. 25" />
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                      <div className="border border-slate-200 rounded-md overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-2">
                          <button type="button" onClick={() => document.execCommand('bold')} className="p-1 hover:bg-slate-200 rounded text-slate-700 font-bold px-2 text-xs">B</button>
                          <button type="button" onClick={() => document.execCommand('italic')} className="p-1 hover:bg-slate-200 rounded text-slate-700 italic px-2 text-xs">I</button>
                          <button type="button" onClick={() => document.execCommand('underline')} className="p-1 hover:bg-slate-200 rounded text-slate-700 underline px-2 text-xs">U</button>
                        </div>
                        <div className="p-3 min-h-[80px] outline-none text-sm text-slate-700 bg-white" contentEditable onInput={(e) => handleMilestoneChange(i, "description", e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: milestone.description }} />
                      </div>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Expected Complete Date</label>
                      <input type="date" value={milestone.expected_complete_date} onChange={(e) => handleMilestoneChange(i, "expected_complete_date", e.target.value)} className={inputClass} />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                      <select value={milestone.status} onChange={(e) => handleMilestoneChange(i, "status", e.target.value)} className={inputClass}>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 6: Teams */}
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><Users className="w-5 h-5 text-indigo-500" /> Teams</h2>
            <button type="button" onClick={addTeam} className="inline-flex items-center gap-x-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors">
              <Plus className="-ml-0.5 h-4 w-4" /> Add Team
            </button>
          </div>
          <div className="space-y-4">
            {teams.map((team, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Team Name</label>
                      <input type="text" value={team.name} onChange={(e) => handleTeamChange(i, "name", e.target.value)} className={inputClass} placeholder="e.g. Frontend Team" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Team Budget ($)</label>
                      <input type="number" value={team.budget} onChange={(e) => handleTeamChange(i, "budget", e.target.value)} className={inputClass} placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">Team Members</label>
                    {team.members.filter(Boolean).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {team.members.map((memberId, mIdx) => {
                          const m = allMembers.find(m => m.id === memberId);
                          if (!m) return null;
                          return (
                            <span key={mIdx} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {m.name}
                              <button type="button" onClick={() => removeTeamMember(i, mIdx)} className="ml-0.5 rounded-full p-0.5 hover:bg-indigo-200 transition-colors">
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
                            className="w-full justify-between font-normal rounded-md border border-slate-300 px-3 py-1.5 h-auto text-slate-500"
                          />
                        }
                      >
                        <span className="flex items-center gap-1.5">
                          <Plus className="h-3.5 w-3.5" /> Add member...
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                        <Command>
                          <CommandInput placeholder="Search team members..." />
                          <CommandList>
                            <CommandEmpty>No member found.</CommandEmpty>
                            <CommandGroup>
                              {allMembers.map((m) => (
                                <CommandItem key={m.id} value={m.name} onSelect={() => addTeamMember(i, m.id)}>
                                  <Check className={cn("mr-2 h-4 w-4", team.members.includes(m.id) ? "opacity-100 text-indigo-600" : "opacity-0")} />
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
                <button type="button" onClick={() => removeTeam(i)} disabled={teams.length === 1} className="mt-6 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-x-4">
          <button type="button" onClick={() => router.back()} className="text-sm font-semibold leading-6 text-slate-600 hover:text-slate-900">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-x-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors disabled:opacity-70">
            <Save className="-ml-0.5 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
