import { ProjectProvider, useProject } from './context/ProjectContext';
import { ContractorDashboard } from './components/ContractorDashboard';
import { ForemanPortal } from './components/ForemanPortal';
import {
  HardHat,
  ShieldCheck,
  Compass,
  AlertCircle,
  Clock,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { useState } from 'react';

function DashboardLayout() {
  const { activeRole, setActiveRole } = useProject();
  const [showDemoHelp, setShowDemoHelp] = useState(true);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Role Selector Header */}
      <header id="mjengo-role-banner" className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/10">
              <HardHat className="w-5.5 h-5.5 text-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tighter text-slate-900">MJENGO</span>
                <span className="text-lg font-black tracking-tighter text-amber-500">254</span>
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Multi-Site Operations Suite</p>
            </div>
          </div>

          {/* Interactive Role Toggle Switch */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            <button
              onClick={() => setActiveRole('Contractor')}
              className={`px-4 py-2 rounded-xl text-xs font-black tracking-wide transition-all duration-200 flex items-center gap-2 select-none cursor-pointer ${
                activeRole === 'Contractor'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Contractor Deck
            </button>
            <button
              onClick={() => setActiveRole('Foreman')}
              className={`px-4 py-2 rounded-xl text-xs font-black tracking-wide transition-all duration-200 flex items-center gap-2 select-none cursor-pointer ${
                activeRole === 'Foreman'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <HardHat className="w-4 h-4" />
              Foreman Account
            </button>
          </div>

        </div>
      </header>

      {/* Demo Guider Tooltip Bar */}
      {showDemoHelp && (
        <section id="demo-instructions-bar" className="bg-amber-50 border-y border-amber-200/60 p-3.5 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-start gap-3.5 justify-between">
            <div className="flex gap-2.5">
              <Compass className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-extrabold text-amber-900 uppercase tracking-wide">Interactive Demo Quick Start Instructions:</p>
                <ol className="list-decimal text-xs text-amber-800 mt-1.5 ml-4 space-y-1 font-medium max-w-5xl leading-relaxed">
                  <li>
                    <b>Take Site Attendance:</b> Switch to <b>Foreman Account</b> above, adjust roll-call checkboxes, and click <b>"Submit Site Roll Call"</b>.
                  </li>
                  <li>
                    <b>Submit Site Updates:</b> While in Foreman mode, request <b>D10 Steel Bars</b> or use a preset <b>Masonry Walling Progress Photo</b> log.
                  </li>
                  <li>
                    <b>Audit & Approve:</b> Switch back to <b>Contractor Deck</b>. Dues are loaded on the <b>"Foreman Rolls & Payroll"</b> tab where you can mark payments. Approve material needs on <b>"Inventory & Materials Log"</b>.
                  </li>
                  <li>
                    <b>Generate Owner Report:</b> Click on <b>"printable Site Reports"</b> tab, input your summaries, and print or export a beautiful PDF review sheet!
                  </li>
                </ol>
              </div>
            </div>
            <button
              onClick={() => setShowDemoHelp(false)}
              className="text-amber-500 hover:text-amber-700 text-xs font-bold bg-white/60 hover:bg-white border border-amber-200 rounded-md px-2 py-0.5 select-none shrink-0"
              title="Close guide"
            >
              Got it
            </button>
          </div>
        </section>
      )}

      {/* Dashboard Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-fade-in">
          {activeRole === 'Contractor' ? (
            <ContractorDashboard />
          ) : (
            <ForemanPortal />
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium text-[11px] tracking-wide">&copy; 2026 <b>Mjengo 254</b>. All Rights Reserved. Kenya Structural Site Portals Corporation.</p>
          <div className="flex items-center gap-2 text-[10px] text-slate-450 uppercase font-black">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure Encryption Active
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <DashboardLayout />
    </ProjectProvider>
  );
}
