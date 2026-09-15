// Evalúa la misma curva cubic-bezier(x1,y1,x2,y2) que usa CSS, para poder
// animar un valor por JS (requestAnimationFrame) exactamente a la par de una
// transición CSS que use esa curva.
function cubicBezierEasing(x1, y1, x2, y2) {
  const A = (a1, a2) => 1 - 3 * a2 + 3 * a1;
  const B = (a1, a2) => 3 * a2 - 6 * a1;
  const C = (a1) => 3 * a1;
  const calcBezier = (t, a1, a2) => ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t;
  const getSlope = (t, a1, a2) => 3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1);
  function getTForX(x) {
    let t = x;
    for (let i = 0; i < 6; i++) {
      const slope = getSlope(t, x1, x2);
      if (slope === 0) return t;
      t -= (calcBezier(t, x1, x2) - x) / slope;
    }
    return t;
  }
  return (x) => calcBezier(getTForX(x), y1, y2);
}

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

  // Si se entró desde "Otras opciones", el viaje puntual viaja aparte (acá) en
  // vez de sobreescribir 'viajeBusqueda' — así esa búsqueda queda intacta y,
  // al volver, la lista de otras opciones sigue mostrando lo mismo de antes.
  const otrasOpcionesTripId = sessionStorage.getItem('otrasOpcionesTripId');
  if (otrasOpcionesTripId) sessionStorage.removeItem('otrasOpcionesTripId');
  const origen = otrasOpcionesTripId ? 'otras' : (data.origen === 'otras' ? 'otras' : 'viable');

  const trip = TRIPS.find((t) => t.id === (otrasOpcionesTripId ? Number(otrasOpcionesTripId) : data.tripId));
  if (!trip) {
    window.location.href = 'index.html';
    return;
  }

  // Alternativas de hotel acordes a la categoría del destino (ver data.js),
  // para que la foto siempre pegue con el tipo de lugar.
  const hotelPool = HOTEL_ALT_POOL_BY_CATEGORIA[trip.fotoCategoria] || HOTEL_ALT_POOL_BY_CATEGORIA.ciudad;

  if (!trip.alojamiento.desayuno) {
    document.getElementById('detalle-aloj-desayuno').hidden = true;
  }

  const inicio = new Date(data.inicio);
  const fin = new Date(data.fin);
  const dias = Math.max(1, Math.round((fin - inicio) / 86400000) + 1);
  const costoBase = trip.porNoche ? trip.precio * dias : trip.precio;

  document.getElementById('detalle-destination').textContent = trip.nombre;

  function formatFecha(date) {
    return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
  }

  // ---------- Estado ----------

  let flightAltIndex = 0;
  let hotelAltIndex = 0;
  let currentTotal = 0;
  let displayedTotal = 0; // valor mostrado en pantalla, va "alcanzando" a currentTotal animado
  let priceAnimFrame = null;
  let priceRendered = false; // recién al primer render el número ya aparece puesto, sin animar
  const selectedExtras = new Map(); // id -> precio

  // Debe ir exactamente a la par de la barra (.price-fill en el CSS): misma
  // duración y misma curva (cubic-bezier(0.22, 0.61, 0.36, 1)), para que el
  // número nunca siga contando después de que la barra ya se detuvo.
  const PRICE_BAR_DURATION = 900;
  const priceEase = cubicBezierEasing(0.22, 0.61, 0.36, 1);

  // Anima el número del precio actual contando hasta el nuevo total, en vez de
  // saltar de golpe, para que se sienta como que recalcula en vez de algo
  // instantáneo/automático (va de la mano con la barra, que también tarda).
  // La primera vez (al entrar a la pantalla) no anima: el precio ya está ahí.
  function animatePriceCurrent(to) {
    const el = document.getElementById('price-current');
    const from = displayedTotal;
    if (priceAnimFrame) cancelAnimationFrame(priceAnimFrame);
    if (from === to || !priceRendered) {
      priceRendered = true;
      displayedTotal = to;
      el.textContent = formatCurrency(to);
      return;
    }
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / PRICE_BAR_DURATION);
      const eased = priceEase(t);
      // Se guarda en cada frame (no solo al terminar) para que, si esta
      // animación se corta por otro cambio antes de llegar a destino, la
      // próxima arranque desde el valor real en pantalla y no desde uno viejo.
      displayedTotal = Math.round(from + (to - from) * eased);
      el.textContent = formatCurrency(displayedTotal);
      if (t < 1) {
        priceAnimFrame = requestAnimationFrame(tick);
      } else {
        priceAnimFrame = null;
      }
    }
    priceAnimFrame = requestAnimationFrame(tick);
  }

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
  const maxTotal = costoBase
    + actividades.reduce((sum, a) => sum + a.precio, 0);

  // Si este viaje viene de "Otras opciones" es, por definición, uno que se
  // pasa del presupuesto original: "TU PRESUPUESTO" sigue mostrando el
  // monto que puso al buscar, pero al lado se aclara cuánto se pasa el
  // total elegido por sobre ese monto (ej. "+$20.000").
  const mostrarDiferencia = origen === 'otras' && data.presupuesto > 0;
  const priceMaxExtraEl = document.getElementById('price-max-extra');
  if (mostrarDiferencia) {
    document.getElementById('price-max').textContent = formatCurrency(data.presupuesto);
  }

  // ---------- Render: Vuelo / Alojamiento ----------

  function renderVuelo() {
    const alt = FLIGHT_ALT_POOL[flightAltIndex];
    const aerolinea = alt.aerolinea || trip.vuelo.aerolinea;

    document.getElementById('ida-fecha').textContent = formatFecha(inicio);
    document.getElementById('ida-hora').textContent = `${alt.horaIda}hs`;
    document.getElementById('ida-aerolinea').textContent = aerolinea;
    document.getElementById('ida-ruta').textContent = `${trip.aeropuertoOrigen} → ${trip.aeropuertoDestino}`;

    document.getElementById('vuelta-fecha').textContent = formatFecha(fin);
    document.getElementById('vuelta-hora').textContent = `${alt.horaVuelta}hs`;
    document.getElementById('vuelta-aerolinea').textContent = aerolinea;
    document.getElementById('vuelta-ruta').textContent = `${trip.aeropuertoDestino} → ${trip.aeropuertoOrigen}`;
  }

  function renderHotel() {
    const alt = hotelPool[hotelAltIndex];
    const nombre = alt.nombre || trip.alojamiento.nombre;
    const habitacion = alt.habitacion || trip.alojamiento.habitacion;
    const distancia = alt.distancia || trip.alojamiento.distancia;
    // La opción "original" (alt.nombre null) es el hotel real del viaje: si
    // tiene una foto propia (trip.alojamiento.imagen) se usa esa en vez de la
    // genérica de la categoría, para que la foto sea del hotel que se nombra.
    const imagen = (!alt.nombre && trip.alojamiento.imagen) || alt.imagen;

    document.getElementById('hotel-nombre').textContent = nombre;
    document.getElementById('hotel-habitacion').textContent = habitacion;
    document.getElementById('hotel-capacidad').textContent = trip.alojamiento.capacidad;
    document.getElementById('hotel-distancia').textContent = distancia;
    document.getElementById('hotel-photo-img').src = imagen;
    document.getElementById('hotel-photo-img').alt = nombre;
  }

  function updatePriceBar() {
    const split = splitCosts(costoBase, FLIGHT_ALT_POOL[flightAltIndex].mult, hotelPool[hotelAltIndex].mult);

    idaBtn.querySelector('.price-pill-amount').textContent = formatCurrency(split.idaPrecio);
    vueltaBtn.querySelector('.price-pill-amount').textContent = formatCurrency(split.vueltaPrecio);
    hotelBtn.querySelector('.price-pill-amount').textContent = formatCurrency(split.hotelTotal);

    let extrasTotal = 0;
    selectedExtras.forEach((precio) => { extrasTotal += precio; });

    const idaTotal = idaBtn.classList.contains('selected') ? split.idaPrecio : 0;
    const vueltaTotal = vueltaBtn.classList.contains('selected') ? split.vueltaPrecio : 0;
    const hotelTotal = hotelBtn.classList.contains('selected') ? split.hotelTotal : 0;

    currentTotal = idaTotal + vueltaTotal + hotelTotal + extrasTotal;
    const percent = Math.min(100, (currentTotal / maxTotal) * 100);

    animatePriceCurrent(currentTotal);
    if (mostrarDiferencia) {
      const extra = Math.max(0, currentTotal - data.presupuesto);
      priceMaxExtraEl.hidden = extra === 0;
      priceMaxExtraEl.textContent = `+${formatCurrency(extra)}`;
    } else {
      document.getElementById('price-max').textContent = formatCurrency(maxTotal);
    }
    document.getElementById('price-fill').style.width = `${percent}%`;
  }

  renderVuelo();
  renderHotel();
  updatePriceBar();

  // ---------- Botones de refrescar ----------

  function refreshButton(btnId, onRefresh) {
    const btn = document.getElementById(btnId);
    const card = btn.closest('.esencial-card');
    btn.addEventListener('click', () => {
      onRefresh();
      btn.classList.remove('spinning');
      card.classList.remove('esencial-card-refresh');
      void btn.offsetWidth; // reinicia las animaciones si se toca varias veces seguidas
      btn.classList.add('spinning');
      card.classList.add('esencial-card-refresh');
      updatePriceBar();
    });
  }

  refreshButton('refresh-vuelo', () => {
    flightAltIndex = (flightAltIndex + 1) % FLIGHT_ALT_POOL.length;
    renderVuelo();
    // La nueva opción entra sin confirmar: el usuario la vuelve a tildar si la quiere.
    idaBtn.classList.remove('selected');
    vueltaBtn.classList.remove('selected');
  });

  refreshButton('refresh-hotel', () => {
    hotelAltIndex = (hotelAltIndex + 1) % hotelPool.length;
    renderHotel();
    hotelBtn.classList.remove('selected');
  });

  // ---------- Actividades (seleccionables) ----------

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
        <button type="button" class="price-pill">
          <svg class="price-pill-icon price-pill-icon-check" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5L9.5 17L19 6" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <svg class="price-pill-icon price-pill-icon-plus" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
          <span class="price-pill-amount">${formatCurrency(item.precio)}</span>
        </button>
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

  // ---------- Botones de navegación ----------

  document.getElementById('back-btn').addEventListener('click', () => {
    // Si se llegó acá directo desde "Otras opciones" (sin pasar por Viaje
    // Recomendado), volver ahí en vez de abrir un Viaje Recomendado que
    // nunca se visitó.
    navigateWithFade(origen === 'otras' ? 'otras-opciones.html' : 'viaje-recomendado.html');
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

    // Secuencia: 1) sube el fondo/tarjeta, 2) el tilde arranca a dibujarse,
    // 3) recién cuando termina de dibujarse aparece el texto, 4) por
    // último aparecen los botones.
    setTimeout(() => {
      savedCheck.classList.add('show');
      drawSavedCheck();
    }, 550);

    setTimeout(() => {
      savedTitle.classList.add('show');
    }, 1550);

    setTimeout(() => {
      savedButtons.forEach((btn) => btn.classList.add('show'));
    }, 1950);
  }

  function closeSavedOverlay() {
    savedOverlay.classList.remove('open');
    setTimeout(() => { savedOverlay.hidden = true; }, 320);
  }

  document.getElementById('guardar-viaje-btn').addEventListener('click', () => {
    // 'otras' si este viaje se abrió desde la pantalla "Otras opciones";
    // 'viable' si vino directo del viaje recomendado (el caso por defecto).
    const categoria = origen;
    addSavedTrip({
      id: `${trip.id}-${Date.now()}`,
      tripId: trip.id,
      categoria,
      // Por qué no era 100% viable (solo aplica a "otras"), para mostrarlo
      // también en la card de Mis Viajes.
      diferencia: categoria === 'otras' ? formatDiferenciaOtras(trip, currentTotal, data.presupuesto, inicio, fin) : '',
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
