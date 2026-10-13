import React from 'react';

// Grade 4 Science illustrations (unit_no 17–24), same style as G4UnitIllustrations

// Science Unit 1: Living Things — Sprout & Ladybird
export function IllusLivingThings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="50" cy="50" r="45" fill="#DCFCE7" />
      <path d="M20 78 Q50 70 80 78 L80 86 L20 86 Z" fill="#A16207" opacity="0.6" />
      <path d="M50 78 L50 46" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 56 Q34 54 30 40 Q46 40 50 56 Z" fill="#22C55E" />
      <path d="M50 48 Q64 44 70 30 Q54 30 50 48 Z" fill="#4ADE80" />
      <ellipse cx="70" cy="66" rx="9" ry="7" fill="#EF4444" />
      <path d="M70 59 L70 73" stroke="#111827" strokeWidth="1.2" />
      <circle cx="66" cy="64" r="1.6" fill="#111827" />
      <circle cx="74" cy="68" r="1.6" fill="#111827" />
      <circle cx="78" cy="63" r="3" fill="#111827" />
    </svg>
  );
}

// Science Unit 2: Air — Wind swirls & kite
export function IllusAir(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="50" cy="50" r="45" fill="#E0F2FE" />
      <path d="M16 42 H52 a8 8 0 1 0 -8 -8" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
      <path d="M16 54 H66 a8 8 0 1 1 -8 8" stroke="#0EA5E9" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 66 H44" stroke="#7DD3FC" strokeWidth="3" strokeLinecap="round" />
      <polygon points="72,18 84,30 72,44 60,30" fill="#F472B6" stroke="#DB2777" strokeWidth="1.5" />
      <path d="M72 18 L72 44 M60 30 L84 30" stroke="#DB2777" strokeWidth="1" />
      <path d="M72 44 Q68 54 74 60 Q80 66 74 74" stroke="#64748B" strokeWidth="1" fill="none" />
    </svg>
  );
}

// Science Unit 3: Plants — Potted flower
export function IllusPlants(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="50" cy="50" r="45" fill="#ECFCCB" />
      <path d="M50 66 L50 36" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 56 Q36 56 32 46 Q46 44 50 56 Z" fill="#22C55E" />
      <path d="M50 52 Q64 52 68 42 Q54 40 50 52 Z" fill="#4ADE80" />
      <circle cx="50" cy="22" r="6" fill="#FDE047" />
      <circle cx="50" cy="13" r="6" fill="#FB923C" />
      <circle cx="59" cy="22" r="6" fill="#FB923C" />
      <circle cx="41" cy="22" r="6" fill="#FB923C" />
      <circle cx="50" cy="31" r="6" fill="#FB923C" />
      <circle cx="50" cy="22" r="5" fill="#FDE047" />
      <path d="M34 66 H66 L62 84 H38 Z" fill="#C2410C" />
      <rect x="32" y="63" width="36" height="6" rx="2" fill="#EA580C" />
    </svg>
  );
}

// Science Unit 4: Animals — Paw print & bird
export function IllusAnimals(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="50" cy="50" r="45" fill="#FEF3C7" />
      <ellipse cx="42" cy="64" rx="12" ry="10" fill="#B45309" />
      <circle cx="28" cy="50" r="5" fill="#B45309" />
      <circle cx="36" cy="42" r="5" fill="#B45309" />
      <circle cx="48" cy="42" r="5" fill="#B45309" />
      <circle cx="56" cy="50" r="5" fill="#B45309" />
      <ellipse cx="72" cy="32" rx="10" ry="8" fill="#EF4444" />
      <circle cx="79" cy="27" r="5" fill="#EF4444" />
      <polygon points="84,27 89,28 84,30" fill="#F59E0B" />
      <circle cx="80" cy="26" r="1.2" fill="#111827" />
      <path d="M66 32 Q72 26 76 34" stroke="#B91C1C" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// Science Unit 5: Water — Droplet & waves
export function IllusWater(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="50" cy="50" r="45" fill="#DBEAFE" />
      <path d="M50 16 C40 32 32 42 32 54 a18 18 0 0 0 36 0 C68 42 60 32 50 16 Z" fill="#3B82F6" />
      <path d="M42 52 a8 8 0 0 0 6 10" stroke="#BFDBFE" strokeWidth="3" strokeLinecap="round" />
      <path d="M14 80 Q24 74 34 80 T54 80 T74 80 T94 80" stroke="#60A5FA" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M18 88 Q28 82 38 88 T58 88 T78 88" stroke="#93C5FD" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Science Unit 6: Materials — Wood block, glass & metal
export function IllusMaterials(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="50" cy="50" r="45" fill="#F5F5F4" />
      <rect x="16" y="52" width="28" height="24" rx="2" fill="#D97706" />
      <path d="M20 58 Q30 62 40 58 M20 66 Q30 70 40 66" stroke="#92400E" strokeWidth="1.2" fill="none" />
      <path d="M50 30 H66 L63 76 H53 Z" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.5" opacity="0.9" />
      <path d="M55 36 L54 68" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <circle cx="80" cy="62" r="12" fill="#CBD5E1" stroke="#64748B" strokeWidth="2" />
      <circle cx="80" cy="62" r="7" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
    </svg>
  );
}

// Science Unit 7: Energy — Sun & lightning bulb
export function IllusEnergy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="50" cy="50" r="45" fill="#FEF9C3" />
      <circle cx="28" cy="30" r="9" fill="#FBBF24" />
      <path d="M28 15 V18 M28 42 V45 M13 30 H16 M40 30 H43" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M58 22 a18 18 0 0 1 10 33 V62 H48 V55 a18 18 0 0 1 10 -33 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
      <rect x="49" y="64" width="18" height="6" rx="2" fill="#94A3B8" />
      <rect x="51" y="71" width="14" height="5" rx="2" fill="#64748B" />
      <polygon points="60,30 52,46 58,46 54,58 66,40 60,40 64,30" fill="#F97316" />
    </svg>
  );
}

// Science Unit 8: Pollution in our Environment — Factory smoke & recycle
export function IllusPollution(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="50" cy="50" r="45" fill="#E7E5E4" />
      <rect x="16" y="50" width="34" height="28" fill="#78716C" />
      <rect x="22" y="34" width="7" height="18" fill="#57534E" />
      <rect x="36" y="40" width="7" height="12" fill="#57534E" />
      <circle cx="26" cy="28" r="6" fill="#A8A29E" />
      <circle cx="33" cy="22" r="7" fill="#D6D3D1" />
      <circle cx="40" cy="34" r="5" fill="#A8A29E" />
      <rect x="22" y="58" width="6" height="6" fill="#FDE68A" />
      <rect x="36" y="58" width="6" height="6" fill="#FDE68A" />
      <circle cx="70" cy="62" r="15" fill="#22C55E" />
      <path d="M64 56 L70 52 L74 58 M78 62 L76 70 L68 70 M62 66 L62 58" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
