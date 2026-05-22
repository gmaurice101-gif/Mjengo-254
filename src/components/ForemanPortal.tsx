import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { DailyLog, MaterialRequest, ProgressPhoto } from '../types';
import { formatCurrency, formatDate } from '../utils';
import {
  Calendar,
  CloudSun,
  ClipboardList,
  Package,
  Camera,
  CheckCircle,
  Plus,
  AlertTriangle,
  FileSpreadsheet,
  Trash2,
  X,
  Upload,
  Check,
  Activity,
  UserPlus
} from 'lucide-react';

export const ForemanPortal: React.FC = () => {
  const {
    state,
    selectedSiteId,
    setSelectedSiteId,
    saveAttendance,
    addDailyLog,
    addMaterialRequest,
    addLogisticsLog,
    addProgressPhoto
  } = useProject();

  const site = state.sites.find(s => s.id === selectedSiteId) || state.sites[0];

  // Roll Call state
  const [rollCallDate, setRollCallDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [dailyRoster, setDailyRoster] = useState<{ workerId: string; present: boolean }[]>(() => {
    // initialize from existing attendance for this date if it exists
    const existing = state.attendance.find(a => a.date === rollCallDate && a.siteId === site.id);
    if (existing) {
      const present = existing.presentWorkerIds.map(id => ({ workerId: id, present: true }));
      const absent = existing.absentWorkerIds.map(id => ({ workerId: id, present: false }));
      return [...present, ...absent];
    }
    // initialize with a few default workers
    return state.workers.slice(0, 7).map(w => ({ workerId: w.id, present: true }));
  });

  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState<'Mason' | 'Mason Helper' | 'Plumber' | 'Electrician' | 'Carpenter' | 'Painter' | 'Steel Fixer' | 'Site Foreman' | 'General Labor'>('Mason');
  const [newWorkerRate, setNewWorkerRate] = useState<number>(1200);
  const [showAddNewWorker, setShowAddNewWorker] = useState(false);

  // Daily Log state
  const [weather, setWeather] = useState<'Sunny' | 'Rainy' | 'Cloudy' | 'Windy'>('Sunny');
  const [workDone, setWorkDone] = useState('');
  const [challenges, setChallenges] = useState('');

  // Material Request state
  const [materialName, setMaterialName] = useState('');
  const [materialQty, setMaterialQty] = useState('');
  const [materialUnit, setMaterialUnit] = useState('Bags');
  const [materialUrgency, setMaterialUrgency] = useState<'Low' | 'Medium' | 'High'>('High');

  // Photo Upload state
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoStage, setPhotoStage] = useState<'Excavation' | 'Foundation' | 'Wallings' | 'Roofing' | 'Finishes'>('Wallings');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState('');
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [photoDate, setPhotoDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Stock images for simulation
  const STOCK_PHOTOS = [
    { name: 'Slab Excavation', url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600', stage: 'Excavation' },
    { name: 'Reinforcement Cage', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600', stage: 'Foundation' },
    { name: 'Masonry Walling', url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=600', stage: 'Wallings' },
    { name: 'Roofing Beams', url: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=600', stage: 'Roofing' }
  ];

  // Success Feedbacks state variables
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  const triggerNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Switch Site handler
  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSiteId = e.target.value;
    setSelectedSiteId(nextSiteId);
    // reload roster or check if attendance exists for new site
    const existing = state.attendance.find(a => a.date === rollCallDate && a.siteId === nextSiteId);
    if (existing) {
      const present = existing.presentWorkerIds.map(id => ({ workerId: id, present: true }));
      const absent = existing.absentWorkerIds.map(id => ({ workerId: id, present: false }));
      setDailyRoster([...present, ...absent]);
    }
  };

  // Change roll call date
  const handleDateChange = (dateVal: string) => {
    setRollCallDate(dateVal);
    const existing = state.attendance.find(a => a.date === dateVal && a.siteId === site.id);
    if (existing) {
      const present = existing.presentWorkerIds.map(id => ({ workerId: id, present: true }));
      const absent = existing.absentWorkerIds.map(id => ({ workerId: id, present: false }));
      setDailyRoster([...present, ...absent]);
    }
  };

  // Handle adding a worker from the dropdown to the active roll call
  const addWorkerToRoster = () => {
    if (!selectedWorkerId) return;
    if (dailyRoster.some(item => item.workerId === selectedWorkerId)) {
      triggerNotification('Worker is already on the roster!', 'info');
      setSelectedWorkerId('');
      return;
    }
    setDailyRoster(prev => [...prev, { workerId: selectedWorkerId, present: true }]);
    setSelectedWorkerId('');
  };

  // Create and add new worker to database and roster
  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName) return;
    const workerId = `w-new-${Date.now()}`;
    const newWorker = {
      id: workerId,
      name: newWorkerName,
      role: newWorkerRole,
      dailyRate: newWorkerRate,
      phone: '07' + Math.floor(10000000 + Math.random() * 90000000)
    };

    state.workers.push(newWorker); // Add to global state pool
    setDailyRoster(prev => [...prev, { workerId: workerId, present: true }]);

    setNewWorkerName('');
    setShowAddNewWorker(false);
    triggerNotification(`Added ${newWorker.name} to database & roster!`);
  };

  const removeWorkerFromRoster = (wId: string) => {
    setDailyRoster(prev => prev.filter(item => item.workerId !== wId));
  };

  const toggleWorkerPresence = (wId: string) => {
    setDailyRoster(prev =>
      prev.map(item => (item.workerId === wId ? { ...item, present: !item.present } : item))
    );
  };

  const handleSubmitRollCall = () => {
    const presentIds = dailyRoster.filter(r => r.present).map(r => r.workerId);
    const absentIds = dailyRoster.filter(r => !r.present).map(r => r.workerId);

    saveAttendance(rollCallDate, site.id, presentIds, absentIds);
    triggerNotification(`Day's Roll Call for ${formatDate(rollCallDate)} successfully logged! Payroll updated.`);
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDone) return;

    addDailyLog({
      siteId: site.id,
      date: rollCallDate,
      weather,
      workDone,
      challenges,
      loggedBy: site.foremanName
    });

    setWorkDone('');
    setChallenges('');
    triggerNotification("Daily site log successfully recorded!");
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName || !materialQty) return;

    addMaterialRequest({
      siteId: site.id,
      itemName: materialName,
      quantity: parseFloat(materialQty),
      unit: materialUnit,
      urgency: materialUrgency,
      requestedBy: site.foremanName,
      date: new Date().toISOString().split('T')[0]
    });

    setMaterialName('');
    setMaterialQty('');
    triggerNotification("Material order request sent to Contractor!");
  };

  // Image Upload handler for raw files
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedPhotoUrl) {
      triggerNotification("Please select or upload an image first!", "info");
      return;
    }

    addProgressPhoto({
      siteId: site.id,
      url: uploadedPhotoUrl,
      caption: photoCaption || 'General progress snapshot',
      stage: photoStage,
      uploadedBy: site.foremanName,
      date: photoDate || new Date().toISOString().split('T')[0]
    });

    setPhotoCaption('');
    setUploadedPhotoUrl('');
    setFileInputKey(Date.now());
    triggerNotification("Progress photo uploaded successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Selection & Notification banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-100 p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Foreman Site Jurisdiction</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="font-semibold text-slate-800 text-lg">{site.name}</p>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{site.location}</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Switch Site:</label>
          <select
            value={selectedSiteId}
            onChange={handleSiteChange}
            className="rounded-lg border border-slate-300 px-3 py-1.5 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {state.sites.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
            ))}
          </select>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 shadow-sm transition-all animate-fade-in ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      {/* Grid Layout of Foreman Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Column 1: Daily Workers Roll Call (dropdown based - marks payroll) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Workers Roll Call</h3>
                  <p className="text-xs text-slate-500">Marks present days which feeds directly to payroll</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={rollCallDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none text-slate-700"
                />
              </div>
            </div>

            {/* Dropdown options for worker search and selection */}
            <div className="mb-4 bg-slate-50 p-3.5 rounded-xl border border-dashed border-slate-200">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                Assign Worker from Portal Pool
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <select
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Choose Worker to Add to Today's Roster --</option>
                    {state.workers.map(w => {
                      // Only show workers not already on the roster
                      const onRoster = dailyRoster.some(r => r.workerId === w.id);
                      if (onRoster) return null;
                      return (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.role}) - KSh {w.dailyRate}/day
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addWorkerToRoster}
                    disabled={!selectedWorkerId}
                    className="bg-slate-900 text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-50 flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add to List
                  </button>

                  <button
                    onClick={() => setShowAddNewWorker(!showAddNewWorker)}
                    className="border border-slate-300 hover:bg-slate-100 transition px-2.5 py-1.5 rounded-lg text-sm font-semibold text-slate-700 shrink-0"
                    title="Register a new builder worker"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form to Register New Worker */}
              {showAddNewWorker && (
                <form onSubmit={handleCreateWorker} className="mt-4 p-3 bg-white border border-slate-100 rounded-xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase">Register New Worker</h4>
                    <button type="button" onClick={() => setShowAddNewWorker(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={newWorkerName}
                      onChange={(e) => setNewWorkerName(e.target.value)}
                      className="border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 w-full"
                    />
                    <select
                      value={newWorkerRole}
                      onChange={(e) => setNewWorkerRole(e.target.value as any)}
                      className="border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 w-full bg-white"
                    >
                      <option value="Mason">Mason</option>
                      <option value="Mason Helper">Mason Helper</option>
                      <option value="General Labor">General Labor</option>
                      <option value="Plumber">Plumber</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Carpenter">Carpenter</option>
                      <option value="Steel Fixer">Steel Fixer</option>
                      <option value="Painter">Painter</option>
                    </select>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1 text-xs text-slate-400 font-bold">KSh</span>
                      <input
                        type="number"
                        required
                        min="500"
                        max="10000"
                        placeholder="Rate"
                        value={newWorkerRate}
                        onChange={(e) => setNewWorkerRate(parseInt(e.target.value))}
                        className="border border-slate-300 rounded pl-10 pr-2 py-1 text-xs text-slate-700 w-full"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-amber-600 text-white font-medium py-1.5 text-xs rounded hover:bg-amber-700 transition">
                    Save and Roster Worker
                  </button>
                </form>
              )}
            </div>

            {/* Attendance List Table */}
            {dailyRoster.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-400">Roster list is empty for this date.</p>
                <p className="text-xs text-slate-400 mt-1">Please select and add workers above to start the roll call.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                      <th className="py-2 px-3">Worker Info</th>
                      <th className="py-2 px-3 text-center">Standard Daily Rate</th>
                      <th className="py-2 px-3 text-center">Attendance Roll Call</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyRoster.map((item, index) => {
                      const worker = state.workers.find(w => w.id === item.workerId);
                      if (!worker) return null;
                      return (
                        <tr key={item.workerId} className="border-b border-slate-50 hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3">
                            <p className="text-xs font-semibold text-slate-800">{worker.name}</p>
                            <p className="text-[10px] text-slate-400">{worker.role} • {worker.phone}</p>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="text-xs font-mono font-medium text-slate-700">{formatCurrency(worker.dailyRate)}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex justify-center">
                              <button
                                onClick={() => toggleWorkerPresence(worker.id)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold select-none cursor-pointer transition flex items-center gap-1.5 ${
                                  item.present
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {item.present ? 'Present' : 'Absent'}
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => removeWorkerFromRoster(worker.id)}
                              className="text-slate-400 hover:text-rose-600 transition"
                              title="Remove from today's roll call"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg">
              Total roster size: <b>{dailyRoster.length} workers</b> • Active Present: <b>{dailyRoster.filter(r => r.present).length}</b>
            </div>
            <button
              onClick={handleSubmitRollCall}
              disabled={dailyRoster.length === 0}
              className="w-full sm:w-auto bg-amber-500 text-slate-900 border-b-2 border-amber-700 px-5 py-2 rounded-xl text-sm font-bold shadow-xs hover:bg-amber-400 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Submit Site Roll Call ({formatDate(rollCallDate)})
            </button>
          </div>
        </div>

        {/* Column 2: Materials Requests & Progress Photos */}
        <div className="lg:col-span-5 space-y-6">

          {/* Widget A: Material requests widget */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Package className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Request Site Materials</h3>
                <p className="text-xs text-slate-500">Submit requests directly to the contractor</p>
              </div>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Material Name / Specs</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Bamburi Cement, D12 Rebars..."
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-amber-500 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g., 50"
                    value={materialQty}
                    onChange={(e) => setMaterialQty(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-amber-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Unit</label>
                  <select
                    value={materialUnit}
                    onChange={(e) => setMaterialUnit(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="Bags">Bags</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Tonnes">Tonnes</option>
                    <option value="Trips">Trips (Sand/Hardcore)</option>
                    <option value="Litres">Litres</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Urgency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Low', 'Medium', 'High'] as const).map(lev => (
                    <button
                      key={lev}
                      type="button"
                      onClick={() => setMaterialUrgency(lev)}
                      className={`py-1 rounded text-xs font-semibold border transition ${
                        materialUrgency === lev
                          ? lev === 'High'
                            ? 'bg-rose-50 border-rose-300 text-rose-700'
                            : lev === 'Medium'
                              ? 'bg-amber-50 border-amber-300 text-amber-700'
                              : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {lev}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-semibold py-2 text-xs rounded-xl hover:bg-slate-800 transition shadow-xs mt-2"
              >
                Submit Materials Request Order
              </button>
            </form>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Recent Site Requests</h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {state.materialRequests.filter(r => r.siteId === site.id).map(r => (
                  <div key={r.id} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-150">
                    <div>
                      <p className="font-semibold text-slate-800">{r.itemName} <span className="font-mono text-slate-500">({r.quantity} {r.unit})</span></p>
                      <p className="text-[10px] text-slate-400">{formatDate(r.date)} • Priority: <span className={
                        r.urgency === 'High' ? 'text-rose-600 font-bold' : r.urgency === 'Medium' ? 'text-amber-600 font-medium' : 'text-slate-500'
                      }>{r.urgency}</span></p>
                    </div>
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        r.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : r.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Widget B: Upload progress snapshots */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Camera className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Site Progress Photo Log</h3>
                <p className="text-xs text-slate-500">Provide photographic evidence of work milestones</p>
              </div>
            </div>

            <form onSubmit={handlePhotoSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Image Caption</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Concrete columns cured..."
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-amber-500 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Progress Date</label>
                  <input
                    type="date"
                    required
                    value={photoDate}
                    onChange={(e) => setPhotoDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Construction Stage</label>
                  <select
                    value={photoStage}
                    onChange={(e) => setPhotoStage(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="Excavation">Excavation</option>
                    <option value="Foundation">Foundation</option>
                    <option value="Wallings">Wallings</option>
                    <option value="Roofing">Roofing</option>
                    <option value="Finishes">Finishes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Photo Selection Source</label>
                <label className="cursor-pointer bg-slate-550 border border-slate-300 hover:bg-slate-150 transition select-none flex items-center justify-center text-[11px] font-semibold text-slate-700 rounded-lg px-2.5 py-2.5 gap-1 shadow-sm w-full">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  Custom Upload File
                  <input
                    key={fileInputKey}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Presets library for fast demo testing */}
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Or use realistic seed simulator preset:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {STOCK_PHOTOS.map((sp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setUploadedPhotoUrl(sp.url);
                        setPhotoStage(sp.stage as any);
                        setPhotoCaption(sp.name);
                      }}
                      className={`relative group rounded-lg overflow-hidden border-2 h-14 bg-slate-100 transition ${
                        uploadedPhotoUrl === sp.url ? 'border-amber-500 ring-2 ring-amber-200' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={sp.url} alt={sp.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center opacity-0 group-hover:opacity-100 transition">
                        <span className="text-[8px] font-bold text-white px-0.5">{sp.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {uploadedPhotoUrl && (
                <div className="relative rounded-lg overflow-hidden border border-slate-200 h-28 bg-slate-50 flex items-center justify-center">
                  <img src={uploadedPhotoUrl} alt="Preview" className="h-full w-auto object-contain mx-auto" />
                  <button
                    type="button"
                    onClick={() => setUploadedPhotoUrl('')}
                    className="absolute top-1.5 right-1.5 bg-slate-900/80 text-white rounded-full p-1 hover:bg-slate-900 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-semibold py-2 text-xs rounded-xl hover:bg-slate-800 transition shadow-xs"
              >
                Upload & Add Photo to Project Gallery
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Daily Task Logs Feed (Logger Widget + Site logs lists) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <ClipboardList className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">Foreman's Daily Site Work Logs</h3>
            <p className="text-xs text-slate-500">Record overall challenges, weather conditions, and progress tasks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleLogSubmit} className="lg:col-span-5 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase mb-1">Create Daily Log</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Date</label>
                <input
                  type="date"
                  value={rollCallDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Weather</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700 bg-white"
                >
                  <option value="Sunny">Sunny ☀️</option>
                  <option value="Rainy">Rainy 🌧️</option>
                  <option value="Cloudy">Cloudy ☁️</option>
                  <option value="Windy">Windy 💨</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Work Done Summary</label>
              <textarea
                required
                rows={3}
                placeholder="What did the crew achieve today?"
                value={workDone}
                onChange={(e) => setWorkDone(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-700 focus:outline-none focus:border-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Challenges or Incident Reports (Optional)</label>
              <textarea
                rows={2}
                placeholder="Any material delays, weather delays, or safety incidents?"
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-700 focus:outline-none focus:border-amber-500 bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 text-slate-900 font-bold py-2 text-xs rounded-xl hover:bg-amber-400 transition tracking-wide shadow-xs"
            >
              Log Daily Progress Statement
            </button>
          </form>

          {/* Previous Site Logs */}
          <div className="lg:col-span-7 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Previous Logs Archive</h4>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {state.dailyLogs.filter(log => log.siteId === site.id).map(log => (
                <div key={log.id} className="p-4 rounded-xl border border-slate-150 bg-white hover:border-slate-300 transition shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{formatDate(log.date)}</span>
                      <span className="text-slate-300 text-xs">|</span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">Weather: {log.weather}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Foreman: {log.loggedBy}</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Labor & Works Completed</p>
                      <p className="text-xs text-slate-700 leading-relaxed mt-0.5">{log.workDone}</p>
                    </div>
                    {log.challenges && (
                      <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-lg">
                        <p className="text-[10px] font-bold text-rose-600 uppercase flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          Challenges reported:
                        </p>
                        <p className="text-xs text-rose-700 leading-normal mt-0.5">{log.challenges}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {state.dailyLogs.filter(log => log.siteId === site.id).length === 0 && (
                <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-sm text-slate-400">No daily logs found for this site.</p>
                  <p className="text-xs text-slate-400 mt-1">Submit the form on the left to catalog your first report.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
