import React, { useState } from 'react';
import { Info } from 'lucide-react';
import RegionHistoryChart from '../charts/RegionHistoryChart';
import SwedenMap from '../charts/SwedenMap';
import ds from '../../styles/designSystem';

const RegionsView = ({ regionStats, agencies }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  return (
    <div className={ds.cn('space-y-8 animate-fade-in')}>

      {/* Current Distribution */}
      <div className={ds.cn('bg-white', ds.cardPadding.lg, ds.radius.lg, 'border relative overflow-hidden', ds.shadows.soft)} style={{ borderColor: ds.colors.slate[200] }}>
        <div className={ds.cn('grid md:grid-cols-2 items-center', ds.spacing['2xl'])}>
          <div>
            <h3 className={ds.cn('font-serif text-slate-900 mb-4', ds.typography.sizes['2xl'], ds.typography.weights.semibold)}>Geografisk fördelning</h3>
            <p className={ds.cn('text-slate-500 mb-8')}>
              Var i landet har myndigheterna sitt säte? Kartan visar koncentrationen av huvudkontor.
            </p>

            <div className="space-y-2">
              {regionStats.map(r => (
                <div
                  key={r.name}
                  onMouseEnter={() => setHoveredRegion(r.name)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  className={ds.cn(
                    'flex items-center justify-between px-3 py-2 cursor-default group',
                    ds.radius.sm,
                    ds.animations.normal,
                    hoveredRegion === r.name ? ds.cn('scale-[1.01]', ds.shadows.subtle) : 'hover:bg-slate-100'
                  )}
                  style={{ backgroundColor: hoveredRegion === r.name ? ds.colors.slate[100] : ds.colors.slate[50] }}
                >
                  <div className={ds.cn('flex items-center', ds.spacing.sm)}>
                    <div className={ds.cn('w-2.5 h-2.5 ring-2 ring-white', ds.radius.full, ds.shadows.subtle)} style={{ backgroundColor: r.color }} />
                    <span className={ds.cn(ds.typography.sizes.sm, ds.typography.weights.medium, 'text-slate-700 group-hover:text-slate-900')}>{r.name}</span>
                  </div>
                  <div className={ds.cn('text-right flex items-baseline', ds.spacing.sm)}>
                    <span className={ds.cn(ds.typography.sizes.base, ds.typography.weights.bold, 'text-slate-900', ds.typography.numbers.oldstyle, ds.typography.numbers.tabular)}>{r.value}</span>
                    <span className={ds.cn('text-slate-400 text-[11px] font-mono', ds.typography.weights.semibold)}>
                      ({Math.round((r.value / agencies.filter(a => !a.e).length) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className={ds.cn('mt-8 p-4 bg-sky-50 flex border border-sky-100', ds.radius.md, ds.spacing.md, ds.typography.sizes.sm, 'text-sky-800')}>
              <Info className={ds.cn(ds.iconSizes.md, 'flex-shrink-0 text-sky-600')} />
              <p>Trots utlokaliseringar är Stockholm fortfarande dominant med ca 45% av myndigheterna.</p>
            </div>
          </div>

          <div className={ds.cn('h-[500px] w-full bg-slate-50/50 p-8 border flex items-center justify-center', ds.radius.lg)} style={{ borderColor: ds.colors.slate[100] }}>
            <SwedenMap stats={regionStats} hoveredRegion={hoveredRegion} />
          </div>
        </div>
      </div>

      {/* Historical Trend */}
      <div className={ds.cn('bg-white', ds.cardPadding.lg, ds.radius.lg, 'border', ds.shadows.soft)} style={{ borderColor: ds.colors.slate[200] }}>
        <h3 className={ds.cn('font-serif text-slate-900 mb-6', ds.typography.sizes.xl, ds.typography.weights.semibold)}>Historisk utveckling (1978-2025)</h3>
        <RegionHistoryChart
          agencies={agencies}
          yearRange={[1978, 2025]}
        />
      </div>
    </div>
  );
};

export default RegionsView;
