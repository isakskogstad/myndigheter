import React, { useMemo } from 'react';

/**
 * Sparkline Component
 * A minimal inline chart showing trends in data
 *
 * @param {Object} props
 * @param {Object} props.data - Object with year keys and numeric values { "2020": 100, "2021": 105 }
 * @param {number} props.width - SVG width (default: 80)
 * @param {number} props.height - SVG height (default: 24)
 * @param {string} props.color - Line/fill color (default: primary-500)
 * @param {boolean} props.showDot - Show dot at last data point (default: true)
 * @param {boolean} props.filled - Show area fill under line (default: true)
 */
const Sparkline = ({
  data,
  width = 80,
  height = 24,
  color = '#0ea5e9',
  showDot = true,
  filled = true
}) => {
  const { points, lastPoint, trend } = useMemo(() => {
    if (!data || typeof data !== 'object') {
      return { points: '', lastPoint: null, trend: 0 };
    }

    // Sort years and get values
    const sortedYears = Object.keys(data).sort();
    if (sortedYears.length < 2) {
      return { points: '', lastPoint: null, trend: 0 };
    }

    const values = sortedYears.map(year => data[year]).filter(v => v !== null && v !== undefined);
    if (values.length < 2) {
      return { points: '', lastPoint: null, trend: 0 };
    }

    // Calculate min/max for scaling
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    // Padding for the chart
    const padding = 4;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Generate points
    const pointsArray = values.map((val, i) => {
      const x = padding + (i / (values.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((val - min) / range) * chartHeight;
      return { x, y, val };
    });

    // Create SVG path
    const linePath = pointsArray.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

    // Area path (for fill)
    const areaPath = `${linePath} L${pointsArray[pointsArray.length - 1].x},${height - padding} L${padding},${height - padding} Z`;

    // Calculate trend (percentage change)
    const firstVal = values[0];
    const lastVal = values[values.length - 1];
    const trendPercent = firstVal > 0 ? ((lastVal - firstVal) / firstVal) * 100 : 0;

    return {
      points: linePath,
      areaPath,
      lastPoint: pointsArray[pointsArray.length - 1],
      trend: trendPercent
    };
  }, [data, width, height]);

  if (!points) {
    return (
      <div
        className="flex items-center justify-center text-slate-300"
        style={{ width, height }}
      >
        <span className="text-[10px]">–</span>
      </div>
    );
  }

  // Determine trend color
  const trendColor = trend > 5 ? '#22c55e' : trend < -5 ? '#ef4444' : color;

  return (
    <svg
      width={width}
      height={height}
      className="inline-block"
      style={{ overflow: 'visible' }}
    >
      {/* Area fill */}
      {filled && (
        <path
          d={`${points} L${lastPoint.x},${height - 4} L4,${height - 4} Z`}
          fill={trendColor}
          fillOpacity={0.1}
        />
      )}

      {/* Line */}
      <path
        d={points}
        fill="none"
        stroke={trendColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* End dot */}
      {showDot && lastPoint && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={2.5}
          fill={trendColor}
        />
      )}
    </svg>
  );
};

export default Sparkline;
