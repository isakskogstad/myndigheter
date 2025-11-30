import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Calendar, MapPin, ExternalLink, Check } from 'lucide-react';
import { deptColors } from '../../data/constants';
import Sparkline from './Sparkline';

/**
 * MobileAgencyCard Component
 * Card-based layout for agencies on mobile devices
 *
 * @param {Object} props
 * @param {Object} props.agency - Agency data object
 * @param {function} props.onSelect - Callback when card is tapped
 * @param {function} props.onToggleCompare - Callback to toggle compare
 * @param {boolean} props.isSelected - Whether agency is in compare list
 * @param {number} props.index - Card index for staggered animation
 */
const MobileAgencyCard = ({ agency, onSelect, onToggleCompare, isSelected, index = 0 }) => {
  const deptColor = deptColors[agency.d] || '#64748b';
  const shortDept = agency.d?.replace('departementet', '').trim() || 'Okänt';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
        isSelected ? 'ring-2 ring-primary-500 border-primary-200' : 'border-slate-200'
      }`}
    >
      {/* Header with department color */}
      <div
        className="h-1.5"
        style={{ backgroundColor: deptColor }}
      />

      <div className="p-4">
        {/* Top Row: Name + Compare Button */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <button
            onClick={() => onSelect(agency)}
            className="flex-1 text-left"
          >
            <h3 className="font-semibold text-slate-900 text-base leading-tight">
              {agency.n}
            </h3>
            {agency.sh && (
              <span className="text-xs text-slate-400 font-mono">{agency.sh}</span>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(agency);
            }}
            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
          >
            <Check className="w-4 h-4" strokeWidth={isSelected ? 3 : 2} />
          </button>
        </div>

        {/* Department Badge */}
        <div className="mb-3">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
            style={{
              backgroundColor: `${deptColor}15`,
              color: deptColor,
              border: `1px solid ${deptColor}30`
            }}
          >
            {shortDept}
          </span>
          {agency.e && (
            <span className="ml-2 px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-xs font-medium">
              Nedlagd
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {/* Employees */}
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <Users className="w-4 h-4 text-slate-400 mx-auto mb-1" />
            <div className="text-sm font-semibold text-slate-900 font-mono">
              {agency.emp ? agency.emp.toLocaleString('sv-SE') : '–'}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">Anställda</div>
          </div>

          {/* Year */}
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <Calendar className="w-4 h-4 text-slate-400 mx-auto mb-1" />
            <div className="text-sm font-semibold text-slate-900 font-mono">
              {agency.s ? agency.s.split('-')[0] : '–'}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">Bildad</div>
          </div>

          {/* City */}
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <MapPin className="w-4 h-4 text-slate-400 mx-auto mb-1" />
            <div className="text-sm font-semibold text-slate-900 truncate max-w-full">
              {agency.city || '–'}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">Stad</div>
          </div>
        </div>

        {/* Sparkline + Structure Row */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {/* Sparkline */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase">Trend</span>
            <Sparkline
              data={agency.empH}
              width={60}
              height={20}
              color="#0ea5e9"
            />
          </div>

          {/* Structure Badge */}
          {agency.str && (
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
              {agency.str}
            </span>
          )}
        </div>

        {/* View Details Button */}
        <button
          onClick={() => onSelect(agency)}
          className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <Building2 className="w-4 h-4" />
          Visa detaljer
        </button>
      </div>
    </motion.div>
  );
};

/**
 * MobileAgencyCardList Component
 * Container for mobile agency cards with lazy loading
 */
export const MobileAgencyCardList = ({
  agencies,
  onSelectAgency,
  onToggleCompare,
  compareList,
  displayLimit = 20
}) => {
  const [visibleCount, setVisibleCount] = React.useState(displayLimit);

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 20, agencies.length));
  };

  const displayAgencies = agencies.slice(0, visibleCount);
  const hasMore = visibleCount < agencies.length;

  return (
    <div className="space-y-4">
      {displayAgencies.map((agency, index) => (
        <MobileAgencyCard
          key={agency.n}
          agency={agency}
          onSelect={onSelectAgency}
          onToggleCompare={onToggleCompare}
          isSelected={compareList.some(a => a.n === agency.n)}
          index={index % displayLimit}
        />
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          className="w-full py-3 text-center text-sm font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
        >
          Visa fler ({agencies.length - visibleCount} kvar)
        </button>
      )}
    </div>
  );
};

export default MobileAgencyCard;
