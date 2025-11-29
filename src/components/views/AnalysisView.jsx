import React, { useMemo } from 'react';
import { Users, TrendingUp, Calendar, Scale } from 'lucide-react';

const RankingCard = ({ title, icon: Icon, items, valueFormatter, onSelect, colorClass = "bg-white" }) => (
  <div className={`${colorClass} p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col`}>
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
        <Icon className="w-5 h-5 text-slate-700" />
      </div>
      <h3 className="font-serif text-lg text-slate-900 font-semibold">{title}</h3>
    </div>
    
    <div className="space-y-3 flex-1">
      {items.map((item, index) => (
        <button
          key={item.n}
          onClick={() => onSelect(item)}
          className="w-full flex items-center justify-between group hover:bg-slate-50 p-2 rounded-lg -mx-2 transition-colors text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className={`
              flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
              ${index < 3 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}
            `}>
              {index + 1}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate group-hover:text-primary-700 transition-colors">
                {item.n}
              </div>
              <div className="text-xs text-slate-500 truncate">{item.d}</div>
            </div>
          </div>
          <div className="text-sm font-mono font-medium text-slate-700 whitespace-nowrap ml-4 old-style-nums">
            {valueFormatter(item)}
          </div>
        </button>
      ))}
    </div>
  </div>
);

const AnalysisView = ({ agencies, onSelectAgency }) => {
  
  const stats = useMemo(() => {
    // Filter active agencies only
    const active = agencies.filter(a => !a.e);

    // 1. Largest (Employees)
    const largest = [...active]
      .sort((a, b) => (b.emp || 0) - (a.emp || 0))
      .slice(0, 5);

    // 2. Smallest (Employees > 0)
    const smallest = [...active]
      .filter(a => a.emp > 0)
      .sort((a, b) => (a.emp || 0) - (b.emp || 0))
      .slice(0, 5);

    // 3. Gender Equality (Highest % Women)
    // Filter: Must have > 50 employees to be statistically relevant
    const mostWomen = [...active]
      .filter(a => a.emp > 50 && a.w && a.m)
      .sort((a, b) => {
        const pctA = a.w / (a.w + a.m);
        const pctB = b.w / (b.w + b.m);
        return pctB - pctA;
      })
      .slice(0, 5);

    // 4. Gender Equality (Lowest % Women = Most Men)
    const mostMen = [...active]
      .filter(a => a.emp > 50 && a.w && a.m)
      .sort((a, b) => {
        const pctA = a.w / (a.w + a.m);
        const pctB = b.w / (b.w + b.m);
        return pctA - pctB;
      })
      .slice(0, 5);

    // 5. Oldest
    const oldest = [...active]
      .filter(a => a.s)
      .sort((a, b) => a.s.localeCompare(b.s))
      .slice(0, 5);

    // 6. Newest
    const newest = [...active]
      .filter(a => a.s)
      .sort((a, b) => b.s.localeCompare(a.s))
      .slice(0, 5);

    return { largest, smallest, mostWomen, mostMen, oldest, newest };
  }, [agencies]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-slate-900 font-bold mb-2">Analys & Topplistor</h2>
        <p className="text-slate-500">Utforska ytterligheterna i den svenska statsförvaltningen.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RankingCard 
          title="Största myndigheterna" 
          icon={Users} 
          items={stats.largest} 
          valueFormatter={a => `${(a.emp || 0).toLocaleString()} anst.`}
          onSelect={onSelectAgency}
        />
        
        <RankingCard 
          title="Minsta myndigheterna" 
          icon={Users} 
          items={stats.smallest} 
          valueFormatter={a => `${a.emp} anst.`}
          onSelect={onSelectAgency}
        />

        <RankingCard 
          title="Högst andel kvinnor" 
          icon={Scale} 
          items={stats.mostWomen} 
          valueFormatter={a => `${Math.round((a.w / (a.w + a.m)) * 100)}%`}
          onSelect={onSelectAgency}
          colorClass="bg-pink-50/30 border-pink-100"
        />

        <RankingCard 
          title="Högst andel män" 
          icon={Scale} 
          items={stats.mostMen} 
          valueFormatter={a => `${Math.round((a.m / (a.w + a.m)) * 100)}%`}
          onSelect={onSelectAgency}
          colorClass="bg-blue-50/30 border-blue-100"
        />

        <RankingCard 
          title="Äldsta myndigheterna" 
          icon={Calendar} 
          items={stats.oldest} 
          valueFormatter={a => a.s?.split('-')[0]}
          onSelect={onSelectAgency}
        />

        <RankingCard 
          title="Nyaste myndigheterna" 
          icon={Calendar} 
          items={stats.newest} 
          valueFormatter={a => a.s?.split('-')[0]}
          onSelect={onSelectAgency}
        />
      </div>
    </div>
  );
};

export default AnalysisView;
