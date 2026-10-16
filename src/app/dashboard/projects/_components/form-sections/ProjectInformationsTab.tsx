/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { ClipboardList, Building2, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CountryCodeSelect } from "@/components/ui/country-code-select";

interface ProjectInformationsTabProps {
  // Project Info
  projectName: string;
  setProjectName: (val: string) => void;
  budget: string;
  setBudget: (val: string) => void;
  expectedDeliveryDate: string;
  setExpectedDeliveryDate: (val: string) => void;
  projectManager: string;
  setProjectManager: (val: string) => void;
  network: string;
  setNetwork: (val: string) => void;
  allMembers: { id: string; name: string; team_id?: string }[];

  // Client Info
  clientName: string;
  setClientName: (val: string) => void;
  clientContactEmail: string;
  setClientContactEmail: (val: string) => void;
  clientPhoneCountry: string;
  setClientPhoneCountry: (val: string) => void;
  clientContactPhone: string;
  setClientContactPhone: (val: string) => void;

  // Services
  selectedServices: string[];
  handleServiceToggle: (service: string) => void;
}

const SERVICE_OPTIONS = [
  "Brand Strategy",
  "UI/UX Design",
  "Web Development",
  "Mobile App Development",
  "3D & Motion",
  "Digital Marketing",
  "SEO",
  "QA & Security",
];

export function ProjectInformationsTab({
  projectName,
  setProjectName,
  budget,
  setBudget,
  expectedDeliveryDate,
  setExpectedDeliveryDate,
  projectManager,
  setProjectManager,
  network,
  setNetwork,
  allMembers,
  clientName,
  setClientName,
  clientContactEmail,
  setClientContactEmail,
  clientPhoneCountry,
  setClientPhoneCountry,
  clientContactPhone,
  setClientContactPhone,
  selectedServices,
  handleServiceToggle,
}: ProjectInformationsTabProps) {
  return (
    <div className="space-y-10">
      {/* 1. Core Project Details */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-3">
          <ClipboardList className="w-5 h-5 text-primary" />
          Project Information
        </h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
          <div className="sm:col-span-3 space-y-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-foreground">
              Project Name <span className="text-rose-500">*</span>
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
              Total Budget ($) <span className="text-rose-500">*</span>
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
                  {projectManager ? allMembers.find((m) => m.id === projectManager)?.name : "Select a manager"}
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

      {/* 2. Client Details */}
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

      {/* 3. Services */}
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
            {SERVICE_OPTIONS.map((service) => (
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
    </div>
  );
}

