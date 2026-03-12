"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";

interface Props {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  datesWithSlots: Set<string>;
}

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const HOURS = Array.from({ length: 19 }, (_, i) => {
  const h = 6 + Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

export default function ScheduleSection({ selectedDate, onSelectDate, datesWithSlots }: Props) {
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(selectedDate + "T12:00:00");
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [editorOpen, setEditorOpen] = useState(false);

  const [dayOpen, setDayOpen] = useState(true);
  const [startHour, setStartHour] = useState("09:00");
  const [endHour, setEndHour] = useState("17:00");
  const [slotDuration, setSlotDuration] = useState(30);
  const [blockedSlots, setBlockedSlots] = useState<Set<string>>(new Set());
  const [allDayDiscount, setAllDayDiscount] = useState(0);
  const [perSlotDiscounts, setPerSlotDiscounts] = useState<Record<string, number>>({});
  const [editingSlotDiscount, setEditingSlotDiscount] = useState<string | null>(null);

  const calendarDays = useMemo(() => {
    const first = new Date(viewDate.year, viewDate.month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewDate]);

  const monthLabel = new Date(viewDate.year, viewDate.month).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const navigate = (dir: -1 | 1) => {
    setViewDate((v) => {
      let m = v.month + dir;
      let y = v.year;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
  };

  const toDateStr = (day: number) => {
    return `${viewDate.year}-${String(viewDate.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const editorSlots = useMemo(() => {
    const slots: string[] = [];
    const [sh, sm] = startHour.split(":").map(Number);
    const [eh, em] = endHour.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    for (let t = startMin; t < endMin; t += slotDuration) {
      const h = Math.floor(t / 60);
      const m = t % 60;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
    return slots;
  }, [startHour, endHour, slotDuration]);

  const toggleBlock = (time: string) => {
    setBlockedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(time)) next.delete(time);
      else next.add(time);
      return next;
    });
  };

  return (
    <Card className="border-gray-200 shadow-none overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#2d3a2e]">Schedule</h3>
        <button
          onClick={() => setEditorOpen(!editorOpen)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors ${
            editorOpen ? "bg-[#2d3a2e] text-white border-[#2d3a2e]" : "border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          <Settings className="w-3 h-3" />
          Editor
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate(-1)} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-[#2d3a2e]">{monthLabel}</span>
          <button onClick={() => navigate(1)} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
          {DAY_LABELS.map((d) => (
            <span key={d} className="text-[10px] font-medium text-gray-400 py-1">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />;
            const ds = toDateStr(day);
            const isSelected = ds === selectedDate;
            const hasSlots = datesWithSlots.has(ds);
            const isToday = ds === new Date().toISOString().split("T")[0];
            return (
              <button
                key={ds}
                onClick={() => onSelectDate(ds)}
                className={`relative w-full aspect-square flex flex-col items-center justify-center rounded-md text-xs transition-colors ${
                  isSelected
                    ? "bg-[#2d3a2e] text-white"
                    : isToday
                    ? "bg-[#2d3a2e]/10 text-[#2d3a2e] font-semibold"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                {day}
                {hasSlots && (
                  <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? "bg-[#b8a44c]" : "bg-[#b8a44c]"}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {editorOpen && (
        <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Day Status</span>
            <button
              onClick={() => setDayOpen(!dayOpen)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                dayOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
              }`}
            >
              {dayOpen ? "Open" : "Closed"}
            </button>
          </div>

          {dayOpen && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Start</label>
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    className="mt-1 w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white"
                  >
                    {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">End</label>
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    className="mt-1 w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white"
                  >
                    {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Slot Duration</label>
                <div className="flex gap-2 mt-1">
                  {[30, 45, 60, 90].map((d) => (
                    <button
                      key={d}
                      onClick={() => setSlotDuration(d)}
                      className={`text-xs px-3 py-1 rounded-md border transition-colors ${
                        slotDuration === d ? "bg-[#2d3a2e] text-white border-[#2d3a2e]" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {d}min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Time Slots</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {editorSlots.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleBlock(t)}
                      className={`text-[11px] px-2 py-1 rounded transition-colors ${
                        blockedSlots.has(t)
                          ? "bg-red-100 text-red-600 line-through"
                          : "bg-white border border-gray-200 text-gray-700 hover:border-[#b8a44c]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">All-Day Discount</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {[0, 5, 10, 15, 20, 25, 30, 40, 50].map((d) => (
                    <button
                      key={d}
                      onClick={() => setAllDayDiscount(d)}
                      className={`text-[11px] px-2 py-1 rounded transition-colors ${
                        allDayDiscount === d
                          ? "bg-[#b8a44c] text-white"
                          : "bg-white border border-gray-200 text-gray-700 hover:border-[#b8a44c]"
                      }`}
                    >
                      {d === 0 ? "None" : `${d}%`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Per-Slot Discounts</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {editorSlots.filter((t) => !blockedSlots.has(t)).map((t) => (
                    <div key={t} className="relative">
                      <button
                        onClick={() => setEditingSlotDiscount(editingSlotDiscount === t ? null : t)}
                        className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                          perSlotDiscounts[t]
                            ? "bg-amber-50 border-[#b8a44c] text-amber-800"
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {t}{perSlotDiscounts[t] ? ` (${perSlotDiscounts[t]}%)` : ""}
                      </button>
                      {editingSlotDiscount === t && (
                        <div className="absolute top-full left-0 mt-1 z-10 bg-white border border-gray-200 rounded-md shadow-lg p-1.5 flex flex-wrap gap-1 w-36">
                          {[0, 5, 10, 15, 20, 25, 30].map((d) => (
                            <button
                              key={d}
                              onClick={() => {
                                setPerSlotDiscounts((prev) => {
                                  const next = { ...prev };
                                  if (d === 0) delete next[t];
                                  else next[t] = d;
                                  return next;
                                });
                                setEditingSlotDiscount(null);
                              }}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 hover:bg-[#b8a44c] hover:text-white transition-colors"
                            >
                              {d === 0 ? "None" : `${d}%`}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
