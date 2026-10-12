'use strict';
// ═══════════════════════════════════════════════════════════════════
// World map counters (admin Traffic › World). Pure: no I/O, no clock of its
// own; proxy.js keeps the numbers in visits.json, next to the daily traffic
// buckets, and scripts/test-geo-stats.mjs drives this module directly.
//
// Where does a visit come from? The browser already knows its own time zone
// (Intl…resolvedOptions().timeZone, e.g. "Europe/Paris") and sends it with
// the anonymous /__visit ping. The proxy turns it into a country with the
// closed table below and keeps only per-country totals. No IP address is
// read, no GeoIP database is shipped, and a zone that is not in the table
// (a typo, "Etc/GMT+3", "UTC") lands in the "ZZ" bucket (Unknown), so the
// stored key set can never grow past the table.
//
// It is an approximation by design: a VPN does not change the time zone,
// but a traveller's laptop does, and a zone shared by several countries
// counts for the one the tz database lists first (Europe/Zurich → CH,
// never LI). Good enough for "where are our players", which is the question.
//
// Table generated from countries-and-timezones (tz database, deprecated
// aliases included: browsers still report Asia/Calcutta, Europe/Kiev…).
// One line per ISO 3166-1 alpha-2 code, zones separated by spaces.
// ═══════════════════════════════════════════════════════════════════

const ZONES_BY_COUNTRY = {
  AD: "Europe/Andorra",
  AE: "Asia/Dubai",
  AF: "Asia/Kabul",
  AG: "America/Antigua",
  AI: "America/Anguilla",
  AL: "Europe/Tirane",
  AM: "Asia/Yerevan",
  AO: "Africa/Luanda",
  AQ: "Antarctica/Casey Antarctica/Davis Antarctica/DumontDUrville Antarctica/Mawson Antarctica/McMurdo Antarctica/Palmer Antarctica/Rothera Antarctica/South_Pole Antarctica/Syowa Antarctica/Troll Antarctica/Vostok",
  AR: "America/Argentina/Buenos_Aires America/Argentina/Catamarca America/Argentina/ComodRivadavia America/Argentina/Cordoba America/Argentina/Jujuy America/Argentina/La_Rioja America/Argentina/Mendoza America/Argentina/Rio_Gallegos America/Argentina/Salta America/Argentina/San_Juan America/Argentina/San_Luis America/Argentina/Tucuman America/Argentina/Ushuaia America/Buenos_Aires America/Catamarca America/Cordoba America/Jujuy America/Mendoza America/Rosario",
  AS: "Pacific/Pago_Pago Pacific/Samoa US/Samoa",
  AT: "Europe/Vienna",
  AU: "Antarctica/Macquarie Australia/ACT Australia/Adelaide Australia/Brisbane Australia/Broken_Hill Australia/Canberra Australia/Currie Australia/Darwin Australia/Eucla Australia/Hobart Australia/LHI Australia/Lindeman Australia/Lord_Howe Australia/Melbourne Australia/NSW Australia/North Australia/Perth Australia/Queensland Australia/South Australia/Sydney Australia/Tasmania Australia/Victoria Australia/West Australia/Yancowinna",
  AW: "America/Aruba",
  AX: "Europe/Mariehamn",
  AZ: "Asia/Baku",
  BA: "Europe/Sarajevo",
  BB: "America/Barbados",
  BD: "Asia/Dacca Asia/Dhaka",
  BE: "CET Europe/Brussels MET",
  BF: "Africa/Ouagadougou",
  BG: "Europe/Sofia",
  BH: "Asia/Bahrain",
  BI: "Africa/Bujumbura",
  BJ: "Africa/Porto-Novo",
  BL: "America/St_Barthelemy",
  BM: "Atlantic/Bermuda",
  BN: "Asia/Brunei",
  BO: "America/La_Paz",
  BQ: "America/Kralendijk",
  BR: "America/Araguaina America/Bahia America/Belem America/Boa_Vista America/Campo_Grande America/Cuiaba America/Eirunepe America/Fortaleza America/Maceio America/Manaus America/Noronha America/Porto_Acre America/Porto_Velho America/Recife America/Rio_Branco America/Santarem America/Sao_Paulo Brazil/Acre Brazil/DeNoronha Brazil/East Brazil/West",
  BS: "America/Nassau",
  BT: "Asia/Thimbu Asia/Thimphu",
  BW: "Africa/Gaborone",
  BY: "Europe/Minsk",
  BZ: "America/Belize",
  CA: "America/Atikokan America/Blanc-Sablon America/Cambridge_Bay America/Coral_Harbour America/Creston America/Dawson America/Dawson_Creek America/Edmonton America/Fort_Nelson America/Glace_Bay America/Goose_Bay America/Halifax America/Inuvik America/Iqaluit America/Moncton America/Montreal America/Nipigon America/Pangnirtung America/Rainy_River America/Rankin_Inlet America/Regina America/Resolute America/St_Johns America/Swift_Current America/Thunder_Bay America/Toronto America/Vancouver America/Whitehorse America/Winnipeg America/Yellowknife Canada/Atlantic Canada/Central Canada/Eastern Canada/Mountain Canada/Newfoundland Canada/Pacific Canada/Saskatchewan Canada/Yukon",
  CC: "Indian/Cocos",
  CD: "Africa/Kinshasa Africa/Lubumbashi",
  CF: "Africa/Bangui",
  CG: "Africa/Brazzaville",
  CH: "Europe/Zurich",
  CI: "Africa/Abidjan",
  CK: "Pacific/Rarotonga",
  CL: "America/Coyhaique America/Punta_Arenas America/Santiago Chile/Continental Chile/EasterIsland Pacific/Easter",
  CM: "Africa/Douala",
  CN: "Asia/Chongqing Asia/Chungking Asia/Harbin Asia/Kashgar Asia/Shanghai Asia/Urumqi PRC",
  CO: "America/Bogota",
  CR: "America/Costa_Rica",
  CU: "America/Havana Cuba",
  CV: "Atlantic/Cape_Verde",
  CW: "America/Curacao",
  CX: "Indian/Christmas",
  CY: "Asia/Famagusta Asia/Nicosia Europe/Nicosia",
  CZ: "Europe/Prague",
  DE: "Europe/Berlin Europe/Busingen",
  DJ: "Africa/Djibouti",
  DK: "Europe/Copenhagen",
  DM: "America/Dominica",
  DO: "America/Santo_Domingo",
  DZ: "Africa/Algiers",
  EC: "America/Guayaquil Pacific/Galapagos",
  EE: "Europe/Tallinn",
  EG: "Africa/Cairo Egypt",
  EH: "Africa/El_Aaiun",
  ER: "Africa/Asmara Africa/Asmera",
  ES: "Africa/Ceuta Atlantic/Canary Europe/Madrid",
  ET: "Africa/Addis_Ababa",
  FI: "Europe/Helsinki",
  FJ: "Pacific/Fiji",
  FK: "Atlantic/Stanley",
  FM: "Pacific/Chuuk Pacific/Kosrae Pacific/Pohnpei Pacific/Ponape Pacific/Truk Pacific/Yap",
  FO: "Atlantic/Faeroe Atlantic/Faroe",
  FR: "Europe/Paris",
  GA: "Africa/Libreville",
  GB: "Europe/Belfast Europe/London GB GB-Eire",
  GD: "America/Grenada",
  GE: "Asia/Tbilisi",
  GF: "America/Cayenne",
  GG: "Europe/Guernsey",
  GH: "Africa/Accra",
  GI: "Europe/Gibraltar",
  GL: "America/Danmarkshavn America/Godthab America/Nuuk America/Scoresbysund America/Thule",
  GM: "Africa/Banjul",
  GN: "Africa/Conakry",
  GP: "America/Guadeloupe",
  GQ: "Africa/Malabo",
  GR: "EET Europe/Athens",
  GS: "Atlantic/South_Georgia",
  GT: "America/Guatemala",
  GU: "Pacific/Guam",
  GW: "Africa/Bissau",
  GY: "America/Guyana",
  HK: "Asia/Hong_Kong Hongkong",
  HN: "America/Tegucigalpa",
  HR: "Europe/Zagreb",
  HT: "America/Port-au-Prince",
  HU: "Europe/Budapest",
  ID: "Asia/Jakarta Asia/Jayapura Asia/Makassar Asia/Pontianak Asia/Ujung_Pandang",
  IE: "Eire Europe/Dublin",
  IL: "Asia/Jerusalem Asia/Tel_Aviv Israel",
  IM: "Europe/Isle_of_Man",
  IN: "Asia/Calcutta Asia/Kolkata",
  IO: "Indian/Chagos",
  IQ: "Asia/Baghdad",
  IR: "Asia/Tehran Iran",
  IS: "Atlantic/Reykjavik Iceland",
  IT: "Europe/Rome",
  JE: "Europe/Jersey",
  JM: "America/Jamaica Jamaica",
  JO: "Asia/Amman",
  JP: "Asia/Tokyo Japan",
  KE: "Africa/Nairobi",
  KG: "Asia/Bishkek",
  KH: "Asia/Phnom_Penh",
  KI: "Pacific/Enderbury Pacific/Kanton Pacific/Kiritimati Pacific/Tarawa",
  KM: "Indian/Comoro",
  KN: "America/St_Kitts",
  KP: "Asia/Pyongyang",
  KR: "Asia/Seoul ROK",
  KW: "Asia/Kuwait",
  KY: "America/Cayman",
  KZ: "Asia/Almaty Asia/Aqtau Asia/Aqtobe Asia/Atyrau Asia/Oral Asia/Qostanay Asia/Qyzylorda",
  LA: "Asia/Vientiane",
  LB: "Asia/Beirut",
  LC: "America/St_Lucia",
  LI: "Europe/Vaduz",
  LK: "Asia/Colombo",
  LR: "Africa/Monrovia",
  LS: "Africa/Maseru",
  LT: "Europe/Vilnius",
  LU: "Europe/Luxembourg",
  LV: "Europe/Riga",
  LY: "Africa/Tripoli Libya",
  MA: "Africa/Casablanca",
  MC: "Europe/Monaco",
  MD: "Europe/Chisinau Europe/Tiraspol",
  ME: "Europe/Podgorica",
  MF: "America/Marigot",
  MG: "Indian/Antananarivo",
  MH: "Kwajalein Pacific/Kwajalein Pacific/Majuro",
  MK: "Europe/Skopje",
  ML: "Africa/Bamako Africa/Timbuktu",
  MM: "Asia/Rangoon Asia/Yangon",
  MN: "Asia/Choibalsan Asia/Hovd Asia/Ulaanbaatar Asia/Ulan_Bator",
  MO: "Asia/Macao Asia/Macau",
  MP: "Pacific/Saipan",
  MQ: "America/Martinique",
  MR: "Africa/Nouakchott",
  MS: "America/Montserrat",
  MT: "Europe/Malta",
  MU: "Indian/Mauritius",
  MV: "Indian/Maldives",
  MW: "Africa/Blantyre",
  MX: "America/Bahia_Banderas America/Cancun America/Chihuahua America/Ciudad_Juarez America/Ensenada America/Hermosillo America/Matamoros America/Mazatlan America/Merida America/Mexico_City America/Monterrey America/Ojinaga America/Santa_Isabel America/Tijuana Mexico/BajaNorte Mexico/BajaSur Mexico/General",
  MY: "Asia/Kuala_Lumpur Asia/Kuching",
  MZ: "Africa/Maputo",
  NA: "Africa/Windhoek",
  NC: "Pacific/Noumea",
  NE: "Africa/Niamey",
  NF: "Pacific/Norfolk",
  NG: "Africa/Lagos",
  NI: "America/Managua",
  NL: "Europe/Amsterdam",
  NO: "Europe/Oslo",
  NP: "Asia/Kathmandu Asia/Katmandu",
  NR: "Pacific/Nauru",
  NU: "Pacific/Niue",
  NZ: "NZ NZ-CHAT Pacific/Auckland Pacific/Chatham",
  OM: "Asia/Muscat",
  PA: "America/Panama EST",
  PE: "America/Lima",
  PF: "Pacific/Gambier Pacific/Marquesas Pacific/Tahiti",
  PG: "Pacific/Bougainville Pacific/Port_Moresby",
  PH: "Asia/Manila",
  PK: "Asia/Karachi",
  PL: "Europe/Warsaw Poland",
  PM: "America/Miquelon",
  PN: "Pacific/Pitcairn",
  PR: "America/Puerto_Rico",
  PS: "Asia/Gaza Asia/Hebron",
  PT: "Atlantic/Azores Atlantic/Madeira Europe/Lisbon Portugal WET",
  PW: "Pacific/Palau",
  PY: "America/Asuncion",
  QA: "Asia/Qatar",
  RE: "Indian/Reunion",
  RO: "Europe/Bucharest",
  RS: "Europe/Belgrade",
  RU: "Asia/Anadyr Asia/Barnaul Asia/Chita Asia/Irkutsk Asia/Kamchatka Asia/Khandyga Asia/Krasnoyarsk Asia/Magadan Asia/Novokuznetsk Asia/Novosibirsk Asia/Omsk Asia/Sakhalin Asia/Srednekolymsk Asia/Tomsk Asia/Ust-Nera Asia/Vladivostok Asia/Yakutsk Asia/Yekaterinburg Europe/Astrakhan Europe/Kaliningrad Europe/Kirov Europe/Moscow Europe/Samara Europe/Saratov Europe/Simferopol Europe/Ulyanovsk Europe/Volgograd W-SU",
  RW: "Africa/Kigali",
  SA: "Asia/Riyadh",
  SB: "Pacific/Guadalcanal",
  SC: "Indian/Mahe",
  SD: "Africa/Khartoum",
  SE: "Europe/Stockholm",
  SG: "Asia/Singapore Singapore",
  SH: "Atlantic/St_Helena",
  SI: "Europe/Ljubljana",
  SJ: "Arctic/Longyearbyen Atlantic/Jan_Mayen",
  SK: "Europe/Bratislava",
  SL: "Africa/Freetown",
  SM: "Europe/San_Marino",
  SN: "Africa/Dakar",
  SO: "Africa/Mogadishu",
  SR: "America/Paramaribo",
  SS: "Africa/Juba",
  ST: "Africa/Sao_Tome",
  SV: "America/El_Salvador",
  SX: "America/Lower_Princes",
  SY: "Asia/Damascus",
  SZ: "Africa/Mbabane",
  TC: "America/Grand_Turk",
  TD: "Africa/Ndjamena",
  TF: "Indian/Kerguelen",
  TG: "Africa/Lome",
  TH: "Asia/Bangkok",
  TJ: "Asia/Dushanbe",
  TK: "Pacific/Fakaofo",
  TL: "Asia/Dili",
  TM: "Asia/Ashgabat Asia/Ashkhabad",
  TN: "Africa/Tunis",
  TO: "Pacific/Tongatapu",
  TR: "Asia/Istanbul Europe/Istanbul Turkey",
  TT: "America/Port_of_Spain",
  TV: "Pacific/Funafuti",
  TW: "Asia/Taipei ROC",
  TZ: "Africa/Dar_es_Salaam",
  UA: "Europe/Kiev Europe/Kyiv Europe/Uzhgorod Europe/Zaporozhye",
  UG: "Africa/Kampala",
  UM: "Pacific/Johnston Pacific/Midway Pacific/Wake",
  US: "America/Adak America/Anchorage America/Atka America/Boise America/Chicago America/Denver America/Detroit America/Fort_Wayne America/Indiana/Indianapolis America/Indiana/Knox America/Indiana/Marengo America/Indiana/Petersburg America/Indiana/Tell_City America/Indiana/Vevay America/Indiana/Vincennes America/Indiana/Winamac America/Indianapolis America/Juneau America/Kentucky/Louisville America/Kentucky/Monticello America/Knox_IN America/Los_Angeles America/Louisville America/Menominee America/Metlakatla America/New_York America/Nome America/North_Dakota/Beulah America/North_Dakota/Center America/North_Dakota/New_Salem America/Phoenix America/Shiprock America/Sitka America/Yakutat CST6CDT EST5EDT HST MST MST7MDT Navajo PST8PDT Pacific/Honolulu US/Alaska US/Aleutian US/Arizona US/Central US/East-Indiana US/Eastern US/Hawaii US/Indiana-Starke US/Michigan US/Mountain US/Pacific",
  UY: "America/Montevideo",
  UZ: "Asia/Samarkand Asia/Tashkent",
  VA: "Europe/Vatican",
  VC: "America/St_Vincent",
  VE: "America/Caracas",
  VG: "America/Tortola",
  VI: "America/St_Thomas America/Virgin",
  VN: "Asia/Ho_Chi_Minh Asia/Saigon",
  VU: "Pacific/Efate",
  WF: "Pacific/Wallis",
  WS: "Pacific/Apia",
  YE: "Asia/Aden",
  YT: "Indian/Mayotte",
  ZA: "Africa/Johannesburg",
  ZM: "Africa/Lusaka",
  ZW: "Africa/Harare",
};

const TZ_COUNTRY = (function () {
  const out = Object.create(null);
  for (const cc in ZONES_BY_COUNTRY) {
    for (const z of ZONES_BY_COUNTRY[cc].split(' ')) out[z] = cc;
  }
  return Object.freeze(out);
})();

const UNKNOWN = 'ZZ';
const MODES = Object.freeze(['pokerthnet', 'lan', 'offline', 'live']);
// Per-country fields of a visit ping: visits, first visits of a device,
// installed PWA, phone or tablet. Mode connects are kept under `m`.
const FIELDS = Object.freeze(['v', 'nw', 'pwa', 'mob']);

// Country of an IANA zone name, or UNKNOWN. Never throws.
function countryOfTz(tz) {
  if (typeof tz !== 'string' || tz.length === 0 || tz.length > 64) return UNKNOWN;
  return TZ_COUNTRY[tz] || UNKNOWN;
}

function _cell(g, cc) {
  let c = g[cc];
  if (!c) c = g[cc] = {};
  return c;
}

// One visit ping. `ev` = { nw:bool, pwa:bool, mob:bool }.
function addVisit(g, cc, ev) {
  const c = _cell(g, cc);
  c.v = (c.v || 0) + 1;
  if (ev && ev.nw) c.nw = (c.nw || 0) + 1;
  if (ev && ev.pwa) c.pwa = (c.pwa || 0) + 1;
  if (ev && ev.mob) c.mob = (c.mob || 0) + 1;
  return g;
}

// One entry-mode connect (first connect of a session to that mode).
function addMode(g, cc, mode) {
  if (MODES.indexOf(mode) < 0) return g;
  const c = _cell(g, cc);
  if (!c.m) c.m = {};
  c.m[mode] = (c.m[mode] || 0) + 1;
  return g;
}

// dst += src, both { cc: { v, nw, pwa, mob, m:{mode:n} } }. Only known
// fields and modes are copied, so a hand-edited visits.json cannot inject
// anything into the dashboard.
function merge(dst, src) {
  if (!src) return dst;
  for (const cc in src) {
    if (!/^[A-Z]{2}$/.test(cc)) continue;
    const s = src[cc]; if (!s) continue;
    const d = _cell(dst, cc);
    for (const f of FIELDS) if (s[f]) d[f] = (d[f] || 0) + s[f];
    if (s.m) {
      for (const md of MODES) if (s.m[md]) {
        if (!d.m) d.m = {};
        d.m[md] = (d.m[md] || 0) + s.m[md];
      }
    }
  }
  return dst;
}

// Every country code the table can produce, UNKNOWN included.
function knownCountries() {
  return Object.keys(ZONES_BY_COUNTRY).concat([UNKNOWN]);
}

module.exports = { countryOfTz, addVisit, addMode, merge, knownCountries, UNKNOWN, MODES, FIELDS, TZ_COUNTRY };
