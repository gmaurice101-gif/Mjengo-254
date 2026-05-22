import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ProjectState,
  ConstructionSite,
  Worker,
  AttendanceRecord,
  InventoryItem,
  LogisticsLog,
  MaterialRequest,
  DailyLog,
  ProgressPhoto
} from '../types';
import { INITIAL_STATE } from '../mockData';

interface ProjectContextType {
  state: ProjectState;
  activeRole: 'Contractor' | 'Foreman';
  setActiveRole: (role: 'Contractor' | 'Foreman') => void;
  selectedSiteId: string;
  setSelectedSiteId: (id: string) => void;
  addSite: (site: Omit<ConstructionSite, 'id' | 'spentBudget'>) => void;
  addWorker: (worker: Omit<Worker, 'id'>) => void;
  saveAttendance: (date: string, siteId: string, presentIds: string[], absentIds: string[]) => void;
  addDailyLog: (log: Omit<DailyLog, 'id'>) => void;
  addMaterialRequest: (req: Omit<MaterialRequest, 'id' | 'status'>) => void;
  updateMaterialRequestStatus: (id: string, status: 'Approved' | 'Rejected') => void;
  addLogisticsLog: (log: Omit<LogisticsLog, 'id'>) => void;
  addProgressPhoto: (photo: Omit<ProgressPhoto, 'id'>) => void;
  togglePaymentStatus: (attendanceId: string, workerId: string) => void;
  payAllForDay: (attendanceId: string) => void;
  getSiteCosts: (siteId: string) => {
    laborTotal: number;
    materialsTotal: number;
    grandTotal: number;
    dailyBreakdown: { date: string; labor: number; materials: number; total: number }[];
    weeklyBreakdown: { week: string; labor: number; materials: number; total: number }[];
    monthlyBreakdown: { month: string; labor: number; materials: number; total: number }[];
  };
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Material unit pricing estimates for realistic running costs
export const MATERIAL_PRICES: Record<string, number> = {
  'Bamburi Cement OPC 42.5': 850,
  'D12 Reinforcement Steel Bars': 1800,
  'D10 Steel Bars': 1400,
  'River Sand': 2800,
  'River Sand Supply': 2800,
  'McNaught Concrete Blocks 9"': 120,
  'Structural Timber 2x4': 450,
};

export const getMaterialUnitPrice = (name: string): number => {
  const match = Object.keys(MATERIAL_PRICES).find(key => name.toLowerCase().includes(key.toLowerCase()));
  return match ? MATERIAL_PRICES[match] : 1000; // default estimate
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ProjectState>(() => {
    const saved = localStorage.getItem('mjengo_254_state');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  const [activeRole, setActiveRole] = useState<'Contractor' | 'Foreman'>(() => {
    return (localStorage.getItem('mjengo_254_role') as 'Contractor' | 'Foreman') || 'Contractor';
  });

  const [selectedSiteId, setSelectedSiteId] = useState<string>(() => {
    const saved = localStorage.getItem('mjengo_254_selected_site');
    return saved || 'site-1';
  });

  useEffect(() => {
    localStorage.setItem('mjengo_254_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('mjengo_254_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('mjengo_254_selected_site', selectedSiteId);
  }, [selectedSiteId]);

  const addSite = (newSite: Omit<ConstructionSite, 'id' | 'spentBudget'>) => {
    const id = `site-${Date.now()}`;
    const site: ConstructionSite = {
      ...newSite,
      id,
      spentBudget: 0,
    };
    setState(prev => ({
      ...prev,
      sites: [...prev.sites, site]
    }));
    setSelectedSiteId(id);
  };

  const addWorker = (newWorker: Omit<Worker, 'id'>) => {
    const id = `w-${Date.now()}`;
    const worker: Worker = {
      ...newWorker,
      id
    };
    setState(prev => ({
      ...prev,
      workers: [...prev.workers, worker]
    }));
  };

  const saveAttendance = (date: string, siteId: string, presentIds: string[], absentIds: string[]) => {
    setState(prev => {
      // Check if attendance already exists
      const existingIdx = prev.attendance.findIndex(a => a.date === date && a.siteId === siteId);
      const updatedAttendance = [...prev.attendance];

      if (existingIdx >= 0) {
        // preserve already paid workers who are still marked as present
        const alreadyPaid = updatedAttendance[existingIdx].paidWorkerIds || [];
        const validPaidIds = alreadyPaid.filter(id => presentIds.includes(id));

        updatedAttendance[existingIdx] = {
          ...updatedAttendance[existingIdx],
          presentWorkerIds: presentIds,
          absentWorkerIds: absentIds,
          paidWorkerIds: validPaidIds
        };
      } else {
        updatedAttendance.push({
          id: `att-${Date.now()}`,
          date,
          siteId,
          presentWorkerIds: presentIds,
          absentWorkerIds: absentIds,
          paidWorkerIds: []
        });
      }

      // Automatically sync budget spending using total computed costs
      const nextState = { ...prev, attendance: updatedAttendance };
      return syncSiteSpending(nextState, siteId);
    });
  };

  const addDailyLog = (newLog: Omit<DailyLog, 'id'>) => {
    const log: DailyLog = {
      ...newLog,
      id: `dl-${Date.now()}`
    };
    setState(prev => ({
      ...prev,
      dailyLogs: [log, ...prev.dailyLogs]
    }));
  };

  const addMaterialRequest = (newReq: Omit<MaterialRequest, 'id' | 'status'>) => {
    const req: MaterialRequest = {
      ...newReq,
      id: `req-${Date.now()}`,
      status: 'Pending'
    };
    setState(prev => ({
      ...prev,
      materialRequests: [req, ...prev.materialRequests]
    }));
  };

  const updateMaterialRequestStatus = (id: string, status: 'Approved' | 'Rejected') => {
    setState(prev => {
      const updatedReqs = prev.materialRequests.map(r => {
        if (r.id === id) {
          return { ...r, status };
        }
        return r;
      });

      // If approved, let's automatically add log for Received to Logistics log & update Inventory quantities
      let updatedLogistics = [...prev.logistics];
      let updatedInventory = [...prev.inventory];
      const req = prev.materialRequests.find(r => r.id === id);

      if (status === 'Approved' && req) {
        const logId = `log-auto-${Date.now()}`;
        const newLog: LogisticsLog = {
          id: logId,
          siteId: req.siteId,
          date: new Date().toISOString(),
          type: 'Received',
          itemName: req.itemName,
          quantity: req.quantity,
          unit: req.unit,
          handler: 'System Auto-Approval',
          supplierOrRecipient: 'Authorized Vendor'
        };
        updatedLogistics = [newLog, ...updatedLogistics];

        // Update inventory
        const existingItemIdx = updatedInventory.findIndex(i => i.siteId === req.siteId && i.name.toLowerCase() === req.itemName.toLowerCase());
        if (existingItemIdx >= 0) {
          updatedInventory[existingItemIdx] = {
            ...updatedInventory[existingItemIdx],
            quantity: updatedInventory[existingItemIdx].quantity + req.quantity,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        } else {
          updatedInventory.push({
            id: `inv-${Date.now()}`,
            siteId: req.siteId,
            name: req.itemName,
            quantity: req.quantity,
            unit: req.unit,
            category: 'Approved Supply',
            lastUpdated: new Date().toISOString().split('T')[0]
          });
        }
      }

      const nextState = {
        ...prev,
        materialRequests: updatedReqs,
        logistics: updatedLogistics,
        inventory: updatedInventory
      };

      return req ? syncSiteSpending(nextState, req.siteId) : nextState;
    });
  };

  const addLogisticsLog = (newLog: Omit<LogisticsLog, 'id'>) => {
    const log: LogisticsLog = {
      ...newLog,
      id: `log-${Date.now()}`
    };

    setState(prev => {
      // update inventory levels based on standard logistics
      const updatedInventory = [...prev.inventory];
      const existingItemIdx = updatedInventory.findIndex(
        i => i.siteId === log.siteId && i.name.toLowerCase() === log.itemName.toLowerCase()
      );

      const multiplier = log.type === 'Received' ? 1 : -1;

      if (existingItemIdx >= 0) {
        const nextQty = Math.max(0, updatedInventory[existingItemIdx].quantity + (log.quantity * multiplier));
        updatedInventory[existingItemIdx] = {
          ...updatedInventory[existingItemIdx],
          quantity: nextQty,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      } else if (log.type === 'Received') {
        updatedInventory.push({
          id: `inv-${Date.now()}`,
          siteId: log.siteId,
          name: log.itemName,
          quantity: log.quantity,
          unit: log.unit,
          category: 'General Binding',
          lastUpdated: new Date().toISOString().split('T')[0]
        });
      }

      const nextState = {
        ...prev,
        logistics: [log, ...prev.logistics],
        inventory: updatedInventory
      };

      return syncSiteSpending(nextState, log.siteId);
    });
  };

  const addProgressPhoto = (newPhoto: Omit<ProgressPhoto, 'id'>) => {
    const photo: ProgressPhoto = {
      ...newPhoto,
      id: `ph-${Date.now()}`
    };
    setState(prev => ({
      ...prev,
      progressPhotos: [photo, ...prev.progressPhotos]
    }));
  };

  const togglePaymentStatus = (attendanceId: string, workerId: string) => {
    setState(prev => {
      const updatedAttendance = prev.attendance.map(a => {
        if (a.id === attendanceId) {
          const paid = a.paidWorkerIds || [];
          const isPaidIdx = paid.indexOf(workerId);
          let nextPaid = [...paid];

          if (isPaidIdx >= 0) {
            nextPaid.splice(isPaidIdx, 1);
          } else {
            nextPaid.push(workerId);
          }
          return { ...a, paidWorkerIds: nextPaid };
        }
        return a;
      });

      return {
        ...prev,
        attendance: updatedAttendance
      };
    });
  };

  const payAllForDay = (attendanceId: string) => {
    setState(prev => {
      const updatedAttendance = prev.attendance.map(a => {
        if (a.id === attendanceId) {
          return { ...a, paidWorkerIds: [...a.presentWorkerIds] };
        }
        return a;
      });
      return {
        ...prev,
        attendance: updatedAttendance
      };
    });
  };

  // Synchronizes a site's actual spending based on historical calculations
  const syncSiteSpending = (currentState: ProjectState, siteId: string): ProjectState => {
    const costs = calculateSiteCosts(currentState, siteId);
    const updatedSites = currentState.sites.map(s => {
      if (s.id === siteId) {
        return { ...s, spentBudget: costs.grandTotal };
      }
      return s;
    });

    return {
      ...currentState,
      sites: updatedSites
    };
  };

  const calculateSiteCosts = (currState: ProjectState, siteId: string) => {
    const siteWorkers = currState.workers;
    const siteAttendance = currState.attendance.filter(a => a.siteId === siteId);
    const siteLogistics = currState.logistics.filter(l => l.siteId === siteId);

    // 1. Labor Costs
    let laborTotal = 0;
    const laborByDate: Record<string, number> = {};

    siteAttendance.forEach(att => {
      let dayCost = 0;
      att.presentWorkerIds.forEach(wId => {
        const worker = siteWorkers.find(w => w.id === wId);
        if (worker) {
          dayCost += worker.dailyRate;
        }
      });
      laborTotal += dayCost;
      laborByDate[att.date] = (laborByDate[att.date] || 0) + dayCost;
    });

    // 2. Material/Logistics Costs (Only Received totals represent budget outflows)
    let materialsTotal = 0;
    const materialsByDate: Record<string, number> = {};

    siteLogistics.forEach(log => {
      if (log.type === 'Received') {
        const itemDate = log.date.split('T')[0];
        const itemCost = log.quantity * getMaterialUnitPrice(log.itemName);
        materialsTotal += itemCost;
        materialsByDate[itemDate] = (materialsByDate[itemDate] || 0) + itemCost;
      }
    });

    // 3. Overall Daily Breakdown
    const allDates = Array.from(new Set([
      ...Object.keys(laborByDate),
      ...Object.keys(materialsByDate)
    ])).sort();

    const dailyBreakdown = allDates.map(date => {
      const labor = laborByDate[date] || 0;
      const materials = materialsByDate[date] || 0;
      return {
        date,
        labor,
        materials,
        total: labor + materials
      };
    });

    // Grouping by standard calendar weeks (simplification using date-group keys)
    const weeklyMap: Record<string, { labor: number; materials: number; total: number }> = {};
    dailyBreakdown.forEach(day => {
      // Week identifier: e.g., '2026-W21'
      // Get Week Number approximation
      const dateVal = new Date(day.date);
      const oneJan = new Date(dateVal.getFullYear(), 0, 1);
      const numberOfDays = Math.floor((dateVal.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
      const weekKey = `${dateVal.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;

      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = { labor: 0, materials: 0, total: 0 };
      }
      weeklyMap[weekKey].labor += day.labor;
      weeklyMap[weekKey].materials += day.materials;
      weeklyMap[weekKey].total += day.total;
    });

    const weeklyBreakdown = Object.keys(weeklyMap).sort().map(week => ({
      week,
      ...weeklyMap[week]
    }));

    // Grouping by Month
    const monthlyMap: Record<string, { labor: number; materials: number; total: number }> = {};
    dailyBreakdown.forEach(day => {
      const monthKey = day.date.substring(0, 7); // e.g., '2026-05'
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { labor: 0, materials: 0, total: 0 };
      }
      monthlyMap[monthKey].labor += day.labor;
      monthlyMap[monthKey].materials += day.materials;
      monthlyMap[monthKey].total += day.total;
    });

    const monthlyBreakdown = Object.keys(monthlyMap).sort().map(month => {
      // Format month as 'May 2026'
      const year = month.substring(0, 4);
      const monthNum = parseInt(month.substring(5, 7), 10);
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const formattedMonth = `${months[monthNum - 1]} ${year}`;

      return {
        month: formattedMonth,
        rawMonth: month,
        labor: monthlyMap[month].labor,
        materials: monthlyMap[month].materials,
        total: monthlyMap[month].total
      };
    });

    return {
      laborTotal,
      materialsTotal,
      grandTotal: laborTotal + materialsTotal,
      dailyBreakdown,
      weeklyBreakdown,
      monthlyBreakdown
    };
  };

  const getSiteCosts = (siteId: string) => {
    return calculateSiteCosts(state, siteId);
  };

  return (
    <ProjectContext.Provider value={{
      state,
      activeRole,
      setActiveRole,
      selectedSiteId,
      setSelectedSiteId,
      addSite,
      addWorker,
      saveAttendance,
      addDailyLog,
      addMaterialRequest,
      updateMaterialRequestStatus,
      addLogisticsLog,
      addProgressPhoto,
      togglePaymentStatus,
      payAllForDay,
      getSiteCosts
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
