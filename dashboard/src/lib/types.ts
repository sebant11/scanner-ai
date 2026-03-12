export interface Barber {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarText: string;
  status: "busy" | "ai-filled" | "open";
  currentClient: string | null;
  fillPercentage: number;
  dailyRevenue: number;
}

export interface TimeSlot {
  id: string;
  time: string;
  endTime: string;
  barberId: string;
  barberName: string;
  status: "booked" | "ai-filled" | "open";
  clientName: string | null;
  date: string;
  discount?: number;
}

export interface VisitRecord {
  date: string;
  service: string;
  barber: string;
  amount: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  preferredBarber: string;
  preferredBarberId: string;
  weeksBetweenCuts: number;
  lastVisit: string;
  isOverdue: boolean;
  preferredDays: string[];
  preferredTimes: string[];
  notes: string;
  avgSpend: number;
  visitHistory: VisitRecord[];
}

export type SlotFilter = "all" | "booked" | "ai-filled" | "open";
