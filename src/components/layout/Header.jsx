import React, { useState } from 'react';
import { Search, Share, ChevronRight, X } from 'lucide-react';
import ds from '../../styles/designSystem';

const Header = ({ 
  activeTabLabel, 
  searchQuery, 
  onSearchChange, 
  onShare,
  onToggleMobileMenu,
  agencies = [], 
  onSelectAgency 
}) => {
  const [showResults, setShowResults] = useState(false);

  // Filter suggestions
  const suggestions = searchQuery.length > 1 
    ? agencies.filter(a => a.n.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5) 
    : [];

  const handleSelect = (agency) => {
    onSelectAgency(agency);
    setShowResults(false);
    onSearchChange(''); // Clear search to avoid obstruction
  };

  return (
    <header className={ds.cn('h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0 w-full', ds.animations.slow)} style={{ borderColor: ds.colors.slate[200] }}>

      {/* Left Side */}
      <div className={ds.cn('flex items-center', ds.spacing.md)}>
        <div className={ds.cn('flex items-center text-slate-500', ds.typography.sizes.sm)}>
          <span className={ds.cn('hover:text-slate-800 cursor-pointer hidden sm:inline', ds.typography.weights.medium, ds.animations.normal)}>Start</span>
          <ChevronRight className={ds.cn(ds.iconSizes.sm, 'mx-2 text-slate-300 hidden sm:block')} />
          <span className={ds.cn('text-slate-900', ds.typography.weights.semibold)}>{activeTabLabel}</span>
        </div>
      </div>
      
      {/* Right Side: Search & Actions */}
      <div className={ds.cn('flex items-center relative', ds.spacing.md)}>
        {/* Search Bar */}
        <div className="relative group">
          <Search className={ds.cn(ds.iconSizes.sm, 'text-slate-400 absolute left-3 top-2.5', ds.animations.normal)} style={{ color: ds.colors.primary[500] }} />
          <input
            type="text"
            placeholder="Sök myndighet..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            className={ds.cn('w-32 sm:w-64 pl-9 pr-8 py-2 bg-white/50 border text-slate-600 placeholder-stone-400 hover:bg-white', ds.radius.md, ds.typography.sizes.sm, ds.focus.ring, ds.animations.normal, ds.shadows.subtle)} style={{ borderColor: ds.colors.slate[200] }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className={ds.cn('absolute right-2 top-2.5 text-slate-400 hover:text-slate-600')}
            >
              <X className="w-3 h-3" />
            </button>
          )}
          
          {/* Search Dropdown */}
          {showResults && suggestions.length > 0 && (
            <div className={ds.cn('absolute top-full left-0 right-0 mt-2 bg-white border overflow-hidden z-50 animate-fade-in', ds.radius.md, ds.shadows.strong)} style={{ borderColor: ds.colors.slate[100] }}>
              <div className="py-1">
                {suggestions.map(agency => (
                  <button
                    key={agency.n}
                    onClick={() => handleSelect(agency)}
                    className={ds.cn('w-full text-left px-4 py-3 flex flex-col border-b last:border-0', ds.typography.sizes.sm, ds.animations.normal, 'hover:bg-slate-50')} style={{ borderColor: ds.colors.slate[50] }}
                  >
                    <span className={ds.cn('text-slate-900', ds.typography.weights.medium)}>{agency.n}</span>
                    <span className={ds.cn('text-slate-500 mt-0.5', ds.typography.sizes.xs)}>{agency.d}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={onShare}
          className={ds.cn('p-2 text-slate-400 border border-transparent', ds.radius.md, ds.animations.normal)} style={{ color: ds.colors.primary[600], backgroundColor: ds.colors.primary[50], borderColor: ds.colors.primary[100] }}
          title="Dela denna vy"
        >
          <Share className={ds.cn(ds.iconSizes.sm)} />
        </button>
      </div>
    </header>
  );
};

export default Header;