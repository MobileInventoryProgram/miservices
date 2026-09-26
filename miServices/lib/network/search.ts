/**
 * Which franchises match what someone typed in the Our Network search:
 * a postcode or postcode district they cover, a town they cover, their area
 * name, or an owner's name.
 */
export interface SearchableFranchise {
  companyName?: string | null;
  territory?: string | null;
  postCodes?: string | null;
  townsCities?: string | null;
  owners: { name: string; firstName: string; lastName: string }[];
}

export function matchesSearch(franchisee: SearchableFranchise, searchTerm: string): boolean {
  const search = searchTerm.toLowerCase().trim();

  if (!search) return true;

  // Extract outward code from full postcode (handles both "CH2 1HA" and "CH21HA")
  // UK postcode outward code: area (1-2 letters) + district (1 digit) + optional sub-district (1 letter/digit)
  let postcodePrefix = search;

  if (search.includes(' ')) {
    // With space: just take first part
    postcodePrefix = search.split(' ')[0].toLowerCase();
  } else if (search.length > 4) {
    // No space but looks like full postcode: extract outward code
    // UK postcode pattern: [A-Z]{1,2} + \d + [A-Z\d]? (e.g., CH2, SW1A, LL14)
    const outwardMatch = search.match(/^([a-z]{1,2}\d[a-z\d]?)/i);
    if (outwardMatch) {
      postcodePrefix = outwardMatch[1].toLowerCase();
    }
  }

  // Parse postCodes string into array (split by comma)
  const postcodesArray = franchisee.postCodes ? franchisee.postCodes.split(',').map(pc => pc.trim()) : [];

  // Check if any franchisee postcode matches the search term or prefix
  const postcodeMatch = postcodesArray.some(postcode => {
    // Clean the stored postcode, removing exclusion notes like "(excl LE15)"
    const cleanPostcode = postcode.replace(/\s*\(.*?\)\s*/g, '').trim();
    const normalizedPostcode = cleanPostcode.toLowerCase().replace(/\s/g, '');
    const normalizedSearch = search.replace(/\s/g, '').toLowerCase();

    // Handle postcode ranges like "CH1-4" (covers CH1, CH2, CH3, CH4)
    const rangeMatch = cleanPostcode.match(/^([A-Z]+)(\d+)-(\d+)$/i);
    if (rangeMatch) {
      const [, letters, start, end] = rangeMatch;
      // Match prefix with optional letter+digit format (e.g., CH2, SW1, SW1A)
      const searchMatch = postcodePrefix.match(/^([A-Z]+)(\d+)([A-Z\d])?$/i);

      if (searchMatch) {
        const [, searchLetters, searchNum] = searchMatch;
        // Check if letters match and number is in range
        if (letters.toLowerCase() === searchLetters.toLowerCase()) {
          const num = parseInt(searchNum);
          return num >= parseInt(start) && num <= parseInt(end);
        }
      }
    }

    // Parse both the search term and stored postcode to compare properly
    // UK postcode structure: Area (1-2 letters) + District (1-2 digits) + optional sub-district (letter/digit)
    const searchParsed = postcodePrefix.match(/^([a-z]+)(\d*)([a-z\d])?$/i);
    const storedParsed = normalizedPostcode.match(/^([a-z]+)(\d*)([a-z\d])?$/i);

    if (searchParsed && storedParsed) {
      const [, searchArea, searchDistrict, searchSub] = searchParsed;
      const [, storedArea, storedDistrict, storedSub] = storedParsed;

      // Areas must match (M, CH, SW, etc.)
      if (searchArea.toLowerCase() !== storedArea.toLowerCase()) {
        return false;
      }

      // If stored postcode is area-only (e.g., "BB", "LL"), it matches any search in that area
      if (!storedDistrict || storedDistrict === '') {
        return true;
      }

      // If search is area-only (e.g., "M"), match any district in that area
      if (!searchDistrict || searchDistrict === '') {
        return true;
      }

      // Both have districts - they must match exactly (M1 should NOT match M18)
      if (searchDistrict !== storedDistrict) {
        return false;
      }

      // If we have sub-districts, they must match too (SW1A vs SW1B)
      if (searchSub && storedSub) {
        return searchSub.toLowerCase() === storedSub.toLowerCase();
      }

      // If search has sub-district but stored doesn't (or vice versa), they still match
      // e.g., "SW1" matches "SW1A" and vice versa
      return true;
    }

    // Fallback: simple contains check
    return normalizedPostcode.includes(normalizedSearch) || 
           normalizedPostcode.startsWith(postcodePrefix.toLowerCase());
  });

  // Parse locations/towns array
  const locationsArray = franchisee.townsCities ? franchisee.townsCities.split(',').map(loc => loc.trim()) : [];

  // Check if any owner name matches
  const ownerNameMatch = franchisee.owners.some(owner =>
    owner.name.toLowerCase().includes(search) ||
    owner.firstName.toLowerCase().includes(search) ||
    owner.lastName.toLowerCase().includes(search)
  );

  // Word-boundary match: checks if the search term appears as a complete word
  // e.g. "chester" matches "Chester" but NOT "Manchester" or "Chesterfield"
  const wordBoundaryMatch = (text: string, term: string) => {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(text);
  };

  // Location match: exact word-boundary match on each individual town/city
  const locationMatch = locationsArray.some(location =>
    wordBoundaryMatch(location, search)
  );

  // Territory/company: use word-boundary matching too
  const territoryMatch = franchisee.territory ? wordBoundaryMatch(franchisee.territory, search) : false;
  const companyMatch = franchisee.companyName ? wordBoundaryMatch(franchisee.companyName, search) : false;

  return (
    territoryMatch ||
    companyMatch ||
    ownerNameMatch ||
    postcodeMatch ||
    locationMatch
  );
}

/** Distance in km between two [lng, lat] points */
export function distanceKm([lng1, lat1]: [number, number], [lng2, lat2]: [number, number]): number {
  const rad = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lng2 - lng1) * rad) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}
