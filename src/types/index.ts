export interface User {
  id: string; name: string; email: string; phone?: string;
  role: 'technician'|'housekeeping'|'spv'|'building_admin';
  buildingId: string; buildingName?: string; companyId: string;
}
export interface WorkOrder {
  id: string; title: string; description?: string; type: string;
  priority: string; status: string; location?: string;
  assignedTo?: string; dueDate?: string; buildingId: string; createdAt: string;
}
export interface ChecklistField {
  id: string; label: string; type: string; required: boolean; options?: string[];
}
export interface ChecklistSection { id: string; title: string; fields: ChecklistField[]; }
export interface ChecklistTemplate {
  id: string; name: string; type: string; frequency: string;
  buildingId: string; assetId?: string|null; items: any[];
}
export interface Asset {
  id: string; name: string; code?: string; category: string;
  location?: string; floor?: string; status: string;
  healthScore?: number; criticality?: string; buildingId: string;
}
export interface MaterialItem {
  id: string; name: string; category: string; unit: string;
  quantity: number; minStock: number; location?: string;
}
export interface PeriodicSchedule {
  id: string; title: string; frequency: string; nextDueDate: string;
  assetId?: string; assetName?: string; priority: string;
  status: 'overdue'|'due_soon'|'ok'; daysUntilDue: number;
}
export interface MyDayData {
  date: string;
  shift: {name:string;startTime:string;endTime:string;isOvernight:boolean}|null;
  attendance: {checkIn:string|null;checkOut:string|null;isValidLocation:boolean|null;hasCheckedIn:boolean;hasCheckedOut:boolean};
  workOrders: {total:number;items:WorkOrder[]};
  checklists: {total:number;pending:number;done:number;items:any[]};
  periodicSchedules: {overdue:number;items:PeriodicSchedule[]};
}
