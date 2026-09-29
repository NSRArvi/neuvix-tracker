import React from "react";
import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
          <Compass className="w-7 h-7" />
        </div>
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">404 Error</span>
        <h2 className="text-xl font-bold text-slate-900 mt-1 mb-2">Page Not Found</h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          The project, planner, or page you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/dashboard"
          className={cn(buttonVariants(), "bg-indigo-600 hover:bg-indigo-700 text-white")}
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
