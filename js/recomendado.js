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
  const costoTotal = trip.porNoche ? trip.precio * dias : trip.precio;

  document.getElementById('reco-destination').textContent = trip.nombre;
  document.getElementById('reco-costo').textContent = formatCurrency(costoTotal);
  document.getElementById('reco-dias').textContent = String(dias);

  // Intereses: mostramos los que el usuario eligió en la búsqueda (o, si no marcó
  // ninguno con ícono conocido, los del propio viaje) para reflejar lo que pidió.
  const INTEREST_ICONS = {
    montana: 'assets/icons/terrain.svg',
    gastronomia: 'assets/icons/restaurant.svg',
    historia: 'assets/icons/menu_book_group1.svg',
    arte: 'assets/icons/palette.svg',
  };
  const elegidosConIcono = (data.intereses || []).filter((i) => INTEREST_ICONS[i]);
  const interesesAMostrar = elegidosConIcono.length
    ? elegidosConIcono
    : trip.intereses.filter((i) => INTEREST_ICONS[i]);

  const interesesEl = document.getElementById('reco-intereses');
  interesesAMostrar.forEach((interes) => {
    const span = document.createElement('span');
    span.className = 'reco-interest-icon';
    span.innerHTML = `<img src="${INTEREST_ICONS[interes]}" alt="${interes}">`;
    interesesEl.appendChild(span);
  });

  document.getElementById('reco-vuelo-fecha').textContent = formatDateLong(inicio);
  document.getElementById('reco-vuelo-aerolinea').textContent = trip.vuelo.aerolinea;

  document.getElementById('reco-aloj-nombre').textContent = trip.alojamiento.nombre;
  document.getElementById('reco-aloj-habitacion').textContent = trip.alojamiento.habitacion;
  if (!trip.alojamiento.desayuno) {
    document.getElementById('reco-aloj-desayuno').hidden = true;
  }

  // ---------- Carrusel de fotos: pila de cartas en abanico ----------
  // Solo se ven la foto del frente y su vecina de cada lado (como un mazo de cartas
  // apiladas y giradas); el resto queda completamente oculto hasta que le toca el turno.
  // Arrastrando, la pila "pasa" cartas: la de al lado se acerca y crece, la del frente
  // se va desplazando y encogiendo hacia atrás.

  const stage = document.getElementById('carousel');
  const ring = document.createElement('div');
  ring.className = 'carousel-ring';
  stage.appendChild(ring);

  const feed = getFeedForTrip(trip);
  const slides = feed.map((photo) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.innerHTML = `
      <img src="${photo.src}" alt="Foto de ${photo.user} en ${trip.nombre}">
      <div class="carousel-overlay"></div>
      <div class="carousel-user">
        <span class="carousel-avatar">${photo.inicial}</span>
        <div class="carousel-user-text">
          <span class="carousel-time">${photo.time}</span>
          <span class="carousel-username">${photo.user}</span>
        </div>
      </div>`;
    ring.appendChild(slide);
    return slide;
  });

  const count = slides.length;
  const STEP_X = 56; // px que se desplaza cada carta vecina
  const STEP_ANGLE = 13; // grados que se inclina cada carta vecina
  const VISIBLE_RANGE = 1; // solo se ven el frente + 1 vecina de cada lado
  let position = 0; // índice "de frente" (puede ser fraccional mientras se arrastra)

  // Distancia circular con signo más corta entre la carta i y la posición actual
  function circularOffset(i) {
    let d = (i - position) % count;
    if (d > count / 2) d -= count;
    if (d < -count / 2) d += count;
    return d;
  }

  const SLIDE_TRANSITION = 'transform 0.4s cubic-bezier(.22,.85,.32,1), opacity 0.3s ease, filter 0.3s ease';

  function setSlidesTransition(enabled) {
    slides.forEach((slide) => {
      slide.style.transition = enabled ? SLIDE_TRANSITION : 'none';
    });
  }

  function render() {
    slides.forEach((slide, i) => {
      const offset = circularOffset(i);
      const absOffset = Math.abs(offset);
      const visible = absOffset <= VISIBLE_RANGE + 0.001;
      const translateX = offset * STEP_X;
      const rotateDeg = offset * STEP_ANGLE;
      const scale = 1 - Math.min(absOffset, VISIBLE_RANGE) * 0.14;
      slide.style.transform = `translateX(${translateX}px) rotate(${rotateDeg}deg) scale(${scale})`;
      slide.style.opacity = visible ? String(1 - absOffset * 0.3) : '0';
      slide.style.filter = `brightness(${1 - Math.min(absOffset, VISIBLE_RANGE) * 0.35})`;
      slide.style.zIndex = String(Math.round((1 - absOffset) * 100));
      slide.style.pointerEvents = visible ? 'auto' : 'none';
    });
  }

  function snapToNearest(withTransition) {
    position = Math.round(position) % count;
    if (position < 0) position += count;
    setSlidesTransition(withTransition);
    render();
  }

  // Arrastre (touch / mouse) para pasar cartas
  let dragging = false;
  let dragged = false;
  let startX = 0;
  let startPosition = 0;

  // Escuchamos el arrastre en window (no con setPointerCapture) para no "robarle"
  // el evento click a las cartas vecinas cuando se las toca sin arrastrar.
  stage.addEventListener('pointerdown', (e) => {
    dragging = true;
    dragged = false;
    startX = e.clientX;
    startPosition = position;
    setSlidesTransition(false);
  });

  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) dragged = true;
    position = startPosition - dx / 130;
    render();
  });

  function stopDrag() {
    if (!dragging) return;
    dragging = false;
    snapToNearest(true);
  }

  window.addEventListener('pointerup', stopDrag);
  window.addEventListener('pointercancel', stopDrag);

  // Rueda del mouse / trackpad (solo cuando el gesto es horizontal)
  let wheelTimer;
  stage.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    setSlidesTransition(false);
    position += e.deltaX / 130;
    render();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => snapToNearest(true), 120);
  }, { passive: false });

  // Tocar la carta vecina la trae al frente (si no fue un arrastre)
  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => {
      if (dragged) return;
      const offset = circularOffset(i);
      if (Math.abs(offset) < 0.001) return;
      position += offset;
      snapToNearest(true);
    });
  });

  window.addEventListener('resize', render);

  snapToNearest(false);

  // ---------- Botones ----------

  document.getElementById('back-btn').addEventListener('click', () => {
    navigateWithFade('index.html');
  });

  document.getElementById('me-interesa-btn').addEventListener('click', () => {
    navigateWithFade('viaje-detalle.html');
  });

  document.getElementById('otras-opciones-btn').addEventListener('click', () => {
    sessionStorage.setItem('pendingResults', JSON.stringify(data.otros || []));
    navigateWithFade('index.html');
  });
});
