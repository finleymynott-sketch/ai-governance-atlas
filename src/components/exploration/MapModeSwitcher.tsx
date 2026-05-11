import { motion, AnimatePresence } from 'framer-motion';
import { useAtlasStore } from '@/store/useAtlasStore';
import type { MapMode } from '@/types';
import { MAP_MODE_CONFIG } from '@/types';

/**
 * The dissertation surfaces three groups of map views:
 *   - The four pillar/composite headlines (Hazard, Break, Balance, Risk).
 *   - Sub-channels for Build and Break when the user wants to look inside.
 *   - Diagnostic/typological views (Bivariate, Clusters, Sovereignty).
 *
 * This switcher exposes all of them. Sub-channels appear conditionally based on
 * which primary mode is active, so the sidebar stays uncluttered.
 */

const PRIMARY_MODES: MapMode[] = ['hazard', 'break-displacement', 'balance', 'risk'];
const ADVANCED_MODES: MapMode[] = ['bivariate', 'clusters', 'sovereignty'];

const BUILD_SUBMODES: MapMode[] = ['hazard', 'build-supply', 'build-access'];
const BREAK_SUBMODES: MapMode[] = ['break-displacement', 'break-shortage'];

interface ModeButtonProps {
  mode: MapMode;
  isActive: boolean;
  onSelect: () => void;
  size?: 'md' | 'sm';
}

const ModeButton = ({ mode, isActive, onSelect, size = 'md' }: ModeButtonProps) => {
  const config = MAP_MODE_CONFIG[mode];
  const label = size === 'sm' ? config.shortLabel : config.label;

  return (
    <motion.button
      onClick={onSelect}
      className={`
        relative w-full flex items-center gap-3 rounded-lg
        text-left cursor-pointer
        transition-colors duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary
        ${size === 'md' ? 'px-3 py-2.5' : 'px-2.5 py-1.5'}
        ${
          isActive
            ? 'text-text-primary'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
        }
      `}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className={`${size === 'md' ? 'w-3 h-3' : 'w-2 h-2'} rounded-full shrink-0`}
        style={{ backgroundColor: config.color }}
        animate={{
          scale: isActive ? 1.2 : 1,
          boxShadow: isActive ? `0 0 12px ${config.color}` : '0 0 0px transparent',
        }}
        transition={{ duration: 0.2 }}
      />

      <span
        className={`
          flex-1 font-medium transition-colors duration-200
          ${size === 'md' ? 'text-sm' : 'text-xs'}
          ${isActive ? 'text-text-primary' : 'text-text-secondary'}
        `}
      >
        {label}
      </span>

      <AnimatePresence>
        {isActive && (
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-accent-primary"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>

      {isActive && size === 'md' && (
        <motion.div
          layoutId="mapModeActiveBackground"
          className="absolute inset-0 rounded-lg -z-10"
          style={{
            backgroundColor: `color-mix(in srgb, ${config.color} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${config.color} 25%, transparent)`,
          }}
          transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
        />
      )}
    </motion.button>
  );
};

export const MapModeSwitcher = () => {
  const mapMode = useAtlasStore((state) => state.mapMode);
  const setMapMode = useAtlasStore((state) => state.setMapMode);

  const showBuildSubmodes =
    mapMode === 'hazard' || mapMode === 'build-supply' || mapMode === 'build-access';
  const showBreakSubmodes = mapMode === 'break-displacement' || mapMode === 'break-shortage';

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h3 className="section-header">Colour by pillar</h3>
        <div className="space-y-1">
          {PRIMARY_MODES.map((mode) => (
            <ModeButton
              key={mode}
              mode={mode}
              isActive={mapMode === mode}
              onSelect={() => setMapMode(mode)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showBuildSubmodes && (
          <motion.div
            key="build-sub"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1.5 overflow-hidden"
          >
            <h4 className="text-[10px] uppercase tracking-wider text-text-tertiary px-1">
              Build channel
            </h4>
            <div className="space-y-0.5">
              {BUILD_SUBMODES.map((mode) => (
                <ModeButton
                  key={mode}
                  mode={mode}
                  isActive={mapMode === mode}
                  onSelect={() => setMapMode(mode)}
                  size="sm"
                />
              ))}
            </div>
          </motion.div>
        )}

        {showBreakSubmodes && (
          <motion.div
            key="break-sub"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1.5 overflow-hidden"
          >
            <h4 className="text-[10px] uppercase tracking-wider text-text-tertiary px-1">
              Break decomposition
            </h4>
            <div className="space-y-0.5">
              {BREAK_SUBMODES.map((mode) => (
                <ModeButton
                  key={mode}
                  mode={mode}
                  isActive={mapMode === mode}
                  onSelect={() => setMapMode(mode)}
                  size="sm"
                />
              ))}
            </div>
            <p className="text-[10px] text-text-tertiary leading-relaxed px-1">
              Same exposure scored through demographic structure. Displacement enters the risk formula;
              shortage is a companion indicator.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <h3 className="section-header">Diagnostic views</h3>
        <div className="space-y-1">
          {ADVANCED_MODES.map((mode) => (
            <ModeButton
              key={mode}
              mode={mode}
              isActive={mapMode === mode}
              onSelect={() => setMapMode(mode)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
