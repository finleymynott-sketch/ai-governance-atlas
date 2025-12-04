/**
 * Source URL mapping for country data documentation
 * Links countries to their source documents (Google Docs, PDFs, etc.)
 */

// Map country IDs to their source documents
// Options:
// A: Individual Google Docs per country
// B: One master document with anchors (#country-code)
// C: PDFs in public folder (/sources/country.pdf)
// D: Single sources page with query param

const SOURCE_URLS: Record<string, string> = {
  // Example entries - replace with your actual document IDs
  // 'USA': 'https://docs.google.com/document/d/YOUR_DOC_ID_USA/edit',
  // 'DEU': 'https://docs.google.com/document/d/YOUR_DOC_ID_GERMANY/edit',
  // 'GBR': 'https://docs.google.com/document/d/YOUR_DOC_ID_UK/edit',
};

// Default fallback - master document with country anchor
const DEFAULT_SOURCE_URL = 'https://docs.google.com/document/d/YOUR_MASTER_DOC_ID/edit';

/**
 * Get the source documentation URL for a specific country
 * Falls back to master document with country anchor if no specific URL exists
 */
export const getSourceUrl = (countryId: string): string => {
  return SOURCE_URLS[countryId] || `${DEFAULT_SOURCE_URL}#${countryId.toLowerCase()}`;
};

/**
 * Check if a country has a dedicated source document
 */
export const hasCountrySource = (countryId: string): boolean => {
  return countryId in SOURCE_URLS;
};

