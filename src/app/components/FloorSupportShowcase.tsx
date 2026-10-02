'use client';

import React from 'react';

export default function FloorSupportShowcase() {
  return (
    <section className="py-12 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-200/80 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 px-2">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#0B1220] tracking-tight leading-[1.2]">
            Reliable Floor Support, <br className="hidden sm:inline" />
            <span className="text-[#1D4ED8]">Every Single Shift</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 mt-3 sm:mt-4 leading-relaxed font-normal max-w-2xl mx-auto">
            From initial cutting table rollout to daily piece-rate payrolls — our dedicated team ensures your production floor runs without disruption.
          </p>
        </div>

        {/* 3 Pillar Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 items-stretch">
          
          {/* Card 1: Shift-Hours Live Assistance */}
          <div className="bg-white rounded-2xl border border-slate-200 hover:border-[#0B1220] p-5 sm:p-6 pb-2 sm:pb-3 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group overflow-hidden">
            <div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                Shift-Hours Live Help
              </h3>
              <p className="mt-1.5 sm:mt-2 text-[13px] sm:text-[14px] text-slate-600 leading-normal font-normal">
                Active 8:00 AM – 8:30 PM, Mon to Sat, for swift floor assistance.
              </p>
            </div>

            {/* Calendar Visual */}
            <div className="mt-3 sm:mt-4 h-44 sm:h-48 w-full flex items-center justify-center select-none overflow-hidden relative">
              <img
                src="/images/support/support-calendar.jpg"
                alt="Shift-Hours Live Help"
                className="w-full h-full object-contain scale-110 sm:scale-120 transition-transform duration-200 group-hover:scale-125"
              />
            </div>
          </div>

          {/* Card 2: Free Onboarding & Floor Setup */}
          <div className="bg-white rounded-2xl border border-slate-200 hover:border-[#0B1220] p-5 sm:p-6 pb-2 sm:pb-3 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group overflow-hidden">
            <div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                Free Floor Onboarding
              </h3>
              <p className="mt-1.5 sm:mt-2 text-[13px] sm:text-[14px] text-slate-600 leading-normal font-normal">
                Hands-on supervisor training and table setup with zero extra fees.
              </p>
            </div>

            {/* Calling Character Visual */}
            <div className="mt-3 sm:mt-4 h-44 sm:h-48 w-full flex items-center justify-center select-none overflow-hidden relative">
              <img
                src="/images/support/support-calling.jpg"
                alt="Free Floor Onboarding - We're On It!"
                className="w-full h-full object-contain scale-125 sm:scale-135 transition-transform duration-200 group-hover:scale-140"
              />
            </div>
          </div>

          {/* Card 3: Direct Apparel Specialists */}
          <div className="bg-white rounded-2xl border border-slate-200 hover:border-[#0B1220] p-5 sm:p-6 pb-2 sm:pb-3 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group overflow-hidden">
            <div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                Real Apparel Specialists
              </h3>
              <p className="mt-1.5 sm:mt-2 text-[13px] sm:text-[14px] text-slate-600 leading-normal font-normal">
                Direct WhatsApp and call support with garment engineers — zero bots.
              </p>
            </div>

            {/* Specialist Visual */}
            <div className="mt-3 sm:mt-4 h-44 sm:h-48 w-full flex items-center justify-center select-none overflow-hidden relative">
              <img
                src="/images/support/support-specialist.jpg"
                alt="Real Apparel Specialist"
                className="w-full h-full object-contain scale-115 sm:scale-125 transition-transform duration-200 group-hover:scale-130"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
