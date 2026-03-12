"use client";

import { useState, useMemo, useCallback } from "react";
import Header from "@/components/Header";
import BarberSelection from "@/components/BarberSelection";
import RevenueStats from "@/components/RevenueStats";
import ScheduleSection from "@/components/ScheduleSection";
import AvailableSlots from "@/components/AvailableSlots";
import ClientList from "@/components/ClientList";
import MessageEditor from "@/components/MessageEditor";
import { barbers, getSlotsForDate, datesWithSlots, clients as initialClients, getRevenueStats } from "@/lib/data";
import { Client, TimeSlot } from "@/lib/types";

export default function Dashboard() {
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [clientsState, setClientsState] = useState<Client[]>(initialClients);
  const [slotOverrides, setSlotOverrides] = useState<Record<string, Partial<TimeSlot>>>({});

  const stats = useMemo(() => getRevenueStats(selectedBarber), [selectedBarber]);

  const slots = useMemo(() => {
    const base = getSlotsForDate(selectedDate, selectedBarber);
    return base.map((s) => ({ ...s, ...slotOverrides[s.id] }));
  }, [selectedDate, selectedBarber, slotOverrides]);

  const handleUpdateSlot = useCallback((id: string, updates: Partial<TimeSlot>) => {
    setSlotOverrides((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
  }, []);

  const handleUpdateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClientsState((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const filteredClients = useMemo(() => {
    if (!selectedBarber) return clientsState;
    return clientsState.filter((c) => c.preferredBarberId === selectedBarber);
  }, [clientsState, selectedBarber]);

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <BarberSelection
          barbers={barbers}
          selected={selectedBarber}
          onSelect={setSelectedBarber}
        />

        <RevenueStats
          revenueSaved={stats.revenueSaved}
          appointmentsRecovered={stats.appointmentsRecovered}
          noShowsPrevented={stats.noShowsPrevented}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScheduleSection
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            datesWithSlots={datesWithSlots}
          />
          <AvailableSlots
            slots={slots}
            onUpdateSlot={handleUpdateSlot}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ClientList
            clients={filteredClients}
            onUpdateClient={handleUpdateClient}
          />
          <MessageEditor />
        </div>
      </main>
    </div>
  );
}
