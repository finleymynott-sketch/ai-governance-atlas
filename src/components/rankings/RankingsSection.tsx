import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, AlertTriangle, Sparkles } from 'lucide-react';
import { useAtlasStore } from '@/store/useAtlasStore';
import { CLUSTER_DEFINITIONS } from '@/types';
import type { Country } from '@/types';
import { getFlagEmoji } from '@/utils/flags';

type SortKey =
  | 'rank'
  | 'name'
  | 'risk'
  | 'hazard'
  | 'displacement'
  | 'balance'
  | 'cluster'
  | 'stability';

type SortDir = 'asc' | 'desc';

const getValue = (c: Country, key: SortKey): number | string => {
  switch (key) {
    case 'rank':
      return c.risk.rank;
    case 'name':
      return c.name;
    case 'risk':
      return c.risk.total;
    case 'hazard':
      return c.build.hazard;
    case 'displacement':
      return c.break.displacement;
    case 'balance':
      return c.balance.raw;
    case 'cluster':
      return c.cluster.id;
    case 'stability':
      return c.cluster.stability;
  }
};

export const RankingsSection = () => {
  const countries = useAtlasStore((state) => state.countries);
  const selectCountry = useAtlasStore((state) => state.selectCountry);
  const setViewMode = useAtlasStore((state) => state.setViewMode);

  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      // Default ordering: rank ascending (top risk first), everything else descending.
      setSortDir(key === 'rank' || key === 'name' ? 'asc' : 'desc');
    }
  };

  const sorted = useMemo(() => {
    const arr = [...countries];
    arr.sort((a, b) => {
      const av = getValue(a, sortKey);
      const bv = getValue(b, sortKey);
      if (typeof av === 'string' || typeof bv === 'string') {
        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return arr;
  }, [countries, sortKey, sortDir]);

  const HeaderCell = ({ keyId, label, align = 'left' }: { keyId: SortKey; label: string; align?: 'left' | 'right' }) => {
    const active = sortKey === keyId;
    return (
      <th
        className={`
          px-3 py-2 text-[11px] uppercase tracking-wider font-medium cursor-pointer select-none
          ${align === 'right' ? 'text-right' : 'text-left'}
          ${active ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}
        `}
        onClick={() => toggleSort(keyId)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          <ArrowUpDown className={`w-3 h-3 ${active ? 'opacity-100' : 'opacity-40'}`} />
        </span>
      </th>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bg-primary px-4 md:px-8 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Risk rankings</h1>
          <p className="text-sm text-text-secondary mt-2 max-w-2xl leading-relaxed">
            Net Displacement Risk for the 48-unit sample, with the dissertation's headline pillars.
            "The framework's primary utility is typological. Ordinal precision is not the point" —
            38 country pairs are statistically indistinguishable. Trust the extremes and the cluster
            archetypes; treat mid-table rank differences with caution.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-xl bg-bg-secondary border border-border-subtle overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-tertiary border-b border-border-subtle">
                <tr>
                  <HeaderCell keyId="rank" label="Rank" />
                  <HeaderCell keyId="name" label="Country" />
                  <HeaderCell keyId="risk" label="Risk" align="right" />
                  <HeaderCell keyId="hazard" label="Hazard" align="right" />
                  <HeaderCell keyId="displacement" label="Displacement" align="right" />
                  <HeaderCell keyId="balance" label="Balance" align="right" />
                  <HeaderCell keyId="cluster" label="Cluster" />
                  <HeaderCell keyId="stability" label="Stability" align="right" />
                  <th className="px-3 py-2 text-[11px] uppercase tracking-wider font-medium text-text-tertiary">
                    Flags
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c, idx) => {
                  const cluster = CLUSTER_DEFINITIONS.find((cl) => cl.id === c.cluster.id);
                  return (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.01, 0.3) }}
                      className="border-b border-border-subtle/40 hover:bg-bg-tertiary/40 cursor-pointer transition-colors"
                      onClick={() => {
                        selectCountry(c.id);
                        setViewMode('exploration');
                      }}
                    >
                      <td className="px-3 py-2 text-text-secondary font-mono tabular-nums text-xs">
                        {c.risk.rank || '—'}
                      </td>
                      <td className="px-3 py-2 text-text-primary">
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {c.flags.isSupranational ? '🇪🇺' : getFlagEmoji(c.id)}
                          </span>
                          <span>{c.name}</span>
                          <span className="text-[11px] text-text-tertiary font-mono">{c.id}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        {(c.risk.total * 100).toFixed(1)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-text-secondary">
                        {(c.build.hazard * 100).toFixed(0)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-text-secondary">
                        {(c.break.displacement * 100).toFixed(0)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-text-secondary">
                        {(c.balance.raw * 100).toFixed(0)}
                      </td>
                      <td className="px-3 py-2">
                        {cluster && (
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
                            style={{
                              backgroundColor: `color-mix(in srgb, ${cluster.color} 15%, transparent)`,
                              color: cluster.color,
                              border: `1px solid color-mix(in srgb, ${cluster.color} 30%, transparent)`,
                            }}
                          >
                            <span className="text-[10px] opacity-60">{cluster.id}.</span>
                            {cluster.shortName}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-text-tertiary">
                        {(c.cluster.stability * 100).toFixed(0)}%
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          {c.cluster.unstable && (
                            <AlertTriangle
                              className="w-3.5 h-3.5 text-amber-400"
                              aria-label="Cluster unstable"
                            />
                          )}
                          {c.flags.kafalaCaveat && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              title="Kafala caveat — OADR may not reflect labour scarcity"
                            >
                              kafala
                            </span>
                          )}
                          {c.flags.zeroRiskPathway === 'aging' && (
                            <Sparkles className="w-3.5 h-3.5 text-yellow-400" aria-label="Aging-buffer zero" />
                          )}
                          {c.flags.zeroRiskPathway === 'no-infra' && (
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" aria-label="No-infrastructure zero" />
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-text-tertiary"
        >
          <span className="inline-flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Bootstrap stability &lt; 0.70 — assignment is sensitive to sample composition
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            Aging-buffer zero (JPN/FIN/PRT)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            No-infrastructure zero (ETH)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              kafala
            </span>
            OADR proxy weakest for these countries
          </span>
        </motion.div>
      </div>
    </div>
  );
};
