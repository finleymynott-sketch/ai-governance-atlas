/**
 * Convert ISO alpha-3 country code to flag emoji
 * Uses regional indicator symbols to create flag emojis
 */

// Special mappings for codes that don't follow standard alpha-2
const ISO_ALPHA3_TO_ALPHA2: Record<string, string> = {
  'GBR': 'GB',
  'DEU': 'DE',
  'FRA': 'FR',
  'CHN': 'CN',
  'JPN': 'JP',
  'KOR': 'KR',
  'IND': 'IN',
  'BRA': 'BR',
  'CAN': 'CA',
  'AUS': 'AU',
  'NLD': 'NL',
  'SWE': 'SE',
  'NOR': 'NO',
  'DNK': 'DK',
  'FIN': 'FI',
  'CHE': 'CH',
  'SGP': 'SG',
  'ISR': 'IL',
  'ARE': 'AE',
  'SAU': 'SA',
  'IRL': 'IE',
  'ESP': 'ES',
  'ITA': 'IT',
  'POL': 'PL',
  'RUS': 'RU',
  'MEX': 'MX',
  'IDN': 'ID',
  'TUR': 'TR',
  'ZAF': 'ZA',
  'NZL': 'NZ',
  'TWN': 'TW',
  'VNM': 'VN',
  'THA': 'TH',
  'MYS': 'MY',
  'USA': 'US',
};

/**
 * Get flag emoji for a country code
 * @param countryCode - ISO 3166-1 alpha-3 code (e.g., "USA", "DEU")
 * @returns Flag emoji string or empty string if conversion fails
 */
export const getFlagEmoji = (countryCode: string): string => {
  // Get alpha-2 code from mapping or derive from alpha-3
  const alpha2 = ISO_ALPHA3_TO_ALPHA2[countryCode] ?? countryCode.slice(0, 2);
  
  try {
    // Convert each letter to regional indicator symbol
    // 0x1F1E6 is 🇦, and 65 is 'A' in ASCII
    const codePoints = [...alpha2.toUpperCase()].map(
      (char) => 0x1F1E6 - 65 + char.charCodeAt(0)
    );
    return String.fromCodePoint(...codePoints);
  } catch {
    return '';
  }
};


