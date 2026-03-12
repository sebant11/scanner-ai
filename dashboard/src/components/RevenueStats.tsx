"use client";

import { Card } from "@/components/ui/card";
import { DollarSign, CalendarCheck, ShieldCheck } from "lucide-react";

interface Props {
  revenueSaved: number;
  appointmentsRecovered: number;
  noShowsPrevented: number;
}

export default function RevenueStats({ revenueSaved, appointmentsRecovered, noShowsPrevented }: Props) {
  const stats = [
    { label: "Revenue Saved", value: `$${revenueSaved.toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Appointments Recovered", value: String(appointmentsRecovered), icon: CalendarCheck, color: "text-[#b8a44c]", bg: "bg-amber-50" },
    { label: "No-Shows Prevented", value: String(noShowsPrevented), icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((s) => (
        <Card key={s.label} className="px-5 py-4 border-gray-200 shadow-none">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#2d3a2e]">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
