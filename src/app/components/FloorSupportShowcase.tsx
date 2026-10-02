'use client';

import React from 'react';

export default function FloorSupportShowcase() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1220] tracking-tight leading-tight">
            Need Help? <br />
            You’re in <span className="text-[#0891B2]">Good Hands</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed font-normal">
            Zigza is India’s dedicated garment production system, trusted by factory owners and floor teams nationwide.
          </p>
        </div>

        {/* 3 Pillar Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          
          {/* Card 1: Everyday Support */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-9 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0B1220]">
                Everyday Support
              </h3>
              <p className="mt-3 text-[14.5px] sm:text-[15.5px] text-slate-600 leading-relaxed">
                Our team is available every shift from 8 AM to 8 PM to assist cutting masters, line supervisors, and plant managers whenever you need help.
              </p>
            </div>

            {/* Toony Calendar Visual */}
            <div className="mt-8 pt-4 flex flex-col items-center justify-center">
              {/* Row 1: SUN, MON, TUE */}
              <div className="flex gap-3 mb-2.5">
                {['SUN', 'MON', 'TUE'].map((day) => (
                  <div
                    key={day}
                    className="w-14 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-between p-1 relative overflow-hidden"
                  >
                    {/* Calendar Binder Rings */}
                    <div className="w-full flex justify-around pt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D2C4]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D2C4]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D2C4]" />
                    </div>
                    <span className="text-[11px] font-bold text-[#0B1220] tracking-wider pb-0.5">
                      {day}
                    </span>
                  </div>
                ))}
              </div>

              {/* Row 2: WED, THU, FRI, SAT */}
              <div className="flex gap-2.5">
                {['WED', 'THU', 'FRI', 'SAT'].map((day) => (
                  <div
                    key={day}
                    className="w-13 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-between p-1 relative overflow-hidden"
                  >
                    <div className="w-full flex justify-around pt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D2C4]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D2C4]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D2C4]" />
                    </div>
                    <span className="text-[10.5px] font-bold text-[#0B1220] tracking-wider pb-0.5">
                      {day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Free Support for All */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-9 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0B1220]">
                Free Support for All
              </h3>
              <p className="mt-3 text-[14.5px] sm:text-[15.5px] text-slate-600 leading-relaxed">
                Every Zigza garment factory gets complete onboarding and floor setup assistance at no extra cost — from day one.
              </p>
            </div>

            {/* Toony Character Calling + "We're Listening" Bubble */}
            <div className="mt-8 pt-4 flex items-end justify-center gap-3">
              {/* Toony Character Vector */}
              <svg viewBox="0 0 100 100" className="w-24 h-24 select-none">
                {/* Body / Shirt */}
                <path d="M25 100 C25 75, 75 75, 75 100 Z" fill="#E2E8F0" stroke="#0B1220" strokeWidth="2.5" />
                {/* Neck */}
                <rect x="42" y="65" width="16" height="15" fill="#FED7AA" stroke="#0B1220" strokeWidth="2" />
                {/* Head */}
                <circle cx="50" cy="50" r="22" fill="#FED7AA" stroke="#0B1220" strokeWidth="2.5" />
                {/* Hair */}
                <path d="M28 45 C28 25, 72 25, 72 45 C65 32, 35 32, 28 45 Z" fill="#0B1220" />
                {/* Eyes & Smile */}
                <circle cx="43" cy="48" r="2" fill="#0B1220" />
                <circle cx="57" cy="48" r="2" fill="#0B1220" />
                <path d="M46 56 Q50 60 54 56" fill="none" stroke="#0B1220" strokeWidth="2" strokeLinecap="round" />
                {/* Phone hand & handset */}
                <path d="M68 60 C68 45, 74 45, 74 65" fill="#FED7AA" stroke="#0B1220" strokeWidth="2" />
                <rect x="67" y="42" width="9" height="24" rx="4" fill="#00D2C4" stroke="#0B1220" strokeWidth="2" />
              </svg>

              {/* Speech Bubble "We're Listening" */}
              <div className="relative mb-6">
                <div className="bg-[#00D2C4] text-[#0B1220] font-bold text-xs sm:text-[13px] px-3.5 py-1.5 rounded-xl shadow-xs whitespace-nowrap">
                  We&apos;re Listening
                </div>
                {/* Speech tail */}
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-6 border-r-[#00D2C4]" />
              </div>
            </div>
          </div>

          {/* Card 3: Talk to Human */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-9 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0B1220]">
                Talk to Human
              </h3>
              <p className="mt-3 text-[14.5px] sm:text-[15.5px] text-slate-600 leading-relaxed">
                No bots, no confusion. Get direct assistance from real garment manufacturing experts via WhatsApp, direct call, and on-floor sessions.
              </p>
            </div>

            {/* Toony Support Agent with Headset at Computer */}
            <div className="mt-8 pt-4 flex items-end justify-center">
              <svg viewBox="0 0 160 100" className="w-36 h-24 select-none">
                {/* Desk Line */}
                <line x1="10" y1="98" x2="150" y2="98" stroke="#0B1220" strokeWidth="3" strokeLinecap="round" />
                {/* Desktop Monitor on Desk */}
                <rect x="90" y="45" width="45" height="35" rx="3" fill="#E2E8F0" stroke="#0B1220" strokeWidth="2" />
                <polygon points="105,80 120,80 125,98 100,98" fill="#CBD5E1" stroke="#0B1220" strokeWidth="2" />
                {/* Support Person Body */}
                <path d="M30 98 C30 70, 75 70, 75 98 Z" fill="#00D2C4" stroke="#0B1220" strokeWidth="2" />
                {/* Collar */}
                <polygon points="48,72 52,82 56,72" fill="#FFFFFF" stroke="#0B1220" strokeWidth="1.5" />
                {/* Neck */}
                <rect x="47" y="62" width="10" height="12" fill="#FED7AA" stroke="#0B1220" strokeWidth="1.5" />
                {/* Head */}
                <circle cx="52" cy="50" r="16" fill="#FED7AA" stroke="#0B1220" strokeWidth="2" />
                {/* Hair */}
                <path d="M38 46 C38 32, 66 32, 66 46 Z" fill="#0B1220" />
                {/* Eyes & Smile */}
                <circle cx="48" cy="49" r="1.5" fill="#0B1220" />
                <circle cx="56" cy="49" r="1.5" fill="#0B1220" />
                <path d="M49 55 Q52 58 55 55" fill="none" stroke="#0B1220" strokeWidth="1.5" strokeLinecap="round" />
                {/* Headset Arch */}
                <path d="M35 48 C35 30, 69 30, 69 48" fill="none" stroke="#0B1220" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="36" cy="48" r="4" fill="#0B1220" />
                {/* Headset Mic */}
                <path d="M36 50 Q44 62 50 58" fill="none" stroke="#0B1220" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="51" cy="58" r="1.5" fill="#00D2C4" />
              </svg>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
