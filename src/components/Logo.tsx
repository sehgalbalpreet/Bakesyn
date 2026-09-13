import React from "react";

interface LogoProps {
  className?: string;
  iconSize?: number;
  textColorClass?: string;
  variant?: "horizontal" | "vertical";
}

export default function Logo({
  className = "",
  iconSize = 44,
  textColorClass = "text-amber-950",
  variant = "horizontal",
}: LogoProps) {
  // High-fidelity luxury crown emblem inspired by Kreative Chocolates' official branding
  const crownSvg = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform hover:scale-105 duration-300"
    >
      <defs>
        {/* Luxury Gold Gradients */}
        <linearGradient id="goldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5E3B5" />
          <stop offset="30%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#AA7C11" />
          <stop offset="100%" stopColor="#F5E3B5" />
        </linearGradient>
        <linearGradient id="goldAccent" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8A5F06" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#FCD34D" />
        </linearGradient>
      </defs>

      {/* Main Crown Body with Five Royal Peaks */}
      <path
        d="M 50,140 
           L 40,110 
           Q 52,118 64,124 
           L 75,85 
           Q 88,105 88,120 
           L 100,60 
           Q 112,105 112,120 
           L 125,85 
           Q 138,118 148,124 
           L 160,110 
           L 150,140 
           Q 100,148 50,140 Z"
        fill="url(#goldMetallic)"
        stroke="url(#goldAccent)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Elegant Crown Base Band */}
      <path
        d="M 50,140 
           Q 100,148 150,140 
           L 150,148 
           Q 100,156 50,148 Z"
        fill="url(#goldAccent)"
      />

      {/* Pearls/Diamonds on Top of the Peaks */}
      <circle cx="40" cy="105" r="4.5" fill="url(#goldMetallic)" stroke="url(#goldAccent)" strokeWidth="1" />
      <circle cx="75" cy="80" r="5.5" fill="url(#goldMetallic)" stroke="url(#goldAccent)" strokeWidth="1" />
      <circle cx="100" cy="54" r="7" fill="url(#goldMetallic)" stroke="url(#goldAccent)" strokeWidth="1" />
      <circle cx="125" cy="80" r="5.5" fill="url(#goldMetallic)" stroke="url(#goldAccent)" strokeWidth="1" />
      <circle cx="160" cy="105" r="4.5" fill="url(#goldMetallic)" stroke="url(#goldAccent)" strokeWidth="1" />

      {/* Embeded Jewels in the Crown's Base Band */}
      <circle cx="100" cy="144" r="2.5" fill="#FFFFFF" />
      <circle cx="80" cy="143" r="2" fill="#FFFFFF" />
      <circle cx="120" cy="143" r="2" fill="#FFFFFF" />
      <circle cx="62" cy="141.5" r="1.5" fill="#FFFFFF" />
      <circle cx="138" cy="141.5" r="1.5" fill="#FFFFFF" />

      {/* Tapered Sweeping Ground Curve underneath the Crown */}
      <path
        d="M 30,162 Q 100,178 170,162 Q 100,172 30,162"
        fill="url(#goldMetallic)"
      />
    </svg>
  );

  if (variant === "vertical") {
    return (
      <div className={`flex flex-col items-center text-center gap-3 ${textColorClass} ${className}`} id="kreative-logo-vertical">
        {crownSvg}
        <div className="space-y-0.5">
          <span className="font-serif text-2xl tracking-[0.28em] font-medium block uppercase pl-[0.28em] text-amber-950">
            Kreative
          </span>
          <span className="font-sans text-[11px] tracking-[0.24em] font-black block uppercase text-amber-900/80">
            Chocolates
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3.5 ${textColorClass} ${className}`} id="kreative-logo-horizontal">
      {crownSvg}
      <div className="text-left leading-none">
        <span className="font-serif text-lg md:text-xl tracking-[0.22em] font-medium block uppercase pl-[0.05em] text-amber-950">
          Kreative
        </span>
        <span className="font-sans text-[9px] md:text-[10px] tracking-[0.2em] font-black block uppercase text-amber-900/80 mt-1">
          Chocolates
        </span>
      </div>
    </div>
  );
}
