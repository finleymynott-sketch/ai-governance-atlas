import Papa from 'papaparse';
import type { Country, CountryCSVRow, PillarScore } from '@/types';

/**
 * Parse a string value to a number, returning 0 if invalid
 */
const parseScore = (value: string | undefined): number => {
  if (value === undefined || value === '') return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : Math.max(0, Math.min(1, parsed));
};

/**
 * Transform a flat CSV row into a nested Country object
 */
const transformCSVRow = (row: CountryCSVRow): Country => {
  // Build pillar indicators
  const buildIndicators: Record<string, number> = {
    compute: parseScore(row.build_compute),
    datacentres: parseScore(row.build_datacentres),
    energy: parseScore(row.build_energy),
    research: parseScore(row.build_research),
  };

  const buildScore: PillarScore = {
    overall: parseScore(row.build_overall),
    indicators: buildIndicators,
  };

  // Break pillar indicators
  const breakIndicators: Record<string, number> = {
    exposure: parseScore(row.break_exposure),
    complementarity: parseScore(row.break_complementarity),
  };

  const breakScore: PillarScore = {
    overall: parseScore(row.break_overall),
    indicators: breakIndicators,
  };

  // Balance pillar indicators
  const balanceIndicators: Record<string, number> = {
    legal: parseScore(row.balance_legal),
    standards: parseScore(row.balance_standards),
    audit: parseScore(row.balance_audit),
    worker: parseScore(row.balance_worker),
    transparency: parseScore(row.balance_transparency),
  };

  const balanceScore: PillarScore = {
    overall: parseScore(row.balance_overall),
    indicators: balanceIndicators,
  };

  // Calculate risk imbalance (Build - Balance gap)
  const riskImbalance = buildScore.overall - balanceScore.overall;

  return {
    id: row.id,
    name: row.name,
    region: row.region,
    build: buildScore,
    break: breakScore,
    balance: balanceScore,
    riskImbalance,
    clusterId: row.cluster_id,
  };
};

/**
 * Load and parse countries from a CSV file
 * @param csvPath - Path to the CSV file (relative to public folder)
 * @returns Promise<Country[]> - Array of transformed Country objects
 */
export const loadCountriesFromCSV = async (
  csvPath: string
): Promise<Country[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<CountryCSVRow>(csvPath, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim().toLowerCase(),
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
        }

        try {
          const countries = results.data
            .filter((row) => row.id && row.name) // Filter out invalid rows
            .map(transformCSVRow);

          resolve(countries);
        } catch (error) {
          reject(new Error(`Failed to transform CSV data: ${error}`));
        }
      },
      error: (error: Error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
};

/**
 * Get a country by ID from an array of countries
 */
export const getCountryById = (
  countries: Country[],
  id: string
): Country | undefined => {
  return countries.find((country) => country.id === id);
};

/**
 * Get countries by cluster ID
 */
export const getCountriesByCluster = (
  countries: Country[],
  clusterId: string
): Country[] => {
  return countries.filter((country) => country.clusterId === clusterId);
};

/**
 * Get countries sorted by a specific pillar or risk
 */
export const getCountriesSortedByPillar = (
  countries: Country[],
  pillar: 'build' | 'break' | 'balance' | 'risk',
  descending = true
): Country[] => {
  return [...countries].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    if (pillar === 'risk') {
      aValue = a.riskImbalance;
      bValue = b.riskImbalance;
    } else {
      aValue = a[pillar].overall;
      bValue = b[pillar].overall;
    }

    return descending ? bValue - aValue : aValue - bValue;
  });
};

/**
 * Get statistics for a pillar across all countries
 */
export const getPillarStats = (
  countries: Country[],
  pillar: 'build' | 'break' | 'balance'
): { min: number; max: number; mean: number; median: number } => {
  if (countries.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0 };
  }

  const values = countries.map((c) => c[pillar].overall).sort((a, b) => a - b);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const midIndex = Math.floor(values.length / 2);

  return {
    min: values[0] ?? 0,
    max: values[values.length - 1] ?? 0,
    mean: sum / values.length,
    median:
      values.length % 2 !== 0
        ? values[midIndex] ?? 0
        : ((values[midIndex - 1] ?? 0) + (values[midIndex] ?? 0)) / 2,
  };
};

