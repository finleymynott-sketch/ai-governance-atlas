import { motion } from 'framer-motion';
import type { GeoProjection } from 'd3-geo';
import type { Country, MapMode } from '@/types';
import { MISSING_POLYGON_UNITS } from '@/types/geo';
import { getRampForMode } from '@/utils/pillarScales';
import { getClusterColor, bivariateColor } from '@/utils/scales';
import { valueForMode } from '@/utils/dataLoader';
import { scaleQuantize } from 'd3-scale';

interface MissingPolygonMarkersProps {
  projection: GeoProjection;
  countries: Map<string, Country>;
  mode: MapMode;
  isDark: boolean;
  bivariateBreaks: { hazard: [number, number]; displacement: [number, number] };
  selectedId?: string | null;
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
  /** Override fill colour (used by CompareMap to encode selected vs dimmed). */
  overrideFill?: (country: Country) => string | null;
  /** Show a numbered comparison badge instead of the ISO label. */
  compareBadge?: (id: string) => { color: string; index: number } | null;
}

const domainForMode = (mode: MapMode): [number, number] =>
  mode === 'sovereignty' ? [0.5, 1] : [0, 1];

const fillFor = (
  country: Country,
  mode: MapMode,
  isDark: boolean,
  bivariateBreaks: { hazard: [number, number]; displacement: [number, number] }
): string => {
  if (mode === 'clusters') return getClusterColor(country.cluster.id);
  if (mode === 'bivariate') {
    return bivariateColor(country.build.hazard, country.break.displacement, bivariateBreaks);
  }
  const ramp = [...getRampForMode(mode, isDark)];
  const value = valueForMode(country, mode as Exclude<MapMode, 'bivariate' | 'clusters'>);
  return scaleQuantize<string>().domain(domainForMode(mode)).range(ramp)(value);
};

/**
 * Overlay markers for sample units that have no polygon in the world-110m
 * TopoJSON. The two cases in this dataset: EU (supranational, no territory of
 * its own to outline) and Singapore (too small for 110m simplification).
 *
 * Rendered after the country paths so they sit on top of the choropleth.
 */
export const MissingPolygonMarkers = ({
  projection,
  countries,
  mode,
  isDark,
  bivariateBreaks,
  selectedId,
  hoveredId,
  onHover,
  onClick,
  overrideFill,
  compareBadge,
}: MissingPolygonMarkersProps) => (
  <g className="missing-polygon-markers" data-no-advance>
    {MISSING_POLYGON_UNITS.map(({ id, centroid }) => {
      const country = countries.get(id);
      if (!country) return null;
      const point = projection(centroid);
      if (!point) return null;

      const [cx, cy] = point;
      const isSelected = selectedId === id;
      const isHovered = hoveredId === id;
      const compare = compareBadge?.(id) ?? null;
      const fill = overrideFill?.(country) ?? fillFor(country, mode, isDark, bivariateBreaks);

      const stroke = isSelected
        ? 'rgba(255, 255, 255, 0.95)'
        : isHovered
          ? isDark
            ? '#A3A3A3'
            : '#525252'
          : isDark
            ? '#525252'
            : '#737373';

      return (
        <g
          key={id}
          transform={`translate(${cx}, ${cy})`}
          style={{ cursor: onClick ? 'pointer' : 'default' }}
          onMouseEnter={() => onHover?.(id)}
          onMouseLeave={() => onHover?.(null)}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(id);
          }}
        >
          {compare && (
            <motion.circle
              r={14}
              fill="none"
              stroke={compare.color}
              strokeWidth={2.5}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          <motion.circle
            r={isSelected ? 9 : 7}
            fill={fill}
            stroke={stroke}
            strokeWidth={isSelected ? 2 : 1}
            animate={{
              boxShadow: isSelected ? `0 0 12px ${fill}` : '0 0 0px transparent',
            }}
          />
          {compare && (
            <text
              y={4}
              textAnchor="middle"
              className="select-none pointer-events-none"
              style={{ fill: '#fff', fontSize: 10, fontWeight: 700 }}
            >
              {compare.index + 1}
            </text>
          )}
          {!compare && (
            <text
              x={11}
              y={4}
              className="select-none pointer-events-none"
              style={{
                fill: isDark ? '#E5E5E5' : '#171717',
                fontSize: 10,
                fontWeight: 600,
                textShadow: isDark
                  ? '0 0 4px rgba(0,0,0,0.7)'
                  : '0 0 4px rgba(255,255,255,0.85)',
              }}
            >
              {id}
            </text>
          )}
        </g>
      );
    })}
  </g>
);
