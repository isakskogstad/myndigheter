import React from 'react';
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
  <span className={className}>{prefix}{value?.toLocaleString('sv-SE')}{suffix}</span>
);

const TrendArrow = ({ current, previous, className = '' }) => {
  if (!previous || !current) return <Minus className={`w-4 h-4 text-stone-400 ${className}`} />;
  const diff = ((current - previous) / previous) * 100;
  if (Math.abs(diff) < 0.5) return <Minus className={`w-4 h-4 text-stone-400 ${className}`} />;
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
  animationYear,
  activeAgenciesCount
}) => {
  const [chartType, setChartType] = React.useState('area');

  // Derived stats
  const currentYearData = timeSeriesData.find(d => d.year === (isAnimating ? animationYear : yearRange[1]));
  const prevYearData = timeSeriesData.find(d => d.year === (isAnimating ? animationYear : yearRange[1]) - 1);
  
  const currentGenderData = genderHistoryData.find(d => d.year === Math.min(yearRange[1], 2024));
  const pctWomen = currentGenderData ? Math.round((currentGenderData.w / (currentGenderData.w + currentGenderData.m)) * 100) : 0;

  // Prepare Chart Data
  // Memoized to prevent unnecessary recalculations
  const chartData = React.useMemo(() => {
    let data = timeSeriesData
      .filter(d => d.year >= yearRange[0] && d.year <= (isAnimating ? animationYear : yearRange[1]))
      .map(d => {
        const swedenData = getStatsByYear(d.year);
        const genderData = genderHistoryData.find(g => g.year === d.year);
        return {
          ...d,
          population: swedenData?.population,
          gdp: swedenData?.gdp,
          w: genderData?.w,
          m: genderData?.m
        };
      });

    if (normalizeData) {
      data = normalizeSeriesData(data, activeSeries, yearRange[0]);
    }
    return data;
  }, [yearRange, isAnimating, animationYear, normalizeData, activeSeries]);

  const handleExportChart = () => {
    const headers = ['År', 'Myndigheter', 'Anställda', 'Befolkning', 'BNP (MSEK)', 'Kvinnor', 'Män'];
    const csvContent = [
      headers.join(';'),
      ...chartData.map(d => [
        d.year,
        d.count,
        d.emp,
        d.population,
        d.gdp,
        d.w,
        d.m
      ].join(';'))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `myndighetsutveckling-${yearRange[0]}-${yearRange[1]}.csv`;
    link.click();
  };

  // Helper to format Y-axis ticks
  const formatYAxis = (value) => {
    if (normalizeData) return value.toFixed(0);
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Controls Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
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
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-4">
          <SeriesSelector
            activeSeries={activeSeries}
            setActiveSeries={setActiveSeries}
            normalizeData={normalizeData}
            setNormalizeData={setNormalizeData}
            baseYear={yearRange[0]}
          />
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`p-2 rounded-full transition-colors ${isAnimating ? 'bg-red-50 text-red-600' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
              title={isAnimating ? "Stoppa animation" : "Spela upp historik"}
            >
              {isAnimating ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            {isAnimating && <span className="text-lg font-bold text-sage-600 tabular-nums">{animationYear}</span>}
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm relative">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-serif text-xl text-stone-900">Utveckling över tid</h3>
            <p className="text-sm text-stone-500">
              {normalizeData ? `Indexerad utveckling (${yearRange[0]}=100)` : 'Absoluta tal'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Chart Type Selector */}
            <div className="flex bg-stone-100 rounded-lg p-1 mr-2">
              <button 
                onClick={() => setChartType('area')}
                className={`p-1.5 rounded-md transition-all ${chartType === 'area' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                title="Ytdiagram"
              >
                <Activity className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setChartType('bar')}
                className={`p-1.5 rounded-md transition-all ${chartType === 'bar' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                title="Stapeldiagram"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setChartType('line')}
                className={`p-1.5 rounded-md transition-all ${chartType === 'line' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                title="Linjediagram"
              >
                <LineChart className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={handleExportChart}
              className="p-2 hover:bg-stone-50 rounded-lg text-stone-400 transition-colors"
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#a8a29e', fontSize: 12}} 
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                hide={false}
                tickFormatter={formatYAxis}
                domain={normalizeData ? ['auto', 'auto'] : [0, 'auto']}
                tick={{fill: '#a8a29e', fontSize: 11}}
                width={40}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                hide={normalizeData ? true : (!activeSeries.population && !activeSeries.gdp)}
                tickFormatter={formatYAxis}
                tick={{fill: '#d97706', fontSize: 11}}
                width={40}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                  border: '1px solid #e7e5e4', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }}
                labelStyle={{ fontFamily: 'var(--font-serif)', fontWeight: 600, color: '#1c1917', marginBottom: '8px' }}
                itemStyle={{ fontSize: '13px', padding: '2px 0' }}
                formatter={(value, name) => {
                  if (normalizeData) return [value.toFixed(1), name];
                  if (name === 'Befolkning') return [value.toLocaleString('sv-SE'), name];
                  if (name === 'BNP') return [`${value.toLocaleString('sv-SE')} MSEK`, name];
                  return [value.toLocaleString('sv-SE'), name];
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
                    fill={p.party === 'S' ? '#fee2e2' : '#dbeafe'} // Red/Blue tint
                    fillOpacity={0.3}
                    yAxisId="left"
                  />
                ))
              }

              {/* Agencies Chart - Dynamic Type */}
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
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Agencies Count */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-stone-100 rounded-lg text-stone-600"><Building2 className="w-5 h-5" /></span>
            <TrendArrow current={currentYearData?.count} previous={prevYearData?.count} />
          </div>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Myndigheter</p>
          <h3 className="text-3xl font-serif text-stone-900 font-medium old-style-nums">
            {currentYearData?.count || 0}
          </h3>
        </div>

        {/* Employees Count */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-stone-100 rounded-lg text-stone-600"><Users className="w-5 h-5" /></span>
            <TrendArrow current={currentYearData?.emp} previous={prevYearData?.emp} />
          </div>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Anställda</p>
          <h3 className="text-3xl font-serif text-stone-900 font-medium old-style-nums">
            <AnimatedNumber value={Math.round((currentYearData?.emp || 0)/1000)} suffix="k" />
          </h3>
        </div>

        {/* Gender Distribution */}
        <div className="col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-serif text-lg text-stone-900 mb-1">Jämställdhet</h4>
              <p className="text-sm text-stone-500">Könsfördelning i staten {yearRange[1]}</p>
            </div>
            <div className="w-12 h-12 hidden sm:block">
               {/* Mini donut could go here */}
            </div>
          </div>
          
          <div className="w-full bg-stone-100 rounded-full h-3 mb-2 overflow-hidden">
            <div 
              className="bg-sage-400 h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${pctWomen}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-medium">
            <span className="text-sage-600">{pctWomen}% Kvinnor</span>
            <span className="text-stone-500">{100 - pctWomen}% Män</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
