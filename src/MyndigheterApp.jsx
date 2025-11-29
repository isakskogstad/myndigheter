import React, { useState, useMemo } from 'react';
import { useAgencyData, useUrlState } from './hooks/useAgencyData';
import { LoadingState, ErrorState } from './components/ui/LoadingState';
import { regionColors } from './data/constants';

// Layout & Views
import Layout from './components/layout/Layout';
import DashboardView from './components/views/DashboardView';
import RegistryView from './components/views/RegistryView';
import DepartmentsView from './components/views/DepartmentsView';
import RegionsView from './components/views/RegionsView';

// UI Components
import AgencyDetailsPanel from './components/ui/AgencyDetailsPanel';
import CompareFloatingBar from './components/ui/CompareFloatingBar';
import CompareModal from './components/ui/CompareModal';
import AboutModal from './components/ui/AboutModal';

// Hooks
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  React.useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDark));
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return [isDark, setIsDark];
};

export default function MyndigheterApp() {
  // 1. Data & Global State
  const { data, loading, error, refresh } = useAgencyData();
  const agencies = data || [];
  const [isDark, setIsDark] = useDarkMode();
  
  // 2. URL State - The Source of Truth
  const [activeTab, setActiveTab] = useUrlState('view', 'overview');
  const [yearRange, setYearRange] = useUrlState('years', [1978, 2025]);
  const [searchQuery, setSearchQuery] = useUrlState('q', '');
  
  // Dashboard State (Persisted in URL)
  const [activeSeries, setActiveSeries] = useUrlState('series', { agencies: true, employees: false });
  const [normalizeData, setNormalizeData] = useUrlState('index', false);
  const [perCapita, setPerCapita] = useUrlState('capita', false);
  const [chartType, setChartType] = useUrlState('chart', 'area');
  const [genderMode, setGenderMode] = useUrlState('gender', 'count');

  // Registry Filter State
  const [deptFilter, setDeptFilter] = useUrlState('dept', 'all');
  const [statusFilter, setStatusFilter] = useUrlState('status', 'all');

  // Local UI State (Transient)
  const [showAboutModal, setShowAboutModal] = useState(false); // Renamed from showIntro
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationYear, setAnimationYear] = useState(1978);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);

  // Animation Loop
  React.useEffect(() => {
    let timer;
    if (isAnimating) {
      timer = setInterval(() => {
        setAnimationYear(y => {
          if (y >= yearRange[1]) {
            setIsAnimating(false);
            return yearRange[1];
          }
          return y + 1;
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [isAnimating, yearRange]);

  // 3. Derived Data
  const activeAgencies = useMemo(() => agencies.filter(a => !a.e), [agencies]);
  const departments = useMemo(() => [...new Set(activeAgencies.map(a => a.d).filter(Boolean))].sort(), [activeAgencies]);

  // Stats Calculations
  const departmentStats = useMemo(() => {
    const stats = {};
    activeAgencies.forEach(a => {
      if (a.d) {
        if (!stats[a.d]) stats[a.d] = { name: a.d, count: 0, emp: 0 };
        stats[a.d].count++;
        stats[a.d].emp += a.emp || 0;
      }
    });
    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [activeAgencies]);

  const regionStats = useMemo(() => {
    const stats = { Stockholm: 0, Göteborg: 0, Malmö: 0, Uppsala: 0, Övrigt: 0 };
    activeAgencies.forEach(a => {
      const city = a.city?.toUpperCase() || '';
      if (city.includes('STOCKHOLM') || city.includes('SOLNA')) stats.Stockholm++;
      else if (city.includes('GÖTEBORG')) stats.Göteborg++;
      else if (city.includes('MALMÖ') || city.includes('LUND')) stats.Malmö++;
      else if (city.includes('UPPSALA')) stats.Uppsala++;
      else stats.Övrigt++;
    });
    return Object.entries(stats).map(([name, value]) => ({ 
      name, value, color: regionColors[name] || '#78716c' 
    }));
  }, [activeAgencies]);

  // Handlers
  const handleDepartmentClick = (deptName) => {
    setDeptFilter(deptName);
    setActiveTab('list');
  };

  const handleDashboardReset = () => {
    setActiveSeries({ agencies: true, employees: false });
    setNormalizeData(false);
    setPerCapita(false);
    setGenderMode('count');
    setYearRange([1978, 2025]);
    setChartType('area');
  };

  // 4. Render
  if (loading) return <LoadingState message="Laddar myndighetsdata..." />;
  if (error) return <ErrorState error={error} onRetry={refresh} />;

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      showIntro={showAboutModal} // Pass to sidebar to show active state
      onToggleIntro={() => setShowAboutModal(true)}
      isDark={isDark}
      onToggleDark={() => setIsDark(!isDark)}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      agencies={agencies} // Pass data for search suggestions
      onSelectAgency={setSelectedAgency}
    >
      {/* Overlays */}
      <AgencyDetailsPanel 
        agency={selectedAgency} 
        onClose={() => setSelectedAgency(null)} 
      />
      
      {showCompareModal && (
        <CompareModal 
          compareList={compareList} 
          onClose={() => setShowCompareModal(false)}
          onRemove={(agency) => setCompareList(prev => prev.filter(a => a.n !== agency.n))}
        />
      )}

      {showAboutModal && (
        <AboutModal onClose={() => setShowAboutModal(false)} />
      )}

      <CompareFloatingBar 
        compareList={compareList}
        onClear={() => setCompareList([])}
        onOpenCompare={() => setShowCompareModal(true)}
      />

      {/* Views */}
      {activeTab === 'overview' && (
        <DashboardView 
          activeSeries={activeSeries}
          setActiveSeries={setActiveSeries}
          normalizeData={normalizeData}
          setNormalizeData={setNormalizeData}
          yearRange={yearRange}
          setYearRange={setYearRange}
          perCapita={perCapita}
          setPerCapita={setPerCapita}
          chartType={chartType}
          setChartType={setChartType}
          genderMode={genderMode}
          setGenderMode={setGenderMode}
          onReset={handleDashboardReset}
          isAnimating={isAnimating}
          setIsAnimating={(val) => {
            if(val) setAnimationYear(yearRange[0]);
            setIsAnimating(val);
          }}
          animationYear={animationYear}
        />
      )}

      {activeTab === 'list' && (
        <RegistryView 
          agencies={agencies}
          departments={departments}
          filterText={searchQuery}
          setFilterText={setSearchQuery}
          deptFilter={deptFilter}
          setDeptFilter={setDeptFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onSelectAgency={setSelectedAgency}
          onToggleCompare={(agency) => {
            setCompareList(prev => {
              if (prev.find(a => a.n === agency.n)) return prev.filter(a => a.n !== agency.n);
              if (prev.length >= 3) return prev; 
              return [...prev, agency];
            });
          }}
          compareList={compareList}
        />
      )}

      {activeTab === 'departments' && (
        <DepartmentsView 
          agencies={agencies}
          departments={departments}
          departmentStats={departmentStats}
          onDepartmentClick={handleDepartmentClick}
        />
      )}

      {activeTab === 'regions' && (
        <RegionsView 
          regionStats={regionStats}
          agencies={agencies}
        />
      )}
    </Layout>
  );
}