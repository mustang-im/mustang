/* WindowsToIANATimezone generated from curl -s https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-core/supplemental/windowsZones.json | jq '.supplemental.windowsZones.mapTimezones | map(select(.mapZone._territory == "001")) | map({(.mapZone._other): .mapZone._type}) | add' */
/* IANAToWindowsTimezone generated from curl -s https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-core/supplemental/windowsZones.json | jq '.supplemental.windowsZones.mapTimezones | map(.mapZone._other as $other | .mapZone._type / " " | map({(.): $other})) | add | add' */

export const WindowsToIANATimezone = {
  "Afghanistan Standard Time": "Asia/Kabul",
  "Alaskan Standard Time": "America/Anchorage",
  "Aleutian Standard Time": "America/Adak",
  "Altai Standard Time": "Asia/Barnaul",
  "Arab Standard Time": "Asia/Riyadh",
  "Arabian Standard Time": "Asia/Dubai",
  "Arabic Standard Time": "Asia/Baghdad",
  "Argentina Standard Time": "America/Buenos_Aires",
  "Astrakhan Standard Time": "Europe/Astrakhan",
  "Atlantic Standard Time": "America/Halifax",
  "AUS Central Standard Time": "Australia/Darwin",
  "Aus Central W. Standard Time": "Australia/Eucla",
  "AUS Eastern Standard Time": "Australia/Sydney",
  "Azerbaijan Standard Time": "Asia/Baku",
  "Azores Standard Time": "Atlantic/Azores",
  "Bahia Standard Time": "America/Bahia",
  "Bangladesh Standard Time": "Asia/Dhaka",
  "Belarus Standard Time": "Europe/Minsk",
  "Bougainville Standard Time": "Pacific/Bougainville",
  "Canada Central Standard Time": "America/Regina",
  "Cape Verde Standard Time": "Atlantic/Cape_Verde",
  "Caucasus Standard Time": "Asia/Yerevan",
  "Cen. Australia Standard Time": "Australia/Adelaide",
  "Central America Standard Time": "America/Guatemala",
  "Central Asia Standard Time": "Asia/Bishkek",
  "Central Brazilian Standard Time": "America/Cuiaba",
  "Central Europe Standard Time": "Europe/Budapest",
  "Central European Standard Time": "Europe/Warsaw",
  "Central Pacific Standard Time": "Pacific/Guadalcanal",
  "Central Standard Time": "America/Chicago",
  "Central Standard Time (Mexico)": "America/Mexico_City",
  "Chatham Islands Standard Time": "Pacific/Chatham",
  "China Standard Time": "Asia/Shanghai",
  "Cuba Standard Time": "America/Havana",
  "Dateline Standard Time": "Etc/GMT+12",
  "E. Africa Standard Time": "Africa/Nairobi",
  "E. Australia Standard Time": "Australia/Brisbane",
  "E. Europe Standard Time": "Europe/Chisinau",
  "E. South America Standard Time": "America/Sao_Paulo",
  "Easter Island Standard Time": "Pacific/Easter",
  "Eastern Standard Time": "America/New_York",
  "Eastern Standard Time (Mexico)": "America/Cancun",
  "Egypt Standard Time": "Africa/Cairo",
  "Ekaterinburg Standard Time": "Asia/Yekaterinburg",
  "Fiji Standard Time": "Pacific/Fiji",
  "FLE Standard Time": "Europe/Kiev",
  "Georgian Standard Time": "Asia/Tbilisi",
  "GMT Standard Time": "Europe/London",
  "Greenland Standard Time": "America/Godthab",
  "Greenwich Standard Time": "Atlantic/Reykjavik",
  "GTB Standard Time": "Europe/Bucharest",
  "Haiti Standard Time": "America/Port-au-Prince",
  "Hawaiian Standard Time": "Pacific/Honolulu",
  "India Standard Time": "Asia/Calcutta",
  "Iran Standard Time": "Asia/Tehran",
  "Israel Standard Time": "Asia/Jerusalem",
  "Jordan Standard Time": "Asia/Amman",
  "Kaliningrad Standard Time": "Europe/Kaliningrad",
  "Korea Standard Time": "Asia/Seoul",
  "Libya Standard Time": "Africa/Tripoli",
  "Line Islands Standard Time": "Pacific/Kiritimati",
  "Lord Howe Standard Time": "Australia/Lord_Howe",
  "Magadan Standard Time": "Asia/Magadan",
  "Magallanes Standard Time": "America/Punta_Arenas",
  "Marquesas Standard Time": "Pacific/Marquesas",
  "Mauritius Standard Time": "Indian/Mauritius",
  "Middle East Standard Time": "Asia/Beirut",
  "Montevideo Standard Time": "America/Montevideo",
  "Morocco Standard Time": "Africa/Casablanca",
  "Mountain Standard Time": "America/Denver",
  "Mountain Standard Time (Mexico)": "America/Mazatlan",
  "Myanmar Standard Time": "Asia/Rangoon",
  "N. Central Asia Standard Time": "Asia/Novosibirsk",
  "Namibia Standard Time": "Africa/Windhoek",
  "Nepal Standard Time": "Asia/Katmandu",
  "New Zealand Standard Time": "Pacific/Auckland",
  "Newfoundland Standard Time": "America/St_Johns",
  "Norfolk Standard Time": "Pacific/Norfolk",
  "North Asia East Standard Time": "Asia/Irkutsk",
  "North Asia Standard Time": "Asia/Krasnoyarsk",
  "North Korea Standard Time": "Asia/Pyongyang",
  "Omsk Standard Time": "Asia/Omsk",
  "Pacific SA Standard Time": "America/Santiago",
  "Pacific Standard Time": "America/Los_Angeles",
  "Pacific Standard Time (Mexico)": "America/Tijuana",
  "Pakistan Standard Time": "Asia/Karachi",
  "Paraguay Standard Time": "America/Asuncion",
  "Qyzylorda Standard Time": "Asia/Qyzylorda",
  "Romance Standard Time": "Europe/Paris",
  "Russia Time Zone 3": "Europe/Samara",
  "Russia Time Zone 10": "Asia/Srednekolymsk",
  "Russia Time Zone 11": "Asia/Kamchatka",
  "Russian Standard Time": "Europe/Moscow",
  "SA Eastern Standard Time": "America/Cayenne",
  "SA Pacific Standard Time": "America/Bogota",
  "SA Western Standard Time": "America/La_Paz",
  "Saint Pierre Standard Time": "America/Miquelon",
  "Sakhalin Standard Time": "Asia/Sakhalin",
  "Samoa Standard Time": "Pacific/Apia",
  "Sao Tome Standard Time": "Africa/Sao_Tome",
  "Saratov Standard Time": "Europe/Saratov",
  "SE Asia Standard Time": "Asia/Bangkok",
  "Singapore Standard Time": "Asia/Singapore",
  "South Africa Standard Time": "Africa/Johannesburg",
  "South Sudan Standard Time": "Africa/Juba",
  "Sri Lanka Standard Time": "Asia/Colombo",
  "Sudan Standard Time": "Africa/Khartoum",
  "Syria Standard Time": "Asia/Damascus",
  "Taipei Standard Time": "Asia/Taipei",
  "Tasmania Standard Time": "Australia/Hobart",
  "Tocantins Standard Time": "America/Araguaina",
  "Tokyo Standard Time": "Asia/Tokyo",
  "Tomsk Standard Time": "Asia/Tomsk",
  "Tonga Standard Time": "Pacific/Tongatapu",
  "Transbaikal Standard Time": "Asia/Chita",
  "Turkey Standard Time": "Europe/Istanbul",
  "Turks And Caicos Standard Time": "America/Grand_Turk",
  "Ulaanbaatar Standard Time": "Asia/Ulaanbaatar",
  "US Eastern Standard Time": "America/Indianapolis",
  "US Mountain Standard Time": "America/Phoenix",
  "UTC": "Etc/UTC",
  "UTC-02": "Etc/GMT+2",
  "UTC-08": "Etc/GMT+8",
  "UTC-09": "Etc/GMT+9",
  "UTC-11": "Etc/GMT+11",
  "UTC+12": "Etc/GMT-12",
  "UTC+13": "Etc/GMT-13",
  "Venezuela Standard Time": "America/Caracas",
  "Vladivostok Standard Time": "Asia/Vladivostok",
  "Volgograd Standard Time": "Europe/Volgograd",
  "W. Australia Standard Time": "Australia/Perth",
  "W. Central Africa Standard Time": "Africa/Lagos",
  "W. Europe Standard Time": "Europe/Berlin",
  "W. Mongolia Standard Time": "Asia/Hovd",
  "West Asia Standard Time": "Asia/Tashkent",
  "West Bank Standard Time": "Asia/Hebron",
  "West Pacific Standard Time": "Pacific/Port_Moresby",
  "Yakutsk Standard Time": "Asia/Yakutsk",
  "Yukon Standard Time": "America/Whitehorse"
};

/* Generated from curl -s https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-core/supplemental/windowsZones.json | jq '.supplemental.windowsZones.mapTimezones | map(.mapZone._other as $other | .mapZone._type / " " | map({(.): $other})) | add | add' */
export const IANAToWindowsTimezone = {
  "Asia/Kabul": "Afghanistan Standard Time",
  "America/Anchorage": "Alaskan Standard Time",
  "America/Juneau": "Alaskan Standard Time",
  "America/Metlakatla": "Alaskan Standard Time",
  "America/Nome": "Alaskan Standard Time",
  "America/Sitka": "Alaskan Standard Time",
  "America/Yakutat": "Alaskan Standard Time",
  "America/Adak": "Aleutian Standard Time",
  "Asia/Barnaul": "Altai Standard Time",
  "Asia/Riyadh": "Arab Standard Time",
  "Asia/Bahrain": "Arab Standard Time",
  "Asia/Kuwait": "Arab Standard Time",
  "Asia/Qatar": "Arab Standard Time",
  "Asia/Aden": "Arab Standard Time",
  "Asia/Dubai": "Arabian Standard Time",
  "Asia/Muscat": "Arabian Standard Time",
  "Etc/GMT-4": "Arabian Standard Time",
  "Asia/Baghdad": "Arabic Standard Time",
  "America/Buenos_Aires": "Argentina Standard Time",
  "America/Argentina/La_Rioja": "Argentina Standard Time",
  "America/Argentina/Rio_Gallegos": "Argentina Standard Time",
  "America/Argentina/Salta": "Argentina Standard Time",
  "America/Argentina/San_Juan": "Argentina Standard Time",
  "America/Argentina/San_Luis": "Argentina Standard Time",
  "America/Argentina/Tucuman": "Argentina Standard Time",
  "America/Argentina/Ushuaia": "Argentina Standard Time",
  "America/Catamarca": "Argentina Standard Time",
  "America/Cordoba": "Argentina Standard Time",
  "America/Jujuy": "Argentina Standard Time",
  "America/Mendoza": "Argentina Standard Time",
  "Europe/Astrakhan": "Astrakhan Standard Time",
  "Europe/Ulyanovsk": "Astrakhan Standard Time",
  "America/Halifax": "Atlantic Standard Time",
  "Atlantic/Bermuda": "Atlantic Standard Time",
  "America/Glace_Bay": "Atlantic Standard Time",
  "America/Goose_Bay": "Atlantic Standard Time",
  "America/Moncton": "Atlantic Standard Time",
  "America/Thule": "Atlantic Standard Time",
  "Australia/Darwin": "AUS Central Standard Time",
  "Australia/Eucla": "Aus Central W. Standard Time",
  "Australia/Sydney": "AUS Eastern Standard Time",
  "Australia/Melbourne": "AUS Eastern Standard Time",
  "Asia/Baku": "Azerbaijan Standard Time",
  "Atlantic/Azores": "Azores Standard Time",
  "America/Scoresbysund": "Azores Standard Time",
  "America/Bahia": "Bahia Standard Time",
  "Asia/Dhaka": "Bangladesh Standard Time",
  "Asia/Thimphu": "Bangladesh Standard Time",
  "Europe/Minsk": "Belarus Standard Time",
  "Pacific/Bougainville": "Bougainville Standard Time",
  "America/Regina": "Canada Central Standard Time",
  "America/Swift_Current": "Canada Central Standard Time",
  "Atlantic/Cape_Verde": "Cape Verde Standard Time",
  "Etc/GMT+1": "Cape Verde Standard Time",
  "Asia/Yerevan": "Caucasus Standard Time",
  "Australia/Adelaide": "Cen. Australia Standard Time",
  "Australia/Broken_Hill": "Cen. Australia Standard Time",
  "America/Guatemala": "Central America Standard Time",
  "America/Belize": "Central America Standard Time",
  "America/Costa_Rica": "Central America Standard Time",
  "Pacific/Galapagos": "Central America Standard Time",
  "America/Tegucigalpa": "Central America Standard Time",
  "America/Managua": "Central America Standard Time",
  "America/El_Salvador": "Central America Standard Time",
  "Etc/GMT+6": "Central America Standard Time",
  "Asia/Bishkek": "Central Asia Standard Time",
  "Antarctica/Vostok": "Central Asia Standard Time",
  "Asia/Urumqi": "Central Asia Standard Time",
  "Indian/Chagos": "Central Asia Standard Time",
  "Etc/GMT-6": "Central Asia Standard Time",
  "America/Cuiaba": "Central Brazilian Standard Time",
  "America/Campo_Grande": "Central Brazilian Standard Time",
  "Europe/Budapest": "Central Europe Standard Time",
  "Europe/Tirane": "Central Europe Standard Time",
  "Europe/Prague": "Central Europe Standard Time",
  "Europe/Podgorica": "Central Europe Standard Time",
  "Europe/Belgrade": "Central Europe Standard Time",
  "Europe/Ljubljana": "Central Europe Standard Time",
  "Europe/Bratislava": "Central Europe Standard Time",
  "Europe/Warsaw": "Central European Standard Time",
  "Europe/Sarajevo": "Central European Standard Time",
  "Europe/Zagreb": "Central European Standard Time",
  "Europe/Skopje": "Central European Standard Time",
  "Pacific/Guadalcanal": "Central Pacific Standard Time",
  "Antarctica/Casey": "Central Pacific Standard Time",
  "Pacific/Ponape": "Central Pacific Standard Time",
  "Pacific/Kosrae": "Central Pacific Standard Time",
  "Pacific/Noumea": "Central Pacific Standard Time",
  "Pacific/Efate": "Central Pacific Standard Time",
  "Etc/GMT-11": "Central Pacific Standard Time",
  "America/Chicago": "Central Standard Time",
  "America/Winnipeg": "Central Standard Time",
  "America/Rankin_Inlet": "Central Standard Time",
  "America/Resolute": "Central Standard Time",
  "America/Matamoros": "Central Standard Time",
  "America/Ojinaga": "Central Standard Time",
  "America/Indiana/Knox": "Central Standard Time",
  "America/Indiana/Tell_City": "Central Standard Time",
  "America/Menominee": "Central Standard Time",
  "America/North_Dakota/Beulah": "Central Standard Time",
  "America/North_Dakota/Center": "Central Standard Time",
  "America/North_Dakota/New_Salem": "Central Standard Time",
  "America/Mexico_City": "Central Standard Time (Mexico)",
  "America/Bahia_Banderas": "Central Standard Time (Mexico)",
  "America/Merida": "Central Standard Time (Mexico)",
  "America/Monterrey": "Central Standard Time (Mexico)",
  "America/Chihuahua": "Central Standard Time (Mexico)",
  "": "Central Standard Time (Mexico)",
  "Pacific/Chatham": "Chatham Islands Standard Time",
  "Asia/Shanghai": "China Standard Time",
  "Asia/Hong_Kong": "China Standard Time",
  "Asia/Macau": "China Standard Time",
  "America/Havana": "Cuba Standard Time",
  "Etc/GMT+12": "Dateline Standard Time",
  "Africa/Nairobi": "E. Africa Standard Time",
  "Antarctica/Syowa": "E. Africa Standard Time",
  "Africa/Djibouti": "E. Africa Standard Time",
  "Africa/Asmera": "E. Africa Standard Time",
  "Africa/Addis_Ababa": "E. Africa Standard Time",
  "Indian/Comoro": "E. Africa Standard Time",
  "Indian/Antananarivo": "E. Africa Standard Time",
  "Africa/Mogadishu": "E. Africa Standard Time",
  "Africa/Dar_es_Salaam": "E. Africa Standard Time",
  "Africa/Kampala": "E. Africa Standard Time",
  "Indian/Mayotte": "E. Africa Standard Time",
  "Etc/GMT-3": "E. Africa Standard Time",
  "Australia/Brisbane": "E. Australia Standard Time",
  "Australia/Lindeman": "E. Australia Standard Time",
  "Europe/Chisinau": "E. Europe Standard Time",
  "America/Sao_Paulo": "E. South America Standard Time",
  "Pacific/Easter": "Easter Island Standard Time",
  "America/New_York": "Eastern Standard Time",
  "America/Nassau": "Eastern Standard Time",
  "America/Toronto": "Eastern Standard Time",
  "America/Iqaluit": "Eastern Standard Time",
  "America/Detroit": "Eastern Standard Time",
  "America/Indiana/Petersburg": "Eastern Standard Time",
  "America/Indiana/Vincennes": "Eastern Standard Time",
  "America/Indiana/Winamac": "Eastern Standard Time",
  "America/Kentucky/Monticello": "Eastern Standard Time",
  "America/Louisville": "Eastern Standard Time",
  "America/Cancun": "Eastern Standard Time (Mexico)",
  "Africa/Cairo": "Egypt Standard Time",
  "Asia/Yekaterinburg": "Ekaterinburg Standard Time",
  "Pacific/Fiji": "Fiji Standard Time",
  "Europe/Kiev": "FLE Standard Time",
  "Europe/Mariehamn": "FLE Standard Time",
  "Europe/Sofia": "FLE Standard Time",
  "Europe/Tallinn": "FLE Standard Time",
  "Europe/Helsinki": "FLE Standard Time",
  "Europe/Vilnius": "FLE Standard Time",
  "Europe/Riga": "FLE Standard Time",
  "Asia/Tbilisi": "Georgian Standard Time",
  "Europe/London": "GMT Standard Time",
  "Atlantic/Canary": "GMT Standard Time",
  "Atlantic/Faeroe": "GMT Standard Time",
  "Europe/Guernsey": "GMT Standard Time",
  "Europe/Dublin": "GMT Standard Time",
  "Europe/Isle_of_Man": "GMT Standard Time",
  "Europe/Jersey": "GMT Standard Time",
  "Europe/Lisbon": "GMT Standard Time",
  "Atlantic/Madeira": "GMT Standard Time",
  "America/Godthab": "Greenland Standard Time",
  "Atlantic/Reykjavik": "Greenwich Standard Time",
  "Africa/Ouagadougou": "Greenwich Standard Time",
  "Africa/Abidjan": "Greenwich Standard Time",
  "Africa/Accra": "Greenwich Standard Time",
  "America/Danmarkshavn": "Greenwich Standard Time",
  "Africa/Banjul": "Greenwich Standard Time",
  "Africa/Conakry": "Greenwich Standard Time",
  "Africa/Bissau": "Greenwich Standard Time",
  "Africa/Monrovia": "Greenwich Standard Time",
  "Africa/Bamako": "Greenwich Standard Time",
  "Africa/Nouakchott": "Greenwich Standard Time",
  "Atlantic/St_Helena": "Greenwich Standard Time",
  "Africa/Freetown": "Greenwich Standard Time",
  "Africa/Dakar": "Greenwich Standard Time",
  "Africa/Lome": "Greenwich Standard Time",
  "Europe/Bucharest": "GTB Standard Time",
  "Asia/Nicosia": "GTB Standard Time",
  "Asia/Famagusta": "GTB Standard Time",
  "Europe/Athens": "GTB Standard Time",
  "America/Port-au-Prince": "Haiti Standard Time",
  "Pacific/Honolulu": "Hawaiian Standard Time",
  "Pacific/Rarotonga": "Hawaiian Standard Time",
  "Pacific/Tahiti": "Hawaiian Standard Time",
  "Etc/GMT+10": "Hawaiian Standard Time",
  "Asia/Calcutta": "India Standard Time",
  "Asia/Tehran": "Iran Standard Time",
  "Asia/Jerusalem": "Israel Standard Time",
  "Asia/Amman": "Jordan Standard Time",
  "Europe/Kaliningrad": "Kaliningrad Standard Time",
  "Asia/Seoul": "Korea Standard Time",
  "Africa/Tripoli": "Libya Standard Time",
  "Pacific/Kiritimati": "Line Islands Standard Time",
  "Etc/GMT-14": "Line Islands Standard Time",
  "Australia/Lord_Howe": "Lord Howe Standard Time",
  "Asia/Magadan": "Magadan Standard Time",
  "America/Punta_Arenas": "Magallanes Standard Time",
  "Pacific/Marquesas": "Marquesas Standard Time",
  "Indian/Mauritius": "Mauritius Standard Time",
  "Indian/Reunion": "Mauritius Standard Time",
  "Indian/Mahe": "Mauritius Standard Time",
  "Asia/Beirut": "Middle East Standard Time",
  "America/Montevideo": "Montevideo Standard Time",
  "Africa/Casablanca": "Morocco Standard Time",
  "Africa/El_Aaiun": "Morocco Standard Time",
  "America/Denver": "Mountain Standard Time",
  "America/Edmonton": "Mountain Standard Time",
  "America/Cambridge_Bay": "Mountain Standard Time",
  "America/Inuvik": "Mountain Standard Time",
  "America/Ciudad_Juarez": "Mountain Standard Time",
  "America/Boise": "Mountain Standard Time",
  "America/Mazatlan": "Mountain Standard Time (Mexico)",
  "Asia/Rangoon": "Myanmar Standard Time",
  "Indian/Cocos": "Myanmar Standard Time",
  "Asia/Novosibirsk": "N. Central Asia Standard Time",
  "Africa/Windhoek": "Namibia Standard Time",
  "Asia/Katmandu": "Nepal Standard Time",
  "Pacific/Auckland": "New Zealand Standard Time",
  "Antarctica/McMurdo": "New Zealand Standard Time",
  "America/St_Johns": "Newfoundland Standard Time",
  "Pacific/Norfolk": "Norfolk Standard Time",
  "Asia/Irkutsk": "North Asia East Standard Time",
  "Asia/Krasnoyarsk": "North Asia Standard Time",
  "Asia/Novokuznetsk": "North Asia Standard Time",
  "Asia/Pyongyang": "North Korea Standard Time",
  "Asia/Omsk": "Omsk Standard Time",
  "America/Santiago": "Pacific SA Standard Time",
  "America/Los_Angeles": "Pacific Standard Time",
  "America/Vancouver": "Pacific Standard Time",
  "America/Tijuana": "Pacific Standard Time (Mexico)",
  "Asia/Karachi": "Pakistan Standard Time",
  "America/Asuncion": "Paraguay Standard Time",
  "Asia/Qyzylorda": "Qyzylorda Standard Time",
  "Europe/Paris": "Romance Standard Time",
  "Europe/Brussels": "Romance Standard Time",
  "Europe/Copenhagen": "Romance Standard Time",
  "Europe/Madrid": "Romance Standard Time",
  "Africa/Ceuta": "Romance Standard Time",
  "Europe/Samara": "Russia Time Zone 3",
  "Asia/Srednekolymsk": "Russia Time Zone 10",
  "Asia/Kamchatka": "Russia Time Zone 11",
  "Asia/Anadyr": "Russia Time Zone 11",
  "Europe/Moscow": "Russian Standard Time",
  "Europe/Kirov": "Russian Standard Time",
  "Europe/Simferopol": "Russian Standard Time",
  "America/Cayenne": "SA Eastern Standard Time",
  "Antarctica/Rothera": "SA Eastern Standard Time",
  "Antarctica/Palmer": "SA Eastern Standard Time",
  "America/Fortaleza": "SA Eastern Standard Time",
  "America/Belem": "SA Eastern Standard Time",
  "America/Maceio": "SA Eastern Standard Time",
  "America/Recife": "SA Eastern Standard Time",
  "America/Santarem": "SA Eastern Standard Time",
  "Atlantic/Stanley": "SA Eastern Standard Time",
  "America/Paramaribo": "SA Eastern Standard Time",
  "Etc/GMT+3": "SA Eastern Standard Time",
  "America/Bogota": "SA Pacific Standard Time",
  "America/Rio_Branco": "SA Pacific Standard Time",
  "America/Eirunepe": "SA Pacific Standard Time",
  "America/Coral_Harbour": "SA Pacific Standard Time",
  "America/Guayaquil": "SA Pacific Standard Time",
  "America/Jamaica": "SA Pacific Standard Time",
  "America/Cayman": "SA Pacific Standard Time",
  "America/Panama": "SA Pacific Standard Time",
  "America/Lima": "SA Pacific Standard Time",
  "Etc/GMT+5": "SA Pacific Standard Time",
  "America/La_Paz": "SA Western Standard Time",
  "America/Antigua": "SA Western Standard Time",
  "America/Anguilla": "SA Western Standard Time",
  "America/Aruba": "SA Western Standard Time",
  "America/Barbados": "SA Western Standard Time",
  "America/St_Barthelemy": "SA Western Standard Time",
  "America/Kralendijk": "SA Western Standard Time",
  "America/Manaus": "SA Western Standard Time",
  "America/Boa_Vista": "SA Western Standard Time",
  "America/Porto_Velho": "SA Western Standard Time",
  "America/Blanc-Sablon": "SA Western Standard Time",
  "America/Curacao": "SA Western Standard Time",
  "America/Dominica": "SA Western Standard Time",
  "America/Santo_Domingo": "SA Western Standard Time",
  "America/Grenada": "SA Western Standard Time",
  "America/Guadeloupe": "SA Western Standard Time",
  "America/Guyana": "SA Western Standard Time",
  "America/St_Kitts": "SA Western Standard Time",
  "America/St_Lucia": "SA Western Standard Time",
  "America/Marigot": "SA Western Standard Time",
  "America/Martinique": "SA Western Standard Time",
  "America/Montserrat": "SA Western Standard Time",
  "America/Puerto_Rico": "SA Western Standard Time",
  "America/Lower_Princes": "SA Western Standard Time",
  "America/Port_of_Spain": "SA Western Standard Time",
  "America/St_Vincent": "SA Western Standard Time",
  "America/Tortola": "SA Western Standard Time",
  "America/St_Thomas": "SA Western Standard Time",
  "Etc/GMT+4": "SA Western Standard Time",
  "America/Miquelon": "Saint Pierre Standard Time",
  "Asia/Sakhalin": "Sakhalin Standard Time",
  "Pacific/Apia": "Samoa Standard Time",
  "Africa/Sao_Tome": "Sao Tome Standard Time",
  "Europe/Saratov": "Saratov Standard Time",
  "Asia/Bangkok": "SE Asia Standard Time",
  "Antarctica/Davis": "SE Asia Standard Time",
  "Indian/Christmas": "SE Asia Standard Time",
  "Asia/Jakarta": "SE Asia Standard Time",
  "Asia/Pontianak": "SE Asia Standard Time",
  "Asia/Phnom_Penh": "SE Asia Standard Time",
  "Asia/Vientiane": "SE Asia Standard Time",
  "Asia/Saigon": "SE Asia Standard Time",
  "Etc/GMT-7": "SE Asia Standard Time",
  "Asia/Singapore": "Singapore Standard Time",
  "Asia/Brunei": "Singapore Standard Time",
  "Asia/Makassar": "Singapore Standard Time",
  "Asia/Kuala_Lumpur": "Singapore Standard Time",
  "Asia/Kuching": "Singapore Standard Time",
  "Asia/Manila": "Singapore Standard Time",
  "Etc/GMT-8": "Singapore Standard Time",
  "Africa/Johannesburg": "South Africa Standard Time",
  "Africa/Bujumbura": "South Africa Standard Time",
  "Africa/Gaborone": "South Africa Standard Time",
  "Africa/Lubumbashi": "South Africa Standard Time",
  "Africa/Maseru": "South Africa Standard Time",
  "Africa/Blantyre": "South Africa Standard Time",
  "Africa/Maputo": "South Africa Standard Time",
  "Africa/Kigali": "South Africa Standard Time",
  "Africa/Mbabane": "South Africa Standard Time",
  "Africa/Lusaka": "South Africa Standard Time",
  "Africa/Harare": "South Africa Standard Time",
  "Etc/GMT-2": "South Africa Standard Time",
  "Africa/Juba": "South Sudan Standard Time",
  "Asia/Colombo": "Sri Lanka Standard Time",
  "Africa/Khartoum": "Sudan Standard Time",
  "Asia/Damascus": "Syria Standard Time",
  "Asia/Taipei": "Taipei Standard Time",
  "Australia/Hobart": "Tasmania Standard Time",
  "Antarctica/Macquarie": "Tasmania Standard Time",
  "America/Araguaina": "Tocantins Standard Time",
  "Asia/Tokyo": "Tokyo Standard Time",
  "Asia/Jayapura": "Tokyo Standard Time",
  "Pacific/Palau": "Tokyo Standard Time",
  "Asia/Dili": "Tokyo Standard Time",
  "Etc/GMT-9": "Tokyo Standard Time",
  "Asia/Tomsk": "Tomsk Standard Time",
  "Pacific/Tongatapu": "Tonga Standard Time",
  "Asia/Chita": "Transbaikal Standard Time",
  "Europe/Istanbul": "Turkey Standard Time",
  "America/Grand_Turk": "Turks And Caicos Standard Time",
  "Asia/Ulaanbaatar": "Ulaanbaatar Standard Time",
  "America/Indianapolis": "US Eastern Standard Time",
  "America/Indiana/Marengo": "US Eastern Standard Time",
  "America/Indiana/Vevay": "US Eastern Standard Time",
  "America/Phoenix": "US Mountain Standard Time",
  "America/Creston": "US Mountain Standard Time",
  "America/Dawson_Creek": "US Mountain Standard Time",
  "America/Fort_Nelson": "US Mountain Standard Time",
  "America/Hermosillo": "US Mountain Standard Time",
  "Etc/GMT+7": "US Mountain Standard Time",
  "Etc/UTC": "UTC",
  "Etc/GMT": "UTC",
  "Etc/GMT+2": "UTC-02",
  "America/Noronha": "UTC-02",
  "Atlantic/South_Georgia": "UTC-02",
  "Etc/GMT+8": "UTC-08",
  "Pacific/Pitcairn": "UTC-08",
  "Etc/GMT+9": "UTC-09",
  "Pacific/Gambier": "UTC-09",
  "Etc/GMT+11": "UTC-11",
  "Pacific/Pago_Pago": "UTC-11",
  "Pacific/Niue": "UTC-11",
  "Pacific/Midway": "UTC-11",
  "Etc/GMT-12": "UTC+12",
  "Pacific/Tarawa": "UTC+12",
  "Pacific/Majuro": "UTC+12",
  "Pacific/Kwajalein": "UTC+12",
  "Pacific/Nauru": "UTC+12",
  "Pacific/Funafuti": "UTC+12",
  "Pacific/Wake": "UTC+12",
  "Pacific/Wallis": "UTC+12",
  "Etc/GMT-13": "UTC+13",
  "Pacific/Enderbury": "UTC+13",
  "Pacific/Fakaofo": "UTC+13",
  "America/Caracas": "Venezuela Standard Time",
  "Asia/Vladivostok": "Vladivostok Standard Time",
  "Asia/Ust-Nera": "Vladivostok Standard Time",
  "Europe/Volgograd": "Volgograd Standard Time",
  "Australia/Perth": "W. Australia Standard Time",
  "Africa/Lagos": "W. Central Africa Standard Time",
  "Africa/Luanda": "W. Central Africa Standard Time",
  "Africa/Porto-Novo": "W. Central Africa Standard Time",
  "Africa/Kinshasa": "W. Central Africa Standard Time",
  "Africa/Bangui": "W. Central Africa Standard Time",
  "Africa/Brazzaville": "W. Central Africa Standard Time",
  "Africa/Douala": "W. Central Africa Standard Time",
  "Africa/Algiers": "W. Central Africa Standard Time",
  "Africa/Libreville": "W. Central Africa Standard Time",
  "Africa/Malabo": "W. Central Africa Standard Time",
  "Africa/Niamey": "W. Central Africa Standard Time",
  "Africa/Ndjamena": "W. Central Africa Standard Time",
  "Africa/Tunis": "W. Central Africa Standard Time",
  "Etc/GMT-1": "W. Central Africa Standard Time",
  "Europe/Berlin": "W. Europe Standard Time",
  "Europe/Andorra": "W. Europe Standard Time",
  "Europe/Vienna": "W. Europe Standard Time",
  "Europe/Zurich": "W. Europe Standard Time",
  "Europe/Busingen": "W. Europe Standard Time",
  "Europe/Gibraltar": "W. Europe Standard Time",
  "Europe/Rome": "W. Europe Standard Time",
  "Europe/Vaduz": "W. Europe Standard Time",
  "Europe/Luxembourg": "W. Europe Standard Time",
  "Europe/Monaco": "W. Europe Standard Time",
  "Europe/Malta": "W. Europe Standard Time",
  "Europe/Amsterdam": "W. Europe Standard Time",
  "Europe/Oslo": "W. Europe Standard Time",
  "Europe/Stockholm": "W. Europe Standard Time",
  "Arctic/Longyearbyen": "W. Europe Standard Time",
  "Europe/San_Marino": "W. Europe Standard Time",
  "Europe/Vatican": "W. Europe Standard Time",
  "Asia/Hovd": "W. Mongolia Standard Time",
  "Asia/Tashkent": "West Asia Standard Time",
  "Antarctica/Mawson": "West Asia Standard Time",
  "Asia/Oral": "West Asia Standard Time",
  "Asia/Almaty": "West Asia Standard Time",
  "Asia/Aqtau": "West Asia Standard Time",
  "Asia/Aqtobe": "West Asia Standard Time",
  "Asia/Atyrau": "West Asia Standard Time",
  "Asia/Qostanay": "West Asia Standard Time",
  "Indian/Maldives": "West Asia Standard Time",
  "Indian/Kerguelen": "West Asia Standard Time",
  "Asia/Dushanbe": "West Asia Standard Time",
  "Asia/Ashgabat": "West Asia Standard Time",
  "Asia/Samarkand": "West Asia Standard Time",
  "Etc/GMT-5": "West Asia Standard Time",
  "Asia/Hebron": "West Bank Standard Time",
  "Asia/Gaza": "West Bank Standard Time",
  "Pacific/Port_Moresby": "West Pacific Standard Time",
  "Antarctica/DumontDUrville": "West Pacific Standard Time",
  "Pacific/Truk": "West Pacific Standard Time",
  "Pacific/Guam": "West Pacific Standard Time",
  "Pacific/Saipan": "West Pacific Standard Time",
  "Etc/GMT-10": "West Pacific Standard Time",
  "Asia/Yakutsk": "Yakutsk Standard Time",
  "Asia/Khandyga": "Yakutsk Standard Time",
  "America/Whitehorse": "Yukon Standard Time",
  "America/Dawson": "Yukon Standard Time"
};
