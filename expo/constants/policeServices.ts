export type PoliceService = {
  id: string;
  name: string;
  city: string;
  province: 'ON';
  lat: number;
  lng: number;
  website?: string;
};

// Core Ontario police services (representative list; can be expanded via admin if needed)
export const ONTARIO_POLICE_SERVICES: PoliceService[] = [
  { id: 'tps', name: 'Toronto Police Service', city: 'Toronto', province: 'ON', lat: 43.6532, lng: -79.3832, website: 'https://www.torontopolice.on.ca/careers/' },
  { id: 'prp', name: 'Peel Regional Police', city: 'Mississauga/Brampton', province: 'ON', lat: 43.5890, lng: -79.6441, website: 'https://www.peelpolice.ca/en/careers/careers.aspx' },
  { id: 'yrp', name: 'York Regional Police', city: 'Aurora', province: 'ON', lat: 44.0065, lng: -79.4504, website: 'https://www.yrp.ca/en/careers-and-opportunities/police-constable.aspx' },
  { id: 'drps', name: 'Durham Regional Police Service', city: 'Whitby', province: 'ON', lat: 43.8971, lng: -78.9429, website: 'https://www.drps.ca/careers/' },
  { id: 'hrps', name: 'Halton Regional Police Service', city: 'Oakville', province: 'ON', lat: 43.4675, lng: -79.6877, website: 'https://www.haltonpolice.ca/en/careers/careers.aspx' },
  { id: 'hps', name: 'Hamilton Police Service', city: 'Hamilton', province: 'ON', lat: 43.2557, lng: -79.8711, website: 'https://hamiltonpolice.on.ca/join-us' },
  { id: 'wrps', name: 'Waterloo Regional Police Service', city: 'Waterloo Region', province: 'ON', lat: 43.4643, lng: -80.5204, website: 'https://www.wrps.on.ca/en/careers/police-constable-recruitment.aspx' },
  { id: 'nrps', name: 'Niagara Regional Police Service', city: 'Niagara', province: 'ON', lat: 43.1594, lng: -79.2469, website: 'https://www.niagarapolice.ca/en/careers/careers.aspx' },
  { id: 'ops', name: 'Ottawa Police Service', city: 'Ottawa', province: 'ON', lat: 45.4215, lng: -75.6972, website: 'https://www.ottawapolice.ca/en/careers-and-opportunities/civilian-and-police-jobs.aspx' },
  { id: 'opp', name: 'Ontario Provincial Police', city: 'Orillia (HQ) / Province-wide', province: 'ON', lat: 44.6080, lng: -79.4194, website: 'https://www.opp.ca/careers' },
  { id: 'lps', name: 'London Police Service', city: 'London', province: 'ON', lat: 42.9849, lng: -81.2453, website: 'https://www.londonpolice.ca/en/careers/careers.aspx' },
  { id: 'gps', name: 'Guelph Police Service', city: 'Guelph', province: 'ON', lat: 43.5448, lng: -80.2482, website: 'https://www.guelphpolice.ca/en/careers/careers.aspx' },
  { id: 'wbps', name: 'Windsor Police Service', city: 'Windsor', province: 'ON', lat: 42.3149, lng: -83.0364, website: 'https://www.police.windsor.on.ca/careers/' },
  { id: 'kps', name: 'Kingston Police Service', city: 'Kingston', province: 'ON', lat: 44.2312, lng: -76.4860, website: 'https://www.careers.kpf.ca/' },
  { id: 'sps', name: 'Sudbury Police Service', city: 'Greater Sudbury', province: 'ON', lat: 46.4917, lng: -80.9930, website: 'https://www.gsps.ca/en/careers/careers.aspx' },
  { id: 'tbps', name: 'Thunder Bay Police Service', city: 'Thunder Bay', province: 'ON', lat: 48.3809, lng: -89.2477, website: 'https://thunderbaypolice.ca/careers' },
];

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371; // km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const x = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * y;
}




