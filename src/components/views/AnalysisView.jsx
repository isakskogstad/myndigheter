import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Briefcase, Calendar, ArrowRight, Zap, Scale, Info, PieChart, Clock } from 'lucide-react';
import ds from '../../styles/designSystem';
import HorizontalTimeline from '../ui/HorizontalTimeline';

// Info tooltip component
const InfoTooltip = ({ text }) => (
  <div className="group relative inline-block">
    <Info className={ds.cn(ds.iconSizes.sm, 'text-slate-400 hover:text-slate-600 cursor-help', ds.animations.normal)} />
    <div className={ds.cn('absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-3 text-white z-50', ds.typography.sizes.xs, ds.radius.md, ds.shadows.strong)} style={{ backgroundColor: ds.colors.slate[900] }}>
      {text}
      <div className={ds.cn('absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 transform rotate-45 -mt-1')} style={{ backgroundColor: ds.colors.slate[900] }}></div>
    </div>
  </div>
);

// --- Sub-components for specific visualizations ---

// 1. Interactive Leaderboard (Horizontal Bars)
const LeaderboardModule = ({ agencies, onSelect }) => {
  const [metric, setMetric] = useState('emp'); // 'emp' | 'fte'

  const data = useMemo(() => {
    return [...agencies]
      .filter(a => !a.e && a[metric] > 0)
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, 10)
      .map(a => ({
        name: a.n,
        value: a[metric],
        agency: a
      }));
  }, [agencies, metric]);

  return (
    <div className={ds.cn('bg-white', ds.cardPadding.lg, ds.radius.lg, 'border', ds.shadows.card, ds.animations.normal)} style={{ borderColor: ds.colors.slate[200] }}>
      <div className={ds.cn('flex flex-wrap justify-between items-center mb-6', ds.spacing.md)}>
        <div>
          <h3 className={ds.cn('font-serif text-slate-900 flex items-center', ds.typography.sizes.xl, ds.typography.weights.bold, ds.spacing.sm)}>
            <Zap className={ds.cn(ds.iconSizes.md, 'text-amber-500 fill-current')} />
            Topplista: Största Myndigheterna
            <InfoTooltip text="Visar de 10 största myndigheterna baserat på antal anställda eller årsarbetskrafter (FTE). Klicka på en stapel för mer detaljer." />
          </h3>
          <p className={ds.cn('text-slate-500', ds.typography.sizes.sm)}>De 10 största myndigheterna baserat på valt mått.</p>
        </div>
        <div className={ds.cn('flex p-1', ds.radius.md)} style={{ backgroundColor: ds.colors.slate[100] }}>
          <button
            onClick={() => setMetric('emp')}
            className={ds.cn('px-3 py-1.5', ds.radius.md, ds.typography.sizes.xs, ds.typography.weights.medium, ds.animations.normal, metric === 'emp' ? ds.cn('bg-white text-slate-900', ds.shadows.subtle) : 'text-slate-500 hover:text-slate-700')}
          >
            Anställda
          </button>
          <button
            onClick={() => setMetric('fte')}
            className={ds.cn('px-3 py-1.5', ds.radius.md, ds.typography.sizes.xs, ds.typography.weights.medium, ds.animations.normal, metric === 'fte' ? ds.cn('bg-white text-slate-900', ds.shadows.subtle) : 'text-slate-500 hover:text-slate-700')}
          >
            Årsarbetskrafter (FTE)
          </button>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            barCategoryGap={15}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={150} 
              tick={{ fontSize: 12, fontWeight: 500, fill: '#475569' }} 
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: ds.colors.slate[50] }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className={ds.cn('bg-white p-3 border', ds.radius.md, ds.shadows.strong, ds.typography.sizes.sm)} style={{ borderColor: ds.colors.slate[200] }}>
                      <div className={ds.cn('text-slate-900 mb-1', ds.typography.weights.bold)}>{d.name}</div>
                      <div className="text-slate-500">
                        {metric === 'emp' ? 'Anställda:' : 'FTE:'} <span className={ds.cn('font-mono text-slate-900', ds.typography.weights.medium)}>{d.value.toLocaleString('sv-SE')}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="value"
              radius={[0, 6, 6, 0]}
              onClick={(data) => onSelect(data.agency)}
              cursor="pointer"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index < 3 ? ds.colors.slate[900] : ds.colors.slate[400]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 2. Correlation Chart (Scatter Plot: Age vs Size)
const AgeVsSizeModule = ({ agencies }) => {
  const data = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return agencies
      .filter(a => !a.e && a.s && a.emp && a.emp > 0) // Include all with employee data
      .map(a => ({
        name: a.n,
        age: currentYear - parseInt(a.s.split('-')[0]),
        size: a.emp,
        dept: a.d
      }))
      .filter(d => !isNaN(d.age) && d.size > 0);
  }, [agencies]);

  if (data.length < 5) {
    return (
      <div className={ds.cn('bg-white flex flex-col', ds.cardPadding.lg, ds.radius.lg, 'border', ds.shadows.card, ds.animations.normal)} style={{ borderColor: ds.colors.slate[200] }}>
        <div className="mb-6">
          <h3 className={ds.cn('font-serif text-slate-900 flex items-center', ds.typography.sizes.xl, ds.typography.weights.bold, ds.spacing.sm)}>
            <Briefcase className={ds.cn(ds.iconSizes.md)} style={{ color: ds.colors.primary[500] }} />
            Storlek vs Ålder
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <p className={ds.cn('text-slate-400', ds.typography.sizes.sm)}>För få datapunkter att visa. Behöver minst 5 myndigheter med anställningsdata.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={ds.cn('bg-white flex flex-col', ds.cardPadding.lg, ds.radius.lg, 'border', ds.shadows.card, ds.animations.normal)} style={{ borderColor: ds.colors.slate[200] }}>
      <div className="mb-6">
        <h3 className={ds.cn('font-serif text-slate-900 flex items-center', ds.typography.sizes.xl, ds.typography.weights.bold, ds.spacing.sm)}>
          <Briefcase className={ds.cn(ds.iconSizes.md)} style={{ color: ds.colors.primary[500] }} />
          Storlek vs Ålder
          <InfoTooltip text="Scatter-plot som visar sambandet mellan myndighetens ålder och storlek. Större bubblor = fler anställda. Endast aktiva myndigheter med anställningsdata visas." />
        </h3>
        <p className={ds.cn('text-slate-500', ds.typography.sizes.sm)}>Är äldre myndigheter större? Varje bubbla är en myndighet.</p>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              type="number" 
              dataKey="age" 
              name="Ålder" 
              unit=" år" 
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              label={{ value: 'Ålder (år)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis 
              type="number" 
              dataKey="size" 
              name="Anställda" 
              tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              width={40}
            />
            <ZAxis type="number" dataKey="size" range={[20, 400]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className={ds.cn('bg-white p-3 border z-50', ds.radius.md, ds.shadows.strong, ds.typography.sizes.sm)} style={{ borderColor: ds.colors.slate[200] }}>
                      <div className={ds.cn('text-slate-900 mb-1', ds.typography.weights.bold)}>{d.name}</div>
                      <div className={ds.cn('text-slate-500', ds.typography.sizes.xs)}>{d.dept}</div>
                      <div className={ds.cn('mt-2 flex justify-between', ds.spacing.md)}>
                        <span className="text-slate-600">{d.age} år gammal</span>
                        <span className={ds.cn('font-mono text-slate-900')}>{d.size.toLocaleString()} anst.</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Myndigheter" data={data} fill={ds.colors.primary[500]} fillOpacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 3. Gender Balance (Diverging Bar)
const GenderBalanceModule = ({ agencies, onSelect }) => {
  const data = useMemo(() => {
    return [...agencies]
      .filter(a => !a.e && a.emp > 100 && a.w && a.m) // Significant size
      .sort((a, b) => (b.w / (b.w + b.m)) - (a.w / (a.w + a.m))) // Most women first
      .filter((_, i, arr) => i < 5 || i >= arr.length - 5) // Top 5 and Bottom 5
      .map(a => ({
        name: a.n,
        womenPct: Math.round((a.w / (a.w + a.m)) * 100),
        menPct: Math.round((a.m / (a.w + a.m)) * 100),
        agency: a
      }));
  }, [agencies]);

  const topWomen = data.slice(0, 5);
  const topMen = data.slice(5).reverse(); // Reverse to show highest men pct descending

  const Row = ({ item }) => {
    // Color coding based on gender balance
    let bgColor = 'bg-slate-50';
    if (item.womenPct >= 45 && item.womenPct <= 55) {
      bgColor = 'bg-emerald-50'; // Balanced
    } else if (item.womenPct > 70) {
      bgColor = 'bg-pink-50'; // High women
    } else if (item.menPct > 70) {
      bgColor = 'bg-indigo-50'; // High men
    }

    return (
      <div
        onClick={() => onSelect(item.agency)}
        className={ds.cn('group cursor-pointer p-2', ds.radius.md, ds.animations.normal, ds.shadows.subtle, bgColor)}
      >
        <div className={ds.cn('flex justify-between mb-1.5', ds.typography.sizes.xs, ds.typography.weights.medium)}>
          <span className={ds.cn('text-slate-700 truncate max-w-[180px]', ds.animations.normal)} style={{ color: ds.colors.primary[700] }}>{item.name}</span>
          <div className={ds.cn('flex', ds.spacing.sm, 'text-[10px]')}>
            <span className="text-pink-600">{item.womenPct}% K</span>
            <span className="text-indigo-600">{item.menPct}% M</span>
          </div>
        </div>
        <div className={ds.cn('flex w-full h-2 overflow-hidden bg-white', ds.radius.full)}>
          <div className="bg-pink-400 h-full" style={{ width: `${item.womenPct}%` }}></div>
          <div className="bg-indigo-500 h-full" style={{ width: `${item.menPct}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className={ds.cn('bg-white flex flex-col', ds.cardPadding.lg, ds.radius.lg, 'border', ds.shadows.card, ds.animations.normal)} style={{ borderColor: ds.colors.slate[200] }}>
      <div className="mb-6">
        <h3 className={ds.cn('font-serif text-slate-900 flex items-center', ds.typography.sizes.xl, ds.typography.weights.bold, ds.spacing.sm)}>
          <Scale className={ds.cn(ds.iconSizes.md, 'text-pink-500')} />
          Jämställdhet (Top/Botten)
          <InfoTooltip text="Färgkodning: Grön = jämställt (45-55%), Rosa = >70% kvinnor, Blå = >70% män. Endast myndigheter med >100 anställda visas." />
        </h3>
        <p className={ds.cn('text-slate-500', ds.typography.sizes.sm)}>Myndigheter med högst andel kvinnor respektive män.</p>
      </div>

      <div className={ds.cn('flex-1 grid grid-cols-1', ds.spacing.lg)}>
        <div>
          <h4 className={ds.cn('text-slate-400 uppercase tracking-wider mb-3', ds.typography.sizes.xs, ds.typography.weights.bold)}>Högst andel kvinnor</h4>
          <div className="space-y-1">
            {topWomen.map(item => <Row key={item.name} item={item} />)}
          </div>
        </div>
        <div>
          <h4 className={ds.cn('text-slate-400 uppercase tracking-wider mb-3', ds.typography.sizes.xs, ds.typography.weights.bold)}>Högst andel män</h4>
          <div className="space-y-1">
            {topMen.map(item => <Row key={item.name} item={item} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. Timeline Card with Toggle (Oldest/Newest)
const TimelineCard = ({ oldest, newest, onSelect }) => {
  const [mode, setMode] = useState('oldest');
  const items = mode === 'oldest' ? oldest : newest;
  const Icon = mode === 'oldest' ? Calendar : ArrowRight;

  return (
    <div className={ds.cn('bg-white h-full flex flex-col', ds.cardPadding.lg, ds.radius.lg, 'border', ds.shadows.soft)} style={{ borderColor: ds.colors.slate[200] }}>
      <div className={ds.cn('flex items-center justify-between mb-6')}>
        <div className={ds.cn('flex items-center', ds.spacing.md)}>
          <div className={ds.cn('p-2.5', ds.radius.md)} style={{ backgroundColor: ds.colors.slate[50] }}>
            <Icon className={ds.cn(ds.iconSizes.md, 'text-slate-700')} />
          </div>
          <h3 className={ds.cn('font-serif text-slate-900', ds.typography.sizes.lg, ds.typography.weights.semibold)}>
            {mode === 'oldest' ? 'Äldsta' : 'Nyaste'} (Aktiva)
          </h3>
        </div>

        <div className={ds.cn('flex p-1', ds.radius.md)} style={{ backgroundColor: ds.colors.slate[100] }}>
          <button
            onClick={() => setMode('oldest')}
            className={ds.cn('px-3 py-1.5', ds.radius.md, ds.typography.sizes.xs, ds.typography.weights.medium, ds.animations.normal, mode === 'oldest' ? ds.cn('bg-white text-slate-900', ds.shadows.subtle) : 'text-slate-500 hover:text-slate-700')}
          >
            Äldst
          </button>
          <button
            onClick={() => setMode('newest')}
            className={ds.cn('px-3 py-1.5', ds.radius.md, ds.typography.sizes.xs, ds.typography.weights.medium, ds.animations.normal, mode === 'newest' ? ds.cn('bg-white text-slate-900', ds.shadows.subtle) : 'text-slate-500 hover:text-slate-700')}
          >
            Yngst
          </button>
        </div>
      </div>

      <div className="space-y-1 flex-1">
        {items.map((item, index) => (
          <button
            key={item.n}
            onClick={() => onSelect(item)}
            className={ds.cn('w-full flex items-center justify-between group p-2.5 text-left', ds.radius.md, ds.animations.normal, 'hover:bg-slate-50')}
          >
            <div className={ds.cn('flex items-center min-w-0', ds.spacing.md)}>
              <span className={ds.cn('flex-shrink-0 w-6 h-6 flex items-center justify-center text-slate-500', ds.radius.full, ds.typography.sizes.xs, ds.typography.weights.bold, ds.animations.normal, 'group-hover:bg-white')} style={{ backgroundColor: ds.colors.slate[100] }}>
                {index + 1}
              </span>
              <div className="min-w-0">
                <div className={ds.cn('text-slate-900 truncate', ds.typography.sizes.sm, ds.typography.weights.medium, ds.animations.normal)} style={{ color: ds.colors.primary[700] }}>
                  {item.n}
                </div>
              </div>
            </div>
            <div className={ds.cn('font-mono text-slate-500 ml-4 group-hover:text-slate-900', ds.typography.sizes.xs, ds.typography.weights.medium, ds.typography.numbers.oldstyle)}>
              {item.s?.split('-')[0]}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const AnalysisView = ({ agencies, onSelectAgency }) => {
  
  const oldest = useMemo(() => 
    agencies.filter(a => !a.e && a.s).sort((a, b) => a.s.localeCompare(b.s)).slice(0, 5), 
  [agencies]);

  const newest = useMemo(() => 
    agencies.filter(a => !a.e && a.s).sort((a, b) => b.s.localeCompare(a.s)).slice(0, 5), 
  [agencies]);

  return (
    <div className={ds.cn('space-y-8 animate-fade-in')}>
      {/* Header */}
      <div className={ds.cn('bg-gradient-to-br p-8 md:p-12 text-white relative overflow-hidden', ds.radius.lg, ds.shadows.strong, ds.gradients.slate)}>
        <div className={ds.cn('relative z-10', ds.containers.content)}>
          <div className={ds.cn('inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white uppercase tracking-wider mb-4', ds.spacing.sm, ds.radius.full, ds.typography.sizes.xs, ds.typography.weights.bold)}>
            <PieChart className="w-3.5 h-3.5" />
            Djupanalys
          </div>
          <h2 className={ds.cn('font-serif mb-4', ds.typography.sizes['3xl'], 'md:text-4xl', ds.typography.weights.bold)}>Myndighetsanalys</h2>
          <p className={ds.cn('text-slate-300', ds.typography.sizes.lg, ds.typography.leading.relaxed)}>
            Utforska extremvärden, korrelationer och trender i den svenska statsförvaltningen genom interaktiva visualiseringar.
          </p>
        </div>
        {/* Abstract Decor */}
        <div className={ds.cn('absolute right-0 top-0 w-96 h-96 blur-3xl transform translate-x-1/2 -translate-y-1/2', ds.radius.full)} style={{ backgroundColor: `${ds.colors.primary[500]}33` }}></div>
        <div className={ds.cn('absolute bottom-0 left-1/4 w-64 h-64 bg-pink-500/20 blur-3xl transform translate-y-1/2', ds.radius.full)}></div>
      </div>

      {/* Horizontal Timeline - Full Width */}
      <div className={ds.cn('bg-white', ds.cardPadding.lg, ds.radius.lg, 'border', ds.shadows.card)} style={{ borderColor: ds.colors.slate[200] }}>
        <div className={ds.cn('flex items-center mb-4', ds.spacing.sm)}>
          <Clock className={ds.cn(ds.iconSizes.md)} style={{ color: ds.colors.primary[500] }} />
          <h3 className={ds.cn('font-serif text-slate-900', ds.typography.sizes.xl, ds.typography.weights.bold)}>
            Tidslinje
          </h3>
          <InfoTooltip text="Interaktiv tidslinje som visar när myndigheter bildades. Scrolla horisontellt eller filtrera på årtionde. Klicka på en punkt för detaljer." />
        </div>
        <p className={ds.cn('text-slate-500 mb-6', ds.typography.sizes.sm)}>
          Se när svenska myndigheter har bildats genom historien. Varje punkt är en myndighet.
        </p>
        <HorizontalTimeline agencies={agencies} onSelect={onSelectAgency} />
      </div>

      {/* Main Grid */}
      <div className={ds.cn('grid grid-cols-1 lg:grid-cols-3', ds.spacing.lg)}>
        {/* Full Width Leaderboard */}
        <div className="col-span-1 lg:col-span-2">
          <LeaderboardModule agencies={agencies} onSelect={onSelectAgency} />
        </div>

        {/* Timeline Card */}
        <div className="col-span-1">
          <TimelineCard
            oldest={oldest}
            newest={newest}
            onSelect={onSelectAgency}
          />
        </div>

        {/* Scatter Plot */}
        <div className="col-span-1 lg:col-span-2">
           <AgeVsSizeModule agencies={agencies} />
        </div>

        {/* Gender Balance */}
        <div className="col-span-1">
          <GenderBalanceModule agencies={agencies} onSelect={onSelectAgency} />
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;