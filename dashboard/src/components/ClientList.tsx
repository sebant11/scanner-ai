"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Search, Pencil, Check, X } from "lucide-react";
import { Client } from "@/lib/types";

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ALL_TIMES = ["morning", "afternoon", "evening"];

interface Props {
  clients: Client[];
  onUpdateClient: (id: string, updates: Partial<Client>) => void;
}

export default function ClientList({ clients, onUpdateClient }: Props) {
  const [filterMode, setFilterMode] = useState<"all" | "overdue">("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [editNotes, setEditNotes] = useState("");
  const [editDays, setEditDays] = useState<string[]>([]);
  const [editTimes, setEditTimes] = useState<string[]>([]);
  const [editWeeks, setEditWeeks] = useState(2);

  const overdueCount = clients.filter((c) => c.isOverdue).length;

  const filtered = clients
    .filter((c) => filterMode === "all" || c.isOverdue)
    .filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q);
    });

  const startEdit = (c: Client) => {
    setEditingId(c.id);
    setEditNotes(c.notes);
    setEditDays([...c.preferredDays]);
    setEditTimes([...c.preferredTimes]);
    setEditWeeks(c.weeksBetweenCuts);
  };

  const saveEdit = (id: string) => {
    onUpdateClient(id, {
      notes: editNotes,
      preferredDays: editDays,
      preferredTimes: editTimes,
      weeksBetweenCuts: editWeeks,
    });
    setEditingId(null);
  };

  const toggleDay = (day: string) => {
    setEditDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const toggleTime = (time: string) => {
    setEditTimes((prev) => prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]);
  };

  return (
    <Card className="border-gray-200 shadow-none overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-[#2d3a2e] mb-3">Clients</h3>

        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setFilterMode("all")}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterMode === "all" ? "bg-[#2d3a2e] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Clients
          </button>
          <button
            onClick={() => setFilterMode("overdue")}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors relative ${
              filterMode === "overdue" ? "bg-[#2d3a2e] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Overdue
            {overdueCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {overdueCount}
              </span>
            )}
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full text-xs border border-gray-200 rounded-md pl-8 pr-3 py-2 bg-white placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 p-6 text-center">No clients found</p>
        )}
        {filtered.map((client) => {
          const isExpanded = expandedId === client.id;
          const isEditing = editingId === client.id;
          return (
            <div key={client.id}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : client.id)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#2d3a2e] flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-white">
                    {client.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#2d3a2e] truncate">{client.name}</span>
                    {client.isOverdue && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 font-semibold">OVERDUE</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                    <span>{client.preferredBarber}</span>
                    <span>·</span>
                    <span>Every {client.weeksBetweenCuts}w</span>
                    <span>·</span>
                    <span>Last: {client.lastVisit}</span>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 bg-gray-50/30">
                  {isEditing ? (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Notes</label>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="mt-1 w-full text-xs border border-gray-200 rounded-md px-3 py-2 bg-white resize-none"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Preferred Days</label>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {ALL_DAYS.map((d) => (
                            <button
                              key={d}
                              onClick={() => toggleDay(d)}
                              className={`text-[11px] px-2 py-1 rounded transition-colors ${
                                editDays.includes(d) ? "bg-[#2d3a2e] text-white" : "bg-white border border-gray-200 text-gray-600"
                              }`}
                            >
                              {d.slice(0, 3)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Preferred Times</label>
                        <div className="flex gap-1.5 mt-1">
                          {ALL_TIMES.map((t) => (
                            <button
                              key={t}
                              onClick={() => toggleTime(t)}
                              className={`text-[11px] px-2.5 py-1 rounded capitalize transition-colors ${
                                editTimes.includes(t) ? "bg-[#b8a44c] text-white" : "bg-white border border-gray-200 text-gray-600"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Weeks Between Cuts</label>
                        <div className="flex gap-1.5 mt-1">
                          {[1, 2, 3, 4, 5, 6].map((w) => (
                            <button
                              key={w}
                              onClick={() => setEditWeeks(w)}
                              className={`text-[11px] w-7 h-7 rounded transition-colors ${
                                editWeeks === w ? "bg-[#2d3a2e] text-white" : "bg-white border border-gray-200 text-gray-600"
                              }`}
                            >
                              {w}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => saveEdit(client.id)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-[#2d3a2e] text-white hover:bg-[#2d3a2e]/90">
                          <Check className="w-3 h-3" /> Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50">
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        <div><span className="text-gray-400">Phone:</span> <span className="text-gray-700">{client.phone}</span></div>
                        <div><span className="text-gray-400">Avg Spend:</span> <span className="text-gray-700">${client.avgSpend}</span></div>
                        <div><span className="text-gray-400">Days:</span> <span className="text-gray-700">{client.preferredDays.join(", ")}</span></div>
                        <div><span className="text-gray-400">Times:</span> <span className="text-gray-700 capitalize">{client.preferredTimes.join(", ")}</span></div>
                      </div>
                      {client.notes && (
                        <p className="text-xs text-gray-500 italic">&ldquo;{client.notes}&rdquo;</p>
                      )}
                      <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Visit History</p>
                        <div className="space-y-1">
                          {client.visitHistory.map((v, i) => (
                            <div key={i} className="flex items-center text-[11px] gap-2">
                              <span className="text-gray-400 w-20">{v.date}</span>
                              <span className="text-gray-700">{v.service}</span>
                              <span className="text-gray-400 ml-auto">${v.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => startEdit(client)}
                        className="flex items-center gap-1 text-xs text-[#b8a44c] hover:text-[#9a8a3e] font-medium mt-1"
                      >
                        <Pencil className="w-3 h-3" /> Edit Preferences
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
