import React, { useState, useMemo } from 'react';
import { MoreHorizontal, Check } from 'lucide-react';
import { deptColors } from '../../data/constants';

const getShortDeptName = (dept) => {
  if (!dept) return '';
  return dept.replace('departementet', '').trim();
};

const RegistryView = ({ 
  agencies, 
  departments,
  filterText, 
  setFilterText,
  onSelectAgency,
  onToggleCompare,
  compareList
}) => {
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState('name');

  const filteredAgencies = useMemo(() => {
    return agencies.filter(agency => {
      const matchesSearch = !filterText || 
        agency.n?.toLowerCase().includes(filterText.toLowerCase()) ||
        agency.sh?.toLowerCase().includes(filterText.toLowerCase());
        
      const matchesDept = deptFilter === 'all' || agency.d === deptFilter;
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && !agency.e) ||
        (statusFilter === 'dissolved' && agency.e);

      return matchesSearch && matchesDept && matchesStatus;
    }).sort((a, b) => {
      if (sortKey === 'employees') return (b.emp || 0) - (a.emp || 0);
      if (sortKey === 'formed') return (b.s || '').localeCompare(a.s || '');
      return (a.n || '').localeCompare(b.n || '');
    });
  }, [agencies, filterText, deptFilter, statusFilter, sortKey]);

  const displayAgencies = filteredAgencies.slice(0, 50);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select 
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800/10 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="all">Alla departement</option>
              {departments.map(d => (
                <option key={d} value={d}>{getShortDeptName(d)}</option>
              ))}
            </select>
          </div>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800/10 cursor-pointer hover:bg-slate-100"
          >
            <option value="all">Alla statusar</option>
            <option value="active">Aktiva</option>
            <option value="dissolved">Nedlagda</option>
          </select>

          <select 
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800/10 cursor-pointer hover:bg-slate-100"
          >
            <option value="name">Sortera: Namn</option>
            <option value="employees">Sortera: Anställda</option>
            <option value="formed">Sortera: Bildad</option>
          </select>
        </div>
        
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
          Visar {filteredAgencies.length} av {agencies.length}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Myndighet / Org.nr</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Departement</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Ledning</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans text-right">FTE</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans text-right">Bildad</th>
                <th className="px-4 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayAgencies.map((agency) => {
                const isSelected = compareList.some(a => a.n === agency.n);
                return (
                  <tr 
                    key={agency.n} 
                    onClick={() => onSelectAgency(agency)}
                    className="group hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 text-sm group-hover:text-primary-700 transition-colors flex items-center gap-2">
                        {agency.n}
                        {agency.e && <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">Nedlagd</span>}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{agency.org || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium border bg-opacity-10"
                        style={{ 
                          backgroundColor: `${deptColors[agency.d]}15`, 
                          color: deptColors[agency.d],
                          borderColor: `${deptColors[agency.d]}30`
                        }}
                      >
                        {getShortDeptName(agency.d)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {agency.str && (
                        <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {agency.str}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono text-right old-style-nums">
                      {agency.fte?.toLocaleString('sv-SE') || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-mono text-right old-style-nums">
                      {agency.s ? agency.s.split('-')[0] : '-'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onToggleCompare(agency); }}
                        className={`p-1.5 rounded transition-colors ${
                          isSelected 
                            ? 'bg-slate-800 text-white' 
                            : 'text-slate-300 hover:bg-slate-200 hover:text-slate-600'
                        }`}
                        title={isSelected ? "Ta bort från jämförelse" : "Lägg till i jämförelse"}
                      >
                        {isSelected ? <Check className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredAgencies.length > 50 && (
          <div className="p-4 bg-slate-50/50 text-center border-t border-slate-100 text-xs text-slate-400">
            Visar 50 första resultaten (sök för att hitta fler)
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistryView;