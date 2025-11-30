import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Building2, Users } from 'lucide-react';

/**
 * HorizontalTimeline Component
 * Displays agencies on a horizontal scrollable timeline
 *
 * @param {Object} props
 * @param {Array} props.agencies - Array of agency objects
 * @param {function} props.onSelect - Callback when agency is selected
 * @param {string} props.mode - 'all' | 'oldest' | 'newest' (default: 'all')
 */
const HorizontalTimeline = ({ agencies, onSelect, mode = 'all' }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hoveredAgency, setHoveredAgency] = useState(null);
  const [selectedDecade, setSelectedDecade] = useState(null);

  // Process agencies into timeline data
  const timelineData = useMemo(() => {
    // Filter and sort agencies by start year
    const filtered = agencies
      .filter(a => a.s && !isNaN(parseInt(a.s.split('-')[0])))
      .map(a => ({
        ...a,
        year: parseInt(a.s.split('-')[0])
      }))
      .sort((a, b) => a.year - b.year);

    if (filtered.length === 0) return { decades: [], agencies: [] };

    // Determine year range
    const minYear = Math.floor(filtered[0].year / 10) * 10;
    const maxYear = Math.ceil((filtered[filtered.length - 1].year + 1) / 10) * 10;

    // Create decade markers
    const decades = [];
    for (let year = minYear; year <= maxYear; year += 10) {
      decades.push(year);
    }

    // Filter based on mode
    let displayAgencies = filtered;
    if (mode === 'oldest') {
      displayAgencies = filtered.filter(a => !a.e).slice(0, 20);
    } else if (mode === 'newest') {
      displayAgencies = filtered.filter(a => !a.e).slice(-20).reverse();
    }

    return { decades, agencies: displayAgencies, minYear, maxYear };
  }, [agencies, mode]);

  // Check scroll position
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      return () => ref.removeEventListener('scroll', checkScroll);
    }
  }, [timelineData]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Calculate position on timeline
  const getPosition = (year) => {
    if (!timelineData.minYear || !timelineData.maxYear) return 0;
    const range = timelineData.maxYear - timelineData.minYear;
    return ((year - timelineData.minYear) / range) * 100;
  };

  // Group agencies by decade for filtering
  const decadeAgencies = useMemo(() => {
    const groups = {};
    timelineData.agencies.forEach(a => {
      const decade = Math.floor(a.year / 10) * 10;
      if (!groups[decade]) groups[decade] = [];
      groups[decade].push(a);
    });
    return groups;
  }, [timelineData.agencies]);

  if (timelineData.decades.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
        Ingen tidsdata tillgänglig
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header with decade filter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">
            {timelineData.agencies.length} myndigheter • {timelineData.minYear}–{timelineData.maxYear}
          </span>
        </div>
        <div className="flex gap-1">
          {timelineData.decades.slice(0, -1).map(decade => (
            <button
              key={decade}
              onClick={() => setSelectedDecade(selectedDecade === decade ? null : decade)}
              className={`px-2 py-1 text-xs rounded transition-all ${
                selectedDecade === decade
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {decade}s
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative">
        {/* Scroll Buttons */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-110 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-110 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Scrollable Timeline */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div
            className="relative pt-8 pb-4"
            style={{ minWidth: `${Math.max(timelineData.decades.length * 150, 800)}px` }}
          >
            {/* Timeline Axis */}
            <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 via-primary-200 to-slate-200 rounded-full" />

            {/* Decade Markers */}
            {timelineData.decades.map((decade, i) => (
              <div
                key={decade}
                className="absolute top-20"
                style={{ left: `${(i / (timelineData.decades.length - 1)) * 100}%` }}
              >
                <div className="flex flex-col items-center transform -translate-x-1/2">
                  <div
                    className={`w-3 h-3 rounded-full border-2 transition-colors ${
                      selectedDecade === decade
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-white border-slate-300'
                    }`}
                  />
                  <span className={`mt-2 text-xs font-mono font-medium transition-colors ${
                    selectedDecade === decade ? 'text-primary-600' : 'text-slate-500'
                  }`}>
                    {decade}
                  </span>
                </div>
              </div>
            ))}

            {/* Agency Items */}
            <div className="relative h-16">
              {timelineData.agencies
                .filter(a => selectedDecade === null || Math.floor(a.year / 10) * 10 === selectedDecade)
                .map((agency, index) => {
                  const position = getPosition(agency.year);
                  const isHovered = hoveredAgency?.n === agency.n;

                  return (
                    <motion.div
                      key={agency.n}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="absolute"
                      style={{
                        left: `${position}%`,
                        top: `${(index % 3) * 20}px`,
                        transform: 'translateX(-50%)'
                      }}
                      onMouseEnter={() => setHoveredAgency(agency)}
                      onMouseLeave={() => setHoveredAgency(null)}
                    >
                      <motion.button
                        onClick={() => onSelect(agency)}
                        whileHover={{ scale: 1.2, zIndex: 10 }}
                        className={`relative group transition-all ${
                          agency.e ? 'opacity-50' : ''
                        }`}
                      >
                        {/* Dot */}
                        <div
                          className={`w-4 h-4 rounded-full border-2 shadow-sm transition-all ${
                            isHovered
                              ? 'bg-primary-500 border-primary-500 scale-125'
                              : agency.e
                                ? 'bg-slate-300 border-slate-400'
                                : 'bg-primary-400 border-primary-500 hover:bg-primary-500'
                          }`}
                        />

                        {/* Tooltip */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.9 }}
                              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 pointer-events-none"
                            >
                              <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl min-w-[200px] max-w-[280px]">
                                <div className="flex items-start gap-2">
                                  <Building2 className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <div className="font-medium text-sm leading-tight">{agency.n}</div>
                                    {agency.sh && (
                                      <div className="text-xs text-slate-400 mt-0.5">{agency.sh}</div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-700 text-xs">
                                  <div className="flex items-center gap-1 text-slate-300">
                                    <Calendar className="w-3 h-3" />
                                    {agency.year}
                                  </div>
                                  {agency.emp && (
                                    <div className="flex items-center gap-1 text-slate-300">
                                      <Users className="w-3 h-3" />
                                      {agency.emp.toLocaleString('sv-SE')}
                                    </div>
                                  )}
                                  {agency.e && (
                                    <span className="px-1.5 py-0.5 bg-red-500/20 text-red-300 rounded text-[10px]">
                                      Nedlagd
                                    </span>
                                  )}
                                </div>
                                {/* Arrow */}
                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-slate-900" />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Gradient Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-400 border-2 border-primary-500" />
          <span>Aktiv myndighet</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-300 border-2 border-slate-400" />
          <span>Nedlagd myndighet</span>
        </div>
      </div>
    </div>
  );
};

export default HorizontalTimeline;
