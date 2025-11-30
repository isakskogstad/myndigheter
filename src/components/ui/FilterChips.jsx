import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Archive, Search, FilterX } from 'lucide-react';

/**
 * FilterChips Component
 * Displays active filters as removable chips
 *
 * @param {Object} props
 * @param {string} props.searchQuery - Current search query
 * @param {string} props.deptFilter - Current department filter
 * @param {string} props.statusFilter - Current status filter ('active' | 'dissolved' | 'all')
 * @param {function} props.onClearSearch - Clear search callback
 * @param {function} props.onClearDept - Clear department filter callback
 * @param {function} props.onClearStatus - Clear status filter callback (reset to 'active')
 * @param {function} props.onClearAll - Clear all filters callback
 */
const FilterChips = ({
  searchQuery,
  deptFilter,
  statusFilter,
  onClearSearch,
  onClearDept,
  onClearStatus,
  onClearAll
}) => {
  const hasSearch = searchQuery && searchQuery.trim().length > 0;
  const hasDept = deptFilter && deptFilter !== 'all';
  const hasStatusChange = statusFilter !== 'active';

  const hasAnyFilter = hasSearch || hasDept || hasStatusChange;

  if (!hasAnyFilter) return null;

  const chipVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 }
  };

  const getShortDeptName = (dept) => {
    if (!dept) return '';
    return dept.replace('departementet', '').trim();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2 py-3 px-4 bg-slate-50/80 rounded-lg border border-slate-200/50"
    >
      <span className="text-xs text-slate-500 font-medium mr-1">Filter:</span>

      <AnimatePresence mode="popLayout">
        {/* Search Chip */}
        {hasSearch && (
          <motion.button
            key="search"
            variants={chipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
            onClick={onClearSearch}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium hover:bg-primary-200 transition-colors group"
          >
            <Search className="w-3 h-3" />
            <span className="max-w-[100px] truncate">"{searchQuery}"</span>
            <X className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        )}

        {/* Department Chip */}
        {hasDept && (
          <motion.button
            key="dept"
            variants={chipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
            onClick={onClearDept}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium hover:bg-amber-200 transition-colors group"
          >
            <Building2 className="w-3 h-3" />
            <span>{getShortDeptName(deptFilter)}</span>
            <X className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        )}

        {/* Status Chip */}
        {hasStatusChange && (
          <motion.button
            key="status"
            variants={chipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
            onClick={onClearStatus}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors group ${
              statusFilter === 'dissolved'
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <Archive className="w-3 h-3" />
            <span>{statusFilter === 'dissolved' ? 'Endast nedlagda' : 'Alla status'}</span>
            <X className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Clear All */}
      {(hasSearch || hasDept || hasStatusChange) && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClearAll}
          className="ml-2 inline-flex items-center gap-1 px-2 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md text-xs font-medium transition-colors"
        >
          <FilterX className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Rensa alla</span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default FilterChips;
