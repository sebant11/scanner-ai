"use client";

import { Barber } from "@/lib/types";

const statusColor: Record<string, string> = {
  busy: "bg-green-500",
  "ai-filled": "bg-[#b8a44c]",
  open: "bg-red-400",
};

const statusLabel: Record<string, string> = {
  busy: "Busy",
  "ai-filled": "AI Filled",
  open: "Open",
};

interface Props {
  barbers: Barber[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export default function BarberSelection({ barbers, selected, onSelect }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 px-5 py-3 rounded-lg border text-sm font-medium transition-colors ${
          selected === null
            ? "bg-[#2d3a2e] text-white border-[#2d3a2e]"
            : "bg-white text-[#2d3a2e] border-gray-200 hover:border-[#2d3a2e]/30"
        }`}
      >
        All Barbers
      </button>

      {barbers.map((b) => {
        const isSelected = selected === b.id;
        const isAi = b.status === "ai-filled";
        return (
          <button
            key={b.id}
            onClick={() => onSelect(b.id)}
            className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all ${
              isSelected
                ? "bg-white border-[#2d3a2e] ring-1 ring-[#2d3a2e]/20"
                : isAi
                ? "bg-white border-[#b8a44c] hover:shadow-sm"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="relative">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: b.avatarBg, color: b.avatarText }}
              >
                {b.initials}
              </div>
              <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${statusColor[b.status]}`} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#2d3a2e] truncate">{b.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  b.status === "busy" ? "bg-green-50 text-green-700" :
                  b.status === "ai-filled" ? "bg-amber-50 text-amber-700" :
                  "bg-red-50 text-red-600"
                }`}>
                  {statusLabel[b.status]}
                </span>
                <span className="text-[11px] text-gray-500">${b.dailyRevenue}</span>
              </div>
              <div className="mt-1.5 w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${b.fillPercentage}%`, background: b.fillPercentage > 75 ? "#2d3a2e" : "#b8a44c" }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">{b.fillPercentage}% filled</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
