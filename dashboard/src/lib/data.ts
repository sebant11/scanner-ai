import { Barber, Client, TimeSlot } from "./types";

export const barbers: Barber[] = [
  {
    id: "b1",
    name: "Marcus Cole",
    initials: "MC",
    avatarBg: "#2d3a2e",
    avatarText: "#ffffff",
    status: "busy",
    currentClient: "James Wilson",
    fillPercentage: 88,
    dailyRevenue: 320,
  },
  {
    id: "b2",
    name: "Tony Rivera",
    initials: "TR",
    avatarBg: "#b8a44c",
    avatarText: "#ffffff",
    status: "ai-filled",
    currentClient: null,
    fillPercentage: 75,
    dailyRevenue: 280,
  },
  {
    id: "b3",
    name: "DeShawn Park",
    initials: "DP",
    avatarBg: "#5a6b5c",
    avatarText: "#ffffff",
    status: "open",
    currentClient: null,
    fillPercentage: 50,
    dailyRevenue: 160,
  },
  {
    id: "b4",
    name: "Leo Nguyen",
    initials: "LN",
    avatarBg: "#3d4f3e",
    avatarText: "#ffffff",
    status: "busy",
    currentClient: "Chris Adams",
    fillPercentage: 92,
    dailyRevenue: 350,
  },
];

function buildSlots(dateStr: string): TimeSlot[] {
  return [
    { id: `${dateStr}-1`, time: "09:00", endTime: "09:30", barberId: "b1", barberName: "Marcus Cole", status: "booked", clientName: "James Wilson", date: dateStr },
    { id: `${dateStr}-2`, time: "09:30", endTime: "10:00", barberId: "b2", barberName: "Tony Rivera", status: "ai-filled", clientName: "Carlos Mendez", date: dateStr, discount: 10 },
    { id: `${dateStr}-3`, time: "10:00", endTime: "10:30", barberId: "b1", barberName: "Marcus Cole", status: "booked", clientName: "David Brown", date: dateStr },
    { id: `${dateStr}-4`, time: "10:00", endTime: "10:30", barberId: "b3", barberName: "DeShawn Park", status: "open", clientName: null, date: dateStr },
    { id: `${dateStr}-5`, time: "10:30", endTime: "11:00", barberId: "b4", barberName: "Leo Nguyen", status: "booked", clientName: "Chris Adams", date: dateStr },
    { id: `${dateStr}-6`, time: "11:00", endTime: "11:30", barberId: "b2", barberName: "Tony Rivera", status: "ai-filled", clientName: "Mike Torres", date: dateStr, discount: 15 },
    { id: `${dateStr}-7`, time: "11:00", endTime: "11:30", barberId: "b1", barberName: "Marcus Cole", status: "open", clientName: null, date: dateStr },
    { id: `${dateStr}-8`, time: "11:30", endTime: "12:00", barberId: "b3", barberName: "DeShawn Park", status: "booked", clientName: "Andre Johnson", date: dateStr },
    { id: `${dateStr}-9`, time: "13:00", endTime: "13:30", barberId: "b4", barberName: "Leo Nguyen", status: "booked", clientName: "Ryan Lee", date: dateStr },
    { id: `${dateStr}-10`, time: "13:00", endTime: "13:30", barberId: "b1", barberName: "Marcus Cole", status: "ai-filled", clientName: "Kevin Hart", date: dateStr, discount: 5 },
    { id: `${dateStr}-11`, time: "14:00", endTime: "14:30", barberId: "b2", barberName: "Tony Rivera", status: "open", clientName: null, date: dateStr },
    { id: `${dateStr}-12`, time: "14:00", endTime: "14:30", barberId: "b3", barberName: "DeShawn Park", status: "ai-filled", clientName: "Sam Wright", date: dateStr, discount: 20 },
    { id: `${dateStr}-13`, time: "15:00", endTime: "15:30", barberId: "b4", barberName: "Leo Nguyen", status: "booked", clientName: "Tom Baker", date: dateStr },
    { id: `${dateStr}-14`, time: "15:30", endTime: "16:00", barberId: "b1", barberName: "Marcus Cole", status: "open", clientName: null, date: dateStr },
    { id: `${dateStr}-15`, time: "16:00", endTime: "16:30", barberId: "b2", barberName: "Tony Rivera", status: "booked", clientName: "Eric Stone", date: dateStr },
    { id: `${dateStr}-16`, time: "16:30", endTime: "17:00", barberId: "b3", barberName: "DeShawn Park", status: "open", clientName: null, date: dateStr },
  ];
}

const today = new Date();

export const slotsMap: Record<string, TimeSlot[]> = {};

for (let d = -3; d <= 14; d++) {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + d);
  const key = dt.toISOString().split("T")[0];
  if (dt.getDay() !== 0) {
    slotsMap[key] = buildSlots(key);
  }
}

export const datesWithSlots = new Set(Object.keys(slotsMap));

export function getSlotsForDate(date: string, barberId?: string | null): TimeSlot[] {
  const slots = slotsMap[date] || [];
  if (barberId) return slots.filter((s) => s.barberId === barberId);
  return slots;
}

export const clients: Client[] = [
  {
    id: "c1", name: "James Wilson", phone: "(555) 234-5678", preferredBarber: "Marcus Cole", preferredBarberId: "b1",
    weeksBetweenCuts: 3, lastVisit: "2026-02-15", isOverdue: true,
    preferredDays: ["Tuesday", "Thursday"], preferredTimes: ["morning"],
    notes: "Prefers skin fade, always asks for lineup", avgSpend: 45,
    visitHistory: [
      { date: "2026-02-15", service: "Skin Fade + Lineup", barber: "Marcus Cole", amount: 45 },
      { date: "2026-01-25", service: "Skin Fade", barber: "Marcus Cole", amount: 40 },
      { date: "2026-01-04", service: "Skin Fade + Beard", barber: "Marcus Cole", amount: 55 },
    ],
  },
  {
    id: "c2", name: "Carlos Mendez", phone: "(555) 345-6789", preferredBarber: "Tony Rivera", preferredBarberId: "b2",
    weeksBetweenCuts: 2, lastVisit: "2026-02-28", isOverdue: false,
    preferredDays: ["Wednesday", "Friday"], preferredTimes: ["afternoon"],
    notes: "Taper fade, Spanish-speaking preferred", avgSpend: 40,
    visitHistory: [
      { date: "2026-02-28", service: "Taper Fade", barber: "Tony Rivera", amount: 40 },
      { date: "2026-02-14", service: "Taper Fade + Eyebrows", barber: "Tony Rivera", amount: 48 },
    ],
  },
  {
    id: "c3", name: "David Brown", phone: "(555) 456-7890", preferredBarber: "Marcus Cole", preferredBarberId: "b1",
    weeksBetweenCuts: 4, lastVisit: "2026-01-20", isOverdue: true,
    preferredDays: ["Monday", "Saturday"], preferredTimes: ["morning", "afternoon"],
    notes: "Classic cut, no product. Sensitive scalp.", avgSpend: 35,
    visitHistory: [
      { date: "2026-01-20", service: "Classic Cut", barber: "Marcus Cole", amount: 35 },
      { date: "2025-12-22", service: "Classic Cut", barber: "DeShawn Park", amount: 35 },
    ],
  },
  {
    id: "c4", name: "Andre Johnson", phone: "(555) 567-8901", preferredBarber: "DeShawn Park", preferredBarberId: "b3",
    weeksBetweenCuts: 2, lastVisit: "2026-03-01", isOverdue: false,
    preferredDays: ["Tuesday", "Saturday"], preferredTimes: ["evening"],
    notes: "High top fade with part line", avgSpend: 50,
    visitHistory: [
      { date: "2026-03-01", service: "High Top Fade + Part", barber: "DeShawn Park", amount: 50 },
      { date: "2026-02-15", service: "High Top Fade", barber: "DeShawn Park", amount: 45 },
    ],
  },
  {
    id: "c5", name: "Mike Torres", phone: "(555) 678-9012", preferredBarber: "Tony Rivera", preferredBarberId: "b2",
    weeksBetweenCuts: 3, lastVisit: "2026-02-01", isOverdue: true,
    preferredDays: ["Wednesday"], preferredTimes: ["morning"],
    notes: "Buzz cut #2 guard, very easy going", avgSpend: 25,
    visitHistory: [
      { date: "2026-02-01", service: "Buzz Cut", barber: "Tony Rivera", amount: 25 },
      { date: "2026-01-11", service: "Buzz Cut", barber: "Tony Rivera", amount: 25 },
    ],
  },
  {
    id: "c6", name: "Chris Adams", phone: "(555) 789-0123", preferredBarber: "Leo Nguyen", preferredBarberId: "b4",
    weeksBetweenCuts: 2, lastVisit: "2026-03-05", isOverdue: false,
    preferredDays: ["Thursday", "Friday"], preferredTimes: ["afternoon"],
    notes: "Mid fade, likes to chat. Tip well.", avgSpend: 42,
    visitHistory: [
      { date: "2026-03-05", service: "Mid Fade", barber: "Leo Nguyen", amount: 42 },
      { date: "2026-02-19", service: "Mid Fade + Beard Trim", barber: "Leo Nguyen", amount: 55 },
    ],
  },
  {
    id: "c7", name: "Ryan Lee", phone: "(555) 890-1234", preferredBarber: "Leo Nguyen", preferredBarberId: "b4",
    weeksBetweenCuts: 4, lastVisit: "2026-01-28", isOverdue: true,
    preferredDays: ["Monday", "Wednesday"], preferredTimes: ["morning", "evening"],
    notes: "Textured crop, uses pomade. Arrives early.", avgSpend: 38,
    visitHistory: [
      { date: "2026-01-28", service: "Textured Crop", barber: "Leo Nguyen", amount: 38 },
      { date: "2025-12-30", service: "Textured Crop", barber: "Leo Nguyen", amount: 38 },
    ],
  },
  {
    id: "c8", name: "Kevin Hart", phone: "(555) 901-2345", preferredBarber: "Marcus Cole", preferredBarberId: "b1",
    weeksBetweenCuts: 1, lastVisit: "2026-03-02", isOverdue: true,
    preferredDays: ["Monday", "Friday"], preferredTimes: ["morning"],
    notes: "Sharp lineup weekly, very particular", avgSpend: 30,
    visitHistory: [
      { date: "2026-03-02", service: "Lineup", barber: "Marcus Cole", amount: 30 },
      { date: "2026-02-23", service: "Lineup + Edge", barber: "Marcus Cole", amount: 35 },
    ],
  },
  {
    id: "c9", name: "Sam Wright", phone: "(555) 012-3456", preferredBarber: "DeShawn Park", preferredBarberId: "b3",
    weeksBetweenCuts: 3, lastVisit: "2026-02-10", isOverdue: true,
    preferredDays: ["Thursday", "Saturday"], preferredTimes: ["afternoon"],
    notes: "Caesar cut, prefers clippers only", avgSpend: 32,
    visitHistory: [
      { date: "2026-02-10", service: "Caesar Cut", barber: "DeShawn Park", amount: 32 },
      { date: "2026-01-20", service: "Caesar Cut", barber: "DeShawn Park", amount: 32 },
    ],
  },
  {
    id: "c10", name: "Tom Baker", phone: "(555) 123-4567", preferredBarber: "Leo Nguyen", preferredBarberId: "b4",
    weeksBetweenCuts: 2, lastVisit: "2026-03-08", isOverdue: false,
    preferredDays: ["Tuesday", "Friday"], preferredTimes: ["afternoon", "evening"],
    notes: "Pompadour style, uses gel. Always on time.", avgSpend: 48,
    visitHistory: [
      { date: "2026-03-08", service: "Pompadour", barber: "Leo Nguyen", amount: 48 },
      { date: "2026-02-22", service: "Pompadour + Beard", barber: "Leo Nguyen", amount: 60 },
    ],
  },
];

export function getRevenueStats(barberId?: string | null) {
  const filteredSlots = Object.values(slotsMap).flat().filter((s) => !barberId || s.barberId === barberId);
  const aiFilledSlots = filteredSlots.filter((s) => s.status === "ai-filled");
  const bookedSlots = filteredSlots.filter((s) => s.status === "booked");
  const avgRevPerSlot = 42;
  return {
    revenueSaved: aiFilledSlots.length * avgRevPerSlot,
    appointmentsRecovered: aiFilledSlots.length,
    noShowsPrevented: Math.floor(bookedSlots.length * 0.12),
  };
}
