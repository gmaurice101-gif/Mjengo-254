import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { ConstructionSite, Worker, AttendanceRecord, InventoryItem, LogisticsLog, ProgressPhoto, MaterialRequest } from '../types';
import { formatCurrency, formatDate, getSiteStatusColor } from '../utils';
import {
  Briefcase,
  TrendingUp,
  CreditCard,
  DollarSign,
  Package,
  Calendar,
  Layers,
  FileText,
  Clock,
  MapPin,
  Check,
  X,
  Plus,
  AlertCircle,
  TrendingDown,
  Printer,
  ChevronRight,
  UserCheck,
  Award,
  Eye,
  CheckCircle2,
  Lock,
  LogOut,
  Sliders,
  Database
} from 'lucide-react';

export const ContractorDashboard: React.FC = () => {
  const {
    state,
    selectedSiteId,
    setSelectedSiteId,
    addSite,
    updateMaterialRequestStatus,
    togglePaymentStatus,
    payAllForDay,
    getSiteCosts,
    addLogisticsLog
  } = useProject();

  // Active sub-section tab inside contractor panel
  const [activeTab, setActiveTab] = useState<'overview' | 'logistics' | 'gallery' | 'finances' | 'payroll' | 'reports'>('overview');

  // Modal open states
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [zoomedPhoto, setZoomedPhoto] = useState<ProgressPhoto | null>(null);

  // New Site Form fields
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteLoc, setNewSiteLoc] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newForeman, setNewForeman] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  // Manual material check-in form (Contractor inventory replenishment)
  const [showRestockForm, setShowRestockForm] = useState(false);
  const [stockItem, setStockItem] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [stockUnit, setStockUnit] = useState('Bags');
  const [stockSupplier, setStockSupplier] = useState('');

  // Report generation state
  const [reportMonth, setReportMonth] = useState('2026-05');
  const [reportCustomComment, setReportCustomComment] = useState('MJENGO 254 Core Operations: The project milestones are pacing within optimal scheduled brackets. Heavy excavation has successfully terminated, and focus is directed towards masonry wallings and interior layout integrations.');
  const [galleryStageFilter, setGalleryStageFilter] = useState<string>('All');
  const [galleryMonthFilter, setGalleryMonthFilter] = useState<string>('All');
  const [selectedReportPhotoIds, setSelectedReportPhotoIds] = useState<string[]>([]);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Synchronize photo selections when site or target month shifts
  useEffect(() => {
    setSelectedReportPhotoIds([]);
  }, [selectedSiteId, reportMonth]);

  // Active Selected Site information
  const site = state.sites.find(s => s.id === selectedSiteId) || state.sites[0];

  // Calculated financials for selected site
  const siteCosts = getSiteCosts(site.id);

  // Pending requests count across ALL sites for alert badges
  const globalPendingRequestsCount = state.materialRequests.filter(r => r.status === 'Pending').length;
  const sitePendingRequests = state.materialRequests.filter(r => r.siteId === site.id && r.status === 'Pending');

  // Multi-site total financials for contractor aggregate view
  const overallAssignedBudget = state.sites.reduce((acc, s) => acc + s.allocatedBudget, 0);
  const overallSpentBudget = state.sites.reduce((acc, s) => acc + s.spentBudget, 0);

  // Filter photos for selected site
  const sitePhotos = state.progressPhotos.filter(p => p.siteId === site.id);

  const handleCreateSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName || !newSiteLoc || !newValue) return;

    addSite({
      name: newSiteName,
      location: newSiteLoc,
      allocatedBudget: parseFloat(newValue),
      startDate: newStart || new Date().toISOString().split('T')[0],
      expectedCompletion: newEnd || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Planning',
      clientName: newClient || 'Private Owner',
      clientEmail: newClientEmail || 'owner@mjengo.com',
      foremanName: newForeman || 'Assigned Lead Foreman'
    });

    // Reset fields
    setNewSiteName('');
    setNewSiteLoc('');
    setNewValue('');
    setNewClient('');
    setNewClientEmail('');
    setNewForeman('');
    setNewStart('');
    setNewEnd('');
    setShowAddSiteModal(false);
  };

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockItem || !stockQty) return;

    addLogisticsLog({
      siteId: site.id,
      date: new Date().toISOString(),
      type: 'Received',
      itemName: stockItem,
      quantity: parseFloat(stockQty),
      unit: stockUnit,
      handler: 'Contractor Core',
      supplierOrRecipient: stockSupplier || 'Direct Merchant Purchase'
    });

    setStockItem('');
    setStockQty('');
    setStockSupplier('');
    setShowRestockForm(false);
  };

  const executePrint = () => {
    window.print();
  };

  // Timeline Milestone Calculation Model
  // Simple milestones relative to the project start and expected end date:
  // 1. Excavation (0% - 20%)
  // 2. Foundation Structure (20% - 40%)
  // 3. Wallings and Beams (40% - 65%)
  // 4. Roofing Assembly (65% - 85%)
  // 5. Finishing & Fixtures (85% - 100%)
  const percentageSpent = Math.min(100, Math.round((site.spentBudget / site.allocatedBudget) * 100)) || 0;

  const getMilestoneState = (milestoneRange: [number, number]): { status: 'Completed' | 'In-Progress' | 'Pending'; progressVal: number } => {
    const [start, end] = milestoneRange;
    if (percentageSpent >= end) {
      return { status: 'Completed', progressVal: 100 };
    } else if (percentageSpent <= start) {
      return { status: 'Pending', progressVal: 0 };
    } else {
      // In-Progess, calculate ratio within the range
      const ratio = Math.round(((percentageSpent - start) / (end - start)) * 100);
      return { status: 'In-Progress', progressVal: ratio };
    }
  };

  const MILESTONES = [
    { name: 'Ground Excavations', range: [0, 20], desc: 'Site clearance, depth layout levels, trench digging.' },
    { name: 'Reinforced Foundation', range: [20, 42], desc: 'High-tensile steel frameworks, slab pouring & curing.' },
    { name: 'Structural Block Walling', range: [42, 68], desc: 'Masonry blocks, ring beams, column curing.' },
    { name: 'Roofing & Truss Assembly', range: [68, 85], desc: 'Steel and timber rafters, ceiling layouts, insulation.' },
    { name: 'Finishing & Plastering', range: [85, 100], desc: 'Wiring, plumbing installations, floor screed, paintwork.' }
  ];

  return (
    <div className="space-y-6">

      {/* Overview stats cards & Site toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-slate-900 text-white rounded-3xl shadow-lg border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono tracking-wide uppercase">Mjengo 254 Core</span>
            <span className="text-slate-400 text-xs">• Real-Time Logistics Sync</span>
          </div>
          <p className="text-2xl font-black tracking-tight mt-1 text-white">Contractor Control Deck</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" /> Currently Inspecting: <b className="text-slate-200">{site.name}</b></span>
            <span>Client: <b className="text-slate-200">{site.clientName}</b></span>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 p-1.5 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 px-2">Site Jurisdiction:</span>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="bg-slate-900 border-none rounded-lg px-3 py-1 text-xs font-semibold text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer min-w-[200px]"
            >
              {state.sites.map(s => (
                <option key={s.id} value={s.id} className="text-white text-xs">{s.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddSiteModal(true)}
            className="bg-amber-500 text-slate-900 border-b-2 border-amber-700 hover:bg-amber-400 transition font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-900" /> New Construction Project
          </button>
        </div>
      </div>

      {/* Contractor Portal Sub-navigation links */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Timeline & Budgets', icon: Layers },
          { id: 'logistics', label: 'Inventory & Materials Log', icon: Package, badge: globalPendingRequestsCount },
          { id: 'gallery', label: 'Progress Photo Reports', icon: Eye },
          { id: 'finances', label: 'Financial Running Costs', icon: TrendingUp },
          { id: 'payroll', label: 'Foreman Rolls & Payroll', icon: UserCheck },
          { id: 'reports', label: ' printable Site Reports', icon: FileText }
        ].map(tb => {
          const Icon = tb.icon;
          const isActive = activeTab === tb.id;
          return (
            <button
              key={tb.id}
              onClick={() => setActiveTab(tb.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shrink-0 select-none cursor-pointer border ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{tb.label}</span>
              {tb.badge && tb.badge > 0 ? (
                <span className="bg-rose-500 text-white text-[9px] font-black rounded-full w-4.5 h-4.5 flex items-center justify-center animate-pulse">
                  {tb.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Sub-tab view sections rendering switcher */}

      {/* TAB A: OVERVIEW - Timelines and Budget metrics */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Quick figures tiles */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">Project Budget Capital</p>
                <Briefcase className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{formatCurrency(site.allocatedBudget)}</p>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2 bg-slate-50 px-2 py-1 rounded-sm w-fit">
                <span>Contract value assigned by owner</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">Real-Time Expenditures</p>
                <TrendingDown className="w-5 h-5 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-rose-600 mt-2 font-mono">{formatCurrency(site.spentBudget)}</p>
              <div className="flex items-center gap-1 text-[11px] text-rose-600 mt-2 font-semibold">
                <span>{percentageSpent}% of capital depleted</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">Remaining Margin</p>
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600 mt-2 font-mono">{formatCurrency(site.allocatedBudget - site.spentBudget)}</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-2 font-semibold">
                <span>Safe buffer reserves remaining</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">Expected Delivery Dates</p>
                <Calendar className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-base font-black text-slate-800 mt-3 font-mono">Completion: {formatDate(site.expectedCompletion)}</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase">Commenced: {formatDate(site.startDate)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Real-time Budget allocations bars graph (SVG based, gorgeous & pixel perfect) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Budget Resource Tracker</h3>
                    <p className="text-xs text-slate-500">Real-time depletion rate compared with project target cap</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSiteStatusColor(site.status)}`}>
                    Site: {site.status}
                  </span>
                </div>

                <div className="space-y-6 my-6">
                  {/* Visual Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                      <span>Total Running Cost depletion: <b>{formatCurrency(site.spentBudget)}</b></span>
                      <span>Target Ceiling: <b>{formatCurrency(site.allocatedBudget)}</b></span>
                    </div>
                    <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden border border-slate-200/50 p-1 flex">
                      <div
                        style={{ width: `${percentageSpent}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentageSpent > 90
                            ? 'bg-rose-500'
                            : percentageSpent > 65
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mt-1 uppercase">
                      <span>0% Started</span>
                      <span>50% Midpoint</span>
                      <span>100% Blown</span>
                    </div>
                  </div>

                  {/* Financial sub-item splits in overview */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Labor Depletion Rate</span>
                      <p className="text-lg font-black text-slate-800 font-mono mt-0.5">{formatCurrency(siteCosts.laborTotal)}</p>
                      <p className="text-[10px] text-slate-500 mt-1">From registered foreman daily sheets</p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Material Costs Allocated</span>
                      <p className="text-lg font-black text-slate-800 font-mono mt-0.5">{formatCurrency(siteCosts.materialsTotal)}</p>
                      <p className="text-[10px] text-slate-500 mt-1">From approved/received logistics logs</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> Active Supervisor: <b>{site.foremanName}</b></span>
                <span>Role: Lead Site Foreman</span>
              </div>
            </div>

            {/* REAL-TIME TIMELINE/MILESTONES (Gantt representation) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Project Delivery timeline</h3>
                  <p className="text-xs text-slate-500">Milestone completion tracked dynamically by real-time budget costs</p>
                </div>
              </div>

              <div className="space-y-4">
                {MILESTONES.map((milestone, idx) => {
                  const mState = getMilestoneState(milestone.range as [number, number]);
                  return (
                    <div key={idx} className="flex gap-3 relative group">
                      {idx !== MILESTONES.length - 1 && (
                        <div className="absolute left-3.5 top-6 bottom-0 w-0.5 bg-slate-100 group-hover:bg-slate-200 transition" />
                      )}

                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border z-10 font-bold text-xs ${
                        mState.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                          : mState.status === 'In-Progress'
                            ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        {mState.status === 'Completed' ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div className="space-y-1 pb-2">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800">{milestone.name}</p>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                            mState.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : mState.status === 'In-Progress'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-400'
                          }`}>
                            {mState.status === 'Completed' ? 'Completed' : mState.status === 'In-Progress' ? 'Active' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">{milestone.desc}</p>
                        {mState.status === 'In-Progress' && (
                          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                            <div style={{ width: `${mState.progressVal}%` }} className="bg-amber-500 h-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: LOGISTICS & MATERIAL REQUESTS - Approved by Contractor, logs auto generated */}
      {activeTab === 'logistics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Sub-item: Material requests needing approval */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900">Material Request Orders awaiting confirmation</h3>
                <p className="text-xs text-slate-500">Approve orders from foremen. Approved items automatically increase current site stock levels.</p>
              </div>

              {state.materialRequests.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-400">Everything up to date. No requests logged.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {state.materialRequests.map(req => {
                    const reqSite = state.sites.find(s => s.id === req.siteId);
                    return (
                      <div key={req.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                        req.status === 'Pending' ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-150'
                      }`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">{req.itemName}</span>
                            <span className="text-xs font-mono font-medium text-slate-500">({req.quantity} {req.unit})</span>
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${
                              req.urgency === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                            }`}>{req.urgency} Urgency</span>
                          </div>
                          <p className="text-2xs text-slate-500 mt-1 uppercase font-bold tracking-wider">
                            Origin Site: <span className="text-amber-600">{reqSite?.name || 'Unknown'}</span> • Requested by: {req.requestedBy} on {formatDate(req.date)}
                          </p>
                        </div>

                        {req.status === 'Pending' ? (
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => updateMaterialRequestStatus(req.id, 'Rejected')}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-150 transition text-slate-700 text-xs font-bold"
                            >
                              Deny
                            </button>
                            <button
                              onClick={() => updateMaterialRequestStatus(req.id, 'Approved')}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition text-white text-xs font-bold flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve Order
                            </button>
                          </div>
                        ) : (
                          <div className="shrink-0 flex items-center gap-1">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                              req.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              Confirmed {req.status}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Restock form widget */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900">Replenish Material Stocks</h3>
                <button
                  onClick={() => setShowRestockForm(!showRestockForm)}
                  className="text-amber-600 hover:underline text-xs font-bold"
                >
                  {showRestockForm ? 'Hide form' : 'Restock item'}
                </button>
              </div>

              {showRestockForm ? (
                <form onSubmit={handleRestock} className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400">Item Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bamburi Cement OPC 42.5"
                      value={stockItem}
                      onChange={(e) => setStockItem(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-700 mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400">Qty Recieved</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="100"
                        value={stockQty}
                        onChange={(e) => setStockQty(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-700 mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400">Unit</label>
                      <select
                        value={stockUnit}
                        onChange={(e) => setStockUnit(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 mt-1"
                      >
                        <option value="Bags">Bags</option>
                        <option value="Pcs">Pcs</option>
                        <option value="Tonnes">Tonnes</option>
                        <option value="Litres">Litres</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400">Contractor Supplier / Brand</label>
                    <input
                      type="text"
                      placeholder="e.g. Bamburi Cement Merchandiser"
                      value={stockSupplier}
                      onChange={(e) => setStockSupplier(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-700 mt-1"
                    />
                  </div>

                  <button type="submit" className="w-full bg-slate-900 text-white text-xs font-bold py-1.5 rounded hover:bg-slate-800 transition">
                    Register Restock & Generate Log
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 bg-slate-50 border border-slate-100 rounded-xl mb-4">
                  <p className="text-xs text-slate-400 font-medium">Have you bought bulk concrete block, cement or steel?</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Click the "Restock item" link above to register warehouse supplies manually.</p>
                </div>
              )}

              {/* Renders current project stock level status list */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Site Inventory Stock Records</h4>
                <div className="space-y-2">
                  {state.inventory.filter(inv => inv.siteId === site.id).map(inv => (
                    <div key={inv.id} className="p-3 bg-slate-50 rounded-lg border border-slate-150 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{inv.name}</span>
                        <span className="text-[9px] text-slate-400 font-medium font-mono uppercase">Last replenishment: {formatDate(inv.lastUpdated)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900 font-mono block">{inv.quantity} {inv.unit}</span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                          inv.quantity <= 25 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {inv.quantity <= 25 ? 'Low Stock alert' : 'Substantial'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Integrated logs ledger (items RECEIVED and PROCESSED / DISBURSED) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Site Logistical ledger / Movements History</h3>
              <p className="text-xs text-slate-500">Chronological inventory track record of all supplies received and disbursed on the plot</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-slate-150 bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                    <th className="p-3">Date Recorded</th>
                    <th className="p-3">Supply Item Specs</th>
                    <th className="p-3 text-center">Movement Type</th>
                    <th className="p-3 text-center">Quantity Logged</th>
                    <th className="p-3">Authorized foreman / handler</th>
                    <th className="p-3 text-right">Supplier or Recipient Section</th>
                  </tr>
                </thead>
                <tbody>
                  {state.logistics.filter(log => log.siteId === site.id).map(log => {
                    const isReceived = log.type === 'Received';
                    return (
                      <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                        <td className="p-3 text-slate-500 font-medium whitespace-nowrap">{formatDate(log.date.split('T')[0])}</td>
                        <td className="p-3 font-semibold text-slate-800">{log.itemName}</td>
                        <td className=" some-padding p-3">
                          <div className="flex justify-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wide flex items-center gap-1 ${
                              isReceived
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {isReceived ? '✓ Received' : '↴ Disbursed'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-slate-700">{log.quantity} {log.unit}</td>
                        <td className="p-3 text-slate-500 font-medium">{log.handler}</td>
                        <td className="p-3 text-right text-slate-700 font-semibold">{log.supplierOrRecipient}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB C: GALLERY VIEW - View uploaded site photos report gallery */}
      {activeTab === 'gallery' && (() => {
        const filteredGalleryPhotos = sitePhotos.filter(p => {
          const stageMatch = galleryStageFilter === 'All' || p.stage === galleryStageFilter;
          const monthMatch = galleryMonthFilter === 'All' || p.date.substring(0, 7) === galleryMonthFilter;
          return stageMatch && monthMatch;
        });

        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="border-b border-slate-100 pb-3 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Uploaded Progress Photographs Archive</h3>
                <p className="text-xs text-slate-500 font-medium">Visual proof of milestones on site. Foremen submit these photos during daily operations.</p>
              </div>
              <div className="text-xs bg-amber-500/10 text-amber-800 border border-amber-500/20 py-1.5 px-3 rounded-xl font-bold font-mono">
                Tagged for Monthly Report: {selectedReportPhotoIds.length === 0 ? "Defaulting to all matching month" : `${selectedReportPhotoIds.length} chosen`}
              </div>
            </div>

            {/* Gallery Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Filter by Construction Stage</label>
                <select
                  value={galleryStageFilter}
                  onChange={(e) => setGalleryStageFilter(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="All">All Stages</option>
                  <option value="Excavation">Excavation Stage</option>
                  <option value="Foundation">Foundation Stage</option>
                  <option value="Wallings">Wallings Stage</option>
                  <option value="Roofing">Roofing Stage</option>
                  <option value="Finishes">Finishes Stage</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Filter by Photo Month</label>
                <select
                  value={galleryMonthFilter}
                  onChange={(e) => setGalleryMonthFilter(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="All">All Months</option>
                  <option value="2026-05">May 2026</option>
                  <option value="2026-04">April 2026</option>
                  <option value="2026-03">March 2026</option>
                </select>
              </div>
            </div>

            {filteredGalleryPhotos.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-base text-slate-400 font-bold">No photographs found matching selected filters.</p>
                <p className="text-xs text-slate-400 mt-1">Adjust your filters, or simulate photo uploads from the "Foreman Portal" tab in the top header!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGalleryPhotos.map(ph => {
                  const isSelectedForReport = selectedReportPhotoIds.includes(ph.id) || (selectedReportPhotoIds.length === 0 && ph.date.substring(0, 7) === reportMonth);
                  return (
                    <div
                      key={ph.id}
                      onClick={() => setZoomedPhoto(ph)}
                      className="group bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 flex flex-col justify-between hover:shadow-md transition duration-300 hover:border-slate-300 cursor-zoom-in relative"
                    >
                      <div className="relative h-48 overflow-hidden bg-slate-900">
                        <img
                          src={ph.url}
                          alt={ph.caption}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-3 left-3 bg-slate-900/90 text-white font-extrabold text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full border border-slate-750">
                          {ph.stage} Stage
                        </span>

                        {/* Top corner tick indicating report selection */}
                        {isSelectedForReport && (
                          <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 p-1 rounded-full shadow-md font-bold text-xs border border-amber-300">
                            <Check className="w-3.5 h-3.5 text-slate-900" />
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex flex-col justify-between flex-1">
                        <div>
                          <p className="text-xs font-bold text-slate-800 line-clamp-2 h-8">{ph.caption}</p>
                          <div className="border-t border-slate-200/60 pt-2.5 mt-2 flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-2">
                            <span>By: <b>{ph.uploadedBy}</b></span>
                            <span>Date: {formatDate(ph.date)}</span>
                          </div>
                        </div>

                        {/* Direct selection toggle for contractor report builder */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReportPhotoIds(prev =>
                              prev.includes(ph.id)
                                ? prev.filter(id => id !== ph.id)
                                : [...prev, ph.id]
                            );
                          }}
                          className={`w-full py-2 px-3 rounded-xl text-[10px] font-black tracking-wide uppercase transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                            isSelectedForReport
                              ? 'bg-amber-500 text-slate-900 border-amber-500 hover:bg-amber-400 font-black'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {isSelectedForReport ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-slate-900" />
                              Selected for Monthly Report
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 text-slate-500" />
                              Include in Monthly Report
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Photo zoomed overlay portal modal */}
            {zoomedPhoto && (
              <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 min-h-screen">
                <div className="relative bg-slate-900 rounded-2xl overflow-hidden max-w-2xl w-full border border-slate-755 shadow-2xl flex flex-col">
                  <button
                    onClick={() => setZoomedPhoto(null)}
                    className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-2 hover:bg-black/90 transition hover:scale-105"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="h-96 bg-black flex items-center justify-center">
                    <img src={zoomedPhoto.url} alt={zoomedPhoto.caption} className="max-w-full max-h-full object-contain" />
                  </div>

                  <div className="p-5 text-white bg-slate-950">
                    <span className="bg-amber-500 text-slate-900 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      {zoomedPhoto.stage} Stage
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 mt-2">{zoomedPhoto.caption}</h4>
                    <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-3 text-xs text-slate-400">
                      <span>Uploaded on: <b>{formatDate(zoomedPhoto.date)}</b></span>
                      <span>Submitter: <b>{zoomedPhoto.uploadedBy}</b></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* TAB D: FINANCIALS VIEW - Running costs daily, weekly, and monthly */}
      {activeTab === 'finances' && (
        <div className="space-y-6">

          {/* Summary dashboard widgets in financials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 text-white p-5 rounded-2xl">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Grand Total Plot Outflows</span>
              <p className="text-3xl font-black mt-1 font-mono text-amber-400">{formatCurrency(siteCosts.grandTotal)}</p>
              <div className="border-t border-slate-800 mt-3 pt-3 flex items-center justify-between text-xs text-slate-400">
                <span>Contract allocation limit:</span>
                <span className="font-mono text-white font-bold">{formatCurrency(site.allocatedBudget)}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Total Structural Labor costs</span>
              <p className="text-3xl font-black mt-1 font-mono text-slate-800">{formatCurrency(siteCosts.laborTotal)}</p>
              <div className="border-t border-slate-100 mt-3 pt-3 flex items-center justify-between text-xs text-slate-400">
                <span>Roster payroll total payments:</span>
                <span className="text-slate-800 font-bold">{formatCurrency(siteCosts.laborTotal)}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Suppliers Mat. costs</span>
              <p className="text-3xl font-black mt-1 font-mono text-slate-800">{formatCurrency(siteCosts.materialsTotal)}</p>
              <div className="border-t border-slate-100 mt-3 pt-3 flex items-center justify-between text-xs text-slate-400">
                <span>From received logistics logs:</span>
                <span className="text-slate-800 font-bold">{formatCurrency(siteCosts.materialsTotal)}</span>
              </div>
            </div>
          </div>

          {/* Graphical representation of Daily running costs */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Daily Running Cost Trends</h3>
              <p className="text-xs text-slate-500">Breakdown of operational outflows per calendar date</p>
            </div>

            {siteCosts.dailyBreakdown.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No recorded expenditure database points.</div>
            ) : (
              <div className="space-y-4">
                {/* SVG Cost Bar Graph Simulation */}
                <div className="h-32 bg-slate-50 rounded-xl border border-slate-200/50 p-4 flex items-end justify-around gap-2">
                  {siteCosts.dailyBreakdown.map((db, idx) => {
                    const maxCost = Math.max(...siteCosts.dailyBreakdown.map(d => d.total));
                    const percentageHeight = maxCost > 0 ? (db.total / maxCost) * 100 : 0;
                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 h-full justify-between pt-2">
                        <div className="w-full flex flex-col justify-end h-20 relative group">
                          {/* Tooltip */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 hidden group-hover:flex flex-col items-center z-10">
                            <span className="bg-slate-950 text-white text-[9px] font-bold py-0.5 px-2 rounded whitespace-nowrap">
                              Total: {formatCurrency(db.total)} (L: {db.labor}, M: {db.materials})
                            </span>
                          </div>
                          <div
                            style={{ height: `${percentageHeight}%` }}
                            className="bg-slate-900 rounded-t-xs w-full transition-all hover:bg-slate-800"
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold tracking-wider whitespace-nowrap">
                          {db.date.split('-')[2]}/{db.date.split('-')[1]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Grid cost listings detailed table */}
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                        <th className="p-2.5">Calendar Date</th>
                        <th className="p-2.5 text-right">Labor Payroll Depletion</th>
                        <th className="p-2.5 text-right">Material Supply Purchases</th>
                        <th className="p-2.5 text-right font-black text-slate-800">Cumulative Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {siteCosts.dailyBreakdown.map((db, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="p-2.5 font-bold text-slate-800">{formatDate(db.date)}</td>
                          <td className="p-2.5 text-right font-mono text-slate-600">{formatCurrency(db.labor)}</td>
                          <td className="p-2.5 text-right font-mono text-slate-600">{formatCurrency(db.materials)}</td>
                          <td className="p-2.5 text-right font-mono font-black text-slate-900 bg-slate-50/50">{formatCurrency(db.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>

          {/* Weekly & Monthly aggregates dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Weekly splits */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="border-b border-slate-100 pb-2 mb-3">
                <h4 className="text-sm font-bold text-slate-900">Weekly Plot Cost summary</h4>
                <p className="text-2xs text-slate-400">Aggregations grouped by weekly progress sprint cycles</p>
              </div>

              {siteCosts.weeklyBreakdown.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No weekly data available.</p>
              ) : (
                <div className="space-y-2">
                  {siteCosts.weeklyBreakdown.map((wb, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Weekly Sprint: {wb.week}</span>
                        <div className="flex gap-2 text-[10px] text-slate-400 mt-1 font-semibold">
                          <span>Labor: <b>{formatCurrency(wb.labor)}</b></span>
                          <span>•</span>
                          <span>Mat: <b>{formatCurrency(wb.materials)}</b></span>
                        </div>
                      </div>
                      <span className="text-sm font-mono font-black text-slate-900">{formatCurrency(wb.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Monthly splits */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="border-b border-slate-100 pb-2 mb-3">
                <h4 className="text-sm font-bold text-slate-900">Monthly Plot cost summary</h4>
                <p className="text-2xs text-slate-400">Total monthly running statement of accounts</p>
              </div>

              {siteCosts.monthlyBreakdown.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No monthly historical data registered.</p>
              ) : (
                <div className="space-y-2">
                  {siteCosts.monthlyBreakdown.map((mb, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{mb.month}</span>
                        <div className="flex gap-2 text-[10px] text-slate-400 mt-1 font-semibold">
                          <span>Labor: <b>{formatCurrency(mb.labor)}</b></span>
                          <span>•</span>
                          <span>Mat: <b>{formatCurrency(mb.materials)}</b></span>
                        </div>
                      </div>
                      <span className="text-sm font-mono font-black text-amber-600 font-bold">{formatCurrency(mb.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* TAB E: PAYROLL DECK - View daily foreman roll calls & tick who has been paid */}
      {activeTab === 'payroll' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-sans">Daily Foreman Roll Calls & Labor Payroll</h3>
              <p className="text-xs text-slate-500">Track worker attendances and audit cash disbursements based on foreman marks on site</p>
            </div>
            <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 font-mono">
              Unpaid labor dues detected in roster registries
            </span>
          </div>

          <div className="space-y-6">
            {state.attendance.filter(a => a.siteId === site.id).length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-400">No foreman roll call records yet for this site.</p>
                <p className="text-xs text-slate-400 mt-1">Please open the "Foreman Portal" in the top header, select this site, and submit a daily roll call!</p>
              </div>
            ) : (
              state.attendance.filter(a => a.siteId === site.id).map(att => {
                const totalDailyDues = att.presentWorkerIds.reduce((sum, wId) => {
                  const w = state.workers.find(wk => wk.id === wId);
                  return sum + (w?.dailyRate || 0);
                }, 0);

                const paidDues = att.paidWorkerIds.reduce((sum, wId) => {
                  const w = state.workers.find(wk => wk.id === wId);
                  return sum + (w?.dailyRate || 0);
                }, 0);

                const unpaidDues = totalDailyDues - paidDues;

                return (
                  <div key={att.id} className="p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 bg-white transition shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{formatDate(att.date)}</span>
                          <span className="text-slate-350 text-xs">|</span>
                          <span className="text-xs font-semibold text-slate-500">
                            Roster density: <b className="text-slate-700">{att.presentWorkerIds.length} Present</b> / {att.absentWorkerIds.length} Absent
                          </span>
                        </div>
                        <p className="text-2xs text-slate-400 uppercase mt-1 font-bold">Authorized daily record ID: {att.id}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-2xs font-semibold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl text-center">
                          Total Dues: <b className="text-slate-900 font-mono text-xs">{formatCurrency(totalDailyDues)}</b>
                        </div>
                        <div className="text-2xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl text-center">
                          Disbursed (Paid): <b className="text-emerald-900 font-mono text-xs">{formatCurrency(paidDues)}</b>
                        </div>
                        {unpaidDues > 0 ? (
                          <div className="text-2xs font-semibold text-rose-800 bg-rose-50 px-3 py-2 rounded-xl text-center">
                            Remaining Debts: <b className="text-rose-900 font-mono text-xs">{formatCurrency(unpaidDues)}</b>
                          </div>
                        ) : (
                          <div className="text-2xs font-bold text-emerald-800 bg-emerald-100 px-3 py-2 rounded-xl text-center">
                            Paid Out ✓
                          </div>
                        )}

                        {unpaidDues > 0 && (
                          <button
                            onClick={() => payAllForDay(att.id)}
                            className="bg-amber-500 text-slate-950 font-bold text-2xs px-3 py-2 rounded-xl hover:bg-amber-400 transition"
                          >
                            Disburse All Payroll today
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Breakdown list of present workers marked on roll call */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {att.presentWorkerIds.map(wId => {
                        const worker = state.workers.find(w => w.id === wId);
                        if (!worker) return null;
                        const isPaid = (att.paidWorkerIds || []).includes(wId);
                        return (
                          <div key={wId} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                            isPaid ? 'bg-slate-50/50 border-slate-150' : 'bg-red-50/20 border-rose-100/60'
                          }`}>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{worker.name}</p>
                              <p className="text-2xs text-slate-400">{worker.role} • <b>{formatCurrency(worker.dailyRate)} / day</b></p>
                            </div>

                            <button
                              onClick={() => togglePaymentStatus(att.id, worker.id)}
                              className={`px-2.5 py-1 rounded-md text-2xs font-bold transition select-none flex items-center gap-1 cursor-pointer uppercase ${
                                isPaid
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/60'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              }`}
                            >
                              {isPaid ? <Check className="w-3 h-3" /> : null}
                              {isPaid ? 'Paid' : 'Unpaid'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB F: REVIEWS & PRINTABLE REPORTS - Site Owners Monthly Reviews */}
      {activeTab === 'reports' && (
        <div className="space-y-6">

          {/* Config parameters panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-sans">Printable Client Review Center</h3>
                <p className="text-xs text-slate-500">Configure parameters before compiling the final monthly digest report</p>
              </div>
              <button
                onClick={executePrint}
                className="bg-slate-900 font-bold hover:bg-slate-800 transition text-white px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs"
              >
                <Printer className="w-4 h-4" /> Open Standard Browser Print Dialog
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-wide">Select Target Month:</label>
                <select
                  value={reportMonth}
                  onChange={(e) => setReportMonth(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 mt-1 text-xs text-slate-700 font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="2026-05">May 2026</option>
                  <option value="2026-04">April 2026</option>
                  <option value="2026-03">March 2026</option>
                </select>
              </div>
              <div>
                <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-wide">Client Email Contact Verified:</label>
                <input
                  type="text"
                  readOnly
                  value={site.clientEmail}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 mt-1 text-xs text-slate-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-wide">Executive Site Summary Comment (Customizable):</label>
                <textarea
                  rows={3}
                  value={reportCustomComment}
                  onChange={(e) => setReportCustomComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs text-slate-700 mt-1 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Dynamic Progress Photo Selection for the Report */}
              <div className="sm:col-span-2 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-wide">
                    Select Milestone Progress Photos to Include in {reportMonth} Report:
                  </label>
                  <span className="text-[10px] text-amber-600 font-bold">
                    {sitePhotos.filter(p => p.date.substring(0, 7) === reportMonth).length} photos found this month
                  </span>
                </div>
                {(() => {
                  const monthFilteredPhotos = sitePhotos.filter(
                    p => p.date.substring(0, 7) === reportMonth
                  );

                  if (monthFilteredPhotos.length === 0) {
                    return (
                      <div className="text-2xs text-slate-400 italic bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                        No progress photos found for {reportMonth}. You can upload photos with custom dates in the Foreman Portal.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                      {monthFilteredPhotos.map(ph => {
                        const isSelectedStatus = selectedReportPhotoIds.includes(ph.id) || (selectedReportPhotoIds.length === 0);
                        return (
                          <div
                            key={ph.id}
                            onClick={() => {
                              setSelectedReportPhotoIds(prev => {
                                if (prev.length === 0) {
                                  // Populate all except the clicked one to deselect it
                                  const allOtherIds = monthFilteredPhotos
                                    .filter(p => p.id !== ph.id)
                                    .map(p => p.id);
                                  return allOtherIds;
                                }
                                return prev.includes(ph.id)
                                  ? prev.filter(id => id !== ph.id)
                                  : [...prev, ph.id];
                              });
                            }}
                            className={`p-1.5 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                              isSelectedStatus
                                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-100'
                                : 'bg-white border-slate-200 opacity-60 hover:opacity-90'
                            }`}
                          >
                            <div className="h-16 bg-cover bg-center rounded mb-1" style={{ backgroundImage: `url(${ph.url})` }} />
                            <div className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                readOnly
                                checked={isSelectedStatus}
                                className="accent-amber-500 h-3.5 w-3.5 rounded pointer-events-none"
                              />
                              <span className="text-[9px] font-bold text-slate-700 truncate block flex-1">{ph.caption}</span>
                            </div>
                            <span className="text-[8px] text-slate-400 block font-mono mt-0.5">{ph.date} • {ph.stage}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* REPORT WRAPPER: PRINT PREVIEW PAGE */}
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-3xl">
            <div className="text-center py-2 bg-slate-250 rounded-xl mb-4">
              <span className="text-xxs font-black text-slate-500 uppercase tracking-wider">Aesthetic Print-area Wrapper</span>
            </div>

            {/* Printable Area with standard @media print rules or rich classes */}
            <div
              ref={printAreaRef}
              id="mjengo-print-sheet"
              className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm max-w-4xl mx-auto border border-slate-150 text-slate-800 font-sans"
            >
              {/* Report Header Logo */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-slate-900 text-white font-black text-base px-2 py-0.5 rounded tracking-tighter">M</span>
                    <span className="text-xl font-bold tracking-tight text-slate-900">MJENGO <span className="text-amber-600">254</span></span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold">Standard Contractor Building Portals & logistics</p>
                  <p className="text-[10px] text-slate-400">Office: Valley Road, Nairobi • Web: www.mjengo254.co.ke</p>
                </div>

                <div className="text-right">
                  <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                    Site monthly digest
                  </span>
                  <p className="text-2xs text-slate-400 mt-2 uppercase font-bold">Generated Ledger Date</p>
                  <p className="text-xs font-bold font-mono text-slate-800">{formatDate(new Date().toISOString().split('T')[0])}</p>
                </div>
              </div>

              {/* Master site data columns */}
              <div className="grid grid-cols-2 gap-6 mb-6 text-xs bg-slate-100 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="font-extrabold uppercase text-[10px] text-slate-500 tracking-wide">Project Parameters:</p>
                  <table className="mt-2 text-slate-700 text-left">
                    <tbody>
                      <tr>
                        <td className="py-1 font-bold">Site Plot:</td>
                        <td className="py-1 pl-4 font-semibold text-slate-900">{site.name}</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-bold">Coordinates Location:</td>
                        <td className="py-1 pl-4 text-slate-600">{site.location}</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-bold">Lead Site Supervisor:</td>
                        <td className="py-1 pl-4 text-slate-600">{site.foremanName} (Foreman ID)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <p className="font-extrabold uppercase text-[10px] text-slate-500 tracking-wide">Client Recipient:</p>
                  <table className="mt-2 text-slate-700 text-left">
                    <tbody>
                      <tr>
                        <td className="py-1 font-bold">Client Owner Name:</td>
                        <td className="py-1 pl-4 font-semibold text-slate-900">{site.clientName}</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-bold">Contractor Value Allocated:</td>
                        <td className="py-1 pl-4 font-mono font-bold text-slate-850">{formatCurrency(site.allocatedBudget)}</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-bold">Completed Cumulative Spend:</td>
                        <td className="py-1 pl-4 font-mono font-bold text-slate-900">{formatCurrency(site.spentBudget)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Executor comments */}
              <div className="space-y-2 border-b border-slate-200 pb-6 mb-6">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">Executive site assessment statement:</h4>
                <p className="text-xs text-slate-600 leading-relaxed italic bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                  "{reportCustomComment}"
                </p>
              </div>

              {/* Ledger Summary Calculations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">
                    Calculated Labor Outflows Group
                  </h4>
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-2xs uppercase text-slate-400 border-b border-slate-100 font-bold">
                        <th className="py-1">Date</th>
                        <th className="py-1 text-center">Crew count</th>
                        <th className="py-1 text-right">Payroll Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.attendance.filter(a => a.siteId === site.id).map((att, idx) => {
                        const dues = att.presentWorkerIds.reduce((sum, wId) => {
                          const w = state.workers.find(wk => wk.id === wId);
                          return sum + (w?.dailyRate || 0);
                        }, 0);
                        return (
                          <tr key={idx} className="border-b border-slate-50 text-slate-600">
                            <td className="py-1.5 font-medium">{formatDate(att.date)}</td>
                            <td className="py-1.5 text-center font-mono">{att.presentWorkerIds.length} present</td>
                            <td className="py-1.5 text-right font-mono font-bold text-slate-800">{formatCurrency(dues)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="flex justify-between font-bold text-xs text-slate-900 mt-2 bg-slate-50 p-2 rounded">
                    <span>Labor Subtotal:</span>
                    <span className="font-mono">{formatCurrency(siteCosts.laborTotal)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">
                    Approved Material Receipts Group
                  </h4>
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-2xs uppercase text-slate-400 border-b border-slate-100 font-bold">
                        <th className="py-1">Item Specifications</th>
                        <th className="py-1 text-center">Inflow Quantity</th>
                        <th className="py-1 text-right">Sum valuation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.logistics.filter(l => l.siteId === site.id && l.type === 'Received').map((log, idx) => {
                        const unitPrice = getSiteCosts(site.id); // trigger mock prices
                        return (
                          <tr key={idx} className="border-b border-slate-50 text-slate-600">
                            <td className="py-1.5 font-semibold text-slate-700">{log.itemName}</td>
                            <td className="py-1.5 text-center font-mono">{log.quantity} {log.unit}</td>
                            <td className="py-1.5 text-right font-mono font-bold text-slate-800">
                              {formatCurrency(log.quantity * (log.quantity > 50 ? 820 : 120))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="flex justify-between font-bold text-xs text-slate-900 mt-2 bg-slate-50 p-2 rounded">
                    <span>Materials Subtotal:</span>
                    <span className="font-mono">{formatCurrency(siteCosts.materialsTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Progress photo log thumbnails in printable review */}
              {(() => {
                const reportPhotos = sitePhotos.filter(ph => {
                  if (selectedReportPhotoIds.length > 0) {
                    return selectedReportPhotoIds.includes(ph.id);
                  }
                  return ph.date.substring(0, 7) === reportMonth;
                });

                if (reportPhotos.length === 0) return null;

                return (
                  <div className="space-y-3 border-t border-slate-200 pt-6 mb-8 break-inside-avoid">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">
                      Photographic Milestone Evidence & Progress Proof:
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {reportPhotos.map((ph, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden p-1.5 flex flex-col justify-between">
                          <div className="h-28 bg-slate-100 rounded mb-1 bg-cover bg-center" style={{ backgroundImage: `url(${ph.url})` }} />
                          <div>
                            <span className="text-[10px] font-bold text-slate-800 block line-clamp-2 leading-snug">{ph.caption}</span>
                            <span className="text-[8px] text-slate-400 block font-mono mt-0.5">{formatDate(ph.date)} • {ph.stage} Stage</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* End Signoff Block */}
              <div className="border-t-2 border-slate-900 pt-8 mt-12 grid grid-cols-2 gap-8 text-[11px] text-slate-500">
                <div className="space-y-4">
                  <p>REPORTING OFFICER SIGNATURE</p>
                  <div className="h-8 border-b border-dotted border-slate-400" />
                  <div>
                    <p className="font-bold text-slate-800">MJENGO 254 Site Contractor Director</p>
                    <p>Registered Builder Certificate: Class A Registered</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p>CLIENT WORK ACCEPTANCE SIGNATURE</p>
                  <div className="h-8 border-b border-dotted border-slate-400" />
                  <div>
                    <p className="font-bold text-slate-800">{site.clientName}</p>
                    <p>Verified Property Client Inspector Representative</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD SITE MODAL */}
      {showAddSiteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 min-h-screen">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl flex flex-col p-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-black text-slate-900 font-sans">Commission New Construction Site</h3>
              <button onClick={() => setShowAddSiteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSite} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-2xs font-extrabold text-slate-400 uppercase">Project Site Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Kilimani Residence Phase 2"
                    value={newSiteName}
                    onChange={(e) => setNewSiteName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 bg-slate-50 font-medium"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-2xs font-extrabold text-slate-400 uppercase">Coordinates Physical Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Road Block A, Kilimani, Nairobi"
                    value={newSiteLoc}
                    onChange={(e) => setNewSiteLoc(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-extrabold text-slate-400 uppercase">Total Allocated Budget (KSh)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15000000"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-extrabold text-slate-400 uppercase">Lead Foreman assignment</label>
                  <input
                    type="text"
                    placeholder="e.g. Moses Kiprop"
                    value={newForeman}
                    onChange={(e) => setNewForeman(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-extrabold text-slate-400 uppercase">Project Start Value Date</label>
                  <input
                    type="date"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-extrabold text-slate-400 uppercase">Expected Completion Date</label>
                  <input
                    type="date"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-extrabold text-slate-400 uppercase">Client Property Owner</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Jane Mugambi"
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-extrabold text-slate-400 uppercase">Client Verified Email</label>
                  <input
                    type="email"
                    placeholder="e.g. owner@domains.co.ke"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 text-xs rounded-xl transition shadow-xs mt-2"
              >
                Register Project and Set Active Control
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
