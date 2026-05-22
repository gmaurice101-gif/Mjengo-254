import { ProjectState } from './types';

export const INITIAL_STATE: ProjectState = {
  sites: [
    {
      id: 'site-1',
      name: 'Kilimani Heights Apartments',
      location: 'Chania Avenue, Kilimani, Nairobi',
      allocatedBudget: 15500000,
      spentBudget: 6245000,
      startDate: '2026-03-01',
      expectedCompletion: '2026-11-30',
      status: 'Active',
      clientName: 'Waweru Holdings Ltd',
      clientEmail: 'info@waweruholdings.co.ke',
      foremanName: 'Moses Kiprop'
    },
    {
      id: 'site-2',
      name: 'Karen Luxury Villa',
      location: 'Invesco Lane, Karen, Nairobi',
      allocatedBudget: 28000000,
      spentBudget: 18450000,
      startDate: '2025-09-10',
      expectedCompletion: '2026-07-15',
      status: 'Active',
      clientName: 'Dr. Jane Mugambi',
      clientEmail: 'jane.mugambi@gmail.com',
      foremanName: 'Otieno Kennedy'
    },
    {
      id: 'site-3',
      name: 'Mombasa Oceanview Suites',
      location: 'Nyali Sea Rd, Nyali, Mombasa',
      allocatedBudget: 42000000,
      spentBudget: 9800000,
      startDate: '2026-01-15',
      expectedCompletion: '2027-02-28',
      status: 'Active',
      clientName: 'Nyali Reef Developers',
      clientEmail: 'development@nyalireef.com',
      foremanName: 'Salim Mwinyi'
    },
    {
      id: 'site-4',
      name: 'Syokimau Gateway Quad',
      location: 'Mwananchi Road, Syokimau',
      allocatedBudget: 8500000,
      spentBudget: 8200000,
      startDate: '2025-11-01',
      expectedCompletion: '2026-05-30',
      status: 'Completed',
      clientName: 'Mutua & Family Trust',
      clientEmail: 'mutuas@syokimau.co.ke',
      foremanName: 'Agnes Mutuku'
    }
  ],
  workers: [
    { id: 'w-1', name: 'John Kamau', role: 'Mason', dailyRate: 1500, phone: '0712345678' },
    { id: 'w-2', name: 'David Omondi', role: 'Mason', dailyRate: 1500, phone: '0722345679' },
    { id: 'w-3', name: 'Peter Mwangi', role: 'Mason Helper', dailyRate: 1000, phone: '0732345680' },
    { id: 'w-4', name: 'Mary Wambui', role: 'Mason Helper', dailyRate: 1000, phone: '0742345681' },
    { id: 'w-5', name: 'Brian Kipchirchir', role: 'Plumber', dailyRate: 1800, phone: '0752345682' },
    { id: 'w-6', name: 'James Onyango', role: 'Electrician', dailyRate: 1800, phone: '0762345683' },
    { id: 'w-7', name: 'Aloice Mwanzia', role: 'Steel Fixer', dailyRate: 1600, phone: '0772345684' },
    { id: 'w-8', name: 'Hassan Juma', role: 'Carpenter', dailyRate: 1700, phone: '0782345685' },
    { id: 'w-9', name: 'Agnes Atieno', role: 'General Labor', dailyRate: 900, phone: '0792345686' },
    { id: 'w-10', name: 'Francis Njoroge', role: 'General Labor', dailyRate: 900, phone: '0702345687' },
    { id: 'w-11', name: 'Mwenda Silas', role: 'Mason', dailyRate: 1500, phone: '0711112222' },
    { id: 'w-12', name: 'Fatuma Ali', role: 'General Labor', dailyRate: 900, phone: '0722223333' }
  ],
  attendance: [
    // Historical records for site-1 (Kilimani Heights) to simulate financial views
    {
      id: 'att-1-1',
      date: '2026-05-22',
      siteId: 'site-1',
      presentWorkerIds: ['w-1', 'w-2', 'w-3', 'w-4', 'w-5', 'w-7', 'w-9', 'w-11'],
      absentWorkerIds: ['w-6', 'w-8', 'w-10', 'w-12'],
      paidWorkerIds: ['w-1', 'w-3', 'w-4', 'w-9']
    },
    {
      id: 'att-1-2',
      date: '2026-05-21',
      siteId: 'site-1',
      presentWorkerIds: ['w-1', 'w-2', 'w-3', 'w-4', 'w-6', 'w-8', 'w-9', 'w-12'],
      absentWorkerIds: ['w-5', 'w-7', 'w-10', 'w-11'],
      paidWorkerIds: ['w-1', 'w-2', 'w-3', 'w-4', 'w-6', 'w-8', 'w-9', 'w-12'] // fully paid
    },
    {
      id: 'att-1-3',
      date: '2026-05-20',
      siteId: 'site-1',
      presentWorkerIds: ['w-1', 'w-2', 'w-3', 'w-4', 'w-5', 'w-6', 'w-7', 'w-8', 'w-9', 'w-10'],
      absentWorkerIds: ['w-11', 'w-12'],
      paidWorkerIds: ['w-1', 'w-2', 'w-3', 'w-4', 'w-5', 'w-6', 'w-7', 'w-8', 'w-9', 'w-10'] // fully paid
    },
    {
      id: 'att-1-4',
      date: '2026-05-19',
      siteId: 'site-1',
      presentWorkerIds: ['w-1', 'w-2', 'w-3', 'w-4', 'w-5', 'w-7', 'w-8', 'w-9', 'w-12'],
      absentWorkerIds: ['w-6', 'w-10', 'w-11'],
      paidWorkerIds: ['w-1', 'w-2', 'w-3', 'w-4', 'w-5', 'w-7', 'w-8', 'w-9', 'w-12']
    },
    {
      id: 'att-1-5',
      date: '2026-05-18',
      siteId: 'site-1',
      presentWorkerIds: ['w-1', 'w-2', 'w-3', 'w-4', 'w-5', 'w-6', 'w-7', 'w-8', 'w-9', 'w-10', 'w-11', 'w-12'],
      absentWorkerIds: [],
      paidWorkerIds: ['w-1', 'w-2', 'w-3', 'w-4', 'w-5', 'w-6', 'w-7', 'w-8', 'w-9', 'w-10', 'w-11', 'w-12']
    },
    // Historical for site-2 (Karen Villa)
    {
      id: 'att-2-1',
      date: '2026-05-22',
      siteId: 'site-2',
      presentWorkerIds: ['w-1', 'w-5', 'w-6', 'w-8', 'w-10', 'w-12'],
      absentWorkerIds: ['w-2', 'w-3', 'w-4', 'w-7', 'w-9', 'w-11'],
      paidWorkerIds: []
    },
    {
      id: 'att-2-2',
      date: '2026-05-21',
      siteId: 'site-2',
      presentWorkerIds: ['w-1', 'w-2', 'w-5', 'w-6', 'w-8', 'w-10', 'w-11', 'w-12'],
      absentWorkerIds: ['w-3', 'w-4', 'w-7', 'w-9'],
      paidWorkerIds: ['w-1', 'w-2', 'w-5', 'w-6', 'w-8', 'w-10', 'w-11', 'w-12']
    }
  ],
  inventory: [
    { id: 'inv-1', siteId: 'site-1', name: 'Bamburi Cement OPC 42.5', quantity: 185, unit: 'Bags', category: 'Aggregates & Binding', lastUpdated: '2026-05-22' },
    { id: 'inv-2', siteId: 'site-1', name: 'D12 Reinforcement Steel Bars', quantity: 42, unit: 'Pcs', category: 'Structural Steel', lastUpdated: '2026-05-21' },
    { id: 'inv-3', siteId: 'site-1', name: 'River Sand', quantity: 12, unit: 'Tonnes', category: 'Aggregates & Binding', lastUpdated: '2026-05-20' },
    { id: 'inv-4', siteId: 'site-1', name: 'McNaught Concrete Blocks 9\"', quantity: 950, unit: 'Pcs', category: 'Masonry', lastUpdated: '2026-05-22' },
    { id: 'inv-5', siteId: 'site-2', name: 'Bamburi Cement OPC 42.5', quantity: 24, unit: 'Bags', category: 'Aggregates & Binding', lastUpdated: '2026-05-22' }, // low stock
    { id: 'inv-6', siteId: 'site-2', name: 'Structural Timber 2x4', quantity: 80, unit: 'Pcs', category: 'Carpentry', lastUpdated: '2026-05-19' },
    { id: 'inv-7', siteId: 'site-3', name: 'Bamburi Cement OPC 42.5', quantity: 500, unit: 'Bags', category: 'Aggregates & Binding', lastUpdated: '2026-05-20' }
  ],
  logistics: [
    {
      id: 'log-1',
      siteId: 'site-1',
      date: '2026-05-22T08:30:00Z',
      type: 'Received',
      itemName: 'Bamburi Cement OPC 42.5',
      quantity: 100,
      unit: 'Bags',
      handler: 'Moses Kiprop',
      supplierOrRecipient: 'Rhino Cement Distributors'
    },
    {
      id: 'log-2',
      siteId: 'site-1',
      date: '2026-05-22T11:15:00Z',
      type: 'Disbursed',
      itemName: 'McNaught Concrete Blocks 9\"',
      quantity: 250,
      unit: 'Pcs',
      handler: 'Moses Kiprop',
      supplierOrRecipient: 'Section B Walling Crew'
    },
    {
      id: 'log-3',
      siteId: 'site-1',
      date: '2026-05-21T09:00:00Z',
      type: 'Received',
      itemName: 'D12 Reinforcement Steel Bars',
      quantity: 50,
      unit: 'Pcs',
      handler: 'Moses Kiprop',
      supplierOrRecipient: 'Apex Steel Mills'
    },
    {
      id: 'log-4',
      siteId: 'site-2',
      date: '2026-05-22T10:00:00Z',
      type: 'Disbursed',
      itemName: 'Bamburi Cement OPC 42.5',
      quantity: 40,
      unit: 'Bags',
      handler: 'Otieno Kennedy',
      supplierOrRecipient: 'First Floor Plastering'
    }
  ],
  materialRequests: [
    {
      id: 'req-1',
      siteId: 'site-1',
      itemName: 'D10 Steel Bars',
      quantity: 30,
      unit: 'Pcs',
      urgency: 'Medium',
      status: 'Pending',
      requestedBy: 'Moses Kiprop',
      date: '2026-05-22'
    },
    {
      id: 'req-2',
      siteId: 'site-1',
      itemName: 'River Sand Supply',
      quantity: 20,
      unit: 'Tonnes',
      urgency: 'High',
      status: 'Approved',
      requestedBy: 'Moses Kiprop',
      date: '2026-05-21'
    },
    {
      id: 'req-3',
      siteId: 'site-2',
      itemName: 'Bamburi Cement OPC 42.5',
      quantity: 150,
      unit: 'Bags',
      urgency: 'High',
      status: 'Pending',
      requestedBy: 'Otieno Kennedy',
      date: '2026-05-22'
    }
  ],
  dailyLogs: [
    {
      id: 'dl-1',
      siteId: 'site-1',
      date: '2026-05-22',
      weather: 'Sunny',
      workDone: 'Casting the ground floor columns and laying blocks for the eastern wing. Plumbers installed structural drainage pipes.',
      challenges: 'Slight delay in block delivery due to traffic along Mombasa Road, but the backlog was resolved by noon.',
      loggedBy: 'Moses Kiprop'
    },
    {
      id: 'dl-2',
      siteId: 'site-1',
      date: '2026-05-21',
      weather: 'Cloudy',
      workDone: 'Erecting high-level scaffolding. Electricians complete electrical wiring conduits on ground floor slab levels.',
      challenges: 'None. Smooth progress throughout the shifters\' rosters.',
      loggedBy: 'Moses Kiprop'
    },
    {
      id: 'dl-3',
      siteId: 'site-2',
      date: '2026-05-22',
      weather: 'Rainy',
      workDone: 'Interior floor leveling and plastering. Structural timber framing for roof truss preparation on site.',
      challenges: 'Heavy rains at 2 PM stopped outdoor painting and exterior wall finishing operations, shifted all work indoors.',
      loggedBy: 'Otieno Kennedy'
    }
  ],
  progressPhotos: [
    {
      id: 'ph-1',
      siteId: 'site-1',
      url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600',
      caption: 'Setting up framework on eastern columns',
      stage: 'Foundation',
      uploadedBy: 'Moses Kiprop',
      date: '2026-05-22'
    },
    {
      id: 'ph-2',
      siteId: 'site-1',
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600',
      caption: 'Slab reinforcement inspection before pouring',
      stage: 'Foundation',
      uploadedBy: 'Moses Kiprop',
      date: '2026-05-20'
    },
    {
      id: 'ph-3',
      siteId: 'site-2',
      url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=600',
      caption: 'Roofing truss assembly on Karen site',
      stage: 'Roofing',
      uploadedBy: 'Otieno Kennedy',
      date: '2026-05-22'
    },
    {
      id: 'ph-4',
      siteId: 'site-3',
      url: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=600',
      caption: 'Excavation completed and boundary wall being laid',
      stage: 'Excavation',
      uploadedBy: 'Salim Mwinyi',
      date: '2026-05-18'
    }
  ]
};
