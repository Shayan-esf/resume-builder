import React from "react";
import imgTums from "@/imports/روزمه02/f19c8a1111418698f76f1a8b682139e7e5463686.png";
import imgUxcel from "@/imports/روزمه02/158ab3494402c2fb39a9d6f04713b2c4be58a595.png";
import imgKntu from "@/imports/روزمه02/5f3994920b0898b280e514dc6259f446af42ee06.png";
import svgPaths from "@/imports/روزمه02/svg-v5tirijsol";
import { imgGroup } from "@/imports/روزمه02/svg-65zxj";

/**
 * TUMS Logo (Tehran University of Medical Sciences)
 * Full height match to title+subtitle block without artificial padding.
 */
export function TUMSLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <img
      alt="TUMS Health Innoversity"
      className={`object-contain pointer-events-none shrink-0 ${className}`}
      src={imgTums}
      title="TUMS Health Innoversity"
    />
  );
}

/**
 * Hamrahe Aval (MCI) Official Vector Logo
 * Full height match to title+subtitle block without artificial padding.
 */
export function MCILogo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <svg
      className={`shrink-0 ${className}`}
      viewBox="0 0 30 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      title="Hamrahe Aval (MCI)"
    >
      <path d={svgPaths.p2cbcf800} fill="#0095DA" />
    </svg>
  );
}

/**
 * Uxcel Official Logo
 * Full height match to title+subtitle block without artificial padding.
 */
export function UxcelLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <img
      alt="Uxcel"
      className={`object-contain pointer-events-none shrink-0 rounded-[3px] ${className}`}
      src={imgUxcel}
      title="Uxcel"
    />
  );
}

/**
 * Ofogh Dadeha Iranian (ODI) Official Logo
 * Full height match to title+subtitle block without artificial padding.
 */
export function OfoqDadeLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <div
      className={`relative shrink-0 flex items-center justify-center ${className}`}
      title="Ofogh Dadeha Iranian"
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 29.0002 19.9998"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={svgPaths.p21be9f80} fill="#4CC9F0" />
        <path d={svgPaths.p36391a80} fill="#4CC9F0" />
        <path d={svgPaths.p3298fb00} fill="#4CC9F0" />
        <path d={svgPaths.p2eead900} fill="#8D8D8D" />
        <path d={svgPaths.p2ae6b900} fill="#8E8E8E" />
        <path d={svgPaths.p18d2a380} fill="#8E8E8E" />
        <path d={svgPaths.p18b20f80} fill="#8E8E8E" />
        <path d={svgPaths.p1ff6f70} fill="#8E8E8E" />
        <path d={svgPaths.p65ea800} fill="#8D8D8D" />
        <path d={svgPaths.p130ff80} fill="#8E8E8E" />
        <path d={svgPaths.p11268500} fill="#8E8E8E" />
        <path d={svgPaths.p222fe680} fill="#8D8D8D" />
        <path d={svgPaths.p3b228200} fill="#8E8E8E" />
        <path d={svgPaths.p2acdad00} fill="#8E8E8E" />
        <path d={svgPaths.pdd92300} fill="#8E8E8E" />
      </svg>
    </div>
  );
}

/**
 * K. N. Toosi University of Technology (KNTU) Official Logo
 * Full height match to title+subtitle block without artificial padding.
 */
export function KNTULogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <img
      alt="K. N. Toosi University of Technology"
      className={`object-contain pointer-events-none shrink-0 ${className}`}
      src={imgKntu}
      title="K. N. Toosi University of Technology"
    />
  );
}
