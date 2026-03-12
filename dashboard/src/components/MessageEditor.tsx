"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Save } from "lucide-react";

const DISCOUNTS = [0, 5, 10, 15, 20, 25, 30, 40, 50];

export default function MessageEditor() {
  const [message, setMessage] = useState(
    "Hi {name}, we have an opening on {date} at {time} with {barber}. Would you like to book?"
  );
  const [discount, setDiscount] = useState(0);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  const previewMessage = message
    .replace("{name}", "James Wilson")
    .replace("{date}", "Thursday, Mar 13")
    .replace("{time}", "10:00 AM")
    .replace("{barber}", "Marcus Cole")
    + (discount > 0 ? `\n\nSpecial offer: ${discount}% off this appointment!` : "");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="border-gray-200 shadow-none overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#2d3a2e]">Message Template</h3>
        <button
          onClick={() => setPreview(!preview)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          {preview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      <div className="p-4 space-y-3">
        {preview ? (
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-100">
            {previewMessage}
          </div>
        ) : (
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white resize-none placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#2d3a2e]/20 focus:border-[#2d3a2e]/40"
            placeholder="Type your message template..."
          />
        )}

        <div>
          <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Discount</label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {DISCOUNTS.map((d) => (
              <button
                key={d}
                onClick={() => setDiscount(d)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                  discount === d
                    ? "bg-[#b8a44c] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {d === 0 ? "None" : `${d}%`}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-md font-medium transition-all ${
            saved
              ? "bg-green-600 text-white"
              : "bg-[#2d3a2e] text-white hover:bg-[#2d3a2e]/90"
          }`}
        >
          <Save className="w-3 h-3" />
          {saved ? "Saved!" : "Save Template"}
        </button>
      </div>
    </Card>
  );
}
