import Papa from 'papaparse';
import type {
  BalanceDimension,
  BalanceDimensionId,
  ClusterAssignmentRow,
  ClusterId,
  Country,
  GovernanceDocumentRow,
  MasterCountryRow,
} from '@/types';
import { BALANCE_DIMENSION_META, CLUSTER_DEFINITIONS } from '@/types';

// === Parsing primitives ===

const parseNum = (value: string | undefined): number => {
  if (value === undefined || value === '' || value.toLowerCase() === 'nan') return 0;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

const parseNumOrNull = (value: string | undefined): number | null => {
  if (value === undefined || value === '' || value.toLowerCase() === 'nan') return null;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
};

const parseBool = (value: string | undefined): boolean => {
  if (value === undefined) return false;
  return value.toLowerCase() === 'true';
};

const fetchCSV = <T>(path: string): Promise<T[]> =>
  new Promise((resolve, reject) => {
    Papa.parse<T>(path, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (r) => resolve(r.data),
      error: (e) => reject(new Error(`Failed to parse ${path}: ${e.message}`)),
    });
  });

// === Static lookups grounded in the dissertation ===

/**
 * UN geoscheme regional grouping. The dissertation reports regional risk means
 * (lines 1425-1430) for Europe, Gulf, Sub-Saharan Africa, Asia-Pacific, Americas.
 * We use a slightly finer breakdown to keep the legend useful, while preserving
 * those high-level groupings as the unit of regional means.
 */
const REGION_BY_ISO: Record<string, string> = {
  ARE: 'Gulf states',
  ARG: 'Latin America',
  AUS: 'Asia-Pacific',
  AUT: 'Western Europe',
  BEL: 'Western Europe',
  BGD: 'South Asia',
  BRA: 'Latin America',
  CAN: 'North America',
  CHE: 'Western Europe',
  CHL: 'Latin America',
  COL: 'Latin America',
  CZE: 'Central Europe',
  DEU: 'Western Europe',
  DNK: 'Northern Europe',
  EGY: 'North Africa',
  ESP: 'Southern Europe',
  ETH: 'Sub-Saharan Africa',
  EU: 'Supranational',
  FIN: 'Northern Europe',
  FRA: 'Western Europe',
  GBR: 'Northern Europe',
  GHA: 'Sub-Saharan Africa',
  IDN: 'Southeast Asia',
  IND: 'South Asia',
  IRL: 'Northern Europe',
  ISR: 'Middle East',
  ITA: 'Southern Europe',
  JPN: 'East Asia',
  KEN: 'Sub-Saharan Africa',
  KOR: 'East Asia',
  MAR: 'North Africa',
  MEX: 'Latin America',
  MYS: 'Southeast Asia',
  NGA: 'Sub-Saharan Africa',
  NLD: 'Western Europe',
  PAK: 'South Asia',
  PHL: 'Southeast Asia',
  POL: 'Central Europe',
  PRT: 'Southern Europe',
  RWA: 'Sub-Saharan Africa',
  SAU: 'Gulf states',
  SGP: 'Southeast Asia',
  SWE: 'Northern Europe',
  THA: 'Southeast Asia',
  TUR: 'Middle East',
  USA: 'North America',
  VNM: 'Southeast Asia',
  ZAF: 'Sub-Saharan Africa',
};

/**
 * The dissertation's kafala caveat (Section 5.2) explicitly names UAE and Saudi
 * Arabia as the cases where OADR-based displacement pressure is theoretically
 * questionable — the Acemoglu-Restrepo mechanism breaks down in administratively-
 * determined labour supply regimes.
 */
const KAFALA_COUNTRIES = new Set<string>(['ARE', 'SAU']);

/**
 * Appendix D Table D.1 and Appendix F Table F.1 specify yellow highlighting for
 * countries where Break_displacement = 0 due to OADR winsorisation (JPN, FIN,
 * PRT), and green highlighting for Ethiopia (zero from minimum raw exposure).
 * These are the only colour conventions the dissertation specifies.
 */
const AGING_ZERO = new Set<string>(['JPN', 'FIN', 'PRT']);
const NO_INFRA_ZERO = new Set<string>(['ETH']);

const clusterLabelFromCsv = (csvValue: string): ClusterId => {
  // CSV uses 0-4; dissertation prose uses 1-5.
  const n = parseInt(csvValue, 10);
  const shifted = (Number.isFinite(n) ? n + 1 : 1) as ClusterId;
  return (shifted >= 1 && shifted <= 5 ? shifted : 1) as ClusterId;
};

const clusterLabelText = (id: ClusterId): string =>
  CLUSTER_DEFINITIONS.find((c) => c.id === id)?.label ?? 'Unassigned';

// === Country name overrides ===
// The CSV's country_name is mostly canonical, but a couple are awkward in UI.

const NAME_OVERRIDE: Record<string, string> = {
  EU: 'European Union',
};

// === Governance document aggregation ===

const DIMENSION_IDS: BalanceDimensionId[] = [
  'law_and_institutions',
  'standards',
  'audit_and_enforcement',
  'worker_protection',
  'transparency',
];

/**
 * Aggregate per-document governance rows into a single set of 5 BalanceDimension
 * entries per country. Where a country has multiple scored documents, average
 * the de_jure and de_facto values.
 */
const aggregateGovernance = (
  rows: GovernanceDocumentRow[]
): Map<string, BalanceDimension[]> => {
  const byCountry = new Map<string, GovernanceDocumentRow[]>();
  for (const row of rows) {
    const iso = row.country_iso3;
    if (!iso) continue;
    if (!byCountry.has(iso)) byCountry.set(iso, []);
    byCountry.get(iso)!.push(row);
  }

  const out = new Map<string, BalanceDimension[]>();
  for (const [iso, docs] of byCountry) {
    const dims: BalanceDimension[] = DIMENSION_IDS.map((dimId) => {
      const meta = BALANCE_DIMENSION_META[dimId];
      const deJureVals: number[] = [];
      const deFactoVals: number[] = [];
      for (const doc of docs) {
        const dj = parseNumOrNull(doc[`${dimId}_de_jure`]);
        const df = parseNumOrNull(doc[`${dimId}_de_facto`]);
        if (dj !== null) deJureVals.push(dj);
        if (df !== null) deFactoVals.push(df);
      }
      const deJure = deJureVals.length ? mean(deJureVals) : null;
      const deFacto = deFactoVals.length ? mean(deFactoVals) : null;
      const gap = deJure !== null && deFacto !== null ? deJure - deFacto : null;
      return {
        id: dimId,
        shortLabel: meta.short,
        longLabel: meta.long,
        deJure,
        deFacto,
        gap,
      };
    });
    out.set(iso, dims);
  }
  return out;
};

const mean = (xs: number[]): number =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;

// === Main loader ===

/**
 * Load the dissertation's three canonical CSVs and join them into Country
 * objects. The master_country_dataset is the source of truth for everything
 * except the 5-dimension Balance breakdown, which comes from governance_documents
 * (the LLM jury's per-document scoring).
 */
export const loadCountries = async (): Promise<Country[]> => {
  const [masterRows, clusterRows, govRows] = await Promise.all([
    fetchCSV<MasterCountryRow>('/data/master_country_dataset.csv'),
    fetchCSV<ClusterAssignmentRow>('/data/table_cluster_assignments.csv'),
    fetchCSV<GovernanceDocumentRow>('/data/governance_documents.csv'),
  ]);

  // Cluster rows have richer stability metadata — prefer their version where present.
  const clusterByIso = new Map<string, ClusterAssignmentRow>();
  for (const row of clusterRows) {
    if (row.country_iso3) clusterByIso.set(row.country_iso3, row);
  }

  const governanceByIso = aggregateGovernance(govRows);

  const countries: Country[] = masterRows
    .filter((row) => row.country_iso3)
    .map((row) => {
      const iso = row.country_iso3;
      const clusterRow = clusterByIso.get(iso);
      const clusterId = clusterLabelFromCsv(clusterRow?.cluster_label ?? row.cluster_label);
      const isMedoid = parseBool(clusterRow?.is_medoid ?? row.is_medoid);
      const stability = parseNum(clusterRow?.membership_stability ?? row.membership_stability);
      const unstable = parseBool(clusterRow?.typology_unstable ?? row.typology_unstable);

      const dimensions = governanceByIso.get(iso) ?? [];
      const isSupranational = iso === 'EU';

      const zeroRiskPathway = AGING_ZERO.has(iso)
        ? ('aging' as const)
        : NO_INFRA_ZERO.has(iso)
          ? ('no-infra' as const)
          : null;

      return {
        id: iso,
        name: NAME_OVERRIDE[iso] ?? row.country_name,
        region: REGION_BY_ISO[iso] ?? 'Unclassified',
        build: {
          hazard: parseNum(row.hazard),
          supply: parseNum(row.build_supply),
          access: parseNum(row.build_access),
          indicators: {
            cloudRegionsTotal: parseNum(row.cloud_regions_total),
            cloudRegionsDomestic: parseNum(row.cloud_regions_domestic),
            colocationPerMillion: parseNum(row.colocation_per_million),
            gridReliability: parseNum(row.grid_reliability),
            internetPenetration: parseNum(row.internet_penetration),
            bandwidthPerUser: parseNum(row.bandwidth_per_user),
          },
        },
        break: {
          displacement: parseNum(row.break_displacement),
          shortage: parseNum(row.break_shortage),
          indicators: {
            exposureRaw: parseNum(row.exposure_raw),
            oadrRaw: parseNum(row.oadr_raw),
          },
        },
        balance: {
          raw: parseNum(row.balance_raw),
          supply: parseNum(row.balance_supply),
          access: parseNum(row.balance_access),
          sovereignty: parseNum(row.sovereignty_s),
          dimensions,
        },
        risk: {
          total: parseNum(row.risk),
          supply: parseNum(row.risk_supply),
          access: parseNum(row.risk_access),
          viz: parseNum(row.risk_viz),
          rank: parseInt(row.risk_rank, 10) || 0,
        },
        cluster: {
          id: clusterId,
          label: clusterLabelText(clusterId),
          isMedoid,
          stability,
          unstable,
        },
        flags: {
          kafalaCaveat: KAFALA_COUNTRIES.has(iso),
          zeroRiskPathway,
          isSupranational,
        },
      };
    });

  return countries;
};

/**
 * Map a country's headline number for a given map mode. Used by the choropleth
 * to drive the colour scale.
 */
export const valueForMode = (
  country: Country,
  mode:
    | 'hazard'
    | 'build-supply'
    | 'build-access'
    | 'break-displacement'
    | 'break-shortage'
    | 'balance'
    | 'risk'
    | 'sovereignty'
): number => {
  switch (mode) {
    case 'hazard':
      return country.build.hazard;
    case 'build-supply':
      return country.build.supply;
    case 'build-access':
      return country.build.access;
    case 'break-displacement':
      return country.break.displacement;
    case 'break-shortage':
      return country.break.shortage;
    case 'balance':
      return country.balance.raw;
    case 'risk':
      return country.risk.viz;
    case 'sovereignty':
      return country.balance.sovereignty;
  }
};
