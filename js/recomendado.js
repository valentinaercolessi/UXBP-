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
  const interesesAMostrar = resolverInteresesConIcono(data.intereses, trip.intereses);

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

  // ---------- Carrusel de fotos: pila apilada por profundidad ----------
  // Como en el diseño: la foto del frente al centro, grande y nítida; dos vecinas
  // a cada lado asomando de a poco, sin ninguna inclinación (nada de rotate);
  // solo se van achicando y oscureciendo cuanto más lejos del frente están.
  // Arrastrando, la pila "pasa" cartas: la de al lado se acerca y crece, la del frente
  // se va desplazando y encogiendo hacia atrás.

  const stage = document.getElementById('carousel');
  const ring = document.createElement('div');
  ring.className = 'carousel-ring';
  stage.appendChild(ring);

  // El alto de .carousel se achica en pantallas bajas (ver CSS) para que la
  // pantalla entera entre sin scroll; acá medimos su alto real y escalamos
  // .carousel-ring en la misma proporción, para que las fotos se achiquen
  // parejo en vez de quedar recortadas por el overflow:hidden. Se mide con
  // JS (no container query units) porque en algún navegador de celular no
  // llegaban a aplicarse a tiempo y el feed se veía cortado arriba/abajo.
  const CAROUSEL_DESIGN_HEIGHT = 406;
  const carouselResizeObserver = new ResizeObserver((entries) => {
    const height = entries[0].contentRect.height;
    if (height <= 0) return;
    const scale = Math.min(1, height / CAROUSEL_DESIGN_HEIGHT);
    stage.style.setProperty('--carousel-scale', scale);
  });
  carouselResizeObserver.observe(stage);

  const feed = getFeedForTrip(trip);
  const slides = feed.map((photo) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    const esVideo = photo.tipo === 'video';
    const media = esVideo
      ? `<video src="${photo.src}" autoplay muted loop playsinline></video>
         <span class="carousel-video-badge">
           <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
         </span>`
      : `<img src="${photo.src}" alt="Foto de ${photo.user} en ${trip.nombre}">`;
    slide.innerHTML = `
      ${media}
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
  const VISIBLE_RANGE = 2; // frente + 2 vecinas de cada lado, como en el diseño
  // El achique entre frente→vecina inmediata y vecina inmediata→lejana es el
  // mismo paso (0.75 y 0.50, a 0.25 cada uno) y el desplazamiento de la
  // lejana está calculado para que, sumado a su tamaño ya reducido, su borde
  // quede siempre dentro del ancho de pantalla más angosto que soportamos
  // (~360px) — así ninguna se corta con el borde, solo "se hunden" hacia atrás.
  const STEP_X_NEAR = 80; // desplazamiento de la vecina inmediata (offset 1)
  const STEP_X_FAR = 105; // desplazamiento de la vecina lejana (offset 2)
  const SCALE_NEAR = 0.75; // achique de la vecina inmediata
  const SCALE_FAR = 0.5; // achique de la vecina lejana
  let position = 0; // índice "de frente" (puede ser fraccional mientras se arrastra)

  function scaleForOffset(absOffset) {
    const a = Math.min(absOffset, VISIBLE_RANGE);
    if (a <= 1) return 1 - a * (1 - SCALE_NEAR);
    return SCALE_NEAR - (a - 1) * (SCALE_NEAR - SCALE_FAR);
  }

  function translateXForOffset(offset) {
    const sign = offset < 0 ? -1 : 1;
    const a = Math.min(Math.abs(offset), VISIBLE_RANGE);
    const dx = a <= 1 ? a * STEP_X_NEAR : STEP_X_NEAR + (a - 1) * (STEP_X_FAR - STEP_X_NEAR);
    return sign * dx;
  }

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
      const translateX = translateXForOffset(offset);
      const scale = scaleForOffset(absOffset);
      slide.style.transform = `translateX(${translateX}px) scale(${scale})`;
      slide.style.opacity = visible ? String(1 - absOffset * 0.35) : '0';
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
    // Por si quedó una selección de "Otras opciones" sin consumir, para que
    // este flujo normal siempre muestre el viaje de 'viajeBusqueda'.
    sessionStorage.removeItem('otrasOpcionesTripId');
    navigateWithFade('viaje-detalle.html');
  });

  document.getElementById('otras-opciones-btn').addEventListener('click', () => {
    navigateWithFade('otras-opciones.html');
  });
});
