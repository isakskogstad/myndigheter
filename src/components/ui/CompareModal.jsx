import React from 'react';
import { X, Users, Building, ExternalLink } from 'lucide-react';

const CompareModal = ({ compareList, onClose, onRemove }) => {
  if (!compareList || compareList.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-slate-50 w-full max-w-6xl h-full max-h-[90vh] rounded-3xl shadow-2xl relative flex flex-col overflow-hidden animate-fade-in border border-slate-200">
        
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="font-serif text-2xl text-slate-900 font-bold">Jämförelse</h2>
            <p className="text-slate-500 text-sm">Jämför {compareList.length} myndigheter sida-vid-sida</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 bg-slate-50/50">
          <div className="flex gap-6 h-full min-w-max">
            {compareList.map(agency => (
              <div key={agency.n} className="w-[320px] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
                <button 
                  onClick={() => onRemove(agency)}
                  className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="p-6 border-b border-slate-50">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl font-serif font-bold text-slate-900 mb-4 border border-slate-100">
                    {agency.n.charAt(0)}
                  </div>
                  <h3 className="font-serif text-xl text-slate-900 leading-tight mb-2 min-h-[3.5rem]">
                    {agency.n}
                  </h3>
                  <span className="inline-block px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">
                    {agency.d}
                  </span>
                </div>

                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <Users className="w-3 h-3" /> Personal
                    </div>
                    <div className="text-3xl font-serif text-slate-900 old-style-nums font-medium">
                      {agency.emp ? agency.emp.toLocaleString('sv-SE') : '–'}
                    </div>
                    {agency.fte && (
                      <div className="text-sm text-slate-500 mt-1 font-medium">
                        {agency.fte.toLocaleString('sv-SE')} FTE
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <Building className="w-3 h-3" /> Organisation
                    </div>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <dt className="text-slate-500">Form</dt>
                        <dd className="font-medium text-slate-900">{agency.str || '–'}</dd>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <dt className="text-slate-500">Säte</dt>
                        <dd className="font-medium text-slate-900">{agency.city || '–'}</dd>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <dt className="text-slate-500">Bildad</dt>
                        <dd className="font-medium text-slate-900 old-style-nums">{agency.s ? agency.s.split('-')[0] : '–'}</dd>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <dt className="text-slate-500">SFS</dt>
                        <dd className="font-mono text-slate-900 text-xs bg-slate-50 px-1.5 rounded">{agency.sfs || '–'}</dd>
                      </div>
                    </dl>
                  </div>

                  {agency.web && (
                    <div className="mt-auto pt-4">
                      <a 
                        href={agency.web} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-primary-200 hover:text-primary-700 transition-all text-sm font-bold"
                      >
                        Webbplats <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
