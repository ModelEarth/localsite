// Earth Filters: the earth.nullschool.net #menu and its date and settings modals as a control any page can embed.
// The filters read and write the nullschool #hash (current/wind/surface/level/overlay=temp/orthographic=-67.66,31.71,913),
// so a page can send the choices to a nullschool iframe.
// Usage: var filters = EarthFilters.create(element, {hash: '...', onChange: function(hash, filters) {...}});
//        filters.setHash(hash) shows the filters for a hash that changed elsewhere, such as a time slider.
(function(window) {

var earthFiltersSiteUrl = 'https://earth.nullschool.net/';
var earthFiltersDefaultHash = 'current/wind/surface/level/orthographic=-67.66,31.71,913';
var earthFiltersFirstYear = 2013;
var earthFiltersStepHours = 3;

var earthFiltersModes = [
  {name: 'air', label: 'Air', title: 'Air Mode'},
  {name: 'ocean', label: 'Ocean', title: 'Ocean Mode'},
  {name: 'chem', label: 'Chem', title: 'Atmospheric Chemistry Mode'},
  {name: 'particulates', label: 'Particulates', title: 'Particulates Mode'},
  {name: 'space', label: 'Space', title: 'Space Weather Mode'},
  {name: 'bio', label: 'Bio', title: 'Biology Mode'}
];

var earthFiltersAnimations = [
  {name: 'wind', label: 'Wind', title: 'Wind Animation'},
  {name: 'currents', label: 'Currents', title: 'Ocean Surface Currents Animation'},
  {name: 'primary_waves', label: 'Waves', title: 'Peak Wave Period Animation'}
];

var earthFiltersHeights = [
  {name: 'surface', label: 'Sfc', title: 'Surface'},
  {name: '1000hPa', label: '1000', title: '1000 hectopascals'},
  {name: '850hPa', label: '850', title: '850 hectopascals'},
  {name: '700hPa', label: '700', title: '700 hectopascals'},
  {name: '500hPa', label: '500', title: '500 hectopascals'},
  {name: '250hPa', label: '250', title: '250 hectopascals'},
  {name: '70hPa', label: '70', title: '70 hectopascals'},
  {name: '10hPa', label: '10', title: '10 hectopascals'}
];

// Overlays offered for each mode, in the order of the nullschool menu
var earthFiltersOverlays = {
  air: [
    {name: 'wind', label: 'Wind', title: 'Wind Speed'},
    {name: 'temp', label: 'Temp', title: 'Temperature'},
    {name: 'relative_humidity', label: 'RH', title: 'Relative Humidity'},
    {name: 'dew_point_temp', label: 'Dew', title: 'Dew Point Temperature'},
    {name: 'wet_bulb_temp', label: 'WBT', title: 'Wet Bulb Temperature'},
    {name: 'precip_3hr', label: '3HPA', title: '3-hour Precipitation Accumulation'},
    {name: 'cape', label: 'CAPE', title: 'Convective Available Potential Energy from Surface'},
    {name: 'total_precipitable_water', label: 'TPW', title: 'Total Precipitable Water'},
    {name: 'total_cloud_water', label: 'TCW', title: 'Total Cloud Water'},
    {name: 'mean_sea_level_pressure', label: 'MSLP', title: 'Mean Sea Level Pressure'},
    {name: 'misery_index', label: 'MI', title: 'Misery Index'},
    {name: 'uv_index', label: 'UVI', title: 'Ultraviolet Index and Erythemal Dose Rate'},
    {name: 'wind_power_density', label: 'WPD', title: 'Instantaneous Wind Power Density'},
    {name: 'none', label: 'None', title: 'No Overlay'}
  ],
  ocean: [
    {name: 'currents', label: 'Currents', title: 'Ocean Currents'},
    {name: 'primary_waves', label: 'Waves', title: 'Peak Wave Period'},
    {name: 'significant_wave_height', label: 'HTSGW', title: 'Significant Wave Height'},
    {name: 'sea_surface_temp', label: 'SST', title: 'Sea Surface Temperature'},
    {name: 'sea_surface_temp_anomaly', label: 'SSTA', title: 'Sea Surface Temperature Anomaly'},
    {name: 'bleaching_alert_area', label: 'BAA', title: 'Bleaching Alert Area'},
    {name: 'none', label: 'None', title: 'No Overlay'}
  ],
  chem: [
    {name: 'cosc', label: 'COsc', title: 'Carbon Monoxide Surface Concentration'},
    {name: 'co2sc', label: 'CO<sub>2</sub>sc', title: 'Carbon Dioxide Surface Concentration'},
    {name: 'so2smass', label: 'SO<sub>2</sub>sm', title: 'Sulfur Dioxide Surface Mass'},
    {name: 'no2', label: 'NO<sub>2</sub>', title: 'Nitrogen Dioxide'}
  ],
  particulates: [
    {name: 'duexttau', label: 'DUex', title: 'Dust Extinction (Aerosol Optical Thickness, 550 nm)'},
    {name: 'pm1', label: 'PM<sub>1</sub>', title: 'Particulate Matter < 1 µm'},
    {name: 'pm2.5', label: 'PM<sub>2.5</sub>', title: 'Particulate Matter < 2.5 µm'},
    {name: 'pm10', label: 'PM<sub>10</sub>', title: 'Particulate Matter < 10 µm'},
    {name: 'organic_matter_aot', label: 'OMaot', title: 'Organic Matter Aerosol Optical Thickness (550 nm)'},
    {name: 'suexttau', label: 'SO<sub>4</sub>ex', title: 'Sulfate Extinction (Aerosol Optical Thickness, 550 nm)'}
  ],
  space: [
    {name: 'aurora', label: 'Aurora', title: 'Probability of Visible Aurora'}
  ],
  bio: [
    {name: 'bleaching_alert_area', label: 'BAA', title: 'Bleaching Alert Area'},
    {name: 'none', label: 'None', title: 'No Overlay'}
  ]
};

// Data sources, as the nullschool menu's Source row shows them
var earthFiltersSources = {
  gfs: 'GFS / NCEP / US National Weather Service',
  gfsNullschool: 'GFS / NCEP / US National Weather Service + Nullschool Technologies',
  cpc: 'CPC / NCEP / US National Weather Service',
  cmems: 'Global Ocean Physics Analysis and Forecast / CMEMS',
  oscar: 'OSCAR v2.0 / Earth & Space Research',
  wavewatch: 'WAVEWATCH III / NCEP / NWS',
  ostia: 'OSTIA / UK Met Office + GHRSST + CMEMS',
  oisst: 'OI SST V2.1 / PSL / NOAA',
  rtgsst: 'RTG-SST / NCEP / US National Weather Service',
  coralReefWatch: 'Coral Reef Watch / NOAA',
  geos: 'GEOS-5 / GMAO / NASA',
  cams: 'CAMS / Copernicus / European Commission + ECMWF',
  ovation: 'OVATION / SWPC / NCEP / NWS / NOAA'
};

// Sources and details for the Overlays tab (about). The heights and units are the ones the nullschool site script offers for each overlay.
var earthFiltersOverlayDetails = {
  wind: {source: earthFiltersSources.gfs, details: 'Speed of the wind at the surface or a chosen height (1000 to 10 hPa). Forecasts every 3 hours, up to 5 days ahead. km/h, m/s, kn, mph.'},
  temp: {source: earthFiltersSources.gfs, details: 'Air temperature at the surface or a chosen height (1000 to 10 hPa). °C, °F, K.'},
  relative_humidity: {source: earthFiltersSources.gfs, details: 'Water vapor in the air, as a percent of what the air can hold at its temperature. Surface or a chosen height. %.'},
  dew_point_temp: {source: earthFiltersSources.gfs, details: 'Temperature at which the air 2 m above the ground would be saturated with water vapor. °C, °F, K.'},
  wet_bulb_temp: {source: earthFiltersSources.gfsNullschool, details: 'Lowest temperature evaporation can cool the air to, 2 m above the ground. Calculated by Nullschool from GFS. °C, °F, K.'},
  precip_3hr: {source: earthFiltersSources.gfs, details: 'Rain, snow and other precipitation that fell in the 3 hours. mm, in, kg/m².'},
  cape: {source: earthFiltersSources.gfs, details: 'Energy available to lift air from the surface, an indicator of thunderstorm potential. J/kg.'},
  total_precipitable_water: {source: earthFiltersSources.gfs, details: 'Water in a column of the atmosphere if it all fell as rain. kg/m².'},
  total_cloud_water: {source: earthFiltersSources.gfs, details: 'Liquid water held in the clouds of a column of the atmosphere. kg/m².'},
  mean_sea_level_pressure: {source: earthFiltersSources.gfs, details: 'Air pressure adjusted to sea level, where highs and lows show weather systems. hPa, mmHg, inHg.'},
  misery_index: {source: earthFiltersSources.gfsNullschool, details: 'How hot or cold the air feels, combining the heat index and wind chill. Calculated by Nullschool from GFS. °C, °F, K.'},
  uv_index: {source: earthFiltersSources.cpc, details: 'Strength of the sun\'s skin-burning ultraviolet light at the surface. Hourly. UV Index, mW/m².'},
  wind_power_density: {source: earthFiltersSources.gfsNullschool, details: 'Power in the wind that turbines could capture, at a chosen height (1000 to 10 hPa). Calculated by Nullschool from GFS. kW/m², W/m².'},
  currents: {source: earthFiltersSources.cmems + '. Earlier dates: ' + earthFiltersSources.oscar, details: 'Speed of the ocean currents 5 m below the surface (15 m for OSCAR). Forecasts up to 5 days ahead.'},
  primary_waves: {source: earthFiltersSources.wavewatch, details: 'Time between the largest waves, animated in the direction they travel. Forecasts up to 5 days ahead. Seconds.'},
  significant_wave_height: {source: earthFiltersSources.wavewatch, details: 'Average height of the highest third of the waves. m, ft.'},
  sea_surface_temp: {source: earthFiltersSources.ostia + ', or ' + earthFiltersSources.rtgsst + ', depending on the date', details: 'Temperature of the ocean surface. Daily. °C, °F, K.'},
  sea_surface_temp_anomaly: {source: earthFiltersSources.ostia + ', ' + earthFiltersSources.oisst + ', or ' + earthFiltersSources.rtgsst + ', depending on the date', details: 'How much warmer or cooler the ocean surface is than its long-term average. Daily. °C, °F, K.'},
  bleaching_alert_area: {source: earthFiltersSources.coralReefWatch, details: 'Heat stress on coral reefs, from No Stress and Bleaching Watch to Alert Level 5.'},
  cosc: {source: earthFiltersSources.geos, details: 'Carbon monoxide in the air at the surface, mostly from fires and burning fuel. ppbv, ppmv.'},
  co2sc: {source: earthFiltersSources.geos, details: 'Carbon dioxide in the air at the surface. ppmv.'},
  so2smass: {source: earthFiltersSources.geos, details: 'Sulfur dioxide at the surface, from volcanoes and burning coal and oil. µg/m³.'},
  no2: {source: earthFiltersSources.cams, details: 'Nitrogen dioxide at the surface, mostly from vehicles and power plants. ppbw, ppmw, µg/m³.'},
  duexttau: {source: earthFiltersSources.geos, details: 'How much dust in the air dims sunlight (aerosol optical thickness at 550 nm). τ.'},
  pm1: {source: earthFiltersSources.cams, details: 'Particles smaller than 1 micrometer in the air at the surface. µg/m³.'},
  'pm2.5': {source: earthFiltersSources.cams, details: 'Particles smaller than 2.5 micrometers in the air at the surface, a common measure of air quality. µg/m³.'},
  pm10: {source: earthFiltersSources.cams, details: 'Particles smaller than 10 micrometers in the air at the surface. µg/m³.'},
  organic_matter_aot: {source: earthFiltersSources.cams, details: 'How much organic matter in the air, such as smoke, dims sunlight (aerosol optical thickness at 550 nm). τ.'},
  suexttau: {source: earthFiltersSources.geos, details: 'How much sulfate in the air dims sunlight (aerosol optical thickness at 550 nm). τ.'},
  aurora: {source: earthFiltersSources.ovation, details: 'Chance of seeing the aurora overhead. Every 5 minutes. %.'}
};

var earthFiltersAnnotations = [
  {name: 'fires', label: 'Fires', title: 'Active Fires'},
  {name: 'none', label: 'None', title: 'No Annotations'}
];

var earthFiltersProjections = [
  {name: 'atlantis', label: 'A', title: 'Atlantis'},
  {name: 'conic_equidistant', label: 'CE', title: 'Conic Equidistant'},
  {name: 'equirectangular', label: 'E', title: 'Equirectangular'},
  {name: 'equal_earth', label: 'EQ', title: 'Equal Earth'},
  {name: 'orthographic', label: 'O', title: 'Orthographic'},
  {name: 'patterson', label: 'P', title: 'Patterson'},
  {name: 'stereographic', label: 'S', title: 'Stereographic'},
  {name: 'waterman', label: 'WB', title: 'Waterman Butterfly'},
  {name: 'winkel3', label: 'W3', title: 'Winkel Tripel'}
];

// The language sets the folder of the nullschool address, such as https://earth.nullschool.net/es/
// The Language row shows the first earthFiltersLanguagesShown, then a More button that reveals the rest.
var earthFiltersLanguagesShown = 6;
var earthFiltersLanguages = [
  {name: 'en', path: '', label: 'English'},
  {name: 'cs', path: 'cs/', label: 'Čeština'},
  {name: 'es', path: 'es/', label: 'Español'},
  {name: 'fr', path: 'fr/', label: 'Français'},
  {name: 'hi', path: 'hi/', label: 'हिन्दी'},
  {name: 'ja', path: 'jp/', label: '日本語'},
  {name: 'ko', path: 'ko/', label: '한국어'},
  {name: 'pt', path: 'pt/', label: 'Português'},
  {name: 'ru', path: 'ru/', label: 'Русский'},
  {name: 'zh-Hans', path: 'zh-cn/', label: '简体中文'},
  {name: 'zh-Hant', path: 'zh-Hant/', label: '繁體中文'}
];

var earthFiltersIcons = {
  calendar: '<svg class="ef-fa" viewBox="0 0 448 512"><path fill="currentColor" d="M400 64h-48V12c0-7-5-12-12-12h-40c-7 0-12 5-12 12v52H160V12c0-7-5-12-12-12h-40c-7 0-12 5-12 12v52H48C22 64 0 86 0 112v352c0 27 22 48 48 48h352c27 0 48-21 48-48V112c0-26-21-48-48-48zm-6 400H54c-3 0-6-3-6-6V160h352v298c0 3-3 6-6 6z"/></svg>',
  angleDouble: '<svg class="ef-fa" viewBox="0 0 448 512"><path fill="currentColor" d="M224 239l136-136c9-9 24-9 34 0l22 23c10 9 10 24 0 33l-96 97 96 96c10 10 10 25 0 34l-22 23c-10 9-25 9-34 0L224 273c-10-9-10-25 0-34zM32 273l136 136c9 9 24 9 34 0l22-23c10-9 10-24 0-34l-96-96 96-96c10-10 10-25 0-34l-22-23c-10-9-25-9-34 0L32 239c-10 9-10 25 0 34z"/></svg>',
  angle: '<svg class="ef-fa" viewBox="0 0 256 512"><path fill="currentColor" d="M32 239l136-136c9-9 24-9 34 0l22 23c10 9 10 24 0 33l-96 97 96 96c10 10 10 25 0 34l-22 23c-10 9-25 9-34 0L32 273c-10-9-10-25 0-34z"/></svg>',
  play: '<svg class="ef-fa ef-fa-narrow" viewBox="0 0 448 512"><path fill="currentColor" d="M424 215L72 7C44-10 0 6 0 48v416c0 38 41 60 72 41l352-208c32-18 32-64 0-82z"/></svg>',
  location: '<svg class="ef-fa ef-fa-narrow" viewBox="0 0 512 512"><path fill="currentColor" d="M445 4L29 195c-48 23-32 93 19 93h176v176c0 51 70 67 93 19L508 67c16-38-25-79-63-63z"/></svg>',
  more: '<svg class="ef-md" viewBox="0 -960 960 960"><g fill="currentColor"><circle cx="240" cy="-480" r="46"/><circle cx="480" cy="-480" r="46"/><circle cx="720" cy="-480" r="46"/></g></svg>', // Bolder dots than Material's more_horiz (r 40)
  moveUnder: '<svg class="ef-md" viewBox="0 -960 960 960"><path fill="currentColor" d="M160-120v-80h640v80H160Zm320-160L280-480l56-56 104 104v-408h80v408l104-104 56 56-200 200Z"/></svg>',
  moveOver: '<svg class="ef-md" viewBox="0 -960 960 960"><path fill="currentColor" d="M160-760v-80h640v80H160Zm280 640v-408L336-424l-56-56 200-200 200 200-56 56-104-104v408h-80Z"/></svg>',
  reset: '<svg class="ef-md" viewBox="0 -960 960 960"><path fill="currentColor" d="M440-122q-121-15-200.5-105.5T160-440q0-66 26-126.5T260-672l57 57q-38 34-57.5 79T240-440q0 88 56 155.5T440-202v80Zm80 0v-80q87-16 143.5-83T720-440q0-100-70-170t-170-70h-3l44 44-56 56-140-140 140-140 56 56-44 44h3q134 0 227 93t93 227q0 121-79.5 211.5T520-122Z"/></svg>',
  openInNew: '<svg class="ef-md" viewBox="0 -960 960 960"><path fill="currentColor" d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"/></svg>',
  close: '<svg class="ef-md" viewBox="0 -960 960 960"><path fill="currentColor" d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>',
  show: '<svg class="ef-md" viewBox="0 -960 960 960"><path fill="currentColor" d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Z"/></svg>',
  // Material unfold_less and unfold_more, turned to point left and right. Their two arrows are closer together and larger than Material's, and stretched taller
  // (1.43 across before the turn). In the 18.75px menu icon, a 1px shift is about 51 viewBox units.
  condense: '<svg class="ef-md" viewBox="0 -960 960 960"><g fill="currentColor" transform="rotate(90 480 -480) translate(480 -480) scale(1.43 1.15) translate(-480 480)"><path transform="translate(0 -82)" d="M356-120 300-176l180-180 180 180-56 56-124-124-124 124Z"/><path transform="translate(0 82)" d="M480-604L300-784l56-56 124 124 124-124 56 56-180 180Z"/></g></svg>',
  expand: '<svg class="ef-md" viewBox="0 -960 960 960"><g fill="currentColor" transform="rotate(90 480 -480) translate(480 -480) scale(1.43 1.15) translate(-480 480)"><path transform="translate(0 -82)" d="M480-120 300-300l58-58 122 122 122-122 58 58-180 180Z"/><path transform="translate(0 82)" d="M358-598l-58-58 180-180 180 180-58 58-122-122-122 122Z"/></g></svg>',
  swap: '<svg class="ef-md" viewBox="0 -960 960 960"><path fill="currentColor" d="M280-160 80-360l200-200 56 57-103 103h287v80H233l103 103-56 57Zm400-240-56-57 103-103H440v-80h287L624-743l56-57 200 200-200 200Z"/></svg>'
};

function readEarthFiltersStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function writeEarthFiltersStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {}
}

function removeEarthFiltersStorage(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (e) {}
}

function escapeEarthFiltersText(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function hasEarthFiltersOption(options, name) {
  return options.some(function(option) {
    return option.name === name;
  });
}

function getEarthFiltersNowStep() {
  var now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    Math.floor(now.getUTCHours() / earthFiltersStepHours) * earthFiltersStepHours,
    0, 0, 0
  ));
}

// Accepts a bare hash, a #hash, or a full nullschool address, and returns the part after the #
function normalizeEarthFiltersHash(hash) {
  var normalized = typeof hash === 'string' ? hash.trim() : '';
  var urlMatch = normalized.match(/^https?:\/\/[^#]*#(.*)$/i);
  if (urlMatch) {
    normalized = urlMatch[1];
  }
  normalized = normalized.replace(/^#+/, '');
  try {
    normalized = decodeURIComponent(normalized);
  } catch (e) {}
  return normalized || earthFiltersDefaultHash;
}

// Same rules as the hash reader in the nullschool site script
function parseEarthFiltersHash(hash) {
  var normalized = normalizeEarthFiltersHash(hash);
  var match = /^(current|(\d{4})\/(\d{1,2})\/(\d{1,2})\/(\d{3,4})Z)\/(\w+)\/(\w+)\/(\w+)(\/.+)?/.exec(normalized);
  if (!match) {
    match = /^(current|(\d{4})\/(\d{1,2})\/(\d{1,2})\/(\d{3,4})Z)\/(\w+)\/(\w+)\/(\w+)(\/.+)?/.exec(earthFiltersDefaultHash);
  }

  var state = {
    time: null, // null is "current", otherwise a UTC Date
    mode: match[6] === 'wind' ? 'air' : match[6],
    animation: 'wind',
    height: 'surface',
    overlay: null,
    annotation: 'none',
    animationEnabled: true,
    showGrid: false,
    projection: null,
    orientation: null,
    spotlight: null
  };

  if (match[1] !== 'current') {
    var hhmm = match[5].padStart(4, '0');
    state.time = new Date(Date.UTC(
      parseInt(match[2], 10),
      parseInt(match[3], 10) - 1,
      parseInt(match[4], 10),
      parseInt(hhmm.substring(0, 2), 10),
      parseInt(hhmm.substring(2), 10),
      0, 0
    ));
  }

  if (match[8] === 'currents') {
    state.animation = 'currents';
  } else if (match[8] === 'waves') {
    state.animation = 'primary_waves';
  } else if (match[8] !== 'level') {
    state.height = match[8];
  }
  state.overlay = state.animation;

  (match[9] || '').split('/').forEach(function(part) {
    var keyMatch;
    if ((keyMatch = /^(\w+)(=([\d\-.,]*))?$/.exec(part))) {
      if (hasEarthFiltersOption(earthFiltersProjections, keyMatch[1])) {
        state.projection = keyMatch[1];
        state.orientation = keyMatch[3] || null;
      } else if (keyMatch[1] === 'loc' && keyMatch[3]) {
        state.spotlight = keyMatch[3];
      }
    } else if ((keyMatch = /^overlay=([\w.]+)$/.exec(part))) {
      state.overlay = keyMatch[1] === 'off' ? 'none' : keyMatch[1];
    } else if ((keyMatch = /^annot=(\w+)$/.exec(part))) {
      state.annotation = keyMatch[1] === 'fires' ? 'fires' : 'none';
    } else if ((keyMatch = /^grid=(\w+)$/.exec(part))) {
      state.showGrid = keyMatch[1] === 'on';
    } else if ((keyMatch = /^anim=(\w+)$/.exec(part))) {
      state.animationEnabled = keyMatch[1] !== 'off';
    }
  });

  return state;
}

// Same order as the hash writer in the nullschool site script
function formatEarthFiltersHash(state) {
  var parts = [];
  if (state.time) {
    var time = state.time;
    parts.push(
      time.getUTCFullYear() + '/' +
      String(time.getUTCMonth() + 1).padStart(2, '0') + '/' +
      String(time.getUTCDate()).padStart(2, '0') + '/' +
      String(time.getUTCHours()).padStart(2, '0') + String(time.getUTCMinutes()).padStart(2, '0') + 'Z'
    );
  } else {
    parts.push('current');
  }

  var modePath = state.mode === 'air' ? 'wind' : state.mode;
  if (state.animation === 'currents') {
    parts.push(modePath, 'surface', 'currents');
  } else if (state.animation === 'primary_waves') {
    parts.push(modePath, 'primary', 'waves');
  } else if (state.height === 'surface') {
    parts.push(modePath, 'surface', 'level');
  } else {
    parts.push(modePath, 'isobaric', state.height);
  }

  if (state.annotation && state.annotation !== 'none') {
    parts.push('annot=' + state.annotation);
  }
  if (!state.animationEnabled) {
    parts.push('anim=off');
  }
  if (state.overlay && state.overlay !== state.animation) {
    parts.push('overlay=' + state.overlay);
  }
  if (state.showGrid) {
    parts.push('grid=on');
  }
  if (state.projection) {
    parts.push(state.projection + (state.orientation ? '=' + state.orientation : ''));
  }
  if (state.spotlight) {
    parts.push('loc=' + state.spotlight);
  }
  return parts.join('/');
}

// Finds a language by its name (es) or its folder (es/)
function getEarthFiltersLanguage(nameOrFolder) {
  return earthFiltersLanguages.find(function(language) {
    return language.name === nameOrFolder || language.path === nameOrFolder;
  }) || earthFiltersLanguages[0];
}

function EarthFilters(container, options) {
  var self = this;
  this.container = container;
  this.options = options || {};
  this.state = parseEarthFiltersHash(this.options.hash);
  this.language = getEarthFiltersLanguage(this.options.language || readEarthFiltersStorage('earthLanguageFolder')); // localsite.js reads the same folder for maps loaded without the filters
  this.timezone = readEarthFiltersStorage('earthFiltersTimezone') === 'local' ? 'local' : 'utc';
  this.chooserDate = null;
  this.mapContainer = this.options.mapContainer || null;
  this.place = 'under';
  this.tab = 'controls';
  this.allLanguages = false; // More pressed in the Language row
  this.condensed = false; // Each Controls row shows only its highlighted choice (setCondensed())
  this.narrow = false; // The panel is at most earthFiltersNarrowWidth wide, which also condenses it (isCondensed())
  this.expandNarrow = false; // Expand pressed while narrow, until the panel widens
  this.render();
  if (this.mapContainer) {
    this.setupMapPanel();
  }
  this.update();
  // A conversation starting in the page's voice controls (.claude-voice-ui, claude-voice.js) condenses the filters, without changing
  // the saved choice. Heard in the capture phase, since the event doesn't bubble up from the element holding the voice controls.
  document.addEventListener('claude-voice:start', function() {
    self.setCondensed(true, false);
  }, true);
}

EarthFilters.prototype.getHash = function() {
  return formatEarthFiltersHash(this.state);
};

EarthFilters.prototype.getBaseUrl = function() {
  return earthFiltersSiteUrl + this.language.path;
};

EarthFilters.prototype.getUrl = function() {
  return this.getBaseUrl() + '#' + this.getHash();
};

// Show the filters for a hash set elsewhere. Doesn't call onChange.
EarthFilters.prototype.setHash = function(hash) {
  this.state = parseEarthFiltersHash(hash);
  this.update();
};

EarthFilters.prototype.changed = function() {
  this.update();
  if (typeof this.options.onChange === 'function') {
    this.options.onChange(this.getHash(), this);
  }
};

EarthFilters.prototype.buttonGroup = function(group, buttons, role) {
  return '<div class="ef-bunch" data-group="' + group + '" role="' + role + '">' + buttons.map(function(button) {
    return '<button type="button" data-name="' + escapeEarthFiltersText(button.name) + '" role="' + (role === 'tablist' ? 'tab' : 'radio') + '" title="' + escapeEarthFiltersText(button.title) + '">' + button.label + '</button>';
  }).join('') + '</div>';
};

// The panel's rows have no separator after their labels. The date modal's rows keep nullschool's separator.
EarthFilters.prototype.row = function(label, content, attributes, withSeparator) {
  return '<div class="ef-row"' + (attributes || '') + '><div class="ef-row-label">' + label + '</div>' + (withSeparator ? '<div class="ef-sep"></div>' : '') + content + '</div>';
};

EarthFilters.prototype.render = function() {
  var self = this;
  var overlayRows = earthFiltersModes.map(function(mode) {
    return self.row('Overlay', self.buttonGroup('overlay', earthFiltersOverlays[mode.name], 'radiogroup'), ' data-mode-row="' + mode.name + '"');
  }).join('');
  // Each overlay in the Overlays tab is a button that shows it on the map
  var aboutOverlays = earthFiltersModes.map(function(mode) {
    return '<div class="ef-about-mode">' + mode.label + '</div><ul class="ef-overlay-list">' +
      earthFiltersOverlays[mode.name].filter(function(overlay) {
        return overlay.name !== 'none';
      }).map(function(overlay) {
        var info = earthFiltersOverlayDetails[overlay.name] || {};
        return '<li><button type="button" class="ef-overlay-item" data-action="show-overlay" data-mode="' + mode.name + '" data-name="' + escapeEarthFiltersText(overlay.name) + '" title="Show on the map">' +
          '<span class="ef-overlay-name">' + escapeEarthFiltersText(overlay.title) + ' <span class="ef-overlay-label">' + overlay.label + '</span></span>' +
          (info.source ? '<span class="ef-overlay-source">Source: ' + escapeEarthFiltersText(info.source) + '</span>' : '') +
          (info.details ? '<span class="ef-overlay-details">' + escapeEarthFiltersText(info.details) + '</span>' : '') +
        '</button></li>';
      }).join('') + '</ul>';
  }).join('');

  var html = '<div class="ef-menu"><div class="ef-panel ef-card">' +
    '<div class="ef-tabs-bar">' +
      this.buttonGroup('tab', [
        {name: 'controls', label: 'Controls', title: 'Map controls'},
        {name: 'about', label: 'Overlays', title: 'About the overlays'} // Named about in the code
      ], 'tablist') +
      // Three-dot menu. Its first item names the other place, which a click moves the filters to.
      (this.mapContainer ?
        '<div class="ef-panel-actions">' +
          '<button type="button" class="ef-more" data-action="toggle-panel-menu" aria-haspopup="menu" aria-expanded="false" title="More">' + earthFiltersIcons.more + '</button>' +
          '<div class="ef-panel-menu" role="menu" hidden>' +
            '<button type="button" role="menuitem" data-action="toggle-panel" data-field="panel-toggle"><span data-field="panel-icon"></span><span data-field="panel-label"></span></button>' +
            '<button type="button" role="menuitem" data-action="toggle-condensed" data-field="condense-toggle"><span data-field="condense-icon"></span><span data-field="condense-label"></span></button>' +
            '<button type="button" role="menuitem" data-action="toggle-place" data-field="place-toggle"><span data-field="place-icon"></span><span data-field="place-label"></span></button>' +
            '<button type="button" role="menuitem" data-action="to-catch" data-field="catch-toggle" title="Move the filters back into the page" hidden>' + earthFiltersIcons.moveOver + '<span>In Page</span></button>' +
            '<button type="button" role="menuitem" data-action="reset-panel" title="Show the filters over the lower left corner of the map, at their default size">' + earthFiltersIcons.reset + '<span>Default Layout</span></button>' +
            '<a role="menuitem" data-field="new-window-link" target="_blank" rel="noopener" title="Open this view on earth.nullschool.net in a new window">' + earthFiltersIcons.openInNew + '<span>New Window</span></a>' +
          '</div>' +
        '</div>'
      : '') +
    '</div>' +

    '<div class="ef-tab-panel" data-tab-panel="controls" role="tabpanel">' +
    this.row('Date',
      '<div class="ef-date-group">' + // The timezone goes under the date in a narrow panel
        '<button type="button" class="ef-date-field" data-field="date" data-action="choose-date" title="Choose Date"></button>' + // Opens the date chooser, like the calendar button
        '<button type="button" class="ef-tz" data-action="change-tz" title="Change Timezone">' + earthFiltersIcons.swap + '<span data-field="tz"></span></button>' +
      '</div>', ' data-row="date"') +
    this.row('When',
      '<div class="ef-bunch" role="toolbar">' +
        '<div class="ef-bunch">' +
          '<button type="button" data-action="now" title="Current Conditions">Now</button>' +
          '<button type="button" data-action="choose-date" title="Choose Date">' + earthFiltersIcons.calendar + '</button>' +
          '<div class="ef-bunch ef-nav-arrows">' +
            '<button type="button" data-action="step" data-hours="-24" title="-1 Day">' + earthFiltersIcons.angleDouble + '</button>' +
            '<button type="button" data-action="step" data-hours="-' + earthFiltersStepHours + '" title="-' + earthFiltersStepHours + ' Hours">' + earthFiltersIcons.angle + '</button>' +
            '<button type="button" data-action="step" data-hours="' + earthFiltersStepHours + '" title="+' + earthFiltersStepHours + ' Hours">' + earthFiltersIcons.angle.replace('class="ef-fa"', 'class="ef-fa ef-flip"') + '</button>' +
            '<button type="button" data-action="step" data-hours="24" title="+1 Day">' + earthFiltersIcons.angleDouble.replace('class="ef-fa"', 'class="ef-fa ef-flip"') + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="ef-bunch ef-multi-select">' +
          '<button type="button" data-action="toggle-grid" title="Toggle Grid">Grid</button>' +
          '<button type="button" data-action="toggle-animation" title="Start/Stop Animation">' + earthFiltersIcons.play + '</button>' +
          '<button type="button" data-action="current-position" title="Current Position">' + earthFiltersIcons.location + '</button>' +
        '</div>' +
      '</div>') +
    this.row('Mode', this.buttonGroup('mode', earthFiltersModes, 'tablist')) +
    this.row('Animate', this.buttonGroup('animation', earthFiltersAnimations, 'radiogroup')) +
    this.row('Height', this.buttonGroup('height', earthFiltersHeights, 'radiogroup') + '<div class="ef-unit">hPa</div>', ' data-mode-row="air"') +
    overlayRows +
    this.row('Annotation', this.buttonGroup('annotation', earthFiltersAnnotations, 'radiogroup'), ' data-mode-row="bio"') +
    this.row('Projection', this.buttonGroup('projection', earthFiltersProjections, 'radiogroup')) +
    // From the nullschool settings modal. Its other settings (base map, info bar, font size) are kept in nullschool's own browser storage, so only the language can be sent.
    // The languages after the first few (data-more) show once More is pressed, or the selected one alone before More (update()).
    this.row('Language',
      '<div class="ef-bunch" data-group="language" role="radiogroup" aria-label="Language">' + earthFiltersLanguages.map(function(language, index) {
        return '<button type="button" lang="' + language.name + '" data-name="' + language.name + '" role="radio"' + (index >= earthFiltersLanguagesShown ? ' data-more hidden' : '') + '>' + language.label + '</button>';
      }).join('') +
      '<button type="button" data-action="more-languages" title="Show all the languages">More</button>' +
      '</div>') +
    '</div>' +

    '<div class="ef-tab-panel ef-about" data-tab-panel="about" role="tabpanel" hidden>' +
      '<p>Wind, weather, ocean and pollution conditions from <a href="https://earth.nullschool.net/about" target="_blank" rel="noopener">earth.nullschool.net</a> by Cameron Beccario. Forecast by supercomputers and updated every three hours.</p>' +
      aboutOverlays +
    '</div>' +

    '<div class="ef-row ef-last-row">' +
      '<a class="ef-link" data-field="open-link" target="_blank" rel="noopener" title="Open this view on earth.nullschool.net">earth.nullschool.net</a>' +
    '</div>' +
  '</div></div>' +

  // Date modal
  '<div class="ef-modal" data-modal="date" role="dialog" aria-modal="true" aria-label="Date" hidden>' +
    '<div class="ef-modal-container"><div class="ef-modal-scroller"><div class="ef-panel ef-card">' +
      '<div class="ef-modal-title"><div>Date</div><button type="button" data-action="close-modal" title="Close">' + earthFiltersIcons.close + '</button></div>' +
      this.row('year', '<div class="ef-bunch" data-chooser="year"></div>', '', true) +
      this.row('month', '<div class="ef-bunch" data-chooser="month"></div>', '', true) +
      this.row('day', '<table class="ef-weeks" role="grid"><thead><tr class="ef-week">' +
        ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(function(day) {
          return '<th scope="col">' + day + '</th>';
        }).join('') +
        '</tr></thead><tbody data-chooser="day"></tbody></table>', '', true) +
      '<div class="ef-row ef-action-row">' +
        '<button type="button" data-action="close-modal">Cancel</button>' +
        '<button type="button" data-action="apply-date">OK</button>' +
      '</div>' +
    '</div></div></div>' +
  '</div>';

  this.container.classList.add('earth-filters');
  this.container.innerHTML = html;
  this.container.addEventListener('click', function(event) {
    self.handleClick(event);
  });
  this.container.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      self.closeModals();
      self.setPanelMenuOpen(false);
    }
  });
  this.panelMenu = this.container.querySelector('.ef-panel-menu');
  // A narrow panel condenses on its own (isCondensed()). Its width is 0 while hidden, which leaves it as it was.
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(function(entries) {
      var width = entries[0].contentRect.width;
      var isNarrow = width <= earthFiltersNarrowWidth;
      if (width > 0 && isNarrow !== self.narrow) {
        self.narrow = isNarrow;
        if (!isNarrow && !self.resizingWidth) {
          self.expandNarrow = false; // Narrowing again condenses the panel again. Not while an edge is dragged, which keeps an expanded panel expanded.
        }
        self.update();
      }
    }).observe(this.container.querySelector('.ef-menu'));
  }
  if (this.mapContainer) {
    // A click anywhere outside the menu and the buttons that open it closes it
    document.addEventListener('click', function(event) {
      if (!self.panelMenu.contains(event.target) && !event.target.closest('[data-action="toggle-panel-menu"]') && event.target !== self.mapToggle) {
        self.setPanelMenuOpen(false);
      }
    });
  }
};

// The three-dot menu opens under the three dots, or with from 'map', above the clear button over nullschool's "earth" button.
// The same menu moves between the two spots, since the panel may be hidden when the clear button opens it.
EarthFilters.prototype.setPanelMenuOpen = function(isOpen, from) {
  var menu = this.panelMenu;
  if (!menu) {
    return;
  }
  var holder = isOpen && from === 'map' ? this.mapMenuHolder : this.container.querySelector('.ef-panel-actions');
  if (menu.parentNode !== holder) {
    holder.appendChild(menu);
  }
  menu.hidden = !isOpen;
  this.mapMenuHolder.hidden = !(isOpen && from === 'map');
  this.menuFrom = isOpen ? from || 'dots' : null;
  this.container.querySelector('[data-action="toggle-panel-menu"]').setAttribute('aria-expanded', this.menuFrom === 'dots' ? 'true' : 'false');
  this.mapToggle.setAttribute('aria-expanded', this.menuFrom === 'map' ? 'true' : 'false');
};

EarthFilters.prototype.handleClick = function(event) {
  var modal = event.target.classList.contains('ef-modal-container') ? event.target : null;
  if (modal) {
    this.closeModals(); // Click on the shaded area around a modal
    return;
  }

  if (event.target.closest('.ef-panel-menu a')) {
    this.setPanelMenuOpen(false); // The New Window link opens and closes the menu
    return;
  }

  var button = event.target.closest('button');
  if (!button || !(this.container.contains(button) || this.panelMenu && this.panelMenu.contains(button))) {
    return;
  }

  var action = button.getAttribute('data-action');
  if (action) {
    if (button.closest('.ef-panel-menu')) {
      this.setPanelMenuOpen(false); // Each menu item closes the menu
    }
    this.handleAction(action, button);
    return;
  }

  var chooser = button.closest('[data-chooser]');
  if (chooser) {
    this.chooseDatePart(chooser.getAttribute('data-chooser'), parseInt(button.getAttribute('data-name'), 10));
    return;
  }

  var group = button.closest('[data-group]');
  if (group) {
    this.choose(group.getAttribute('data-group'), button.getAttribute('data-name'));
  }
};

EarthFilters.prototype.handleAction = function(action, button) {
  var state = this.state;
  switch (action) {
    case 'now':
      state.time = null;
      this.changed();
      break;
    case 'step':
      var nextTime = new Date((state.time || getEarthFiltersNowStep()).getTime());
      nextTime.setUTCHours(nextTime.getUTCHours() + parseInt(button.getAttribute('data-hours'), 10));
      state.time = nextTime;
      this.changed();
      break;
    case 'choose-date':
      this.openDateChooser();
      break;
    case 'apply-date':
      this.applyChosenDate();
      break;
    case 'toggle-grid':
      state.showGrid = !state.showGrid;
      this.changed();
      break;
    case 'toggle-animation':
      state.animationEnabled = !state.animationEnabled;
      this.changed();
      break;
    case 'current-position':
      this.showCurrentPosition();
      break;
    case 'change-tz':
      this.timezone = this.timezone === 'utc' ? 'local' : 'utc';
      writeEarthFiltersStorage('earthFiltersTimezone', this.timezone);
      this.update();
      break;
    case 'reset-panel':
      this.resetMapPanel();
      break;
    case 'more-languages':
      this.allLanguages = true;
      this.update();
      break;
    case 'toggle-panel-menu':
      this.setPanelMenuOpen(this.menuFrom !== 'dots', 'dots');
      break;
    case 'toggle-panel':
      this.setMapPanelOpen(!this.isOpen);
      break;
    case 'toggle-condensed':
      var condense = !this.isCondensed();
      this.expandNarrow = !condense; // Expand also shows all the choices in a narrow panel
      this.setCondensed(condense, true);
      break;
    case 'toggle-place':
      this.isOpen = true; // Shows the filters in their new place, also when the menu opened from the clear button
      writeEarthFiltersStorage(this.storageKeys.open, 'true');
      this.setMapPanelPlace(this.inPageCatch() || this.place === 'over' ? 'under' : 'over'); // From the page's #earthFilterCatch, under the map
      break;
    case 'to-catch':
      this.isOpen = true;
      writeEarthFiltersStorage(this.storageKeys.open, 'true');
      this.useCatch = true;
      this.applyMapPanelPlace();
      break;
    case 'show-overlay':
      this.setMode(button.getAttribute('data-mode'));
      state.overlay = button.getAttribute('data-name');
      if (hasEarthFiltersOption(earthFiltersAnimations, state.overlay)) {
        state.animation = state.overlay; // Wind, currents and waves also animate
        if (state.animation !== 'wind') {
          state.height = 'surface';
        }
      }
      this.changed();
      break;
    case 'close-modal':
      this.closeModals();
      break;
  }
};

// Switches the mode, with an animation and overlay that the mode offers
EarthFilters.prototype.setMode = function(name) {
  var state = this.state;
  if (state.mode === name) {
    return;
  }
  state.mode = name;
  if (name === 'ocean' && state.animation === 'wind') {
    state.animation = 'currents';
  }
  if (name !== 'air') {
    state.height = 'surface';
  }
  if (!hasEarthFiltersOption(earthFiltersOverlays[name], state.overlay)) {
    state.overlay = name === 'bio' ? 'none' : earthFiltersOverlays[name][0].name;
  }
  state.annotation = name === 'bio' ? 'fires' : 'none';
};

EarthFilters.prototype.choose = function(group, name) {
  var state = this.state;
  switch (group) {
    case 'mode':
      if (state.mode === name) {
        return;
      }
      this.setMode(name);
      break;
    case 'animation':
      state.animation = name;
      if (name !== 'wind') {
        state.height = 'surface'; // Currents and waves are only at the surface
      }
      break;
    case 'height':
      state.height = name;
      state.animation = 'wind';
      break;
    case 'overlay':
      state.overlay = name;
      break;
    case 'annotation':
      state.annotation = name;
      break;
    case 'projection':
      if (state.projection !== name) {
        state.orientation = null; // Each projection has its own center and zoom
      }
      state.projection = name;
      break;
    case 'tab':
      if (name === 'about' && this.tab !== 'about') {
        this.aboutHeight = this.isOverMap() && this.isOpen ? this.container.offsetHeight : 0; // The height before Overlays, which it keeps
      }
      this.tab = name;
      this.update();
      if (this.isOverMap()) {
        this.applyMapPanelBox();
      }
      this.liftMapPanel();
      return; // Not a map change
    case 'language':
      this.language = getEarthFiltersLanguage(name);
      writeEarthFiltersStorage('earthLanguageFolder', this.language.path);
      break;
  }
  this.changed();
};

EarthFilters.prototype.showCurrentPosition = function() {
  var self = this;
  if (!navigator.geolocation) {
    return;
  }
  navigator.geolocation.getCurrentPosition(function(position) {
    self.state.spotlight = position.coords.longitude.toFixed(3) + ',' + position.coords.latitude.toFixed(3);
    self.changed();
  }, function(error) {
    console.log('Earth Filters current position: ' + error.message);
  }, {timeout: 15000});
};

EarthFilters.prototype.openModal = function(name) {
  this.closeModals();
  var modal = this.container.querySelector('[data-modal="' + name + '"]');
  modal.hidden = false;
  var focusButton = modal.querySelector('[aria-checked="true"], [aria-selected="true"]') || modal.querySelector('button');
  if (focusButton) {
    focusButton.focus();
  }
};

EarthFilters.prototype.closeModals = function() {
  this.container.querySelectorAll('.ef-modal').forEach(function(modal) {
    modal.hidden = true;
  });
};

EarthFilters.prototype.openDateChooser = function() {
  var time = this.state.time || getEarthFiltersNowStep();
  this.chooserDate = new Date(time.getTime());
  this.renderDateChooser();
  this.openModal('date');
};

EarthFilters.prototype.chooseDatePart = function(part, value) {
  var chosen = this.chooserDate;
  var day = chosen.getUTCDate();
  if (part === 'year' || part === 'month') {
    var year = part === 'year' ? value : chosen.getUTCFullYear();
    var month = part === 'month' ? value - 1 : chosen.getUTCMonth();
    var daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    chosen.setUTCDate(1);
    chosen.setUTCFullYear(year);
    chosen.setUTCMonth(month);
    chosen.setUTCDate(Math.min(day, daysInMonth));
  } else {
    chosen.setUTCDate(value);
  }
  this.renderDateChooser();
};

EarthFilters.prototype.applyChosenDate = function() {
  var latest = getEarthFiltersNowStep();
  this.state.time = this.chooserDate.getTime() > latest.getTime() ? latest : this.chooserDate;
  this.closeModals();
  this.changed();
};

EarthFilters.prototype.renderDateChooser = function() {
  var chosen = this.chooserDate;
  var now = new Date();
  var years = [];
  for (var year = earthFiltersFirstYear; year <= now.getUTCFullYear(); year++) {
    years.push(year);
  }
  this.container.querySelector('[data-chooser="year"]').innerHTML = years.map(function(year) {
    return '<button type="button" data-name="' + year + '" aria-checked="' + (year === chosen.getUTCFullYear()) + '">' + year + '</button>';
  }).join('');

  var months = '';
  for (var month = 1; month <= 12; month++) {
    months += '<button type="button" data-name="' + month + '" aria-checked="' + (month === chosen.getUTCMonth() + 1) + '">' + String(month).padStart(2, '0') + '</button>';
  }
  this.container.querySelector('[data-chooser="month"]').innerHTML = months;

  var firstWeekday = new Date(Date.UTC(chosen.getUTCFullYear(), chosen.getUTCMonth(), 1)).getUTCDay();
  var daysInMonth = new Date(Date.UTC(chosen.getUTCFullYear(), chosen.getUTCMonth() + 1, 0)).getUTCDate();
  var latestDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  var weeks = '';
  for (var cell = 0; cell < 42; cell++) {
    var day = cell - firstWeekday + 1;
    if (cell % 7 === 0) {
      if (day > daysInMonth) {
        break;
      }
      weeks += '<tr class="ef-week">';
    }
    if (day < 1 || day > daysInMonth) {
      weeks += '<td></td>';
    } else {
      var isFuture = Date.UTC(chosen.getUTCFullYear(), chosen.getUTCMonth(), day) > latestDay;
      weeks += '<td><button type="button" data-name="' + day + '" aria-checked="' + (day === chosen.getUTCDate()) + '"' + (isFuture ? ' disabled' : '') + '>' + String(day).padStart(2, '0') + '</button></td>';
    }
    if (cell % 7 === 6) {
      weeks += '</tr>';
    }
  }
  this.container.querySelector('[data-chooser="day"]').innerHTML = weeks;
};

// Current conditions (no time in the hash) show the date and time of the latest 3-hour step
EarthFilters.prototype.formatDateField = function() {
  var time = this.state.time || getEarthFiltersNowStep();
  var isLocal = this.timezone === 'local';
  var year = isLocal ? time.getFullYear() : time.getUTCFullYear();
  var month = (isLocal ? time.getMonth() : time.getUTCMonth()) + 1;
  var day = isLocal ? time.getDate() : time.getUTCDate();
  var hour = isLocal ? time.getHours() : time.getUTCHours();
  var minute = isLocal ? time.getMinutes() : time.getUTCMinutes();
  // 12-hour time with am or pm right after it, as in 6:00pm
  return year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0') + ' ' +
    (hour % 12 || 12) + ':' + String(minute).padStart(2, '0') + (hour < 12 ? 'am' : 'pm');
};

// Named, so it's clear what the switch changes. Local adds the browser's zone at the date shown, such as EDT or GMT+2, when it can be found.
EarthFilters.prototype.formatTimezoneField = function() {
  if (this.timezone !== 'local') {
    return 'UTC Time Zone';
  }
  var zone = '';
  try {
    var zonePart = new Intl.DateTimeFormat(undefined, {timeZoneName: 'short'}).formatToParts(this.state.time || getEarthFiltersNowStep()).find(function(part) {
      return part.type === 'timeZoneName';
    });
    zone = zonePart ? zonePart.value : '';
  } catch (e) {}
  return 'Local Time Zone' + (zone ? ' (' + zone + ')' : '');
};

EarthFilters.prototype.update = function() {
  var state = this.state;
  var container = this.container;
  var selected = {
    mode: state.mode,
    animation: state.animation,
    height: state.height,
    overlay: state.overlay,
    annotation: state.annotation,
    projection: state.projection || 'orthographic', // nullschool's default
    language: this.language.name,
    tab: this.tab
  };

  container.querySelectorAll('[data-group]').forEach(function(group) {
    var value = selected[group.getAttribute('data-group')];
    group.querySelectorAll('button[data-name]').forEach(function(button) { // Not the Language row's More
      var isSelected = button.getAttribute('data-name') === value;
      button.setAttribute(group.getAttribute('role') === 'tablist' ? 'aria-selected' : 'aria-checked', isSelected ? 'true' : 'false');
    });
  });

  // The Language row: the first few, the selected one, or all of them after More
  var allLanguages = this.allLanguages;
  container.querySelectorAll('[data-group="language"] [data-more]').forEach(function(button) {
    button.hidden = !allLanguages && button.getAttribute('data-name') !== selected.language;
  });
  var moreLanguages = container.querySelector('[data-action="more-languages"]');
  if (moreLanguages) {
    moreLanguages.hidden = allLanguages;
  }

  container.querySelectorAll('[data-action="show-overlay"]').forEach(function(button) {
    var isShown = button.getAttribute('data-mode') === state.mode && button.getAttribute('data-name') === state.overlay;
    button.setAttribute('aria-pressed', isShown ? 'true' : 'false');
  });

  container.querySelectorAll('[data-tab-panel]').forEach(function(panel) {
    panel.hidden = panel.getAttribute('data-tab-panel') !== selected.tab;
  });

  container.querySelectorAll('[data-mode-row]').forEach(function(row) {
    row.hidden = row.getAttribute('data-mode-row') !== state.mode;
  });

  container.querySelector('[data-action="toggle-grid"]').setAttribute('aria-pressed', state.showGrid ? 'true' : 'false');
  container.querySelector('[data-action="toggle-animation"]').setAttribute('aria-pressed', state.animationEnabled ? 'true' : 'false');
  container.querySelector('[data-action="current-position"]').setAttribute('aria-pressed', state.spotlight ? 'true' : 'false');
  container.querySelector('[data-action="now"]').setAttribute('aria-pressed', state.time ? 'false' : 'true');
  container.querySelector('[data-field="date"]').textContent = this.formatDateField();
  container.querySelector('[data-field="tz"]').textContent = this.formatTimezoneField();
  container.querySelector('[data-field="open-link"]').href = this.getUrl();
  container.classList.toggle('ef-condensed', this.isCondensed());
  if (this.panelMenu) {
    this.updatePanelMenu();
  }
  if (this.isCondensed() && this.isOverMap()) {
    this.applyMapPanelBox(); // The condensed panel's width follows its choices
  }
};

// The menu can be outside the container, over the map, so its items are found from the menu
EarthFilters.prototype.updatePanelMenu = function() {
  var menu = this.panelMenu;
  menu.querySelector('[data-field="new-window-link"]').href = this.getUrl(); // The current filters and language, like the earth.nullschool.net link
  menu.querySelector('[data-field="panel-label"]').textContent = this.isOpen ? 'Close Panel' : 'Show Panel';
  menu.querySelector('[data-field="panel-toggle"]').title = this.isOpen ? 'Hide the filters' : 'Show the filters';
  menu.querySelector('[data-field="panel-icon"]').innerHTML = this.isOpen ? earthFiltersIcons.close : earthFiltersIcons.show;
  var isCondensed = this.isCondensed();
  menu.querySelector('[data-field="condense-label"]').textContent = isCondensed ? 'Expand' : 'Condense';
  menu.querySelector('[data-field="condense-toggle"]').title = isCondensed ? 'Show all the choices in each row' : 'Show only the highlighted choice in each row';
  menu.querySelector('[data-field="condense-icon"]').innerHTML = isCondensed ? earthFiltersIcons.expand : earthFiltersIcons.condense;
  // Under the map from over it or from the page's #earthFilterCatch, otherwise over the map. In Page goes back to the catch.
  var toUnder = this.place === 'over' || this.inPageCatch();
  var placeToggle = menu.querySelector('[data-field="place-toggle"]');
  placeToggle.querySelector('[data-field="place-icon"]').innerHTML = toUnder ? earthFiltersIcons.moveUnder : earthFiltersIcons.moveOver;
  placeToggle.querySelector('[data-field="place-label"]').textContent = toUnder ? 'Under Map' : 'Over Map';
  placeToggle.title = toUnder ? 'Move the filters under the map' : 'Move the filters over the map, where they can be dragged and resized from the corners and edges';
  menu.querySelector('[data-field="catch-toggle"]').hidden = !getEarthFiltersCatch() || this.inPageCatch();
};

// With options.mapContainer, the filters show over the map's lower left corner, or under the map, and a clear button over nullschool's
// "earth" button opens the three-dot menu, which shows and hides them. Over the map, the panel is dragged from its background and resized from its corners and edges.
// The panel's default spot covers the clear button, so its close icon hides it.
// Saved in the browser with options.storagePrefix: <prefix>Open, <prefix>Place (under or over), <prefix>Box (position and size over the map)
// and <prefix>Condensed (Condense or Expand).
var earthFiltersPanelGap = 10; // Default offset from the map's left and bottom edges
var earthFiltersPanelWidth = 560; // Default width over the map
var earthFiltersExpandDrag = 8; // Dragging a condensed panel's right side wider by more than this expands it
var earthFiltersNarrowWidth = 480; // At most this wide, the panel condenses on its own. Same as the @container query in earth-filters.css.
var earthFiltersPanelMinWidth = 220;
var earthFiltersPanelMinHeight = 120;
var earthFiltersPanelGrip = 40; // The panel can be dragged off the map's sides and bottom, leaving this much on the map to pick it up again

EarthFilters.prototype.setupMapPanel = function() {
  var self = this;
  var mapContainer = this.mapContainer;
  var prefix = this.options.storagePrefix || 'earthFilters';
  this.storageKeys = {open: prefix + 'Open', place: prefix + 'Place', box: prefix + 'Box', condensed: prefix + 'Condensed'};
  this.condensed = readEarthFiltersStorage(this.storageKeys.condensed) === 'true';
  this.place = readEarthFiltersStorage(this.storageKeys.place) === 'under' ? 'under' : 'over'; // Over the map unless moved under it
  this.isOpen = readEarthFiltersStorage(this.storageKeys.open) !== 'false'; // Shown when the map first loads, until hidden
  this.box = null;
  try {
    this.box = JSON.parse(readEarthFiltersStorage(this.storageKeys.box) || 'null');
  } catch (e) {}
  if (this.box && typeof this.box.left !== 'number') {
    this.box = null; // Saved when the panel was placed from the right
  }

  if (window.getComputedStyle(mapContainer).position === 'static') {
    mapContainer.style.position = 'relative';
  }
  // Marks the spot under the map to return to from over the map
  this.underMarker = document.createComment('earth filters under the map');
  this.container.parentNode.insertBefore(this.underMarker, this.container);

  this.mapToggle = document.createElement('button');
  this.mapToggle.type = 'button';
  this.mapToggle.className = 'ef-map-toggle';
  this.mapToggle.title = 'Model Controls';
  // A page can show its icon and label to make it a button of its own.
  // Elsewhere it's a clear outline over nullschool's "earth" button.
  this.mapToggle.innerHTML = '<i class="material-icons ef-map-toggle-icon" aria-hidden="true">tune</i><span class="ef-map-toggle-label">Model Controls</span>';
  this.mapToggle.setAttribute('aria-haspopup', 'menu');
  this.mapToggle.setAttribute('aria-expanded', 'false');
  this.mapToggle.addEventListener('click', function(event) {
    self.setPanelMenuOpen(self.menuFrom !== 'map', 'map');
    event.preventDefault();
    event.stopPropagation();
  });
  mapContainer.appendChild(this.mapToggle);

  // Holds the three-dot menu above the clear button when the clear button opens it
  this.mapMenuHolder = document.createElement('div');
  this.mapMenuHolder.className = 'earth-filters ef-map-menu';
  this.mapMenuHolder.hidden = true;
  this.mapMenuHolder.addEventListener('click', function(event) {
    self.handleClick(event);
  });
  this.mapMenuHolder.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      self.setPanelMenuOpen(false);
    }
  });
  mapContainer.appendChild(this.mapMenuHolder);

  // The corners, then the edges, which resize the panel too (.ef-corner, earth-filters.css)
  ['nw', 'ne', 'sw', 'se', 'n', 'e', 's', 'w'].forEach(function(corner) {
    var cornerDiv = document.createElement('div');
    cornerDiv.className = 'ef-corner';
    cornerDiv.setAttribute('data-corner', corner);
    self.container.appendChild(cornerDiv);
  });
  this.container.addEventListener('pointerdown', function(event) {
    self.startMapPanelDrag(event);
  });
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(function() {
      if (self.isOverMap()) {
        self.applyMapPanelBox();
      }
    }).observe(mapContainer);
  }
  this.applyMapPanelPlace();
};

EarthFilters.prototype.setMapPanelOpen = function(isOpen) {
  this.isOpen = isOpen;
  writeEarthFiltersStorage(this.storageKeys.open, isOpen ? 'true' : 'false');
  this.applyMapPanelPlace();
};

// Condensed, each Controls row shows only its highlighted choice (earth-filters.css). With save, from Condense and Expand in the
// three-dot menu, the choice is kept in the browser. A voice conversation condenses without saving.
EarthFilters.prototype.isCondensed = function() {
  return this.condensed || this.narrow && !this.expandNarrow;
};

EarthFilters.prototype.setCondensed = function(isCondensed, save) {
  this.condensed = isCondensed;
  if (save && this.storageKeys) {
    writeEarthFiltersStorage(this.storageKeys.condensed, isCondensed ? 'true' : 'false');
  }
  this.update();
  if (this.isOverMap()) {
    this.applyMapPanelBox();
  }
};

EarthFilters.prototype.setMapPanelPlace = function(place) {
  this.useCatch = false; // Out of the page's #earthFilterCatch until In Page
  this.place = place === 'over' ? 'over' : 'under';
  writeEarthFiltersStorage(this.storageKeys.place, this.place);
  this.applyMapPanelPlace();
  this.update();
};

// Default Layout clears the saved place, position, size and visibility, and shows the filters over the map's lower left corner
EarthFilters.prototype.resetMapPanel = function() {
  this.useCatch = false;
  this.place = 'over';
  this.box = null;
  this.isOpen = true;
  removeEarthFiltersStorage(this.storageKeys.place);
  removeEarthFiltersStorage(this.storageKeys.box);
  removeEarthFiltersStorage(this.storageKeys.open);
  this.applyMapPanelPlace();
};

// A page can hold the panel in its own place, a #earthFilterCatch element (as project/goals does, after its tabs).
// The panel starts there on each page load and shows as it does under the map. The three-dot menu's Under Map and
// Over Map move it out (useCatch false), and In Page brings it back.
function getEarthFiltersCatch() {
  return document.getElementById('earthFilterCatch');
}

EarthFilters.prototype.inPageCatch = function() {
  return !!getEarthFiltersCatch() && this.useCatch !== false;
};

// Over the map now, where it's dragged and resized (ef-over), not under it or in a page's #earthFilterCatch
EarthFilters.prototype.isOverMap = function() {
  return this.container.classList.contains('ef-over');
};

EarthFilters.prototype.applyMapPanelPlace = function() {
  this.sendMapPanelBack();
  var container = this.container;
  var pageCatch = this.inPageCatch() ? getEarthFiltersCatch() : null;
  var isOver = this.place === 'over' && !pageCatch;
  if (pageCatch) {
    if (container.parentNode !== pageCatch) {
      pageCatch.appendChild(container);
    }
  } else if (isOver && container.parentNode !== this.mapContainer) {
    this.mapContainer.appendChild(container);
  } else if (!isOver && this.underMarker.nextSibling !== container) {
    this.underMarker.parentNode.insertBefore(container, this.underMarker.nextSibling);
  }
  container.classList.toggle('ef-over', isOver);
  container.classList.toggle('ef-under', !isOver && !pageCatch);
  container.classList.toggle('ef-closed', !this.isOpen);
  this.updatePanelMenu();
  if (isOver) {
    this.applyMapPanelBox();
  } else {
    ['left', 'bottom', 'width', 'height', 'maxHeight'].forEach(function(property) {
      container.style[property] = '';
    });
    this.clipMapPanel(0, 0, 0);
  }
};

// Hides the parts of the panel dragged off the map's right, bottom and left edges, and the corners there.
// The panel ignores the pointer outside its filters (earth-filters.css), so the clipped parts don't cover the page.
EarthFilters.prototype.clipMapPanel = function(right, bottom, left) {
  var menu = this.container.querySelector('.ef-menu');
  menu.style.clipPath = right || bottom || left ? 'inset(0 ' + right + 'px ' + bottom + 'px ' + left + 'px)' : '';
  var offMap = {nw: left > 0, ne: right > 0, sw: left > 0 || bottom > 0, se: right > 0 || bottom > 0, n: false, e: right > 0, s: bottom > 0, w: left > 0};
  this.container.querySelectorAll('.ef-corner').forEach(function(corner) {
    corner.style.visibility = offMap[corner.getAttribute('data-corner')] ? 'hidden' : '';
  });
};

// After a tab change over the map, a panel dragged partly below the map's bottom edge moves up, so the tab's
// content isn't hidden by the map's bottom. The new place is saved, as after a drag.
EarthFilters.prototype.liftMapPanel = function() {
  if (!this.isOverMap() || !this.isOpen || !this.box || this.box.bottom >= 0) {
    return;
  }
  this.box.bottom = Math.max(0, Math.min(earthFiltersPanelGap, this.mapContainer.clientHeight - this.container.offsetHeight));
  writeEarthFiltersStorage(this.storageKeys.box, JSON.stringify(this.box));
  this.applyMapPanelBox();
};

// Sets the panel's size and its offset from the map's lower left corner. Its top stays on the map, and at least earthFiltersPanelGrip of it.
EarthFilters.prototype.applyMapPanelBox = function() {
  var container = this.container;
  var mapWidth = this.mapContainer.clientWidth;
  var mapHeight = this.mapContainer.clientHeight;
  if (!mapWidth || !mapHeight || !this.isOpen) {
    return; // Hidden. The ResizeObserver applies the box when the map shows.
  }
  var box = this.box || {left: earthFiltersPanelGap, bottom: earthFiltersPanelGap, width: earthFiltersPanelWidth, height: null};
  var width = Math.max(Math.min(earthFiltersPanelMinWidth, mapWidth), Math.min(box.width, mapWidth - (this.box ? 0 : 2 * earthFiltersPanelGap)));
  container.style.width = width + 'px';
  if (box.height) {
    container.style.height = Math.max(Math.min(earthFiltersPanelMinHeight, mapHeight), Math.min(box.height, mapHeight)) + 'px';
    container.style.maxHeight = '';
  } else if (this.tab === 'about' && this.aboutHeight) {
    // The Overlays tab (about) doesn't make the panel taller. Its text scrolls in the panel's height from the tab before it.
    container.style.height = Math.max(Math.min(earthFiltersPanelMinHeight, mapHeight), Math.min(this.aboutHeight, this.box ? mapHeight - box.bottom : mapHeight - 2 * earthFiltersPanelGap)) + 'px';
    container.style.maxHeight = '';
  } else {
    container.style.height = '';
    container.style.maxHeight = Math.max(earthFiltersPanelMinHeight, (this.box ? mapHeight - box.bottom : mapHeight - 2 * earthFiltersPanelGap)) + 'px'; // Fits above its bottom edge
  }
  if (this.isCondensed() && !this.resizingWidth) {
    // Condensed, the panel narrows to its card, which fits its choices (earth-filters.css), with room for the menu's scrollbar.
    // The box keeps its width for Expand. While an east or west edge is dragged, the panel follows it, so it can widen past the narrow width.
    var menu = container.querySelector('.ef-menu');
    var fitWidth = container.querySelector('.ef-menu > .ef-card').offsetWidth + menu.offsetWidth - menu.clientWidth;
    if (fitWidth < width) {
      width = fitWidth;
      container.style.width = width + 'px';
    }
  }
  var height = container.offsetHeight;
  var left = Math.max(earthFiltersPanelGrip - width, Math.min(box.left, mapWidth - earthFiltersPanelGrip));
  var bottom = Math.max(earthFiltersPanelGrip - height, Math.min(box.bottom, mapHeight - height));
  container.style.left = left + 'px';
  container.style.bottom = bottom + 'px';
  this.clipMapPanel(Math.max(0, left + width - mapWidth), Math.max(0, -bottom), Math.max(0, -left));
};

EarthFilters.prototype.startMapPanelDrag = function(event) {
  if (!this.isOverMap() || event.button !== 0) {
    return;
  }
  var corner = event.target.closest('.ef-corner');
  var cornerName = corner ? corner.getAttribute('data-corner') : '';
  if (!corner && (!event.target.closest('.ef-menu') || event.target.closest('button, a, input, select, textarea, label'))) {
    return; // Buttons and links keep working. The modals aren't part of the panel.
  }

  this.bringMapPanelToFront(); // Before the pointer capture below, which moving the panel would end
  var self = this;
  var container = this.container;
  var mapWidth = this.mapContainer.clientWidth;
  var mapHeight = this.mapContainer.clientHeight;
  var start = {
    x: event.clientX,
    y: event.clientY,
    left: container.offsetLeft,
    top: container.offsetTop,
    width: container.offsetWidth,
    height: container.offsetHeight
  };
  var expandedWidth = this.box ? this.box.width : earthFiltersPanelWidth; // The width a condensed panel kept for Expand
  // The map iframe would take the pointer as it moves over it
  var iframes = this.mapContainer.querySelectorAll('iframe');
  iframes.forEach(function(iframe) {
    iframe.style.pointerEvents = 'none';
  });
  container.classList.add('ef-dragging');
  this.resizingWidth = /[ew]/.test(cornerName);
  if (event.target.setPointerCapture) {
    event.target.setPointerCapture(event.pointerId); // Not the container, which ignores the pointer. The moves bubble up to it.
  }
  event.preventDefault();

  function move(moveEvent) {
    var dx = moveEvent.clientX - start.x;
    var dy = moveEvent.clientY - start.y;
    var left = start.left;
    var top = start.top;
    var width = start.width;
    var height = start.height;
    if (!cornerName) {
      // Off the sides and bottom, keeping earthFiltersPanelGrip on the map. The top stays on the map.
      left = Math.max(earthFiltersPanelGrip - width, Math.min(left + dx, mapWidth - earthFiltersPanelGrip));
      top = Math.max(0, Math.min(top + dy, mapHeight - earthFiltersPanelGrip));
    } else {
      // Corners and edges off the map are hidden, so only the ones on the map resize, up to the map's edges.
      // An edge resizes one way, a corner both.
      if (cornerName.indexOf('e') >= 0) {
        width = Math.min(Math.max(earthFiltersPanelMinWidth, start.width + dx), Math.max(start.width, mapWidth - left));
      } else if (cornerName.indexOf('w') >= 0) {
        left = Math.max(Math.min(0, start.left), Math.min(start.left + dx, start.left + start.width - earthFiltersPanelMinWidth));
        width = start.left + start.width - left;
      }
      if (cornerName.indexOf('s') >= 0) {
        height = Math.min(Math.max(earthFiltersPanelMinHeight, start.height + dy), Math.max(start.height, mapHeight - top));
      } else if (cornerName.indexOf('n') >= 0) {
        top = Math.max(0, Math.min(start.top + dy, start.top + start.height - earthFiltersPanelMinHeight));
        height = start.top + start.height - top;
      }
    }
    if (cornerName.indexOf('e') >= 0 && width > start.width + earthFiltersExpandDrag && self.isCondensed()) {
      // Widening a condensed panel from its right side expands it, as Expand in the three-dot menu does. It jumps to the width it kept
      // for Expand, at least wide enough for the full choices beside their labels, then follows the pointer from there.
      self.expandNarrow = true;
      self.setCondensed(false, true);
      width = Math.max(width, Math.min(Math.max(expandedWidth, earthFiltersNarrowWidth + earthFiltersExpandDrag), mapWidth - left));
      start.width = width - dx;
    }
    self.box = {
      left: left,
      bottom: mapHeight - top - height,
      width: self.isCondensed() && !self.resizingWidth ? (self.box ? self.box.width : earthFiltersPanelWidth) : width, // A condensed panel's move keeps the width for Expand
      height: /[ns]/.test(cornerName) ? height : (self.box && self.box.height) || null // A move, or the east or west edge, keeps the height fitting the filters until a corner or the top or bottom edge is dragged
    };
    self.applyMapPanelBox();
  }

  function end() {
    container.removeEventListener('pointermove', move);
    container.removeEventListener('pointerup', end);
    container.removeEventListener('pointercancel', end);
    iframes.forEach(function(iframe) {
      iframe.style.pointerEvents = '';
    });
    container.classList.remove('ef-dragging');
    if (self.box) {
      writeEarthFiltersStorage(self.storageKeys.box, JSON.stringify(self.box));
    }
    if (self.resizingWidth) {
      self.resizingWidth = false;
      if (!self.narrow) {
        self.expandNarrow = false; // Narrowing again condenses the panel again
      }
      self.applyMapPanelBox(); // A panel still condensed fits its choices again
    }
  }

  container.addEventListener('pointermove', move);
  container.addEventListener('pointerup', end);
  container.addEventListener('pointercancel', end);
};

// A dragged panel comes to the front of the page's other panels. A page laid over the map can sit above everything
// in the map, as when the map is in a fixed #fullscreen under project/goals, so the panel moves out to a layer of its
// own (.ef-front-layer, earth-filters.css) kept over the map, where it has the same place and size. It goes back into
// the map when the pointer goes down elsewhere, or when it's placed again (shown, hidden, moved under the map).
EarthFilters.prototype.bringMapPanelToFront = function() {
  var self = this;
  if (!this.frontLayer) {
    this.frontLayer = document.createElement('div');
    this.frontLayer.className = 'ef-front-layer';
    this.syncFrontLayer = function() {
      var layer = self.frontLayer;
      var map = self.mapContainer;
      if (!map.getClientRects().length) { // The map is hidden
        layer.style.display = 'none';
        return;
      }
      var rect = map.getBoundingClientRect();
      layer.style.display = '';
      layer.style.left = (rect.left + map.clientLeft) + 'px';
      layer.style.top = (rect.top + map.clientTop) + 'px';
      layer.style.width = map.clientWidth + 'px';
      layer.style.height = map.clientHeight + 'px';
    };
    this.frontLayerPointerDown = function(event) {
      if (!self.container.contains(event.target)) {
        self.sendMapPanelBack();
      }
    };
  }
  if (this.container.parentNode === this.frontLayer) {
    return;
  }
  document.body.appendChild(this.frontLayer);
  this.syncFrontLayer();
  this.frontLayer.appendChild(this.container);
  window.addEventListener('scroll', this.syncFrontLayer, true); // Capture, for scrolling inside the page too
  window.addEventListener('resize', this.syncFrontLayer);
  document.addEventListener('pointerdown', this.frontLayerPointerDown, true);
};

EarthFilters.prototype.sendMapPanelBack = function() {
  if (!this.frontLayer || !this.frontLayer.parentNode) {
    return;
  }
  window.removeEventListener('scroll', this.syncFrontLayer, true);
  window.removeEventListener('resize', this.syncFrontLayer);
  document.removeEventListener('pointerdown', this.frontLayerPointerDown, true);
  if (this.container.parentNode === this.frontLayer) {
    this.mapContainer.appendChild(this.container);
  }
  this.frontLayer.parentNode.removeChild(this.frontLayer);
};

window.EarthFilters = {
  create: function(container, options) {
    return new EarthFilters(container, options);
  },
  parseHash: parseEarthFiltersHash,
  formatHash: formatEarthFiltersHash,
  defaultHash: earthFiltersDefaultHash
};

})(window);
