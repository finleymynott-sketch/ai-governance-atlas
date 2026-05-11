import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFlagEmoji } from '@/utils/flags';
import { useAtlasStore } from '@/store/useAtlasStore';
import type { Country } from '@/types';

interface CountryComparisonCardProps {
  visible: boolean;
  /** ISO3 ids of the two countries to compare. Defaults to USA / JPN — the
      dissertation's headline demographic-paradox pair. */
  countries: [string, string];
  showBreakdown: boolean;
}

interface CountryView {
  country: Country;
  hazard: number;
  displacement: number;
  balance: number;
  exposureRaw: number;
  oadrRaw: number;
  risk: number;
  rank: number;
  archetype: string;
  archetypeSubtitle: string;
}

const buildView = (c: Country): CountryView => {
  const archetype =
    c.flags.zeroRiskPathway === 'aging'
      ? 'AGING ABSORPTION'
      : c.flags.zeroRiskPathway === 'no-infra'
        ? 'NO INFRASTRUCTURE'
        : c.risk.total > 0.4
          ? 'GOVERNANCE GAP'
          : c.risk.total > 0.15
            ? 'MODERATE RISK'
            : c.risk.total > 0
              ? 'CAPABILITY ABSORBED'
              : 'RISK = 0';
  const subtitle =
    c.flags.zeroRiskPathway === 'aging'
      ? 'Exposure → shortage filling'
      : c.flags.zeroRiskPathway === 'no-infra'
        ? 'No AI infrastructure yet'
        : c.risk.total > 0.4
          ? 'Capability outpaces governance'
          : c.risk.total > 0.15
            ? 'Capability moderated'
            : 'Demographics + governance hold';
  return {
    country: c,
    hazard: c.build.hazard,
    displacement: c.break.displacement,
    balance: c.balance.raw,
    exposureRaw: c.break.indicators.exposureRaw,
    oadrRaw: c.break.indicators.oadrRaw,
    risk: c.risk.total,
    rank: c.risk.rank,
    archetype,
    archetypeSubtitle: subtitle,
  };
};

const BarRow = ({
  label,
  value,
  color,
  delay,
  animate,
  display,
}: {
  label: string;
  value: number;
  color: string;
  delay: number;
  animate: boolean;
  display?: string;
}) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-white/60 uppercase tracking-wide text-[10px]">{label}</span>
      <span className="text-white/80 font-mono text-[10px]">{display ?? Math.round(value * 100)}</span>
    </div>
    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: animate ? `${Math.min(100, value * 100)}%` : 0 }}
        transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  </div>
);

const CountryCard = ({
  view,
  showBreakdown,
  side,
  barDelayOffset,
}: {
  view: CountryView;
  showBreakdown: boolean;
  side: 'left' | 'right';
  barDelayOffset: number;
}) => {
  const [showBars, setShowBars] = useState(false);
  const [showArchetype, setShowArchetype] = useState(false);

  useEffect(() => {
    if (showBreakdown) {
      const t1 = setTimeout(() => setShowBars(true), 300);
      const t2 = setTimeout(() => setShowArchetype(true), 1800);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    setShowBars(false);
    setShowArchetype(false);
    return;
  }, [showBreakdown]);

  return (
    <motion.div
      className="w-[230px] p-4 bg-white/5 rounded-xl border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: side === 'left' ? 0.1 : 0.2, duration: 0.4 }}
    >
      <div className="text-center mb-3">
        <span className="text-3xl mb-1 block">{getFlagEmoji(view.country.id)}</span>
        <h4 className="text-base font-semibold text-white">{view.country.name}</h4>
      </div>

      <AnimatePresence mode="wait">
        {!showBreakdown && (
          <motion.div
            key="aggregate"
            className="text-center py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Task exposure</p>
            <p className="text-4xl font-bold text-white tabular-nums">
              {view.exposureRaw.toFixed(2)}
            </p>
            <p className="text-[10px] text-white/40 mt-2">
              Hazard {(view.hazard * 100).toFixed(0)}
            </p>
          </motion.div>
        )}

        {showBreakdown && (
          <motion.div
            key="breakdown"
            className="space-y-3 py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <motion.div
              className="h-px bg-white/20 mb-3"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4 }}
            />

            <BarRow
              label="Hazard (Build)"
              value={view.hazard}
              color="linear-gradient(to right, #F59E0B, #FBBF24)"
              delay={barDelayOffset}
              animate={showBars}
            />
            <BarRow
              label="Displacement"
              value={view.displacement}
              color="linear-gradient(to right, #EF4444, #F87171)"
              delay={barDelayOffset + 0.2}
              animate={showBars}
            />
            <BarRow
              label="Balance"
              value={view.balance}
              color="linear-gradient(to right, #10B981, #34D399)"
              delay={barDelayOffset + 0.4}
              animate={showBars}
            />
            <BarRow
              label="OADR (workforce age)"
              value={view.oadrRaw / 60}
              color="linear-gradient(to right, #6366F1, #818CF8)"
              delay={barDelayOffset + 0.6}
              animate={showBars}
              display={view.oadrRaw.toFixed(1)}
            />

            <AnimatePresence>
              {showArchetype && (
                <motion.div
                  className="pt-3 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <p
                    className="text-xs font-bold tracking-wider"
                    style={{
                      color: view.risk > 0.3 ? '#EF4444' : view.risk > 0 ? '#F59E0B' : '#10B981',
                    }}
                  >
                    {view.archetype}
                  </p>
                  <p className="text-[10px] text-white/50 mt-0.5">{view.archetypeSubtitle}</p>
                  <p className="text-[10px] text-white/40 mt-1 font-mono">
                    Risk {(view.risk * 100).toFixed(1)} · rank {view.rank || '—'}/48
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const CountryComparisonCard = ({
  visible,
  countries,
  showBreakdown,
}: CountryComparisonCardProps) => {
  const storeCountries = useAtlasStore((state) => state.countries);
  const c1 = storeCountries.find((c) => c.id === countries[0]);
  const c2 = storeCountries.find((c) => c.id === countries[1]);

  if (!visible || !c1 || !c2) return null;

  const view1 = buildView(c1);
  const view2 = buildView(c2);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-24 z-30 pointer-events-none flex justify-center"
          style={{ left: '40%', right: '0' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="pointer-events-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-2xl">
              <div className="flex items-stretch gap-4">
                <CountryCard view={view1} showBreakdown={showBreakdown} side="left" barDelayOffset={0} />

                <div className="flex items-center justify-center px-2">
                  <AnimatePresence mode="wait">
                    {!showBreakdown ? (
                      <motion.span
                        key="equals"
                        className="text-3xl text-white/40 font-light"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        ≈
                      </motion.span>
                    ) : (
                      <motion.span
                        key="vs"
                        className="text-sm text-white/30 font-semibold tracking-wider"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        VS
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <CountryCard view={view2} showBreakdown={showBreakdown} side="right" barDelayOffset={0.1} />
              </div>

              <AnimatePresence>
                {!showBreakdown && (
                  <motion.p
                    className="text-center text-white/50 mt-4 text-xs italic"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    Nearly identical task exposure
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CountryComparisonCard;
