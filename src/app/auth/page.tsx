'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  ShieldCheck,
  ArrowRight,
  Loader2,
  FolderKanban,
  Users,
  CheckCircle2,
  TrendingUp,
  DollarSign,
} from 'lucide-react'

export default function AuthPage() {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      setLoadingProvider(provider)
      setErrorMsg(null)
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })

      if (error) {
        console.error('OAuth error:', error)
        setErrorMsg(error.message)
        setLoadingProvider(null)
      } else if (data?.url) {
        window.location.href = data.url
      }
    } catch (err: unknown) {
      console.error('Unexpected auth error:', err)
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred')
      setLoadingProvider(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-800">
      {/* LEFT SIDE: AUTHENTICATION FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 xl:p-20 relative bg-white border-r border-slate-200/80">
        {/* Top Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
            N
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900 block leading-tight">
              Neuvix
            </span>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Agency CRM
            </span>
          </div>
        </div>

        {/* Center: Auth Box */}
        <div className="my-auto py-12 max-w-md w-full mx-auto">
          <div className="mb-8">
            
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign in with your organization account to manage projects, teams, and milestones.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200">
              {errorMsg}
            </div>
          )}

          {/* Social Auth Buttons */}
          <div className="space-y-3.5">
            {/* Google Login Button */}
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={loadingProvider !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-2xs hover:border-slate-400 hover:text-slate-900 transition-all duration-200 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loadingProvider === 'google' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                  <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
                </>
              )}
            </button>

            {/* GitHub Login Button */}
            <button
              onClick={() => handleOAuthLogin('github')}
              disabled={loadingProvider !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md shadow-slate-900/10 transition-all duration-200 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loadingProvider === 'github' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Connecting to GitHub...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>Continue with GitHub</span>
                  <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted authentication secured by Supabase</span>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center lg:text-left text-xs text-slate-400 pt-6">
          By signing in, you agree to Neuvix&apos;s Terms of Service and Privacy Policy.
        </p>
      </div>

      {/* RIGHT SIDE: APP SHOWCASE & HIGHLIGHTS */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-12 xl:p-16 flex-col justify-between text-white relative overflow-hidden">
        {/* Soft Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />


        {/* App Showcase Content */}
        <div className="relative z-10 my-auto py-8 space-y-8 max-w-lg">
          <div>
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              One unified platform to track agency revenue, teams, and deliverables.
            </h2>
            <p className="mt-3 text-indigo-200/80 text-sm leading-relaxed">
              Neuvix empowers digital agencies, dev studios, and consultants to manage clients, monitor team payouts, and close milestones on time.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-3">
                <FolderKanban className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Project Tracking</h3>
              <p className="text-xs text-indigo-200/70 mt-1">
                Full lifecycle budgets, client info, documents, and live progress.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Milestone Invoicing</h3>
              <p className="text-xs text-indigo-200/70 mt-1">
                Automated budget percentage splits and payable allocations.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center mb-3">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Team Rosters</h3>
              <p className="text-xs text-indigo-200/70 mt-1">
                Assign specialized teams and roles across active projects.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center mb-3">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Agency Analytics</h3>
              <p className="text-xs text-indigo-200/70 mt-1">
                Cashflow metrics, collection rates, and monthly client onboarding.
              </p>
            </div>
          </div>

          {/* Social Proof / Security Badge */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-400/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Enterprise-grade Security</p>
              <p className="text-[11px] text-indigo-200/70">
                Row-Level Security (RLS) and encrypted sessions powered by Supabase.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="relative z-10 flex items-center justify-between text-xs text-indigo-300/50">
          <span>© 2026 Neuvix Inc.</span>
          <span>All rights reserved.</span>
        </div>
      </div>
    </div>
  )
}

