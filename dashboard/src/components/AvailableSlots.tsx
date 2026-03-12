"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Pencil, X, Check } from "lucide-react";
import { TimeSlot, SlotFilter } from "@/lib/types";

const STATUS_STYLES: Record<string, { badge: string; label: string }> = {
  booked: { badge: "bg-green-50 text-green-700", label: "Booked" },
  "ai-filled": { badge: "bg-amber-50 text-amber-700", label: "AI Filled" },
  open: { badge: "bg-red-50 text-red-500", label: "Open" },
};

interface Props {
  slots: TimeSlot[];
  onUpdateSlot: (id: string, updates: Partial<TimeSlot>) => void;
}

export default function AvailableSlots({ slots, onUpdateSlot }: Props) {
  const [filter, setFilter] = useState<SlotFilter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<TimeSlot["status"]>("open");
  const [editClient, setEditClient] = useState("");

  const counts = {
    all: slots.length,
    booked: slots.filter((s) => s.status === "booked").length,
    "ai-filled": slots.filter((s) => s.status === "ai-filled").length,
    open: slots.filter((s) => s.status === "open").length,
  };

  const filtered = filter === "all" ? slots : slots.filter((s) => s.status === filter);

  const startEdit = (slot: TimeSlot) => {
    setEditingId(slot.id);
    setEditStatus(slot.status);
    setEditClient(slot.clientName || "");
  };

  const saveEdit = (id: string) => {
    onUpdateSlot(id, {
      status: editStatus,
      clientName: editClient || null,
    });
    setEditingId(null);
  };

  const filters: { key: SlotFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "booked", label: "Booked" },
    { key: "ai-filled", label: "AI Filled" },
    { key: "open", label: "Open" },
  ];

  return (
    <Card className="border-gray-200 shadow-none overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-[#2d3a2e] mb-3">Available Slots</h3>
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                filter === f.key
                  ? "bg-[#2d3a2e] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
              <span className="ml-1 opacity-70">({counts[f.key]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 p-6 text-center">No slots found</p>
        )}
        {filtered.map((slot) => {
          const st = STATUS_STYLES[slot.status];
          const isEditing = editingId === slot.id;
          return (
            <div key={slot.id} className="px-4 py-3 group hover:bg-gray-50/50 transition-colors">
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 w-12">{slot.time}</span>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as TimeSlot["status"])}
                      className="text-xs border border-gray-200 rounded px-2 py-1"
                    >
                      <option value="booked">Booked</option>
                      <option value="ai-filled">AI Filled</option>
                      <option value="open">Open</option>
                    </select>
                    <input
                      value={editClient}
                      onChange={(e) => setEditClient(e.target.value)}
                      placeholder="Client name"
                      className="text-xs border border-gray-200 rounded px-2 py-1 flex-1"
                    />
                    <button onClick={() => saveEdit(slot.id)} className="p-1 rounded bg-green-50 hover:bg-green-100 text-green-600">
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500 w-16 shrink-0">{slot.time} – {slot.endTime}</span>
                  <span className="text-xs text-gray-500 w-24 truncate">{slot.barberName}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.badge}`}>
                    {st.label}
                  </span>
                  {slot.clientName && (
                    <span className="text-xs text-[#2d3a2e] font-medium truncate">{slot.clientName}</span>
                  )}
                  {slot.discount && slot.discount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
                      {slot.discount}% off
                    </span>
                  )}
                  <button
                    onClick={() => startEdit(slot)}
                    className="ml-auto p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-100 text-gray-400 transition-all"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
