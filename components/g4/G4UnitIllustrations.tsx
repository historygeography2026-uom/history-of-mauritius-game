import React from 'react';

// Grade 4 Unit 1: Working with Maps — Compass & Globe
export function IllusMaps(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="50" cy="50" r="45" fill="#DBEAFE" />
      <circle cx="50" cy="50" r="28" fill="#93C5FD" stroke="#3B82F6" strokeWidth="2" />
      <path d="M50 22 L50 78" stroke="#1D4ED8" strokeWidth="1.5" />
      <path d="M22 50 L78 50" stroke="#1D4ED8" strokeWidth="1.5" />
      <path d="M50 22 Q65 35, 50 50 Q35 65, 50 78" stroke="#2563EB" strokeWidth="1.5" fill="none" />
      <path d="M50 22 Q35 35, 50 50 Q65 65, 50 78" stroke="#2563EB" strokeWidth="1.5" fill="none" />
      <polygon points="50,15 53,22 47,22" fill="#EF4444" />
      <text x="50" y="14" textAnchor="middle" fontSize="8" fill="#EF4444" fontWeight="bold">N</text>
    </svg>
  );
}

// Grade 4 Unit 2: Our Natural Environment — Mountains & Trees
export function IllusEnvironment(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="50" cy="50" r="45" fill="#DCFCE7" />
      <circle cx="72" cy="28" r="10" fill="#FBBF24" />
      <polygon points="15,75 35,35 55,75" fill="#6D9886" />
      <polygon points="40,75 65,25 90,75" fill="#4B7A5D" />
      <polygon points="65,25 70,35 60,35" fill="#FFFFFF" opacity="0.5" />
      <rect x="22" y="65" width="6" height="15" fill="#92400E" rx="1" />
      <circle cx="25" cy="60" r="8" fill="#22C55E" />
      <circle cx="80" cy="65" r="6" fill="#16A34A" />
      <rect x="78" y="68" width="4" height="10" fill="#78350F" rx="1" />
      <path d="M10 80 Q 30 70, 50 80 T 90 80 L 90 90 L 10 90 Z" fill="#86EFAC" />
    </svg>
  );
}

// Grade 4 Unit 3: Weather — Sun, Cloud, Rain
export function IllusG4Weather(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="50" cy="50" r="45" fill="#E0F2FE" />
      <circle cx="70" cy="35" r="14" fill="#FBBF24" />
      <line x1="70" y1="15" x2="70" y2="21" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="49" x2="70" y2="55" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <line x1="84" y1="35" x2="90" y2="35" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="35" x2="56" y2="35" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 55 a 12 12 0 0 1 12 -12 a 16 16 0 0 1 30 4 a 10 10 0 0 1 0 20 h -42 a 12 12 0 0 1 0 -24 z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
      <path d="M30 70 Q 30 80, 33 80 Q 36 80, 36 70 Q 33 65, 30 70 Z" fill="#3B82F6" />
      <path d="M42 72 Q 42 82, 45 82 Q 48 82, 48 72 Q 45 67, 42 72 Z" fill="#3B82F6" />
      <path d="M54 70 Q 54 80, 57 80 Q 60 80, 60 70 Q 57 65, 54 70 Z" fill="#3B82F6" />
    </svg>
  );
}

// Grade 4 Unit 4: Locality - Past and Present — Old & New Buildings
export function IllusLocality(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="50" cy="50" r="45" fill="#FEF3C7" />
      {/* Old building */}
      <rect x="12" y="45" width="30" height="35" fill="#D4A574" rx="1" />
      <polygon points="10,45 27,25 44,45" fill="#C2956B" />
      <rect x="18" y="52" width="7" height="10" fill="#92400E" rx="1" />
      <rect x="30" y="52" width="7" height="10" fill="#92400E" rx="1" />
      <rect x="23" y="67" width="10" height="13" fill="#78350F" rx="1" />
      {/* Arrow */}
      <path d="M48 55 L55 55" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#arrow)" />
      <polygon points="56,55 52,52 52,58" fill="#F59E0B" />
      {/* Modern building */}
      <rect x="58" y="35" width="30" height="45" fill="#60A5FA" rx="2" />
      <rect x="62" y="40" width="6" height="6" fill="#BFDBFE" rx="1" />
      <rect x="72" y="40" width="6" height="6" fill="#BFDBFE" rx="1" />
      <rect x="62" y="50" width="6" height="6" fill="#BFDBFE" rx="1" />
      <rect x="72" y="50" width="6" height="6" fill="#BFDBFE" rx="1" />
      <rect x="62" y="60" width="6" height="6" fill="#BFDBFE" rx="1" />
      <rect x="72" y="60" width="6" height="6" fill="#BFDBFE" rx="1" />
      <rect x="68" y="70" width="10" height="10" fill="#1E40AF" rx="1" />
    </svg>
  );
}

// Grade 4 Unit 5: People Living in our Locality — Community
export function IllusCommunity(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="50" cy="50" r="45" fill="#FCE7F3" />
      {/* Person 1 */}
      <circle cx="25" cy="40" r="8" fill="#FB923C" />
      <path d="M12 75 Q 25 55, 38 75 Z" fill="#FDBA74" />
      {/* Person 2 (center, taller) */}
      <circle cx="50" cy="32" r="10" fill="#A78BFA" />
      <path d="M32 75 Q 50 48, 68 75 Z" fill="#C4B5FD" />
      {/* Person 3 */}
      <circle cx="75" cy="40" r="8" fill="#34D399" />
      <path d="M62 75 Q 75 55, 88 75 Z" fill="#6EE7B7" />
      {/* Hearts / community */}
      <path d="M47 18 Q 47 14, 50 14 Q 53 14, 53 18 Q 50 22, 47 18 Z" fill="#F43F5E" />
      <circle cx="38" cy="24" r="2" fill="#F43F5E" opacity="0.6" />
      <circle cx="62" cy="24" r="2" fill="#F43F5E" opacity="0.6" />
    </svg>
  );
}

// Grade 4 Unit 6: Voyages of Discovery — Ship & Compass
export function IllusVoyages(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="50" cy="50" r="45" fill="#CFFAFE" />
      {/* Ocean waves */}
      <path d="M5 65 Q 15 58, 25 65 T 45 65 T 65 65 T 85 65 T 95 65 L 95 95 L 5 95 Z" fill="#0EA5E9" />
      <path d="M5 72 Q 20 65, 35 72 T 65 72 T 95 72 L 95 95 L 5 95 Z" fill="#38BDF8" />
      {/* Ship hull */}
      <path d="M25 62 L 75 62 L 68 78 L 32 78 Z" fill="#92400E" />
      {/* Mast */}
      <rect x="48" y="20" width="4" height="42" fill="#451A03" />
      {/* Main sail */}
      <path d="M50 22 Q 78 32, 50 55 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
      {/* Second sail */}
      <path d="M48 28 Q 22 38, 48 52 Z" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="0.5" />
      {/* Flag */}
      <path d="M50 20 L 60 24 L 50 28 Z" fill="#EF4444" />
      {/* Small compass on top-right */}
      <circle cx="80" cy="25" r="8" fill="#FFFFFF" stroke="#64748B" strokeWidth="1" />
      <polygon points="80,17 82,25 80,23 78,25" fill="#EF4444" />
      <polygon points="80,33 78,25 80,27 82,25" fill="#1E293B" />
    </svg>
  );
}
