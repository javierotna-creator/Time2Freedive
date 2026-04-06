const LOCATIONS = [
    { id: 'sardina', name: 'Sardina del Norte', lat: 28.153780, lon: -15.700058, image: 'images/sardina_del_norte_1775319000201.png' },
    { id: 'agaete', name: 'Agaete', lat: 28.095031, lon: -15.708352, image: 'images/agaete.png' },
    { id: 'tufia', name: 'Tufia', lat: 27.961840, lon: -15.379835, image: 'images/tufia_bay_1775319016817.png' },
    { id: 'cabron', name: 'El Cabrón', lat: 27.870599, lon: -15.385277, image: 'images/el_cabron_1775319030003.png' },
    { id: 'risco', name: 'Risco Verde', lat: 27.856890, lon: -15.387041, image: 'images/risco_verde_1775319062071.png' },
    { id: 'canteras', name: 'Las Canteras', lat: 28.1380, lon: -15.4380, image: 'images/las_canteras_1775319078513.png' }
];

const EXTRA_LOCATIONS = [
    // Gran Canaria
    { id: 'burrero', name: 'El Burrero', lat: 27.896, lon: -15.393, image: 'images/logo.png' },
    { id: 'pasitoblanco', name: 'Pasito Blanco', lat: 27.746, lon: -15.620, image: 'images/logo.png' },
    { id: 'amadores', name: 'Amadores', lat: 27.790, lon: -15.716, image: 'images/logo.png' },
    { id: 'laaldea', name: 'La Aldea', lat: 27.986, lon: -15.822, image: 'images/logo.png' },
    { id: 'puertillo', name: 'El Puertillo', lat: 28.140, lon: -15.534, image: 'images/logo.png' },
    { id: 'caletaabajo', name: 'Caleta de Abajo', lat: 28.165, lon: -15.659, image: 'images/logo.png' },
    { id: 'roqueprieto', name: 'Roque Prieto', lat: 28.152, lon: -15.619, image: 'images/logo.png' },
    { id: 'arinaga', name: 'Arinaga / Zoco Negro', lat: 27.863, lon: -15.391, image: 'images/logo.png' },
    { id: 'puertorico', name: 'Puerto Rico', lat: 27.788, lon: -15.713, image: 'images/logo.png' },
    { id: 'tauro', name: 'Tauro', lat: 27.796, lon: -15.727, image: 'images/logo.png' },
    // Tenerife
    { id: 'radazul', name: 'Radazul', lat: 28.406, lon: -16.323, image: 'images/logo.png' },
    { id: 'tabaiba', name: 'Tabaiba', lat: 28.402, lon: -16.331, image: 'images/logo.png' },
    { id: 'mesadelmar', name: 'Mesa del Mar', lat: 28.502, lon: -16.425, image: 'images/logo.png' },
    { id: 'garachico', name: 'Garachico', lat: 28.375, lon: -16.764, image: 'images/logo.png' },
    { id: 'abades', name: 'Abades', lat: 28.142, lon: -16.438, image: 'images/logo.png' },
    { id: 'montanaamarilla', name: 'Montaña Amarilla', lat: 28.009, lon: -16.637, image: 'images/logo.png' },
    { id: 'lasgalletas', name: 'Las Galletas', lat: 28.008, lon: -16.657, image: 'images/logo.png' },
    { id: 'alcala', name: 'Alcalá', lat: 28.201, lon: -16.832, image: 'images/logo.png' },
    { id: 'puertitoarmenime', name: 'Puertito de Armeñime', lat: 28.113, lon: -16.762, image: 'images/logo.png' },
    { id: 'losgigantes', name: 'Los Gigantes', lat: 28.243, lon: -16.840, image: 'images/logo.png' },
    { id: 'puntadeteno', name: 'Punta de Teno', lat: 28.344, lon: -16.922, image: 'images/logo.png' }
];

let globalData = null; // Guardará todos los datos procesados
let currentDateIndex = 0; // 0 = hoy, 1 = mañana...
let currentHourIndex = new Date().getHours();
let map = null;
let markers = [];
let layerControl = null;
let layersRef = {};

const dictReasons = {
    'Oleaje extremo (>2m)': { en: 'Extreme waves (>2m)', de: 'Extremer Wellengang (>2m)' },
    'Temporal de viento (>40km/h)': { en: 'Gale wind (>40km/h)', de: 'Sturmwind (>40km/h)' },
    'Swell N/NW fuerte (>1.2m)': { en: 'Strong N/NW swell (>1.2m)', de: 'Starker N/NW-Swell (>1.2m)' },
    'Viento N/NW fuerte (>25km/h)': { en: 'Strong N/NW wind (>25km/h)', de: 'Starker N/NW-Wind (>25km/h)' },
    'Swell N/NW moderado, posible turbidez': { en: 'Moderate N/NW swell, possible turbidity', de: 'Mäßiger N/NW-Swell, mögliche Trübung' },
    'Viento N/NW que pica algo el mar': { en: 'N/NW wind makes sea choppy', de: 'N/NW-Wind macht die See kabbelig' },
    'Viento fuerte generalizado': { en: 'Widespread strong wind', de: 'Allgemein starker Wind' },
    'Swell N/NW directo (>1.0m)': { en: 'Direct N/NW swell (>1.0m)', de: 'Direkter N/NW-Swell (>1.0m)' },
    'Viento N/NW fuerte (>22km/h)': { en: 'Strong N/NW wind (>22km/h)', de: 'Starker N/NW-Wind (>22km/h)' },
    'Swell N/NW residual': { en: 'Residual N/NW swell', de: 'Restlicher N/NW-Swell' },
    'Brisa N/NW afectando visibilidad': { en: 'N/NW breeze affecting visibility', de: 'N/NW-Brise beeinträchtigt Sicht' },
    'Swell Sur/SE entra duro (>0.8m)': { en: 'South/SE swell hits hard (>0.8m)', de: 'Süd/SE-Swell trifft hart (>0.8m)' },
    'Temporal viento Sur/SE': { en: 'South/SE gale', de: 'Süd/SE-Sturm' },
    'Oleaje Sur/SE moderado': { en: 'Moderate South/SE waves', de: 'Mäßige Süd/SE-Wellen' },
    'Viento Sur/SE levanta mar': { en: 'South/SE wind raises sea', de: 'Süd/SE-Wind peitscht See auf' },
    'Alisio muy fuerte fuera': { en: 'Very strong trade wind outside', de: 'Sehr starker Passatwind draußen' },
    'Swell Este/NE peligro a costa (>1.0m)': { en: 'East/NE swell danger to coast (>1.0m)', de: 'Ost/NE-Swell Gefahr für Küste (>1.0m)' },
    'Alisio fuerte directo (>25km/h)': { en: 'Direct strong trade wind (>25km/h)', de: 'Direkter starker Passatwind (>25km/h)' },
    'Peligro/visibilidad por Swell E/NE': { en: 'Danger/visibility due to E/NE swell', de: 'Gefahr/Sicht wegen E/NE-Swell' },
    'Alisio moderado racheado': { en: 'Moderate gusty trade wind', de: 'Mäßiger böiger Passatwind' },
    'Swell Este/NE muy fuerte (>1.2m)': { en: 'Very strong East/NE swell (>1.2m)', de: 'Sehr starker Ost/NE-Swell (>1.2m)' },
    'Vendaval de Alisio (>30km/h)': { en: 'Trade wind gale (>30km/h)', de: 'Passat-Sturm (>30km/h)' },
    'Resaca E/NE remueve fondo': { en: 'E/NE undertow stirs bottom', de: 'E/NE-Sog wühlt Boden auf' },
    'Alisio moderado forma oleaje': { en: 'Moderate trade wind forms waves', de: 'Mäßiger Passatwind bildet Wellen' },
    'Swell Norte salta la barra (>1.5m)': { en: 'North swell jumps the bar (>1.5m)', de: 'Nord-Swell springt über die Barriere (>1.5m)' },
    'Temporal viento Norte (>25km/h)': { en: 'North gale (>25km/h)', de: 'Nord-Sturm (>25km/h)' },
    'Mar de fondo Norte moderada': { en: 'Moderate North groundswell', de: 'Mäßige Nord-Dünung' },
    'Viento Norte refrescado afecta agua': { en: 'Freshened North wind affects water', de: 'Auffrischender Nordwind beeinflusst Wasser' }
};

const textI18n = {
    es: {
        subtitle: "Descubre dónde hacer apnea hoy en Canarias",
        addLocation: "Añadir ubicación",
        map: "Mapa",
        list: "Lista",
        loading: "Consultando a Poseidón (Open-Meteo)...",
        hour: "Hora",
        addLocTitle: "Añadir Ubicación",
        addLocDesc: "Elige un lugar de la lista o escribe uno nuevo para solicitarlo.",
        addLocPlaceholder: "Escribe el nombre del lugar...",
        cancel: "Cancelar",
        confirmAdd: "Añadir",
        status: { perfecto: 'perfecto', regular: 'regular', malo: 'malo' },
        waves: "Oleaje",
        wind: "Viento",
        state: "Estado",
        errorOpm: "Error al consultar datos a Open-Meteo. Revisa tu conexión.",
        alreadyActive: "Esa ubicación ya está activa y viéndose.",
        errorNewLoc: "Hubo un error al descargar datos para la nueva ubicación.",
        reqConfirm: "La ubicación '{0}' no está en la base de datos local. ¿Confirmas que quieres enviar una solicitud a los administradores para que la evalúen e incluyan?",
        reqSuccess: "¡Solicitud enviada correctamente! Te avisaremos cuando se añada.",
        reqError: "Hubo un problema de red al enviar la solicitud.",
        reqNoForm: "Formulario de sugerencias no configurado correctamente.",
        prevDay: "Día Anterior",
        nextDay: "Día Siguiente",
        loadingWord: "Cargando...",
        mapBase1: "Mapa Principal (Por defecto)",
        mapBase2: "Satélite",
        mapBase3: "Relieve y Terreno",
        mapOver1: "Relieve Submarino (Batimetría)",
        mapOver2: "Marcas y Navegación (Mar)",
        mapOver3: "Lluvia (Radar)",
        mapOver4: "Oleaje (Alt. ola)",
        mapOver5: "Viento"
    },
    en: {
        subtitle: "Discover where to freedive today in the Canary Islands",
        addLocation: "Add location",
        map: "Map",
        list: "List",
        loading: "Consulting Poseidon (Open-Meteo)...",
        hour: "Hour",
        addLocTitle: "Add Location",
        addLocDesc: "Choose a place from the list or type a new one to request it.",
        addLocPlaceholder: "Type the name of the place...",
        cancel: "Cancel",
        confirmAdd: "Add",
        status: { perfecto: 'perfect', regular: 'fair', malo: 'bad' },
        waves: "Waves",
        wind: "Wind",
        state: "Status",
        errorOpm: "Error querying data from Open-Meteo. Check your connection.",
        alreadyActive: "That location is already active and visible.",
        errorNewLoc: "There was an error downloading data for the new location.",
        reqConfirm: "The location '{0}' is not in the local database. Do you confirm you want to send a request to the administrators to evaluate and include it?",
        reqSuccess: "Request sent successfully! We will let you know when it is added.",
        reqError: "There was a network problem sending the request.",
        reqNoForm: "Suggestion form not configured correctly.",
        prevDay: "Previous Day",
        nextDay: "Next Day",
        loadingWord: "Loading...",
        mapBase1: "Main Map (Default)",
        mapBase2: "Satellite",
        mapBase3: "Relief and Terrain",
        mapOver1: "Underwater Relief (Bathymetry)",
        mapOver2: "Seamarks and Navigation",
        mapOver3: "Rain (Radar)",
        mapOver4: "Waves (Wave height)",
        mapOver5: "Wind"
    },
    de: {
        subtitle: "Entdecke heute, wo du auf den Kanaren freitauchen kannst",
        addLocation: "Ort hinzufügen",
        map: "Karte",
        list: "Liste",
        loading: "Poseidon wird befragt (Open-Meteo)...",
        hour: "Stunde",
        addLocTitle: "Ort hinzufügen",
        addLocDesc: "Wähle einen Ort aus der Liste oder gib einen neuen ein, um ihn anzufragen.",
        addLocPlaceholder: "Schreibe den Namen des Ortes...",
        cancel: "Abbrechen",
        confirmAdd: "Hinzufügen",
        status: { perfecto: 'perfekt', regular: 'mittelmäßig', malo: 'schlecht' },
        waves: "Wellen",
        wind: "Wind",
        state: "Status",
        errorOpm: "Fehler beim Abrufen von Daten von Open-Meteo. Überprüfe die Verbindung.",
        alreadyActive: "Dieser Ort ist bereits aktiv und sichtbar.",
        errorNewLoc: "Beim Herunterladen der Daten für den neuen Ort ist ein Fehler aufgetreten.",
        reqConfirm: "Der Ort '{0}' ist nicht in der lokalen Datenbank. Bestätigst du, dass du eine Anfrage an die Administratoren senden möchtest, um sie zu bewerten und aufzunehmen?",
        reqSuccess: "Anfrage erfolgreich gesendet! Wir werden dich informieren, sobald sie hinzugefügt wurde.",
        reqError: "Beim Senden der Anfrage ist ein Netzwerkproblem aufgetreten.",
        reqNoForm: "Vorschlagsformular nicht richtig konfiguriert.",
        prevDay: "Vorheriger Tag",
        nextDay: "Nächster Tag",
        loadingWord: "Wird geladen...",
        mapBase1: "Hauptkarte (Standard)",
        mapBase2: "Satellit",
        mapBase3: "Relief und Gelände",
        mapOver1: "Unterwasserrelief (Bathymetrie)",
        mapOver2: "Seemarken und Navigation",
        mapOver3: "Regen (Radar)",
        mapOver4: "Wellen (Wellenhöhe)",
        mapOver5: "Wind"
    }
};

const langLocales = { es: 'es-ES', en: 'en-US', de: 'de-DE' };
const langFlags = { es: '🇪🇸', en: '🇬🇧', de: '🇩🇪' };
let currentLang = 'es';

function t(key, ...args) {
    let str = textI18n[currentLang][key] || key;
    if (args.length > 0) {
        args.forEach((val, i) => {
            str = str.replace(`{${i}}`, val);
        });
    }
    return str;
}

function tReason(reason) {
    if (currentLang === 'es') return reason;
    if (dictReasons[reason] && dictReasons[reason][currentLang]) {
        return dictReasons[reason][currentLang];
    }
    return reason;
}

function updateStaticTranslations() {
    DOM.appSubtitle.textContent = t('subtitle');
    DOM.menuAddLoc.textContent = t('addLocation');
    DOM.prevDayBtn.title = t('prevDay');
    DOM.nextDayBtn.title = t('nextDay');
    if (DOM.dateDisplay.textContent === textI18n.es.loadingWord || DOM.dateDisplay.textContent === textI18n.en.loadingWord || DOM.dateDisplay.textContent === textI18n.de.loadingWord) {
        DOM.dateDisplay.textContent = t('loadingWord');
    }
    DOM.btnMapView.textContent = t('map');
    DOM.btnListView.textContent = t('list');
    DOM.txtLoading.textContent = t('loading');
    DOM.lblHour.textContent = t('hour');
    DOM.modalTitle.textContent = t('addLocTitle');
    DOM.modalDesc.textContent = t('addLocDesc');
    DOM.addLocInput.placeholder = t('addLocPlaceholder');
    DOM.btnCancelLoc.textContent = t('cancel');
    DOM.btnConfirmLoc.textContent = t('confirmAdd');
    
    document.querySelectorAll('.cal-day-name').forEach((el, index) => {
        const textDate = new Date(2023, 0, 2 + index); 
        el.textContent = textDate.toLocaleDateString(langLocales[currentLang], { weekday: 'short' });
    });
}


const DOM = {
    loading: document.getElementById('loading'),
    results: document.getElementById('results-container'),
    dateControls: document.getElementById('date-controls'),
    hourSliderContainer: document.getElementById('hour-slider-container'),
    viewToggle: document.getElementById('view-toggle'),
    btnMapView: document.getElementById('btn-map-view'),
    btnListView: document.getElementById('btn-list-view'),
    mapWrapper: document.querySelector('.map-wrapper'),
    cardsWrapper: document.querySelector('.cards-wrapper'),
    dateDisplay: document.getElementById('current-date-display'),
    hourDisplay: document.getElementById('hour-display'),
    hourSlider: document.getElementById('hour-slider'),
    prevDayBtn: document.getElementById('prev-day-btn'),
    nextDayBtn: document.getElementById('next-day-btn'),
    locList: document.getElementById('locations-list'),
    mainLogo: document.getElementById('main-logo'),
    calDropdown: document.getElementById('calendar-dropdown'),
    calPrevMonth: document.getElementById('cal-prev-month'),
    calNextMonth: document.getElementById('cal-next-month'),
    calMonthYear: document.getElementById('cal-month-year'),
    calDays: document.getElementById('cal-days'),
    // Nuevos elementos
    menuBtn: document.getElementById('menu-btn'),
    menuDropdown: document.getElementById('menu-dropdown'),
    menuAddLoc: document.getElementById('menu-add-loc'),
    addLocModal: document.getElementById('add-location-modal'),
    addLocInput: document.getElementById('add-loc-input'),
    locListDatalist: document.getElementById('loc-list'),
    btnCancelLoc: document.getElementById('btn-cancel-loc'),
    btnConfirmLoc: document.getElementById('btn-confirm-loc'),
    netlifyForm: document.forms['new-location-request'],
    appSubtitle: document.getElementById('app-subtitle'),
    lblHour: document.getElementById('lbl-hour'),
    txtLoading: document.getElementById('txt-loading'),
    modalTitle: document.getElementById('modal-title'),
    modalDesc: document.getElementById('modal-desc'),
    langSelector: document.getElementById('lang-selector'),
    currentLangBtn: document.getElementById('current-lang-btn'),
    langDropdown: document.getElementById('lang-dropdown'),
    langOptions: document.querySelectorAll('.lang-option')
};

let currentCalMonth = new Date().getMonth();
let currentCalYear = new Date().getFullYear();

// Utils: Direcciones en grados
const isBetween = (val, min, max) => {
    if (min > max) { // Rango que cruza el 0 (ej: N es 315 a 45)
        return val >= min || val <= max;
    }
    return val >= min && val <= max;
};

const getDirectionName = (deg) => {
    if (isBetween(deg, 337.5, 22.5)) return 'N';
    if (isBetween(deg, 22.5, 67.5)) return 'NE';
    if (isBetween(deg, 67.5, 112.5)) return 'E';
    if (isBetween(deg, 112.5, 157.5)) return 'SE';
    if (isBetween(deg, 157.5, 202.5)) return 'S';
    if (isBetween(deg, 202.5, 247.5)) return 'SW';
    if (isBetween(deg, 247.5, 292.5)) return 'W';
    if (isBetween(deg, 292.5, 337.5)) return 'NW';
    return '';
};

function evaluateConditions(spotId, waveH, waveDir, windS, windDir) {
    let score = 2; // 0: Malo, 1: Regular, 2: Perfecto
    let reasons = [];

    // Global rule
    if (waveH > 2.0) { score = 0; reasons.push('Oleaje extremo (>2m)'); return { score, reasons }; }
    if (windS > 40) { score = 0; reasons.push('Temporal de viento (>40km/h)'); return { score, reasons }; }

    if (spotId === 'sardina') {
        const swellNW = isBetween(waveDir, 270, 45);
        const windNW = isBetween(windDir, 270, 45);
        
        if (swellNW && waveH > 1.2) { score = 0; reasons.push('Swell N/NW fuerte (>1.2m)'); }
        if (windNW && windS > 25) { score = Math.min(score, 0); reasons.push('Viento N/NW fuerte (>25km/h)'); }
        
        // Only evaluate yellow if we are not already red based on specific constraints
        if (score > 0) {
            if (swellNW && waveH >= 0.8) { score = Math.min(score, 1); reasons.push('Swell N/NW moderado, posible turbidez'); }
            if (windNW && windS >= 15) { score = Math.min(score, 1); reasons.push('Viento N/NW que pica algo el mar'); }
            if (windS >= 35) { score = Math.min(score, 1); reasons.push('Viento fuerte generalizado'); } // Any wind > 35 is yellow (unless caught by global >40 red limit)
        }
    } else if (spotId === 'agaete') {
        const swellNW = isBetween(waveDir, 270, 45);
        const windNW = isBetween(windDir, 270, 45);
        
        if (swellNW && waveH > 1.0) { score = 0; reasons.push('Swell N/NW directo (>1.0m)'); }
        if (windNW && windS > 22) { score = Math.min(score, 0); reasons.push('Viento N/NW fuerte (>22km/h)'); }
        
        if (score > 0) {
            if (swellNW && waveH >= 0.6) { score = Math.min(score, 1); reasons.push('Swell N/NW residual'); }
            if (windNW && windS >= 12) { score = Math.min(score, 1); reasons.push('Brisa N/NW afectando visibilidad'); }
        }
    } else if (spotId === 'tufia') {
        const swellSE = isBetween(waveDir, 135, 225);
        const windSE = isBetween(windDir, 135, 225);
        const windNE = isBetween(windDir, 45, 135);
        
        if (swellSE && waveH > 0.8) { score = 0; reasons.push('Swell Sur/SE entra duro (>0.8m)'); }
        if (windSE && windS > 25) { score = Math.min(score, 0); reasons.push('Temporal viento Sur/SE'); }
        
        if (score > 0) {
            if (swellSE && waveH >= 0.5) { score = Math.min(score, 1); reasons.push('Oleaje Sur/SE moderado'); }
            if (windSE && windS >= 15) { score = Math.min(score, 1); reasons.push('Viento Sur/SE levanta mar'); }
            if (windNE && windS >= 35) { score = Math.min(score, 1); reasons.push('Alisio muy fuerte fuera'); }
        }
    } else if (spotId === 'cabron') {
        const swellNE = isBetween(waveDir, 45, 135);
        const windNE = isBetween(windDir, 45, 135);
        
        if (swellNE && waveH > 1.0) { score = 0; reasons.push('Swell Este/NE peligro a costa (>1.0m)'); }
        if (windNE && windS > 25) { score = Math.min(score, 0); reasons.push('Alisio fuerte directo (>25km/h)'); }
        
        if (score > 0) {
            if (swellNE && waveH >= 0.6) { score = Math.min(score, 1); reasons.push('Peligro/visibilidad por Swell E/NE'); }
            if (windNE && windS >= 15) { score = Math.min(score, 1); reasons.push('Alisio moderado racheado'); }
        }
    } else if (spotId === 'risco') {
        const swellNE = isBetween(waveDir, 45, 135);
        const windNE = isBetween(windDir, 45, 135);
        
        if (swellNE && waveH > 1.2) { score = 0; reasons.push('Swell Este/NE muy fuerte (>1.2m)'); }
        if (windNE && windS > 30) { score = Math.min(score, 0); reasons.push('Vendaval de Alisio (>30km/h)'); }
        
        if (score > 0) {
            if (swellNE && waveH >= 0.8) { score = Math.min(score, 1); reasons.push('Resaca E/NE remueve fondo'); }
            if (windNE && windS >= 18) { score = Math.min(score, 1); reasons.push('Alisio moderado forma oleaje'); }
        }
    } else if (spotId === 'canteras') {
        const swellNW = isBetween(waveDir, 270, 45);
        const windN = isBetween(windDir, 270, 90); // North components
        
        if (swellNW && waveH > 1.5) { score = 0; reasons.push('Swell Norte salta la barra (>1.5m)'); }
        if (windN && windS > 25) { score = Math.min(score, 0); reasons.push('Temporal viento Norte (>25km/h)'); }
        
        if (score > 0) {
            if (swellNW && waveH >= 1.0) { score = Math.min(score, 1); reasons.push('Mar de fondo Norte moderada'); }
            if (windN && windS >= 15) { score = Math.min(score, 1); reasons.push('Viento Norte refrescado afecta agua'); }
        }
    }

    return { score, reasons };
}

async function fetchMeteoData() {
    const lats = LOCATIONS.map(l => l.lat).join(',');
    const lons = LOCATIONS.map(l => l.lon).join(',');

    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lons}&hourly=wave_height,wave_direction&timezone=auto`;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&hourly=wind_speed_10m,wind_direction_10m&timezone=auto`;

    const [resM, resW] = await Promise.all([fetch(marineUrl), fetch(weatherUrl)]);
    const [dataM, dataW] = await Promise.all([resM.json(), resW.json()]);

    let processed = [];

    // Open-Meteo devuelve un array (si pedimos multiples coords) o un solo objeto si pides 1, 
    // pero al pasar varias lats/lons separadas por coma, devuelve un array de objetos.
    for (let i = 0; i < LOCATIONS.length; i++) {
        const obsM = Array.isArray(dataM) ? dataM[i] : dataM;
        const obsW = Array.isArray(dataW) ? dataW[i] : dataW;

        processed.push({
            ...LOCATIONS[i],
            time: obsM.hourly.time,
            wave_height: obsM.hourly.wave_height,
            wave_direction: obsM.hourly.wave_direction,
            wind_speed: obsW.hourly.wind_speed_10m,
            wind_direction: obsW.hourly.wind_direction_10m
        });
    }

    // Organizar por días y horas de forma más estructurada
    // Reduciremos el tiempo a los primeros 3 días para simplicidad
    const resultByDayAndHour = [];
    if(processed.length > 0) {
        const timeArray = processed[0].time;
        for (let i = 0; i < timeArray.length; i++) {
            const dateStr = timeArray[i].substring(0, 10); // YYYY-MM-DD
            const hourStr = timeArray[i].substring(11, 13); // HH
            
            let dayObj = resultByDayAndHour.find(d => d.date === dateStr);
            if (!dayObj) {
                dayObj = { date: dateStr, hours: [] };
                resultByDayAndHour.push(dayObj);
            }

            const spots = processed.map(loc => {
                const wh = loc.wave_height[i];
                const wdir = loc.wave_direction[i];
                const ws = loc.wind_speed[i];
                const wndDir = Math.round(loc.wind_direction[i]);
                const evaluation = evaluateConditions(loc.id, wh, wdir, ws, wndDir);
                return {
                    id: loc.id,
                    name: loc.name,
                    lat: loc.lat,
                    lon: loc.lon,
                    image: loc.image,
                    wave_height: wh,
                    wave_direction: wdir,
                    wind_speed: ws,
                    wind_direction: wndDir,
                    status: evaluation.score === 2 ? 'perfecto' : evaluation.score === 1 ? 'regular' : 'malo',
                    reasons: evaluation.reasons
                };
            });

            dayObj.hours.push({
                hour: parseInt(hourStr),
                spots
            });
        }
    }
    return resultByDayAndHour;
}

function initMap() {
    if (!map) {
        // Mapas Base (Basemaps)
        layersRef.cartoVoyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors & CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        });

        layersRef.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
            maxZoom: 19
        });

        layersRef.relief = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; OpenStreetMap contributors | Map style: &copy; OpenTopoMap',
            maxZoom: 17
        });

        layersRef.bathymetry = L.tileLayer.wms('https://ows.emodnet-bathymetry.eu/wms', {
            layers: 'emodnet:mean,emodnet:contours',
            format: 'image/png',
            transparent: true,
            attribution: 'EMODnet Bathymetry',
            opacity: 0.8
        });

        layersRef.seamarks = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; OpenSeaMap contributors',
            maxZoom: 18
        });

        layersRef.rainLayer = L.tileLayer('https://tilecache.rainviewer.com/v2/radar/1690000000/256/{z}/{x}/{y}/2/1_1.png', {
            attribution: 'Radar data: &copy; RainViewer',
            opacity: 0.6,
            maxZoom: 18,
            maxNativeZoom: 8
        });

        fetch('https://api.rainviewer.com/public/weather-maps.json')
            .then(res => res.json())
            .then(data => {
                if(data && data.radar && data.radar.past && data.radar.past.length > 0) {
                    const time = data.radar.past[data.radar.past.length - 1].time;
                    layersRef.rainLayer.setUrl(`https://tilecache.rainviewer.com/v2/radar/${time}/256/{z}/{x}/{y}/2/1_1.png`);
                }
            })
            .catch(console.error);

        layersRef.wavesLayer = L.tileLayer('https://weather.openportguide.de/tiles/actual/significant_wave_height/0h/{z}/{x}/{y}.png', {
            attribution: 'Weather data &copy; OpenPortGuide',
            opacity: 0.7,
            maxZoom: 18,
            maxNativeZoom: 8
        });

        layersRef.windLayer = L.tileLayer('https://weather.openportguide.de/tiles/actual/wind_stream/0h/{z}/{x}/{y}.png', {
            attribution: 'Weather data &copy; OpenPortGuide',
            opacity: 0.7,
            maxZoom: 18,
            maxNativeZoom: 8
        });

        map = L.map('map', {
            center: [27.95, -15.55],
            zoom: 10,
            layers: [layersRef.cartoVoyager]
        });

        updateLayerControl();
    }
}

function updateLayerControl() {
    if (!map) return;
    if (layerControl) map.removeControl(layerControl);
    
    const baseMaps = {};
    baseMaps[t('mapBase1')] = layersRef.cartoVoyager;
    baseMaps[t('mapBase2')] = layersRef.satellite;
    baseMaps[t('mapBase3')] = layersRef.relief;
    
    const overlayMaps = {};
    overlayMaps[t('mapOver1')] = layersRef.bathymetry;
    overlayMaps[t('mapOver2')] = layersRef.seamarks;
    overlayMaps[t('mapOver3')] = layersRef.rainLayer;
    overlayMaps[t('mapOver4')] = layersRef.wavesLayer;
    overlayMaps[t('mapOver5')] = layersRef.windLayer;

    layerControl = L.control.layers(baseMaps, overlayMaps, {
        position: 'topright'
    }).addTo(map);
}

function updateUI() {
    if (!globalData || globalData.length === 0) return;

    const dayData = globalData[currentDateIndex];
    if(!dayData) return;

    const d = new Date(dayData.date);
    DOM.dateDisplay.textContent = d.toLocaleDateString(langLocales[currentLang], { weekday: 'long', day: 'numeric', month: 'short' });
    DOM.hourDisplay.textContent = `${currentHourIndex}:00`;

    const hourData = dayData.hours.find(h => h.hour === currentHourIndex);
    if (!hourData) return;

    DOM.locList.innerHTML = '';
    
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    hourData.spots.forEach(spot => {
        let colorMap = spot.status === 'perfecto' ? '#00e676' : spot.status === 'regular' ? '#ffb74d' : '#e94560';
        let translatedStatus = t('status')[spot.status];
        
        const marker = L.circleMarker([spot.lat, spot.lon], {
            radius: 8,
            fillColor: colorMap,
            color: '#fff',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(`
            <div class="map-popup-container">
                <img src="${spot.image}" class="map-popup-img" alt="${spot.name}">
                <b class="map-popup-title">${spot.name}</b>
                <div class="map-popup-status">
                    ${t('state')}: <span class="loc-status status-${spot.status} popup-status-badge">${translatedStatus}</span>
                </div>
                ${spot.reasons.length > 0 ? `<p class="map-popup-reasons">${spot.reasons.map(r => tReason(r)).join(', ')}</p>` : ''}
                <div class="map-popup-stats">
                    <div class="popup-stat-box">
                        <span class="popup-stat-label">${t('waves')}</span>
                        <span class="popup-stat-value">${spot.wave_height}m (${getDirectionName(spot.wave_direction)})</span>
                    </div>
                    <div class="popup-stat-box">
                        <span class="popup-stat-label">${t('wind')}</span>
                        <span class="popup-stat-value">${spot.wind_speed} km/h (${getDirectionName(spot.wind_direction)})</span>
                    </div>
                </div>
            </div>
        `, { autoPanPadding: [10, 10], minWidth: 220 }).addTo(map);
        
        marker.on('click', () => {
            const latOffset = window.innerWidth < 600 ? 0.015 : 0.005;
            map.setView([spot.lat + latOffset, spot.lon], 13, { animate: true });
        });
        
        markers.push(marker);

        const card = document.createElement('div');
        card.className = `location-card glass`;
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div class="loc-header">
                <span class="loc-name">${spot.name}</span>
                <span class="loc-status status-${spot.status}">${translatedStatus}</span>
            </div>
            ${spot.reasons.length > 0 ? `<p style="font-size: 0.8rem; color: #ffb74d; margin-bottom: 0.5rem">${spot.reasons.map(r => tReason(r)).join(', ')}</p>` : ''}
            <div class="loc-stats">
                <div class="stat-box">
                    <span class="stat-label">${t('waves')}</span>
                    <span class="stat-value">${spot.wave_height}m (${getDirectionName(spot.wave_direction)})</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">${t('wind')}</span>
                    <span class="stat-value">${spot.wind_speed} km/h (${getDirectionName(spot.wind_direction)})</span>
                </div>
            </div>
        `;
        
        // Al clicar una tarjeta de la lista, hacemos zoom en el mapa y la abrimos
        card.addEventListener('click', () => {
            // Cambiar a vista de mapa
            DOM.btnMapView.classList.add('active');
            DOM.btnListView.classList.remove('active');
            DOM.mapWrapper.classList.remove('hidden');
            DOM.cardsWrapper.classList.add('hidden');
            if (map) {
                map.invalidateSize();
            }

            const latOffset = window.innerWidth < 600 ? 0.015 : 0.005;
            map.setView([spot.lat + latOffset, spot.lon], 13, { animate: true });
            marker.openPopup();
            // Desplazar la vista al mapa en dispositivos móviles
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        DOM.locList.appendChild(card);
    });

    renderCalendar();
}

function renderCalendar() {
    if (!DOM.calDays) return;
    DOM.calDays.innerHTML = '';
    const date = new Date(currentCalYear, currentCalMonth, 1);
    const monthName = date.toLocaleDateString(langLocales[currentLang], { month: 'long', year: 'numeric' });
    DOM.calMonthYear.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    let firstDayIndex = date.getDay() - 1;
    if (firstDayIndex === -1) firstDayIndex = 6;

    const daysInMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
        const d = document.createElement('div');
        d.className = 'cal-day empty';
        DOM.calDays.appendChild(d);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const d = document.createElement('div');
        const yyyy = currentCalYear;
        const mm = String(currentCalMonth + 1).padStart(2, '0');
        const dd = String(i).padStart(2, '0');
        const ds = `${yyyy}-${mm}-${dd}`;
        
        d.textContent = i;

        const dataIndex = globalData ? globalData.findIndex(g => g.date === ds) : -1;

        if (dataIndex !== -1) {
            const dayInfo = globalData[dataIndex];
            const hourForStatus = dayInfo.hours.find(h => h.hour === 12) || dayInfo.hours[0];
            const sCounts = { perfecto: 0, regular: 0, malo: 0 };
            if (hourForStatus && hourForStatus.spots) {
                hourForStatus.spots.forEach(s => sCounts[s.status]++);
            }
            
            let statusClass = 'cal-status-regular';
            if (sCounts.perfecto >= 2) statusClass = 'cal-status-perfecto';
            else if (sCounts.malo > 2) statusClass = 'cal-status-malo';

            d.className = `cal-day available ${statusClass}`;
            if (currentDateIndex === dataIndex) {
                d.classList.add('selected');
            }
            d.addEventListener('click', () => {
                currentDateIndex = dataIndex;
                DOM.calDropdown.classList.add('hidden');
                updateUI();
            });
        } else {
            d.className = 'cal-day disabled';
        }

        DOM.calDays.appendChild(d);
    }
}

if (DOM.dateDisplay) {
    DOM.dateDisplay.addEventListener('click', () => {
        DOM.calDropdown.classList.toggle('hidden');
        renderCalendar();
    });

    DOM.calPrevMonth.addEventListener('click', () => {
        currentCalMonth--;
        if (currentCalMonth < 0) { currentCalMonth = 11; currentCalYear--; }
        renderCalendar();
    });

    DOM.calNextMonth.addEventListener('click', () => {
        currentCalMonth++;
        if (currentCalMonth > 11) { currentCalMonth = 0; currentCalYear++; }
        renderCalendar();
    });

    document.addEventListener('click', (e) => {
        if (!DOM.dateDisplay.contains(e.target) && !DOM.calDropdown.contains(e.target)) {
            DOM.calDropdown.classList.add('hidden');
        }
    });
}

async function initApp() {
    DOM.loading.classList.remove('hidden');
    if (DOM.mainLogo) DOM.mainLogo.classList.add('hidden');

    try {
        globalData = await fetchMeteoData();
        DOM.loading.classList.add('hidden');
        DOM.results.classList.remove('hidden');
        DOM.dateControls.classList.remove('hidden');
        DOM.hourSliderContainer.classList.remove('hidden');
        DOM.viewToggle.classList.remove('hidden');

        initMap();
        updateUI();
        
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
                map.fitBounds([
                    [28.2, -15.85], // Noroeste
                    [27.7, -15.35]  // Sureste
                ], { animate: false });
            }
        }, 100);
        
        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 600);

    } catch (err) {
        console.error(err);
        alert(t('errorOpm'));
        DOM.loading.classList.add('hidden');
    }
}

function changeLang(lang) {
    if (!textI18n[lang]) return;
    currentLang = lang;
    
    DOM.currentLangBtn.textContent = langFlags[lang];
    DOM.langOptions.forEach(btn => {
        if (btn.dataset.lang === lang) {
            btn.style.display = 'none';
        } else {
            btn.style.display = 'block';
        }
    });

    updateStaticTranslations();
    if (map) updateLayerControl();
    updateUI();
}

DOM.langOptions.forEach(btn => {
    if (btn.dataset.lang === currentLang) btn.style.display = 'none';
});
updateStaticTranslations();

// Lang selector init
if (DOM.currentLangBtn) {
    DOM.currentLangBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        DOM.langDropdown.classList.toggle('hidden');
    });
    DOM.langOptions.forEach(btn => {
        btn.addEventListener('click', (e) => {
            changeLang(e.target.dataset.lang);
            DOM.langDropdown.classList.add('hidden');
        });
    });
    document.addEventListener('click', (e) => {
        if (DOM.langSelector && !DOM.langSelector.contains(e.target)) {
            DOM.langDropdown.classList.add('hidden');
        }
    });
}

// Iniciar aplicación automáticamente
initApp();

DOM.prevDayBtn.addEventListener('click', () => {
    if (currentDateIndex > 0) {
        currentDateIndex--;
        updateUI();
    }
});

DOM.nextDayBtn.addEventListener('click', () => {
    if (globalData && currentDateIndex < globalData.length - 1) {
        currentDateIndex++;
        updateUI();
    }
});

DOM.hourSlider.addEventListener('input', (e) => {
    currentHourIndex = parseInt(e.target.value);
    updateUI();
});

if (DOM.btnMapView && DOM.btnListView) {
    DOM.btnMapView.addEventListener('click', () => {
        DOM.btnMapView.classList.add('active');
        DOM.btnListView.classList.remove('active');
        DOM.mapWrapper.classList.remove('hidden');
        DOM.cardsWrapper.classList.add('hidden');
        if (map) {
            setTimeout(() => map.invalidateSize(), 50);
        }
    });

    DOM.btnListView.addEventListener('click', () => {
        DOM.btnListView.classList.add('active');
        DOM.btnMapView.classList.remove('active');
        DOM.cardsWrapper.classList.remove('hidden');
        DOM.mapWrapper.classList.add('hidden');
    });
}

// Lógica del Menú
if (DOM.menuBtn) {
    DOM.menuBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Evitar que el click cierre el menú inmediatamente
        DOM.menuDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!DOM.menuBtn.contains(e.target) && !DOM.menuDropdown.contains(e.target)) {
            DOM.menuDropdown.classList.add('hidden');
        }
    });
}

// Lógica de Añadir Ubicación
if (DOM.menuAddLoc) {
    DOM.menuAddLoc.addEventListener('click', () => {
        DOM.menuDropdown.classList.add('hidden');
        
        // Rellenar datalist si está vacío
        if (DOM.locListDatalist.options.length === 0) {
            EXTRA_LOCATIONS.forEach(loc => {
                const option = document.createElement('option');
                option.value = loc.name;
                DOM.locListDatalist.appendChild(option);
            });
        }
        
        DOM.addLocInput.value = '';
        DOM.addLocModal.classList.remove('hidden');
    });

    DOM.btnCancelLoc.addEventListener('click', () => {
        DOM.addLocModal.classList.add('hidden');
    });

    DOM.btnConfirmLoc.addEventListener('click', async () => {
        const selectedName = DOM.addLocInput.value.trim();
        if (!selectedName) return;

        // Comprobar si existe en nuestra BBDD
        const foundLoc = EXTRA_LOCATIONS.find(l => l.name.toLowerCase() === selectedName.toLowerCase());
        
        if (foundLoc) {
            const alreadyActive = LOCATIONS.find(l => l.id === foundLoc.id);
            if (alreadyActive) {
                alert(t('alreadyActive'));
                DOM.addLocModal.classList.add('hidden');
                return;
            }

            // Añadir al array activo y recargar
            LOCATIONS.push(foundLoc);
            DOM.addLocModal.classList.add('hidden');
            DOM.loading.classList.remove('hidden');
            DOM.results.classList.add('hidden');
            try {
                globalData = await fetchMeteoData();
                DOM.loading.classList.add('hidden');
                DOM.results.classList.remove('hidden');
                updateUI();
                
                // Hacer un zoom out para asegurar que se vean puntos lejanos
                if (map) {
                    const lats = LOCATIONS.map(l => l.lat);
                    const lons = LOCATIONS.map(l => l.lon);
                    map.fitBounds([
                        [Math.max(...lats) + 0.1, Math.min(...lons) - 0.1], 
                        [Math.min(...lats) - 0.1, Math.max(...lons) + 0.1]
                    ], { animate: true });
                }
            } catch (err) {
                alert(t('errorNewLoc'));
                DOM.loading.classList.add('hidden');
                DOM.results.classList.remove('hidden');
            }

        } else {
            const confirmNew = confirm(t('reqConfirm', selectedName));
            if (confirmNew) {
                if (DOM.netlifyForm) {
                    const formData = new FormData(DOM.netlifyForm);
                    formData.set('location-name', selectedName);
                    
                    try {
                        await fetch('/', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: new URLSearchParams(formData).toString()
                        });
                        alert(t('reqSuccess'));
                    } catch (err) {
                        console.error(err);
                        alert(t('reqError'));
                    }
                } else {
                    alert(t('reqNoForm'));
                }
            }
            DOM.addLocModal.classList.add('hidden');
        }
    });
}

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Registrado!', reg.scope))
            .catch(err => console.log('Fallo al registrar el Service Worker', err));
    });
}

