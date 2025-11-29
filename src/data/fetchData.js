// External data fetching from civictechsweden/myndighetsdata
const BASE_URL = 'https://raw.githubusercontent.com/civictechsweden/myndighetsdata/master/data';

const CACHE_KEY = 'myndigheter_data_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if cached data is still valid
 */
function getCachedData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > CACHE_DURATION;

    if (isExpired) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch (e) {
    console.warn('Cache read error:', e);
    return null;
  }
}

/**
 * Save data to cache
 */
function setCachedData(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Cache write error:', e);
  }
}

/**
 * Fetch a single JSON file with error handling
 */
async function fetchJSON(filename) {
  const response = await fetch(`${BASE_URL}/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${filename}: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetch all agency data from external sources
 * Returns cached data if available and not expired
 */
export async function fetchAllAgencyData() {
  // Check cache first
  const cached = getCachedData();
  if (cached) {
    console.log('Using cached agency data');
    return cached;
  }

  console.log('Fetching fresh agency data from GitHub...');

  // Fetch all data sources in parallel
  // merged.json contains 978 agencies with combined data from all sources
  // wd.json has start/end dates from Wikidata
  const [merged, wd] = await Promise.all([
    fetchJSON('merged.json'),
    fetchJSON('wd.json'),
  ]);

  const data = { merged, wd };

  // Cache the data
  setCachedData(data);

  return data;
}

/**
 * Merge and transform raw data into app-ready compact format
 * Uses short property names to match existing MyndigheterApp.jsx format:
 * n=name, s=start, e=end, d=department, en=english, sh=short, emp=employees,
 * fte=FTE, w=women, m=men, str=structure, cof=cofog, gd=hasGD, fteH=FTE history,
 * org=orgNr, tel=phone, web=website, grp=group, city=city, host=host, sfs=SFS ref,
 * empH=employee history (total), wH=women history, mH=men history (from AGV, 1980+)
 */
export function transformAgencyData(rawData) {
  // Defensive: ensure rawData has required properties
  if (!rawData || typeof rawData !== 'object') {
    console.error('transformAgencyData: Invalid rawData', rawData);
    return [];
  }

  const merged = rawData.merged || {};
  const wd = rawData.wd || {};

  // merged.json has 978 agencies with nested source data (esv, stkt, scb, sfs, agv)
  // wd.json has start/end dates from Wikidata
  // Use Map to deduplicate by normalized name (handles "Andra AP-fonden" vs "ANDRA AP-FONDEN")
  const agencyMap = new Map();

  Object.entries(merged).forEach(([name, sources]) => {
    // Skip if sources is not an object
    if (!sources || typeof sources !== 'object') return;
    // Normalize name for deduplication (lowercase for comparison)
    const normalizedKey = name.toLowerCase().trim();
    // Extract data from each source within merged.json
    const esv = sources.esv || {};
    const stkt = sources.stkt || {};
    const scb = sources.scb || {};
    const sfs = sources.sfs || {};
    const agv = sources.agv || {};

    // Get Wikidata for start/end dates
    const wdData = wd[name] || {};

    // Get latest employee/FTE data from ESV (most complete for recent years)
    const esvEmployees = (esv && esv.employees) ? esv.employees : {};
    const esvFte = (esv && esv.fte) ? esv.fte : {};
    const esvYears = Object.keys(esvEmployees);
    const latestEsvYear = esvYears.length > 0 ? esvYears.sort().pop() : null;
    const latestEsvEmp = latestEsvYear ? esvEmployees[latestEsvYear] : undefined;
    const latestFte = latestEsvYear ? esvFte[latestEsvYear] : undefined;

    // Get AGV employee history (goes back to 1980 for many agencies)
    const agvTotal = (agv && agv.total) ? agv.total : {};
    const agvWomen = (agv && agv.women) ? agv.women : {};
    const agvMen = (agv && agv.men) ? agv.men : {};

    // Get latest employee count (prefer ESV if available, otherwise AGV)
    const agvYears = Object.keys(agvTotal);
    const latestAgvYear = agvYears.length > 0 ? agvYears.sort().pop() : null;
    const latestAgvEmp = latestAgvYear ? agvTotal[latestAgvYear] : undefined;
    const latestEmp = latestEsvEmp || latestAgvEmp;

    // Get latest gender data from AGV
    const latestWomen = latestAgvYear ? agvWomen[latestAgvYear] : undefined;
    const latestMen = latestAgvYear ? agvMen[latestAgvYear] : undefined;

    // Extract city from AGV office address
    const officeAddr = agv.office_address || '';
    const cityMatch = officeAddr.match(/\d{3}\s*\d{2}\s+([A-ZÅÄÖ]+)/);
    const city = cityMatch ? cityMatch[1] : undefined;

    // Build compact agency object matching MyndigheterApp.jsx format
    const agency = {
      n: name,  // name
      d: esv.department || stkt.department,  // department
      s: wdData.start || stkt.start || sfs.start,  // start date
      e: wdData.end || stkt.end || sfs.end,  // end date (for dissolved agencies)
      en: esv.name_en || wdData.name_en,  // english name
      sh: esv.short_name || stkt.abbreviation,  // short name
      emp: latestEmp,  // total employees (latest available)
      fte: latestFte,  // FTE for latest year
      w: latestWomen || scb.women,  // women count (prefer AGV, fallback SCB)
      m: latestMen || scb.men,  // men count (prefer AGV, fallback SCB)
      str: stkt.structure,  // structure type
      cof: stkt.cofog10,  // COFOG code
      gd: stkt.has_gd,  // has generaldirektör
      fteH: esvFte,  // FTE history (from ESV)
      empH: agvTotal,  // Employee history from AGV (1980+)
      wH: agvWomen,  // Women history from AGV (1980+)
      mH: agvMen,  // Men history from AGV (1980+)
      org: esv.org_nr || stkt.org_nr,  // organization number
      tel: agv.phone,  // telephone
      web: agv.website,  // website
      grp: agv.group,  // group
      city: city,  // city
      host: stkt.host_authority,  // host authority
      sfs: sfs.created_by,  // SFS reference
    };

    // Remove undefined/empty properties to keep objects clean
    Object.keys(agency).forEach(key => {
      if (agency[key] === undefined ||
          (typeof agency[key] === 'object' && Object.keys(agency[key]).length === 0)) {
        delete agency[key];
      }
    });

    // Deduplicate: if we already have this agency, merge data (prefer more complete entry)
    if (agencyMap.has(normalizedKey)) {
      const existing = agencyMap.get(normalizedKey);
      // Keep the version with more data fields, or prefer properly capitalized name
      const existingFields = Object.keys(existing).length;
      const newFields = Object.keys(agency).length;
      if (newFields > existingFields || (newFields === existingFields && name !== name.toUpperCase())) {
        agencyMap.set(normalizedKey, agency);
      }
    } else {
      agencyMap.set(normalizedKey, agency);
    }
  });

  return Array.from(agencyMap.values());
}

/**
 * Clear the data cache (useful for forcing refresh)
 */
export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
  console.log('Agency data cache cleared');
}

/**
 * Get cache info
 */
export function getCacheInfo() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return { exists: false };

    const { timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;
    const expiresIn = CACHE_DURATION - age;

    return {
      exists: true,
      timestamp: new Date(timestamp).toISOString(),
      ageHours: Math.round(age / (60 * 60 * 1000) * 10) / 10,
      expiresInHours: Math.round(expiresIn / (60 * 60 * 1000) * 10) / 10,
    };
  } catch (e) {
    return { exists: false, error: e.message };
  }
}
