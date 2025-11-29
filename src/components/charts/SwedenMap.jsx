import React from 'react';

const SwedenMap = ({ stats }) => {
  // Normalize stats for bubble size
  const maxVal = Math.max(...Object.values(stats).map(s => s.value));
  const getSize = (val) => Math.max(8, (val / maxVal) * 40);

  return (
    <svg viewBox="0 0 300 600" className="w-full h-full max-h-[500px]">
      {/* Abstract Sweden Outline (Simplified) */}
      <path 
        d="M110,580 L90,550 L70,500 L60,450 L50,400 L60,350 L50,300 L60,250 L80,200 L100,150 L130,100 L150,50 L170,20 L190,50 L200,100 L190,150 L180,200 L190,250 L200,300 L210,350 L200,400 L180,450 L160,500 L140,550 L110,580 Z" 
        fill="#f1f5f9" 
        stroke="#cbd5e1" 
        strokeWidth="2"
      />
      
      {/* Stockholm */}
      <circle cx="180" cy="400" r={getSize(stats.find(s => s.name === 'Stockholm')?.value || 0)} fill="#0c80f0" opacity="0.8" />
      <text x="190" y="400" className="text-[10px] fill-slate-600 font-medium" dx="10">Stockholm</text>

      {/* Uppsala */}
      <circle cx="175" cy="380" r={getSize(stats.find(s => s.name === 'Uppsala')?.value || 0)} fill="#7c3aed" opacity="0.8" />
      <text x="185" y="380" className="text-[10px] fill-slate-600 font-medium" dx="10">Uppsala</text>

      {/* Göteborg */}
      <circle cx="80" cy="460" r={getSize(stats.find(s => s.name === 'Göteborg')?.value || 0)} fill="#059669" opacity="0.8" />
      <text x="60" y="460" className="text-[10px] fill-slate-600 font-medium" textAnchor="end" dx="-10">Göteborg</text>

      {/* Malmö */}
      <circle cx="110" cy="560" r={getSize(stats.find(s => s.name === 'Malmö')?.value || 0)} fill="#d97706" opacity="0.8" />
      <text x="120" y="560" className="text-[10px] fill-slate-600 font-medium" dx="10">Malmö</text>

      {/* Other (Abstract center) */}
      <circle cx="140" cy="250" r={getSize(stats.find(s => s.name === 'Övrigt')?.value || 0)} fill="#78716c" opacity="0.4" />
      <text x="140" y="250" className="text-[10px] fill-slate-500 font-medium" textAnchor="middle" dy="5">Övrigt</text>
    </svg>
  );
};

export default SwedenMap;
