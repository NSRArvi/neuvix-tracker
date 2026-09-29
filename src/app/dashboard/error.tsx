"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Unable to load dashboard section</h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {error?.message || "There was a problem loading this data. Please refresh or try again."}
        </p>
        <Button
          onClick={() => reset()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" /> Try Again
        </Button>
      </div>
    </div>
  );
}
