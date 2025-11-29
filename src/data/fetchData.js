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
  const [scb, stkt, sfs, agv, esv, wd] = await Promise.all([
    fetchJSON('scb.json'),
    fetchJSON('stkt.json'),
    fetchJSON('sfs.json'),
    fetchJSON('agv.json'),
    fetchJSON('esv.json'),
    fetchJSON('wd.json'),
  ]);

  const data = { scb, stkt, sfs, agv, esv, wd };

  // Cache the data
  setCachedData(data);

  return data;
}

/**
 * Merge and transform raw data into app-ready compact format
 * Uses short property names to match existing MyndigheterApp.jsx format:
 * n=name, s=start, e=end, d=department, en=english, sh=short, emp=employees,
 * fte=FTE, w=women, m=men, str=structure, cof=cofog, gd=hasGD, fteH=FTE history,
 * org=orgNr, tel=phone, web=website, grp=group, city=city, host=host, sfs=SFS ref
 */
export function transformAgencyData(rawData) {
  const { scb, stkt, sfs, agv, wd } = rawData;

  // Use wd (Wikidata) as base - it has ALL agencies including dissolved ones (~700+)
  // stkt only has active agencies (~350)
  const agencies = [];

  Object.entries(wd).forEach(([name, wdData]) => {
    // Get additional data from other sources
    const stktData = stkt[name] || {};
    const scbData = scb[name] || {};
    const sfsData = sfs[name] || {};
    const agvData = agv[name] || {};

    // Extract city from office address
    const officeAddr = agvData.office_address || '';
    const cityMatch = officeAddr.match(/\d{3}\s*\d{2}\s+([A-ZÅÄÖ]+)/);
    const city = cityMatch ? cityMatch[1] : undefined;

    // Get employee counts from SCB data
    const scbEmployees = scbData.employees || {};
    const latestYear = Object.keys(scbEmployees).sort().pop();
    const latestEmp = latestYear ? scbEmployees[latestYear] : {};

    // Build compact agency object matching MyndigheterApp.jsx format
    const agency = {
      n: name,  // name
      d: stktData.department || undefined,  // department (from stkt)
      s: wdData.start || stktData.start,  // start date
      e: wdData.end || stktData.end,  // end date (for dissolved agencies)
      en: wdData.name_en,  // english name
      sh: stktData.abbreviation,  // short name / abbreviation
      emp: latestEmp.total,  // total employees
      fte: stktData.fte?.[latestYear],  // FTE for latest year
      w: latestEmp.women,  // women count
      m: latestEmp.men,  // men count
      str: stktData.structure,  // structure type
      cof: stktData.cofog10,  // COFOG code
      gd: stktData.has_gd,  // has generaldirektör
      fteH: stktData.fte || {},  // FTE history
      org: stktData.org_nr,  // organization number
      tel: agvData.phone,  // telephone
      web: agvData.website,  // website
      grp: agvData.group,  // group
      city: city,  // city
      host: stktData.host_authority,  // host authority
      sfs: sfsData.created_by,  // SFS reference
    };

    // Remove undefined properties to keep objects clean
    Object.keys(agency).forEach(key => {
      if (agency[key] === undefined) delete agency[key];
    });

    agencies.push(agency);
  });

  return agencies;
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
