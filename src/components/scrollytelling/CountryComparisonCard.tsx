import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFlagEmoji } from '@/utils/flags';

interface CountryComparisonCardProps {
  visible: boolean;
  countries: [string, string];
  showBreakdown: boolean;
}

interface CountryData {
  code: string;
  name: string;
  aggregateScore: number;
  build: number;
  break_: number;
  balance: number;
  archetype: string;
  archetypeSubtitle: string;
}

const countryDatabase: Record<string, CountryData> = {
  USA: {
    code: 'USA',
    name: 'United States',
    aggregateScore: 76,
    build: 92,
    break_: 78,
    balance: 42,
    archetype: 'HIGH CAPABILITY',
    archetypeSubtitle: 'WEAK GOVERNANCE',
  },
  DEU: {
    code: 'DEU',
    name: 'Germany',
    aggregateScore: 75,
    build: 68,
    break_: 65,
    balance: 85,
    archetype: 'STRONG GOVERNANCE',
    archetypeSubtitle: 'STEADY CAPABILITY',
  },
};

const BarRow = ({
  label,
  value,
  color,
  delay,
  animate,
}: {
  label: string;
  value: number;
  color: string;
  delay: number;
  animate: boolean;
}) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-white/60 uppercase tracking-wide text-[10px]">{label}</span>
      <span className="text-white/80 font-mono text-[10px]">{value}%</span>
    </div>
    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: animate ? `${value}%` : 0 }}
        transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  </div>
);

const CountryCard = ({
  country,
  showBreakdown,
  side,
  barDelayOffset,
}: {
  country: CountryData;
  showBreakdown: boolean;
  side: 'left' | 'right';
  barDelayOffset: number;
}) => {
  const [showBars, setShowBars] = useState(false);
  const [showArchetype, setShowArchetype] = useState(false);

  useEffect(() => {
    if (showBreakdown) {
      const barTimer = setTimeout(() => setShowBars(true), 300);
      const archetypeTimer = setTimeout(() => setShowArchetype(true), 1800);
      return () => {
        clearTimeout(barTimer);
        clearTimeout(archetypeTimer);
      };
    } else {
      setShowBars(false);
      setShowArchetype(false);
    }
  }, [showBreakdown]);

  return (
    <motion.div
      className="w-[220px] p-4 bg-white/5 rounded-xl border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: side === 'left' ? 0.1 : 0.2, duration: 0.4 }}
    >
      {/* Header */}
      <div className="text-center mb-3">
        <span className="text-3xl mb-1 block">{getFlagEmoji(country.code)}</span>
        <h4 className="text-base font-semibold text-white">{country.name}</h4>
      </div>

      {/* Aggregate Score (fades out when breakdown shows) */}
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
            <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Score</p>
            <p className="text-4xl font-bold text-white">{country.aggregateScore}</p>
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
            {/* Divider line animation */}
            <motion.div
              className="h-px bg-white/20 mb-3"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4 }}
            />

            {/* Bars */}
            <BarRow
              label="Build"
              value={country.build}
              color="linear-gradient(to right, #F59E0B, #FBBF24)"
              delay={barDelayOffset}
              animate={showBars}
            />
            <BarRow
              label="Break"
              value={country.break_}
              color="linear-gradient(to right, #EF4444, #F87171)"
              delay={barDelayOffset + 0.2}
              animate={showBars}
            />
            <BarRow
              label="Balance"
              value={country.balance}
              color="linear-gradient(to right, #10B981, #34D399)"
              delay={barDelayOffset + 0.4}
              animate={showBars}
            />

            {/* Archetype label */}
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
                      color: country.balance > country.build ? '#10B981' : '#F59E0B',
                    }}
                  >
                    {country.archetype}
                  </p>
                  <p className="text-[10px] text-white/50 mt-0.5">{country.archetypeSubtitle}</p>
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
  const [country1, country2] = countries.map((code) => countryDatabase[code]);

  if (!country1 || !country2) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-24 z-30 pointer-events-none flex justify-center"
          style={{
            // Position in the map area (right 60% of screen, after text card)
            left: '40%',
            right: '0',
          }}
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
              {/* Cards container */}
              <div className="flex items-stretch gap-4">
                <CountryCard
                  country={country1}
                  showBreakdown={showBreakdown}
                  side="left"
                  barDelayOffset={0}
                />

                {/* Equals sign (when aggregate) or VS (when breakdown) */}
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
                        =
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

                <CountryCard
                  country={country2}
                  showBreakdown={showBreakdown}
                  side="right"
                  barDelayOffset={0.1}
                />
              </div>

              {/* Bottom caption */}
              <AnimatePresence>
                {!showBreakdown && (
                  <motion.p
                    className="text-center text-white/50 mt-4 text-xs italic"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    "Nearly identical scores"
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
