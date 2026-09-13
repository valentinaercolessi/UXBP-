document.addEventListener('DOMContentLoaded', () => {
  const raw = sessionStorage.getItem('viajeBusqueda');
  if (!raw) {
    window.location.href = 'index.html';
    return;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    window.location.href = 'index.html';
    return;
  }

  const trip = TRIPS.find((t) => t.id === data.tripId);
  if (!trip) {
    window.location.href = 'index.html';
    return;
  }

  const inicio = new Date(data.inicio);
  const fin = new Date(data.fin);
  const dias = Math.max(1, Math.round((fin - inicio) / 86400000) + 1);
  const costoBase = trip.porNoche ? trip.precio * dias : trip.precio;

  document.getElementById('detalle-destination').textContent = trip.nombre;

  function formatFechaHora(date, hora) {
    return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()} · ${hora}hs`;
  }

  // ---------- Estado ----------

  let flightAltIndex = 0;
  let hotelAltIndex = 0;
  let currentTotal = 0;
  const selectedExtras = new Map(); // id -> precio

  // Vuelo y alojamiento vienen seleccionados por defecto (son "lo esencial"),
  // pero se pueden destildar tocando su precio, igual que las actividades.
  const idaBtn = document.getElementById('ida-precio');
  const vueltaBtn = document.getElementById('vuelta-precio');
  const hotelBtn = document.getElementById('hotel-precio');

  [idaBtn, vueltaBtn, hotelBtn].forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      updatePriceBar();
    });
  });

  const actividades = getActividadesForTrip(trip);
  const gastronomia = getGastronomiaForTrip(trip);
  const maxTotal = costoBase
    + actividades.reduce((sum, a) => sum + a.precio, 0)
    + gastronomia.reduce((sum, g) => sum + g.precio, 0);

  // ---------- Render: Vuelo / Alojamiento ----------

  function renderVuelo() {
    const alt = FLIGHT_ALT_POOL[flightAltIndex];
    const aerolinea = alt.aerolinea || trip.vuelo.aerolinea;

    document.getElementById('ida-fecha').textContent = formatFechaHora(inicio, alt.horaIda);
    document.getElementById('ida-aerolinea').textContent = aerolinea;
    document.getElementById('ida-ruta').textContent = `${trip.aeropuertoOrigen} → ${trip.aeropuertoDestino}`;

    document.getElementById('vuelta-fecha').textContent = formatFechaHora(fin, alt.horaVuelta);
    document.getElementById('vuelta-aerolinea').textContent = aerolinea;
    document.getElementById('vuelta-ruta').textContent = `${trip.aeropuertoDestino} → ${trip.aeropuertoOrigen}`;
  }

  function renderHotel() {
    const alt = HOTEL_ALT_POOL[hotelAltIndex];
    const nombre = alt.nombre || trip.alojamiento.nombre;
    const habitacion = alt.habitacion || trip.alojamiento.habitacion;
    const distancia = alt.distancia || trip.alojamiento.distancia;

    document.getElementById('hotel-nombre').textContent = nombre;
    document.getElementById('hotel-habitacion').textContent = `${habitacion} · ${trip.alojamiento.capacidad}`;
    document.getElementById('hotel-distancia').textContent = distancia;
    document.getElementById('hotel-photo-img').src = alt.imagen;
    document.getElementById('hotel-photo-img').alt = nombre;
  }

  function updatePriceBar() {
    const split = splitCosts(costoBase, FLIGHT_ALT_POOL[flightAltIndex].mult, HOTEL_ALT_POOL[hotelAltIndex].mult);

    idaBtn.textContent = formatCurrency(split.idaPrecio);
    vueltaBtn.textContent = formatCurrency(split.vueltaPrecio);
    hotelBtn.textContent = formatCurrency(split.hotelTotal);

    let extrasTotal = 0;
    selectedExtras.forEach((precio) => { extrasTotal += precio; });

    const idaTotal = idaBtn.classList.contains('selected') ? split.idaPrecio : 0;
    const vueltaTotal = vueltaBtn.classList.contains('selected') ? split.vueltaPrecio : 0;
    const hotelTotal = hotelBtn.classList.contains('selected') ? split.hotelTotal : 0;

    currentTotal = idaTotal + vueltaTotal + hotelTotal + extrasTotal;
    const percent = Math.min(100, (currentTotal / maxTotal) * 100);

    document.getElementById('price-current').textContent = formatCurrency(currentTotal);
    document.getElementById('price-max').textContent = formatCurrency(maxTotal);
    document.getElementById('price-fill').style.width = `${percent}%`;
  }

  renderVuelo();
  renderHotel();
  updatePriceBar();

  // ---------- Botones de refrescar ----------

  function refreshButton(btnId, onRefresh) {
    const btn = document.getElementById(btnId);
    btn.addEventListener('click', () => {
      onRefresh();
      btn.classList.remove('spinning');
      void btn.offsetWidth; // reinicia la animación si se toca varias veces seguidas
      btn.classList.add('spinning');
      updatePriceBar();
    });
  }

  refreshButton('refresh-vuelo', () => {
    flightAltIndex = (flightAltIndex + 1) % FLIGHT_ALT_POOL.length;
    renderVuelo();
    showToast('Buscamos otra opción de vuelo con un costo similar');
  });

  refreshButton('refresh-hotel', () => {
    hotelAltIndex = (hotelAltIndex + 1) % HOTEL_ALT_POOL.length;
    renderHotel();
    showToast('Buscamos otro alojamiento con un costo similar');
  });

  // ---------- Actividades / Gastronomía (seleccionables) ----------

  function renderSharedItems(containerId, items) {
    const container = document.getElementById(containerId);
    items.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'shared-item';
      el.innerHTML = `
        <div class="shared-item-image">
          <img src="${item.imagen}" alt="${item.nombre}">
        </div>
        <p class="shared-item-name">${item.nombre}</p>
        <button type="button" class="price-pill">${formatCurrency(item.precio)}</button>
      `;
      const pill = el.querySelector('.price-pill');
      pill.addEventListener('click', () => {
        const isSelected = pill.classList.toggle('selected');
        if (isSelected) {
          selectedExtras.set(item.id, item.precio);
        } else {
          selectedExtras.delete(item.id);
        }
        updatePriceBar();
      });
      container.appendChild(el);
    });
  }

  renderSharedItems('actividades-scroll', actividades);
  renderSharedItems('gastronomia-scroll', gastronomia);

  // ---------- Botones de navegación ----------

  document.getElementById('back-btn').addEventListener('click', () => {
    navigateWithFade('viaje-recomendado.html');
  });

  // ---------- Overlay: viaje guardado ----------

  const savedOverlay = document.getElementById('saved-overlay');
  const savedCheck = savedOverlay.querySelector('.saved-check');
  const savedCheckPath = document.getElementById('saved-check-path');
  const savedTitle = document.getElementById('saved-title');
  const savedButtons = [
    document.getElementById('saved-ver-viaje'),
    document.getElementById('saved-volver-inicio'),
  ];

  function resetSavedCheck() {
    const length = savedCheckPath.getTotalLength();
    savedCheckPath.style.transition = 'none';
    savedCheckPath.style.strokeDasharray = length;
    savedCheckPath.style.strokeDashoffset = length;
  }

  function drawSavedCheck() {
    savedCheckPath.getBoundingClientRect();
    savedCheckPath.style.transition = 'stroke-dashoffset 1s ease-out';
    savedCheckPath.style.strokeDashoffset = '0';
  }

  function openSavedOverlay() {
    resetSavedCheck();
    [savedCheck, savedTitle, ...savedButtons].forEach((el) => el.classList.remove('show'));

    savedOverlay.hidden = false;
    savedOverlay.getBoundingClientRect();
    requestAnimationFrame(() => {
      savedOverlay.classList.add('open');
    });

    // Secuencia: 1) sube el fondo/tarjeta, 2) el tilde arranca a dibujarse
    // a la vez que aparece el texto, 3) por último aparecen los botones.
    setTimeout(() => {
      savedCheck.classList.add('show');
      savedTitle.classList.add('show');
      drawSavedCheck();
    }, 550);

    setTimeout(() => {
      savedButtons.forEach((btn) => btn.classList.add('show'));
    }, 1550);
  }

  function closeSavedOverlay() {
    savedOverlay.classList.remove('open');
    setTimeout(() => { savedOverlay.hidden = true; }, 320);
  }

  document.getElementById('guardar-viaje-btn').addEventListener('click', () => {
    addSavedTrip({
      id: `${trip.id}-${Date.now()}`,
      tripId: trip.id,
      categoria: 'viable', // llegó acá tocando "Me interesa" en Viaje Recomendado
      nombre: trip.nombre,
      imagen: trip.imagen,
      inicio: inicio.toISOString(),
      fin: fin.toISOString(),
      dias,
      costoTotal: currentTotal,
      intereses: resolverInteresesConIcono(data.intereses, trip.intereses),
      guardadoEn: new Date().toISOString(),
    });
    openSavedOverlay();
  });

  savedOverlay.addEventListener('click', (e) => {
    if (e.target === savedOverlay) closeSavedOverlay();
  });

  document.getElementById('saved-ver-viaje').addEventListener('click', () => {
    navigateWithFade('mis-viajes.html');
  });

  document.getElementById('saved-volver-inicio').addEventListener('click', () => {
    navigateWithFade('index.html');
  });
});
