import React, { useState, useMemo } from 'react';
import { 
  Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ReferenceArea, ComposedChart 
} from 'recharts';
import { Building2, Users, Play, Square, ArrowUp, ArrowDown, Minus, Download, BarChart3, LineChart, Activity } from 'lucide-react';
import SeriesSelector, { normalizeSeriesData } from '../SeriesSelector';
import RangeSlider from '../ui/RangeSlider';
import { governmentPeriods, timeSeriesData, genderHistoryData } from '../../data/constants';
import { getStatsByYear } from '../../data/swedenStats';

const AnimatedNumber = ({ value, prefix = '', suffix = '', className = '' }) => (
  <span className={className}>{prefix}{value?.toLocaleString('sv-SE', { maximumFractionDigits: 1 })}{suffix}</span>
);

const TrendArrow = ({ current, previous, className = '' }) => {
  if (!previous || !current) return <Minus className={`w-4 h-4 text-slate-400 ${className}`} />;
  const diff = ((current - previous) / previous) * 100;
  if (Math.abs(diff) < 0.5) return <Minus className={`w-4 h-4 text-slate-400 ${className}`} />;
  if (diff > 0) return <div className={`flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}><ArrowUp className="w-3 h-3 mr-1" /> {diff.toFixed(1)}%</div>;
  return <div className={`flex items-center text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}><ArrowDown className="w-3 h-3 mr-1" /> {Math.abs(diff).toFixed(1)}%</div>;
};

const DashboardView = ({ 
  activeSeries,
  setActiveSeries,
  normalizeData,
  setNormalizeData,
  yearRange,
  setYearRange,
  isAnimating,
  setIsAnimating,
  animationYear
}) => {
  const [chartType, setChartType] = useState('area');
  const [genderMode, setGenderMode] = useState('count'); // 'count' | 'share'
  const [perCapita, setPerCapita] = useState(false);

  // Helper: Reset all filters
  const handleReset = () => {
    setActiveSeries({ agencies: true, employees: false });
    setNormalizeData(false);
    setPerCapita(false);
    setGenderMode('count');
    setYearRange([1978, 2025]);
    setChartType('area');
  };

  // Derived stats
  const currentYearData = timeSeriesData.find(d => d.year === (isAnimating ? animationYear : yearRange[1]));
  const prevYearData = timeSeriesData.find(d => d.year === (isAnimating ? animationYear : yearRange[1]) - 1);
  
  const currentGenderData = genderHistoryData.find(d => d.year === Math.min(yearRange[1], 2024));
  const pctWomen = currentGenderData ? Math.round((currentGenderData.w / (currentGenderData.w + currentGenderData.m)) * 100) : 0;

  // Prepare Chart Data
  const chartData = useMemo(() => {
    let data = timeSeriesData
      .filter(d => d.year >= yearRange[0] && d.year <= (isAnimating ? animationYear : yearRange[1]))
      .map(d => {
        const swedenData = getStatsByYear(d.year);
        const genderData = genderHistoryData.find(g => g.year === d.year);
        
        const item = {
          ...d,
          population: swedenData?.population,
          gdp: swedenData?.gdp,
          w: genderData?.w,
          m: genderData?.m
        };

        // Per Capita Logic (per 100k inhabitants)
        if (perCapita && item.population) {
          if (item.count) item.count = (item.count / item.population) * 100000;
          if (item.emp) item.emp = (item.emp / item.population) * 100000;
        }

        // Gender Share Logic
        if (genderMode === 'share' && item.w && item.m) {
          const total = item.w + item.m;
          item.w = (item.w / total) * 100;
          item.m = (item.m / total) * 100;
        }

        return item;
      });

    if (normalizeData) {
      data = normalizeSeriesData(data, activeSeries, yearRange[0]);
    }
    return data;
  }, [yearRange, isAnimating, animationYear, normalizeData, activeSeries, perCapita, genderMode]);

  const handleExportChart = () => {
    const headers = ['År', 'Myndigheter', 'Anställda', 'Befolkning', 'BNP (MSEK)', 'Kvinnor', 'Män'];
    const csvContent = [
      headers.join(';'),
      ...chartData.map(d => [
        d.year,
        d.count?.toFixed(2),
        d.emp?.toFixed(2),
        d.population,
        d.gdp,
        d.w?.toFixed(2),
        d.m?.toFixed(2)
      ].join(';'))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `myndigheter-data-${yearRange[0]}-${yearRange[1]}.csv`;
    link.click();
  };

  // Helper to format Y-axis ticks
  const formatYAxis = (value) => {
    if (normalizeData) return value.toFixed(0);
    if (genderMode === 'share' && (activeSeries.women || activeSeries.men)) return `${value}%`;
    if (perCapita) return value.toFixed(1);
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Controls Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {/* Range Slider */}
        <div className="mb-6">
          <RangeSlider
            min={1978}
            max={2025}
            value={yearRange}
            onChange={setYearRange}
          />
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <SeriesSelector
            activeSeries={activeSeries}
            setActiveSeries={setActiveSeries}
            normalizeData={normalizeData}
            setNormalizeData={setNormalizeData}
            perCapita={perCapita}
            setPerCapita={setPerCapita}
            baseYear={yearRange[0]}
            onReset={handleReset}
            genderMode={genderMode}
            setGenderMode={setGenderMode}
          />
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`p-2 rounded-full transition-colors ${isAnimating ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              title={isAnimating ? "Stoppa animation" : "Spela upp historik"}
            >
              {isAnimating ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            {isAnimating && <span className="text-lg font-bold text-primary-600 tabular-nums">{animationYear}</span>}
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-serif text-xl text-slate-900">Utveckling över tid</h3>
            <p className="text-sm text-slate-500">
              {normalizeData ? `Indexerad utveckling (${yearRange[0]}=100)` : perCapita ? 'Per 100 000 invånare' : 'Absoluta tal'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Chart Type Selector */}
            <div className="flex bg-slate-100 rounded-lg p-1 mr-2">
              <button 
                onClick={() => setChartType('area')}
                className={`p-1.5 rounded-md transition-all ${chartType === 'area' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                title="Ytdiagram"
              >
                <Activity className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setChartType('bar')}
                className={`p-1.5 rounded-md transition-all ${chartType === 'bar' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                title="Stapeldiagram"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setChartType('line')}
                className={`p-1.5 rounded-md transition-all ${chartType === 'line' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                title="Linjediagram"
              >
                <LineChart className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={handleExportChart}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
              title="Ladda ner data som CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="colorAgencies" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#57534e" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#57534e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                hide={false}
                tickFormatter={formatYAxis}
                domain={normalizeData || genderMode === 'share' ? ['auto', 'auto'] : [0, 'auto']}
                tick={{fill: '#64748b', fontSize: 11}}
                width={40}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                hide={normalizeData || genderMode === 'share' ? true : (!activeSeries.population && !activeSeries.gdp)}
                tickFormatter={formatYAxis}
                tick={{fill: '#d97706', fontSize: 11}}
                width={40}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }}
                labelStyle={{ fontFamily: 'var(--font-serif)', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}
                itemStyle={{ fontSize: '13px', padding: '2px 0' }}
                formatter={(value, name) => {
                  if (normalizeData) return [value.toFixed(1), name];
                  if (genderMode === 'share' && (name === 'Kvinnor' || name === 'Män')) return [`${value.toFixed(1)}%`, name];
                  if (name === 'Befolkning') return [value.toLocaleString('sv-SE'), name];
                  if (name === 'BNP') return [`${value.toLocaleString('sv-SE')} MSEK`, name];
                  return [value.toLocaleString('sv-SE', { maximumFractionDigits: 1 }), name];
                }}
              />
              
              {/* Governments Background */}
              {governmentPeriods
                .filter(p => p.end > yearRange[0] && p.start < yearRange[1])
                .map((p, i) => (
                  <ReferenceArea
                    key={i}
                    x1={Math.max(p.start, yearRange[0])}
                    x2={Math.min(p.end, isAnimating ? animationYear : yearRange[1])}
                    fill={p.party === 'S' ? '#fee2e2' : '#e0f2fe'} // Red/Blue tint
                    fillOpacity={0.3}
                    yAxisId="left"
                  />
                ))
              }

              {/* Agencies Chart */}
              {activeSeries.agencies && (
                chartType === 'bar' ? (
                  <Bar
                    yAxisId="left"
                    dataKey="count" 
                    name="Antal Myndigheter"
                    fill="#57534e"
                    radius={[2, 2, 0, 0]}
                  />
                ) : chartType === 'line' ? (
                  <Line
                    yAxisId="left"
                    type="monotone" 
                    dataKey="count" 
                    name="Antal Myndigheter"
                    stroke="#57534e" 
                    strokeWidth={3}
                    dot={false}
                  />
                ) : (
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="count" 
                    name="Antal Myndigheter"
                    stroke="#57534e" 
                    strokeWidth={2} 
                    fill="url(#colorAgencies)" 
                    animationDuration={500}
                  />
                )
              )}

              {/* Employees Line */}
              {activeSeries.employees && (
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="emp" 
                  name="Antal Anställda"
                  stroke="#84a59d" 
                  strokeWidth={2} 
                  dot={false}
                  strokeDasharray={normalizeData ? "" : "5 5"}
                />
              )}

              {/* Population Line */}
              {activeSeries.population && (
                <Line 
                  yAxisId={normalizeData ? "left" : "right"}
                  type="monotone" 
                  dataKey="population" 
                  name="Befolkning"
                  stroke="#a8a29e" 
                  strokeWidth={2} 
                  dot={false}
                  strokeDasharray="3 3"
                />
              )}

              {/* GDP Line */}
              {activeSeries.gdp && (
                <Line 
                  yAxisId={normalizeData ? "left" : "right"}
                  type="monotone" 
                  dataKey="gdp" 
                  name="BNP"
                  stroke="#d97706" 
                  strokeWidth={2} 
                  dot={false}
                />
              )}

              {/* Gender Lines */}
              {activeSeries.women && (
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="w" 
                  name="Kvinnor"
                  stroke="#be185d" 
                  strokeWidth={2} 
                  dot={false}
                />
              )}
              {activeSeries.men && (
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="m" 
                  name="Män"
                  stroke="#4f46e5" 
                  strokeWidth={2} 
                  dot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Agencies Count */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-slate-100 rounded-lg text-slate-600"><Building2 className="w-5 h-5" /></span>
            <TrendArrow current={currentYearData?.count} previous={prevYearData?.count} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Myndigheter</p>
          <h3 className="text-3xl font-serif text-slate-900 font-medium old-style-nums">
            {currentYearData?.count || 0}
          </h3>
        </div>

        {/* Employees Count */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-slate-100 rounded-lg text-slate-600"><Users className="w-5 h-5" /></span>
            <TrendArrow current={currentYearData?.emp} previous={prevYearData?.emp} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Anställda</p>
          <h3 className="text-3xl font-serif text-slate-900 font-medium old-style-nums">
            <AnimatedNumber value={Math.round((currentYearData?.emp || 0)/1000)} suffix="k" />
          </h3>
        </div>

        {/* Gender Distribution */}
        <div className="col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-serif text-lg text-slate-900 mb-1">Jämställdhet</h4>
              <p className="text-sm text-slate-500">Könsfördelning i staten {isAnimating ? animationYear : yearRange[1]}</p>
            </div>
            <div className="w-12 h-12 hidden sm:block">
               {/* Mini donut could go here */}
            </div>
          </div>
          
          <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
            <div 
              className="bg-sage-400 h-full rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${pctWomen}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-medium">
            <span className="text-sage-600">{pctWomen}% Kvinnor</span>
            <span className="text-slate-500">{100 - pctWomen}% Män</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;