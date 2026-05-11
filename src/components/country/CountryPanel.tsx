import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, GitCompare, AlertTriangle, Sparkles } from 'lucide-react';
import { useAtlasStore, useSelectedCountry } from '@/store/useAtlasStore';
import type { BalanceDimension, Country } from '@/types';
import { CLUSTER_DEFINITIONS, PILLAR_CONFIG } from '@/types';
import { getFlagEmoji } from '@/utils/flags';

const panelVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { type: 'spring', damping: 30, stiffness: 300, staggerChildren: 0.04, delayChildren: 0.08 },
  },
  exit: { x: '100%', transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0, 0, 0.2, 1] } },
};

const ordinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'] as const;
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
};

const fmt = (n: number, digits = 0): string => (n * 100).toFixed(digits);

// === Sub-components ===

const StatBar = ({
  label,
  value,
  color,
  hint,
}: {
  label: string;
  value: number;
  color: string;
  hint?: string;
}) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="text-xs font-mono tabular-nums text-text-primary">
        {fmt(value, 1)}
      </span>
    </div>
    <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}50` }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.15 }}
      />
    </div>
    {hint && <p className="text-[10px] text-text-tertiary mt-1 leading-snug">{hint}</p>}
  </div>
);

const PillarCard = ({
  title,
  conceptLabel,
  color,
  children,
}: {
  title: string;
  conceptLabel: string;
  color: string;
  children: React.ReactNode;
}) => (
  <motion.section
    variants={itemVariants}
    className="rounded-xl bg-bg-primary/50 border border-border-subtle/50 p-4 space-y-3"
  >
    <div className="flex items-baseline justify-between">
      <div className="flex items-center gap-2">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}50` }}
        />
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-text-tertiary">
        {conceptLabel}
      </span>
    </div>
    {children}
  </motion.section>
);

// === Section renderers ===

const RiskCallout = ({ country }: { country: Country }) => {
  const r = country.risk;
  const riskColor = PILLAR_CONFIG.risk.color;

  let pathwayBadge: React.ReactNode = null;
  if (country.flags.zeroRiskPathway === 'aging') {
    pathwayBadge = (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
        style={{ backgroundColor: 'rgba(250, 204, 21, 0.15)', color: '#FACC15', border: '1px solid rgba(250, 204, 21, 0.3)' }}
        title="Risk = 0 via demographic absorption (Appendix F: yellow highlighting)"
      >
        <Sparkles className="w-3 h-3" />
        Aging-buffer zero
      </span>
    );
  } else if (country.flags.zeroRiskPathway === 'no-infra') {
    pathwayBadge = (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
        style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', border: '1px solid rgba(34, 197, 94, 0.3)' }}
        title="Risk = 0 from minimum raw exposure (Appendix F: green highlighting)"
      >
        <Sparkles className="w-3 h-3" />
        No-infrastructure zero
      </span>
    );
  }

  return (
    <motion.section variants={itemVariants} className="rounded-xl bg-bg-tertiary border border-border-subtle p-4 space-y-2">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: riskColor, boxShadow: `0 0 10px ${riskColor}` }} />
          <h3 className="text-sm font-semibold text-text-primary">Net Displacement Risk</h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-text-tertiary">Headline</span>
      </div>

      <div className="flex items-end gap-3">
        <span className="text-3xl font-bold tabular-nums" style={{ color: riskColor }}>
          {fmt(r.total, 1)}
        </span>
        <span className="text-sm text-text-secondary mb-1">
          rank {country.risk.rank > 0 ? ordinal(country.risk.rank) : '—'} of 48
        </span>
      </div>

      <div className="pt-2 space-y-2">
        <StatBar label="Risk · supply channel" value={r.supply} color={riskColor} />
        <StatBar label="Risk · access channel" value={r.access} color={riskColor} />
        <p className="text-[10px] text-text-tertiary leading-relaxed">
          Risk = 1 − (1 − R<sub>supply</sub>)(1 − R<sub>access</sub>). Channels combined via probabilistic union.
          Map colour uses cube-rooted risk for legibility.
        </p>
      </div>

      {pathwayBadge && <div className="pt-1">{pathwayBadge}</div>}

      {country.flags.kafalaCaveat && (
        <div className="mt-2 pt-3 border-t border-border-subtle">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
            <p className="text-[11px] text-text-secondary leading-relaxed">
              <span className="font-medium text-text-primary">Kafala caveat. </span>
              OADR may not reflect labour scarcity under kafala-sponsorship regimes. This country's
              headline ranking rests on a proxy whose theoretical validity is weakest here
              (see Methodology · Limitations).
            </p>
          </div>
        </div>
      )}
    </motion.section>
  );
};

const ClusterBadge = ({ country }: { country: Country }) => {
  const cluster = CLUSTER_DEFINITIONS.find((c) => c.id === country.cluster.id);
  if (!cluster) return null;

  return (
    <motion.section
      variants={itemVariants}
      className="rounded-xl bg-bg-primary/50 border border-border-subtle/50 p-4 space-y-2"
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Cluster assignment</h3>
        <span className="text-[10px] uppercase tracking-wider text-text-tertiary">Typology</span>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{
            backgroundColor: `color-mix(in srgb, ${cluster.color} 20%, transparent)`,
            color: cluster.color,
            border: `1px solid color-mix(in srgb, ${cluster.color} 40%, transparent)`,
          }}
        >
          {cluster.id}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-text-primary truncate">{cluster.label}</div>
          <div className="text-[11px] text-text-tertiary">
            Medoid: {cluster.medoidId} · {cluster.memberCount} members
            {country.cluster.isMedoid && <span className="ml-1 text-accent-primary">· this country is the medoid</span>}
          </div>
        </div>
      </div>

      <div className="pt-1">
        <div className="flex items-center justify-between text-[10px] text-text-tertiary mb-1">
          <span>Bootstrap stability</span>
          <span className="font-mono">{(country.cluster.stability * 100).toFixed(0)}%</span>
        </div>
        <div className="h-1 bg-black/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: country.cluster.unstable ? '#F59E0B' : cluster.color }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, Math.min(1, country.cluster.stability)) * 100}%` }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
        </div>
        {country.cluster.unstable && (
          <p className="text-[10px] text-amber-400 mt-1 leading-snug">
            Below 0.70 threshold — cluster membership is sensitive to sample composition.
          </p>
        )}
      </div>
    </motion.section>
  );
};

const BuildCard = ({ country }: { country: Country }) => {
  const b = country.build;
  const color = PILLAR_CONFIG.build.color;
  return (
    <PillarCard title="Build" conceptLabel="Hazard" color={color}>
      <div className="flex items-end gap-3">
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>
          {fmt(b.hazard, 0)}
        </span>
        <span className="text-xs text-text-secondary mb-1">Hazard composite</span>
      </div>
      <div className="space-y-2 pt-1">
        <StatBar label="Build · supply channel" value={b.supply} color={color} hint="Cloud regions, colocation density, grid reliability" />
        <StatBar label="Build · access channel" value={b.access} color={color} hint="Internet penetration, bandwidth per user" />
      </div>
      <details className="group">
        <summary className="cursor-pointer text-[11px] text-text-tertiary hover:text-text-secondary py-1">
          Raw indicators ▾
        </summary>
        <div className="space-y-1 pl-2 pt-1">
          <RawIndicator label="Cloud regions (total)" value={b.indicators.cloudRegionsTotal} />
          <RawIndicator label="Cloud regions (domestic)" value={b.indicators.cloudRegionsDomestic} />
          <RawIndicator label="Colocation per million" value={b.indicators.colocationPerMillion} digits={1} />
          <RawIndicator label="Grid reliability (%)" value={b.indicators.gridReliability} digits={1} />
          <RawIndicator label="Internet penetration (%)" value={b.indicators.internetPenetration} digits={1} />
          <RawIndicator label="Bandwidth/user (Mbps)" value={b.indicators.bandwidthPerUser} digits={1} />
        </div>
      </details>
    </PillarCard>
  );
};

const BreakCard = ({ country }: { country: Country }) => {
  const br = country.break;
  const color = PILLAR_CONFIG.break.color;
  const isAgingBuffer = country.flags.zeroRiskPathway === 'aging';
  return (
    <PillarCard title="Break" conceptLabel="Exposure" color={color}>
      <div className="flex items-end gap-3">
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>
          {fmt(br.displacement, 0)}
        </span>
        <span className="text-xs text-text-secondary mb-1">Displacement (enters risk)</span>
      </div>
      <div className="space-y-2 pt-1">
        <StatBar label="Displacement" value={br.displacement} color={color} hint="Exposure × (1 − OADR_norm). Young workforce → crisis." />
        <StatBar
          label="Shortage (companion)"
          value={br.shortage}
          color="#F87171"
          hint="Exposure × OADR_norm. Aging workforce → AI fills gaps."
        />
      </div>
      {isAgingBuffer && (
        <p className="text-[11px] text-text-tertiary leading-relaxed bg-amber-500/5 border border-amber-500/20 rounded p-2">
          Demographic absorption: this country's high task exposure resolves as shortage filling rather
          than worker displacement. Same exposure, opposite governance challenge.
        </p>
      )}
      <details className="group">
        <summary className="cursor-pointer text-[11px] text-text-tertiary hover:text-text-secondary py-1">
          Raw indicators ▾
        </summary>
        <div className="space-y-1 pl-2 pt-1">
          <RawIndicator label="Task exposure (raw)" value={br.indicators.exposureRaw} digits={3} />
          <RawIndicator label="Old-age dependency ratio" value={br.indicators.oadrRaw} digits={1} />
        </div>
      </details>
    </PillarCard>
  );
};

const BalanceCard = ({ country }: { country: Country }) => {
  const bl = country.balance;
  const color = PILLAR_CONFIG.balance.color;

  const scoredDims = bl.dimensions.filter((d) => d.deJure !== null || d.deFacto !== null);
  const hasDims = scoredDims.length > 0;

  // Identify weakest / strongest by mean(de_jure, de_facto)
  const dimWithScore = scoredDims.map((d) => {
    const dj = d.deJure ?? 0;
    const df = d.deFacto ?? 0;
    return { dim: d, score: (dj + df) / 2 };
  });
  const weakest = dimWithScore.length ? dimWithScore.reduce((a, b) => (a.score <= b.score ? a : b)) : null;
  const strongest = dimWithScore.length ? dimWithScore.reduce((a, b) => (a.score >= b.score ? a : b)) : null;

  return (
    <PillarCard title="Balance" conceptLabel="Resilience" color={color}>
      <div className="flex items-end gap-3">
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>
          {fmt(bl.raw, 0)}
        </span>
        <span className="text-xs text-text-secondary mb-1">balance_raw</span>
      </div>

      {bl.sovereignty < 1 && (
        <p className="text-[11px] text-text-tertiary leading-relaxed">
          Sovereignty discount S = {bl.sovereignty.toFixed(2)} applied to the supply channel: governance
          reach over foreign-hosted cloud is halved.
        </p>
      )}

      <div className="space-y-2 pt-1">
        <StatBar label="Balance · supply (× sovereignty)" value={bl.supply} color={color} />
        <StatBar label="Balance · access" value={bl.access} color={color} />
      </div>

      {hasDims ? (
        <div className="space-y-2 pt-2 border-t border-border-subtle">
          <h4 className="text-[10px] uppercase tracking-wider text-text-tertiary">
            Five governance sub-pillars
          </h4>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-text-tertiary">
                <th className="text-left font-normal pb-1">Dimension</th>
                <th className="text-right font-normal pb-1 w-12">de jure</th>
                <th className="text-right font-normal pb-1 w-12">de facto</th>
                <th className="text-right font-normal pb-1 w-10">gap</th>
              </tr>
            </thead>
            <tbody>
              {bl.dimensions.map((d) => (
                <DimensionRow key={d.id} dim={d} />
              ))}
            </tbody>
          </table>
          {weakest && strongest && weakest.dim.id !== strongest.dim.id && (
            <p className="text-[11px] text-text-tertiary leading-relaxed pt-1">
              <span className="text-text-secondary">Weakest:</span> {weakest.dim.shortLabel}{' '}
              ({weakest.score.toFixed(1)}/3).{' '}
              <span className="text-text-secondary">Strongest:</span> {strongest.dim.shortLabel}{' '}
              ({strongest.score.toFixed(1)}/3).
            </p>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-text-tertiary leading-relaxed pt-2 border-t border-border-subtle">
          Per-document sub-pillar scores not available for this country in the current export.
          The balance_raw above is from the methodology run.
        </p>
      )}

      <p className="text-[10px] text-text-tertiary leading-relaxed pt-1">
        Balance measures documented evidence of governance capacity, not governance itself —
        "a conservative lower bound" per the dissertation.
      </p>
    </PillarCard>
  );
};

const DimensionRow = ({ dim }: { dim: BalanceDimension }) => {
  const fmt2 = (v: number | null): string => (v === null ? '—' : v.toFixed(1));
  const gap = dim.gap;
  const gapColor = gap === null
    ? 'text-text-tertiary'
    : gap > 0.5
      ? 'text-amber-400'
      : gap > 0
        ? 'text-text-secondary'
        : 'text-emerald-400';
  return (
    <tr className="border-t border-border-subtle/30">
      <td className="py-1 pr-2 text-text-secondary">{dim.shortLabel}</td>
      <td className="py-1 text-right font-mono tabular-nums text-text-primary">{fmt2(dim.deJure)}</td>
      <td className="py-1 text-right font-mono tabular-nums text-text-primary">{fmt2(dim.deFacto)}</td>
      <td className={`py-1 text-right font-mono tabular-nums ${gapColor}`}>
        {gap === null ? '—' : (gap >= 0 ? '+' : '') + gap.toFixed(1)}
      </td>
    </tr>
  );
};

const RawIndicator = ({ label, value, digits = 0 }: { label: string; value: number; digits?: number }) => (
  <div className="flex items-center justify-between text-[11px]">
    <span className="text-text-tertiary">{label}</span>
    <span className="font-mono tabular-nums text-text-secondary">{value.toFixed(digits)}</span>
  </div>
);

// === Panel root ===

export const CountryPanel = () => {
  const panelRef = useRef<HTMLDivElement>(null);

  const countryPanelOpen = useAtlasStore((state) => state.countryPanelOpen);
  const selectCountry = useAtlasStore((state) => state.selectCountry);
  const comparisonCountries = useAtlasStore((state) => state.comparisonCountries);
  const addToComparison = useAtlasStore((state) => state.addToComparison);
  const removeFromComparison = useAtlasStore((state) => state.removeFromComparison);
  const setViewMode = useAtlasStore((state) => state.setViewMode);
  const country = useSelectedCountry();

  const isInComparison = country ? comparisonCountries.includes(country.id) : false;
  const canAddToComparison = comparisonCountries.length < 4;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && countryPanelOpen) selectCountry(null);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [countryPanelOpen, selectCountry]);

  const flagEmoji = country && !country.flags.isSupranational ? getFlagEmoji(country.id) : '';
  const isEU = country?.id === 'EU';

  return (
    <AnimatePresence mode="wait">
      {countryPanelOpen && country && (
        <motion.aside
          ref={panelRef}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="
            fixed right-0 top-16 bottom-0
            w-[420px] z-40
            bg-gradient-to-b from-bg-secondary to-bg-primary
            border-l border-border-subtle
            shadow-2xl shadow-black/50
            overflow-hidden
          "
        >
          <div className="inner-highlight" />

          <div className="h-full overflow-y-auto no-scrollbar">
            {/* Header */}
            <motion.div
              variants={itemVariants}
              className="sticky top-0 z-10 bg-bg-secondary/85 backdrop-blur-xl border-b border-border-subtle/50 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 flex items-start gap-4">
                  {isEU ? (
                    <motion.div
                      className="text-4xl leading-none w-14 h-14 rounded-lg flex items-center justify-center bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
                    >
                      EU
                    </motion.div>
                  ) : (
                    flagEmoji && (
                      <motion.span
                        className="text-5xl leading-none"
                        role="img"
                        aria-label={`${country.name} flag`}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
                      >
                        {flagEmoji}
                      </motion.span>
                    )
                  )}
                  <div className="min-w-0 pt-1">
                    <h2 className="text-2xl font-bold text-text-primary tracking-tight leading-tight">
                      {country.name}
                    </h2>
                    <p className="text-sm text-text-secondary mt-0.5">{country.region}</p>
                    {country.flags.isSupranational && (
                      <p className="text-[11px] text-text-tertiary mt-0.5 italic">
                        Supranational entity · no map polygon
                      </p>
                    )}
                  </div>
                </div>

                <motion.button
                  onClick={() => selectCountry(null)}
                  className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <RiskCallout country={country} />
              <ClusterBadge country={country} />
              <BuildCard country={country} />
              <BreakCard country={country} />
              <BalanceCard country={country} />

              {/* Actions */}
              <motion.div variants={itemVariants} className="pt-2 space-y-2">
                <motion.button
                  onClick={() => {
                    if (isInComparison) removeFromComparison(country.id);
                    else if (canAddToComparison) addToComparison(country.id);
                  }}
                  disabled={!canAddToComparison && !isInComparison}
                  className={`
                    w-full flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${
                      isInComparison
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
                        : canAddToComparison
                          ? 'bg-accent-primary text-white hover:opacity-90'
                          : 'bg-bg-tertiary border border-border-subtle text-text-tertiary cursor-not-allowed opacity-50'
                    }
                  `}
                  whileHover={canAddToComparison || isInComparison ? { scale: 1.01 } : {}}
                  whileTap={canAddToComparison || isInComparison ? { scale: 0.99 } : {}}
                >
                  {isInComparison ? (
                    <>
                      <Minus className="w-4 h-4" />
                      Remove from comparison
                    </>
                  ) : canAddToComparison ? (
                    <>
                      <Plus className="w-4 h-4" />
                      Add to comparison
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Comparison full (4 max)
                    </>
                  )}
                </motion.button>

                {comparisonCountries.length >= 2 && (
                  <motion.button
                    onClick={() => {
                      selectCountry(null);
                      setViewMode('comparison');
                    }}
                    className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-bg-tertiary border border-border-subtle text-text-secondary text-sm font-medium hover:text-text-primary hover:border-border-strong transition-all duration-200"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <GitCompare className="w-4 h-4" />
                    View comparison ({comparisonCountries.length})
                  </motion.button>
                )}
              </motion.div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
