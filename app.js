const LOCATIONS = [
    { id: 'sardina', name: 'Sardina del Norte', lat: 28.153780, lon: -15.700058, image: 'images/sardina_del_norte_1775319000201.png' },
    { id: 'agaete', name: 'Agaete', lat: 28.095031, lon: -15.708352, image: 'images/agaete.png' },
    { id: 'tufia', name: 'Tufia', lat: 27.961840, lon: -15.379835, image: 'images/tufia_bay_1775319016817.png' },
    { id: 'cabron', name: 'El Cabrón', lat: 27.870599, lon: -15.385277, image: 'images/el_cabron_1775319030003.png' },
    { id: 'risco', name: 'Risco Verde', lat: 27.856890, lon: -15.387041, image: 'images/risco_verde_1775319062071.png' },
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
    locList: document.getElementById('locations-list'),
    mainLogo: document.getElementById('main-logo'),
    calDropdown: document.getElementById('calendar-dropdown'),
    calPrevMonth: document.getElementById('cal-prev-month'),
    calNextMonth: document.getElementById('cal-next-month'),
    calMonthYear: document.getElementById('cal-month-year'),
    calDays: document.getElementById('cal-days')
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
        `, { autoPanPadding: [10, 10] }).addTo(map);
        
        marker.on('click', () => {
            // Hacemos zoom desplazando el centro un poco hacia el Norte, para que el marcador quede más abajo y el popup quepa perfecto.
            const latOffset = window.innerWidth < 600 ? 0.015 : 0.005;
            map.setView([spot.lat + latOffset, spot.lon], 13, { animate: true });
        });
        
        markers.push(marker);

        // HTML Tarjeta
        const card = document.createElement('div');
        card.className = `location-card glass`;
        card.style.cursor = 'pointer'; // Indicador visual de que es interactivo
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
        
        // Al clicar una tarjeta de la lista, hacemos zoom en el mapa y la abrimos
        card.addEventListener('click', () => {
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
    const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
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

DOM.btnCheck.addEventListener('click', async () => {
    DOM.btnCheck.classList.add('hidden');
    DOM.loading.classList.remove('hidden');
    if (DOM.mainLogo) DOM.mainLogo.classList.add('hidden');

    try {
        globalData = await fetchMeteoData();
        DOM.loading.classList.add('hidden');
        DOM.results.classList.remove('hidden');
        DOM.dateControls.classList.remove('hidden');
        DOM.hourSliderContainer.classList.remove('hidden');

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
        
        // Aseguramos que tras la animación de entrada (0.5s en CSS) se refresque el mapa
        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 600);

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

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Registrado!', reg.scope))
            .catch(err => console.log('Fallo al registrar el Service Worker', err));
    });
}

