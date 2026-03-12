"use client";

export default function Header() {
  return (
    <header className="flex items-center gap-3 px-6 py-4 bg-[#2d3a2e]">
      <div className="w-9 h-9 rounded-full bg-[#b8a44c] flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 3v18l7-4 7 4V3z" />
        </svg>
      </div>
      <h1 className="text-white text-lg font-semibold tracking-tight">Barber Booking</h1>
    </header>
  );
}
