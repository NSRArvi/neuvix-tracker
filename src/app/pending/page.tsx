"use client";

import React from "react";
import { ShieldCheck, LogOut, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function PendingPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Pending Approval</h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Your account has been created successfully, but you have not been assigned to a team yet. 
          Please contact your administrator to grant you access to the dashboard.
        </p>

        <div className="space-y-4">
          <Button 
            onClick={() => window.location.href = "/dashboard"} 
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            I have been approved, check status
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleSignOut} 
            className="w-full text-slate-600 gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Secured by Neuvix Agency CRM</span>
        </div>
      </div>
    </div>
  );
}
