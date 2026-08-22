/** Indian states, cities, and municipal authority lookup for jurisdiction parsing. */

export interface CityEntry {
  city: string;
  state: string;
  localAuthority: string;
  portalUrl?: string;
  aliases?: string[];
}

export const INDIAN_STATES: string[] = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
  "Andaman and Nicobar Islands",
  "Lakshadweep",
  "Dadra and Nagar Haveli and Daman and Diu",
];

export const CITY_DIRECTORY: CityEntry[] = [
  {
    city: "Chennai",
    state: "Tamil Nadu",
    localAuthority: "Greater Chennai Corporation",
    portalUrl: "https://chennaicorporation.gov.in/",
    aliases: ["chennai"],
  },
  {
    city: "Mumbai",
    state: "Maharashtra",
    localAuthority: "Brihanmumbai Municipal Corporation (BMC)",
    portalUrl: "https://portal.mcgm.gov.in/",
    aliases: ["mumbai", "bombay"],
  },
  {
    city: "New Delhi",
    state: "Delhi",
    localAuthority: "Municipal Corporation of Delhi / NDMC",
    portalUrl: "https://mcdonline.nic.in/",
    aliases: ["delhi", "new delhi"],
  },
  {
    city: "Bengaluru",
    state: "Karnataka",
    localAuthority: "Bruhat Bengaluru Mahanagara Palike (BBMP)",
    portalUrl: "https://bbmp.gov.in/",
    aliases: ["bengaluru", "bangalore"],
  },
  {
    city: "Hyderabad",
    state: "Telangana",
    localAuthority: "Greater Hyderabad Municipal Corporation",
    portalUrl: "https://ghmc.gov.in/",
    aliases: ["hyderabad"],
  },
  {
    city: "Kolkata",
    state: "West Bengal",
    localAuthority: "Kolkata Municipal Corporation",
    portalUrl: "https://www.kmcgov.in/",
    aliases: ["kolkata", "calcutta"],
  },
  {
    city: "Pune",
    state: "Maharashtra",
    localAuthority: "Pune Municipal Corporation",
    portalUrl: "https://pmc.gov.in/",
    aliases: ["pune"],
  },
  {
    city: "Ahmedabad",
    state: "Gujarat",
    localAuthority: "Ahmedabad Municipal Corporation",
    portalUrl: "https://ahmedabadcity.gov.in/",
    aliases: ["ahmedabad"],
  },
  {
    city: "Jaipur",
    state: "Rajasthan",
    localAuthority: "Jaipur Municipal Corporation",
    portalUrl: "https://jaipurmc.org/",
    aliases: ["jaipur"],
  },
  {
    city: "Lucknow",
    state: "Uttar Pradesh",
    localAuthority: "Lucknow Municipal Corporation",
    portalUrl: "https://lmc.up.nic.in/",
    aliases: ["lucknow"],
  },
  {
    city: "Kochi",
    state: "Kerala",
    localAuthority: "Kochi Municipal Corporation",
    portalUrl: "https://kochicorp.kerala.gov.in/",
    aliases: ["kochi", "cochin"],
  },
  {
    city: "Thiruvananthapuram",
    state: "Kerala",
    localAuthority: "Thiruvananthapuram Municipal Corporation",
    aliases: ["thiruvananthapuram", "trivandrum"],
  },
  {
    city: "Surat",
    state: "Gujarat",
    localAuthority: "Surat Municipal Corporation",
    portalUrl: "https://suratmunicipal.gov.in/",
    aliases: ["surat"],
  },
  {
    city: "Nagpur",
    state: "Maharashtra",
    localAuthority: "Nagpur Municipal Corporation",
    aliases: ["nagpur"],
  },
  {
    city: "Indore",
    state: "Madhya Pradesh",
    localAuthority: "Indore Municipal Corporation",
    aliases: ["indore"],
  },
  {
    city: "Bhopal",
    state: "Madhya Pradesh",
    localAuthority: "Bhopal Municipal Corporation",
    aliases: ["bhopal"],
  },
  {
    city: "Patna",
    state: "Bihar",
    localAuthority: "Patna Municipal Corporation",
    aliases: ["patna"],
  },
  {
    city: "Guwahati",
    state: "Assam",
    localAuthority: "Guwahati Municipal Corporation",
    aliases: ["guwahati"],
  },
  {
    city: "Chandigarh",
    state: "Chandigarh",
    localAuthority: "Chandigarh Municipal Corporation",
    aliases: ["chandigarh"],
  },
  {
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    localAuthority: "Greater Visakhapatnam Municipal Corporation",
    aliases: ["visakhapatnam", "vizag"],
  },
  {
    city: "Coimbatore",
    state: "Tamil Nadu",
    localAuthority: "Coimbatore City Municipal Corporation",
    aliases: ["coimbatore"],
  },
  {
    city: "Madurai",
    state: "Tamil Nadu",
    localAuthority: "Madurai City Municipal Corporation",
    aliases: ["madurai"],
  },
  {
    city: "Varanasi",
    state: "Uttar Pradesh",
    localAuthority: "Varanasi Nagar Nigam",
    aliases: ["varanasi", "banaras"],
  },
  {
    city: "Kanpur",
    state: "Uttar Pradesh",
    localAuthority: "Kanpur Municipal Corporation",
    aliases: ["kanpur"],
  },
  {
    city: "Noida",
    state: "Uttar Pradesh",
    localAuthority: "Noida Authority / local municipal body",
    aliases: ["noida"],
  },
  {
    city: "Gurugram",
    state: "Haryana",
    localAuthority: "Municipal Corporation Gurugram",
    aliases: ["gurugram", "gurgaon"],
  },
  {
    city: "Ranchi",
    state: "Jharkhand",
    localAuthority: "Ranchi Municipal Corporation",
    aliases: ["ranchi"],
  },
  {
    city: "Bhubaneswar",
    state: "Odisha",
    localAuthority: "Bhubaneswar Municipal Corporation",
    aliases: ["bhubaneswar"],
  },
  {
    city: "Raipur",
    state: "Chhattisgarh",
    localAuthority: "Raipur Municipal Corporation",
    aliases: ["raipur"],
  },
  {
    city: "Dehradun",
    state: "Uttarakhand",
    localAuthority: "Dehradun Municipal Corporation",
    aliases: ["dehradun"],
  },
  {
    city: "Amritsar",
    state: "Punjab",
    localAuthority: "Amritsar Municipal Corporation",
    aliases: ["amritsar"],
  },
  {
    city: "Ludhiana",
    state: "Punjab",
    localAuthority: "Ludhiana Municipal Corporation",
    aliases: ["ludhiana"],
  },
  {
    city: "Panaji",
    state: "Goa",
    localAuthority: "Corporation of the City of Panaji",
    aliases: ["panaji", "panjim", "goa"],
  },
  {
    city: "Shimla",
    state: "Himachal Pradesh",
    localAuthority: "Shimla Municipal Corporation",
    aliases: ["shimla"],
  },
  {
    city: "Jammu",
    state: "Jammu and Kashmir",
    localAuthority: "Jammu Municipal Corporation",
    aliases: ["jammu"],
  },
  {
    city: "Srinagar",
    state: "Jammu and Kashmir",
    localAuthority: "Srinagar Municipal Corporation",
    aliases: ["srinagar"],
  },
];

const STATE_ALIASES: Record<string, string> = {
  tn: "Tamil Nadu",
  tamilnadu: "Tamil Nadu",
  maharashtra: "Maharashtra",
  karnataka: "Karnataka",
  delhi: "Delhi",
  telangana: "Telangana",
  westbengal: "West Bengal",
  gujarat: "Gujarat",
  rajasthan: "Rajasthan",
  kerala: "Kerala",
  uttarpradesh: "Uttar Pradesh",
  up: "Uttar Pradesh",
  madhyapradesh: "Madhya Pradesh",
  bihar: "Bihar",
  odisha: "Odisha",
  assam: "Assam",
  punjab: "Punjab",
  haryana: "Haryana",
  jharkhand: "Jharkhand",
  chhattisgarh: "Chhattisgarh",
  uttarakhand: "Uttarakhand",
  himachalpradesh: "Himachal Pradesh",
  goa: "Goa",
  andhrapradesh: "Andhra Pradesh",
  manipur: "Manipur",
  meghalaya: "Meghalaya",
  nagaland: "Nagaland",
  mizoram: "Mizoram",
  tripura: "Tripura",
  sikkim: "Sikkim",
  arunachalpradesh: "Arunachal Pradesh",
  ladakh: "Ladakh",
  jammukashmir: "Jammu and Kashmir",
  puducherry: "Puducherry",
  pondicherry: "Puducherry",
  chandigarh: "Chandigarh",
};

function normalizeKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function titleCase(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function findCity(text: string): CityEntry | undefined {
  const lower = text.toLowerCase();
  for (const entry of CITY_DIRECTORY) {
    const names = [entry.city, ...(entry.aliases || [])];
    for (const name of names) {
      const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (re.test(lower)) return entry;
    }
  }
  return undefined;
}

function findState(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const state of INDIAN_STATES) {
    const re = new RegExp(`\\b${state.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(lower)) return state;
  }
  const compact = normalizeKey(lower);
  for (const [alias, state] of Object.entries(STATE_ALIASES)) {
    if (compact.includes(alias)) return state;
  }
  return undefined;
}

export function resolveLocalAuthority(city: string, state: string): {
  localAuthority: string;
  portalUrl?: string;
} {
  const match = CITY_DIRECTORY.find(
    (c) => c.city.toLowerCase() === city.toLowerCase() && c.state.toLowerCase() === state.toLowerCase()
  );
  if (match) {
    return { localAuthority: match.localAuthority, portalUrl: match.portalUrl };
  }
  return {
    localAuthority: `Municipal / local body for ${city}, ${state}`,
    portalUrl: statePortalUrl(state),
  };
}

export function statePortalUrl(state: string): string | undefined {
  const map: Record<string, string> = {
    "Tamil Nadu": "https://www.tn.gov.in/",
    Maharashtra: "https://www.maharashtra.gov.in/",
    Karnataka: "https://www.karnataka.gov.in/",
    Delhi: "https://delhi.gov.in/",
    Telangana: "https://www.telangana.gov.in/",
    "West Bengal": "https://wb.gov.in/",
    Gujarat: "https://gujarat.gov.in/",
    Rajasthan: "https://rajasthan.gov.in/",
    Kerala: "https://www.kerala.gov.in/",
    "Uttar Pradesh": "https://up.gov.in/",
    "Madhya Pradesh": "https://www.mp.gov.in/",
    Bihar: "https://state.bihar.gov.in/",
    Odisha: "https://odisha.gov.in/",
    Assam: "https://assam.gov.in/",
    Punjab: "https://punjab.gov.in/",
    Haryana: "https://haryana.gov.in/",
    Jharkhand: "https://www.jharkhand.gov.in/",
    Chhattisgarh: "https://www.cgstate.gov.in/",
    Uttarakhand: "https://uk.gov.in/",
    "Himachal Pradesh": "https://himachal.nic.in/",
    Goa: "https://www.goa.gov.in/",
    "Andhra Pradesh": "https://www.ap.gov.in/",
  };
  return map[state];
}

export function parseIndianJurisdiction(text: string): Record<string, string> {
  const trimmed = text.trim();
  if (!trimmed) return { country: "India" };

  let city: string | undefined;
  let state: string | undefined;

  const cityEntry = findCity(trimmed);
  if (cityEntry) {
    city = cityEntry.city;
    state = cityEntry.state;
  }

  const foundState = findState(trimmed);
  if (foundState) state = foundState;

  const commaMatch = trimmed.match(/([A-Za-z][A-Za-z\s.'-]+?)\s*[,]\s*([A-Za-z][A-Za-z\s.'-]+)/);
  if (commaMatch) {
    const part1 = commaMatch[1].trim();
    const part2 = commaMatch[2].trim();
    const stateFromPart2 = findState(part2);
    const cityFromPart1 = findCity(part1);
    if (stateFromPart2) {
      state = stateFromPart2;
      if (cityFromPart1) city = cityFromPart1.city;
      else if (part1.length < 40) city = titleCase(part1);
    }
  }

  const inMatch = trimmed.match(/\bin\s+([A-Za-z][A-Za-z\s.'-]+?)(?:\s*[,.\s]|$)/i);
  if (inMatch && !city) {
    const inPlace = inMatch[1].trim();
    const inCity = findCity(inPlace);
    if (inCity) {
      city = inCity.city;
      state = inCity.state;
    } else {
      const inState = findState(inPlace);
      if (inState) state = inState;
    }
  }

  if (!city && !state && trimmed.length < 50) {
    const singleCity = findCity(trimmed);
    if (singleCity) {
      city = singleCity.city;
      state = singleCity.state;
    } else {
      const singleState = findState(trimmed);
      if (singleState) state = singleState;
      else city = titleCase(trimmed);
    }
  }

  const result: Record<string, string> = { country: "India" };
  if (city) result.city = city;
  if (state) result.state = state;

  if (city && state) {
    const resolved = resolveLocalAuthority(city, state);
    result.local_authority = resolved.localAuthority;
    result.government_level = "local";
    if (resolved.portalUrl) result.portal_url = resolved.portalUrl;
  } else if (state) {
    const portal = statePortalUrl(state);
    if (portal) result.state_portal_url = portal;
  }

  return result;
}
