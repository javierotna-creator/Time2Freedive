const LOCATIONS = [
    { id: 'sardina', name: 'Sardina del Norte', lat: 28.1509, lon: -15.6951, image: 'images/sardina_del_norte_1775319000201.png' },
    { id: 'agaete', name: 'Agaete', lat: 28.1000, lon: -15.7170, image: 'images/agaete.png' },
    { id: 'tufia', name: 'Tufia', lat: 27.9622, lon: -15.3813, image: 'images/tufia_bay_1775319016817.png' },
    { id: 'cabron', name: 'El Cabrón', lat: 27.8680, lon: -15.3870, image: 'images/el_cabron_1775319030003.png' },
    { id: 'risco', name: 'Risco Verde', lat: 27.8590, lon: -15.3910, image: 'images/risco_verde_1775319062071.png' },
    { id: 'canteras', name: 'Las Canteras', lat: 28.1380, lon: -15.4380, image: 'images/las_canteras_1775319078513.png' }
];

let globalData = null; // Guardará todos los datos procesados
let currentDateIndex = 0; // 0 = hoy, 1 = mañana...
let currentHourIndex = new Date().getHours();
let map = null;
let markers = [];

const DOM = {
    btnCheck: document.getElementById('check-btn'),
    loading: document.getElementById('loading'),
    results: document.getElementById('results-container'),
    dateControls: document.getElementById('date-controls'),
    hourSliderContainer: document.getElementById('hour-slider-container'),
    dateDisplay: document.getElementById('current-date-display'),
    hourDisplay: document.getElementById('hour-display'),
    hourSlider: document.getElementById('hour-slider'),
    prevDayBtn: document.getElementById('prev-day-btn'),
    nextDayBtn: document.getElementById('next-day-btn'),
    locList: document.getElementById('locations-list')
};

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

    if (spotId === 'sardina') {
        if (isBetween(waveDir, 270, 45) && waveH > 0.8) { score = 0; reasons.push('Swell del Norte/NW peligroso'); }
        if (isBetween(windDir, 315, 45) && windS > 15) { score = Math.min(score, 1); reasons.push('Viento N fuerte'); }
        if (isBetween(windDir, 90, 225) && waveH < 1.0) { /* Perfecto */ }
    } else if (spotId === 'agaete') {
        if (isBetween(waveDir, 270, 45) && waveH > 0.8) { score = 0; reasons.push('Swell N/NW golpea directo'); }
        if (isBetween(windDir, 270, 45) && windS > 15) { score = 0; reasons.push('Viento N/NW racheado'); }
        if (isBetween(windDir, 90, 225) && waveH < 1.0) { /* Perfecto */ }
    } else if (spotId === 'tufia') {
        if (isBetween(windDir, 225, 360) && waveH < 1.0) { /* Perfecto */ }
        if (isBetween(waveDir, 45, 135) && waveH > 0.6) { score = 0; reasons.push('Swell del Este entra directo'); }
        if (isBetween(windDir, 45, 135) && windS > 20) { score = 0; reasons.push('Viento fuerte del Este'); }
    } else if (spotId === 'cabron') {
        if (isBetween(windDir, 0, 90) && windS > 20) { score = 0; reasons.push('Alisio fuerte genera corriente'); }
        if (isBetween(waveDir, 315, 45) && waveH > 1.0) { score = 0; reasons.push('Swell N técnico'); }
    } else if (spotId === 'risco') {
        if (waveH > 0.8 && isBetween(waveDir, 315, 135)) { score = 0; reasons.push('Mar de fondo ensucia la zona'); }
        if (isBetween(windDir, 0, 90) && windS > 15) { score = Math.min(score, 1); reasons.push('Alisio crea borreguillo'); }
    } else if (spotId === 'canteras') {
        if (isBetween(windDir, 315, 45) && windS > 20) { score = 0; reasons.push('Viento N pica el mar'); }
        if (isBetween(waveDir, 315, 45) && waveH > 1.2) { score = Math.min(score, 1); reasons.push('Swell fuerte, quédate dentro'); }
    }

    // Reglas Generales
    if (waveH > 2.0) score = 0;
    if (windS > 35) score = 0;

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
        map = L.map('map').setView([27.95, -15.55], 10);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors & CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);
    }
}

function updateUI() {
    if (!globalData || globalData.length === 0) return;

    const dayData = globalData[currentDateIndex];
    if(!dayData) return;

    // Actualizar fecha
    const d = new Date(dayData.date);
    DOM.dateDisplay.textContent = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
    DOM.hourDisplay.textContent = `${currentHourIndex}:00`;

    // Buscar los datos de la hora seleccionada
    const hourData = dayData.hours.find(h => h.hour === currentHourIndex);
    if (!hourData) return;

    // Actualizar fondo global basado en la peor/mejor condición (promedio o predominante)
    const statusCounts = { perfecto: 0, regular: 0, malo: 0 };
    hourData.spots.forEach(s => statusCounts[s.status]++);

    document.documentElement.className = '';
    if (statusCounts.perfecto >= 2) {
        document.documentElement.classList.add('state-perfecto');
    } else if (statusCounts.malo > 2) {
        document.documentElement.classList.add('state-peligroso');
    }

    // Actualizar DOM Tarjetas
    DOM.locList.innerHTML = '';
    
    // Limpiar marcadores viejos
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    hourData.spots.forEach(spot => {
        // Marcador Mapa
        let colorMap = spot.status === 'perfecto' ? '#00e676' : spot.status === 'regular' ? '#ffb74d' : '#e94560';
        const marker = L.circleMarker([spot.lat, spot.lon], {
            radius: 8,
            fillColor: colorMap,
            color: '#fff',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(`
            <div style="text-align: center;">
                <img src="${spot.image}" style="width: 100%; max-width: 150px; border-radius: 8px; margin-bottom: 0.5rem; display: block;" alt="${spot.name}">
                <b>${spot.name}</b><br>
                Estado: ${spot.status.toUpperCase()}
            </div>
        `).addTo(map);
        markers.push(marker);

        // HTML Tarjeta
        const card = document.createElement('div');
        card.className = `location-card glass`;
        card.innerHTML = `
            <div class="loc-header">
                <span class="loc-name">${spot.name}</span>
                <span class="loc-status status-${spot.status}">${spot.status}</span>
            </div>
            ${spot.reasons.length > 0 ? `<p style="font-size: 0.8rem; color: #ffb74d; margin-bottom: 0.5rem">${spot.reasons.join(', ')}</p>` : ''}
            <div class="loc-stats">
                <div class="stat-box">
                    <span class="stat-label">Oleaje</span>
                    <span class="stat-value">${spot.wave_height}m (${getDirectionName(spot.wave_direction)})</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Viento</span>
                    <span class="stat-value">${spot.wind_speed} km/h (${getDirectionName(spot.wind_direction)})</span>
                </div>
            </div>
        `;
        DOM.locList.appendChild(card);
    });
}

DOM.btnCheck.addEventListener('click', async () => {
    DOM.btnCheck.classList.add('hidden');
    DOM.loading.classList.remove('hidden');

    try {
        globalData = await fetchMeteoData();
        DOM.loading.classList.add('hidden');
        DOM.results.classList.remove('hidden');
        DOM.dateControls.classList.remove('hidden');
        DOM.hourSliderContainer.classList.remove('hidden');

        initMap();
        updateUI();
        setTimeout(() => map.invalidateSize(), 100);

    } catch (err) {
        console.error(err);
        alert('Error al consultar datos a Open-Meteo. Revisa tu conexión.');
        DOM.btnCheck.classList.remove('hidden');
        DOM.loading.classList.add('hidden');
    }
});

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
