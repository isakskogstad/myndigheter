import React, { useState, useMemo } from 'react';
import { MoreHorizontal, Check, Search, ArrowUpDown, FilterX, FolderSearch } from 'lucide-react';
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
  deptFilter,
  setDeptFilter,
  statusFilter,
  setStatusFilter,
  onSelectAgency,
  onToggleCompare,
  compareList
}) => {
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // Advanced Search Logic
  const filteredAgencies = useMemo(() => {
    // Split search into terms for multi-word matching (simple fuzzy)
    const searchTerms = filterText.toLowerCase().split(' ').filter(Boolean);

    return agencies.filter(agency => {
      // Search Match
      let matchesSearch = true;
      if (searchTerms.length > 0) {
        const searchableText = `${agency.n} ${agency.sh || ''} ${agency.org || ''}`.toLowerCase();
        matchesSearch = searchTerms.every(term => searchableText.includes(term));
      }
        
      const matchesDept = deptFilter === 'all' || agency.d === deptFilter;
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && !agency.e) ||
        (statusFilter === 'dissolved' && agency.e);

      return matchesSearch && matchesDept && matchesStatus;
    }).sort((a, b) => {
      let res = 0;
      if (sortKey === 'employees') res = (b.emp || 0) - (a.emp || 0);
      else if (sortKey === 'formed') res = (b.s || '').localeCompare(a.s || '');
      else res = (a.n || '').localeCompare(b.n || '');
      
      return sortDir === 'asc' ? res : -res;
    });
  }, [agencies, filterText, deptFilter, statusFilter, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir('asc'); // Default to asc for new key (except maybe employees, but let's keep simple)
    }
  };

  const displayAgencies = filteredAgencies.slice(0, 100); // Increased limit

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center sticky top-20 z-20 backdrop-blur-xl bg-white/80">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select 
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all cursor-pointer hover:bg-white max-w-[200px]"
          >
            <option value="all">Alla departement</option>
            {departments.map(d => (
              <option key={d} value={d}>{getShortDeptName(d)}</option>
            ))}
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all cursor-pointer hover:bg-white"
          >
            <option value="all">Alla statusar</option>
            <option value="active">Aktiva</option>
            <option value="dissolved">Nedlagda</option>
          </select>
          
          {(deptFilter !== 'all' || statusFilter !== 'all' || filterText) && (
            <button 
              onClick={() => {
                setDeptFilter('all');
                setStatusFilter('all');
                setFilterText('');
              }}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="Rensa filter"
            >
              <FilterX className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider whitespace-nowrap">
          {filteredAgencies.length} träffar
        </span>
      </div>

      {/* Empty State */}
      {filteredAgencies.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <FolderSearch className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-serif font-medium text-slate-900 mb-1">Inga myndigheter hittades</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Vi hittade inget som matchar din sökning. Prova att ändra filter eller söktermer.
          </p>
          <button 
            onClick={() => { setFilterText(''); setDeptFilter('all'); setStatusFilter('all'); }}
            className="mt-6 px-6 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            Rensa sökning
          </button>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/90 backdrop-blur sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="w-12 px-4 py-4 text-center border-b border-slate-200">
                    <span className="sr-only">Välj</span>
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest font-sans border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">Myndighet <ArrowUpDown className={`w-3 h-3 text-slate-300 group-hover:text-primary-500 ${sortKey === 'name' ? 'text-primary-600' : ''}`} /></div>
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest font-sans border-b border-slate-200 hidden sm:table-cell">
                    Departement
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest font-sans border-b border-slate-200 hidden md:table-cell">
                    Ledning
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest font-sans border-b border-slate-200 text-right cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('employees')}>
                    <div className="flex items-center justify-end gap-1"><ArrowUpDown className={`w-3 h-3 text-slate-300 group-hover:text-primary-500 ${sortKey === 'employees' ? 'text-primary-600' : ''}`} /> Anställda</div>
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest font-sans border-b border-slate-200 text-right hidden sm:table-cell cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('formed')}>
                    <div className="flex items-center justify-end gap-1"><ArrowUpDown className={`w-3 h-3 text-slate-300 group-hover:text-primary-500 ${sortKey === 'formed' ? 'text-primary-600' : ''}`} /> År</div>
                  </th>
                  <th className="px-4 py-4 w-10 border-b border-slate-200"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayAgencies.map((agency) => {
                  const isSelected = compareList.some(a => a.n === agency.n);
                  return (
                    <tr 
                      key={agency.n} 
                      onClick={() => onSelectAgency(agency)}
                      className={`group transition-all cursor-pointer ${isSelected ? 'bg-primary-50/30' : 'hover:bg-slate-50'}`}
                    >
                      <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => onToggleCompare(agency)}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-primary-600 border-primary-600 text-white shadow-sm scale-110' 
                              : 'bg-white border-slate-300 text-transparent hover:border-primary-400'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-sm group-hover:text-primary-700 transition-colors flex items-center gap-2">
                          {agency.n}
                          {agency.e && <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded uppercase tracking-wide font-bold">Nedlagd</span>}
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-1">{agency.org || '–'}</div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span 
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border bg-opacity-10 whitespace-nowrap"
                          style={{ 
                            backgroundColor: `${deptColors[agency.d]}10`, 
                            color: deptColors[agency.d],
                            borderColor: `${deptColors[agency.d]}20`
                          }}
                        >
                          {getShortDeptName(agency.d)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm hidden md:table-cell">
                        {agency.str && (
                          <span className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">
                            {agency.str}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-mono text-right old-style-nums font-medium">
                        {agency.emp?.toLocaleString('sv-SE') || '–'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono text-right old-style-nums hidden sm:table-cell">
                        {agency.s ? agency.s.split('-')[0] : '–'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="p-1.5 rounded-lg text-slate-300 group-hover:text-primary-400 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredAgencies.length > 100 && (
            <div className="p-4 bg-slate-50/50 text-center border-t border-slate-200 text-xs font-medium text-slate-500">
              Visar de 100 första träffarna – förfina din sökning för att se mer.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RegistryView;
