/**
 * Convert ISO alpha-3 country code to flag emoji using regional indicator symbols.
 *
 * Several alpha-3 codes do not equal alpha-2 + a letter (AUT, BGD, CHL, PAK,
 * KOR, GBR, etc.), so we explicitly map every country in the dissertation
 * sample. Falling back to `slice(0, 2)` is unsafe — AUT would render as 🇦🇺
 * (Australia) instead of 🇦🇹 (Austria).
 */
const ISO_ALPHA3_TO_ALPHA2: Record<string, string> = {
  ARE: 'AE',
  ARG: 'AR',
  AUS: 'AU',
  AUT: 'AT',
  BEL: 'BE',
  BGD: 'BD',
  BRA: 'BR',
  CAN: 'CA',
  CHE: 'CH',
  CHL: 'CL',
  CHN: 'CN',
  COL: 'CO',
  CZE: 'CZ',
  DEU: 'DE',
  DNK: 'DK',
  EGY: 'EG',
  ESP: 'ES',
  ETH: 'ET',
  FIN: 'FI',
  FRA: 'FR',
  GBR: 'GB',
  GHA: 'GH',
  IDN: 'ID',
  IND: 'IN',
  IRL: 'IE',
  ISR: 'IL',
  ITA: 'IT',
  JPN: 'JP',
  KEN: 'KE',
  KOR: 'KR',
  MAR: 'MA',
  MEX: 'MX',
  MYS: 'MY',
  NGA: 'NG',
  NLD: 'NL',
  NOR: 'NO',
  NZL: 'NZ',
  PAK: 'PK',
  PHL: 'PH',
  POL: 'PL',
  PRT: 'PT',
  RUS: 'RU',
  RWA: 'RW',
  SAU: 'SA',
  SGP: 'SG',
  SWE: 'SE',
  THA: 'TH',
  TUR: 'TR',
  TWN: 'TW',
  USA: 'US',
  VNM: 'VN',
  ZAF: 'ZA',
};

/**
 * Return the flag emoji for an alpha-3 country code, or the EU flag for "EU".
 * Returns an empty string if the code is unknown.
 */
export const getFlagEmoji = (countryCode: string): string => {
  if (countryCode === 'EU') return '🇪🇺';
  const alpha2 = ISO_ALPHA3_TO_ALPHA2[countryCode];
  if (!alpha2) return '';
  try {
    const codePoints = [...alpha2.toUpperCase()].map(
      (char) => 0x1f1e6 - 65 + char.charCodeAt(0)
    );
    return String.fromCodePoint(...codePoints);
  } catch {
    return '';
  }
};
