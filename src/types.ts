export interface ConstructionSite {
  id: string;
  name: string;
  location: string;
  allocatedBudget: number;
  spentBudget: number;
  startDate: string;
  expectedCompletion: string;
  status: 'Planning' | 'Active' | 'Paused' | 'Completed';
  clientName: string;
  clientEmail: string;
  foremanName: string;
}

export type WorkerRole = 'Mason' | 'Mason Helper' | 'Plumber' | 'Electrician' | 'Carpenter' | 'Painter' | 'Steel Fixer' | 'Site Foreman' | 'General Labor';

export interface Worker {
  id: string;
  name: string;
  role: WorkerRole;
  dailyRate: number; // in KSh (Kenya Shillings since Mjengo 254 indicates Kenyan construction site environment! "254" is Kenya's country code. Let's make it look authentic and contextual using Kenyan Shillings KSh!)
  phone: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  siteId: string;
  presentWorkerIds: string[]; // Workers who showed up
  absentWorkerIds: string[]; // Workers who were absent
  paidWorkerIds: string[]; // Workers who have been paid for this day
}

export interface InventoryItem {
  id: string;
  siteId: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  lastUpdated: string;
}

export interface LogisticsLog {
  id: string;
  siteId: string;
  date: string;
  type: 'Received' | 'Disbursed';
  itemName: string;
  quantity: number;
  unit: string;
  handler: string;
  supplierOrRecipient: string;
}

export interface MaterialRequest {
  id: string;
  siteId: string;
  itemName: string;
  quantity: number;
  unit: string;
  urgency: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedBy: string;
  date: string;
}

export interface DailyLog {
  id: string;
  siteId: string;
  date: string;
  weather: 'Sunny' | 'Rainy' | 'Cloudy' | 'Windy';
  workDone: string;
  challenges: string;
  loggedBy: string;
}

export interface ProgressPhoto {
  id: string;
  siteId: string;
  url: string; // base64 or placeholder url
  caption: string;
  stage: 'Excavation' | 'Foundation' | 'Wallings' | 'Roofing' | 'Finishes';
  uploadedBy: string;
  date: string;
}

export interface ProjectState {
  sites: ConstructionSite[];
  workers: Worker[];
  attendance: AttendanceRecord[];
  inventory: InventoryItem[];
  logistics: LogisticsLog[];
  materialRequests: MaterialRequest[];
  dailyLogs: DailyLog[];
  progressPhotos: ProgressPhoto[];
}
