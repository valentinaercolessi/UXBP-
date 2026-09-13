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

  const inicio = new Date(data.inicio);
  const fin = new Date(data.fin);
  const dias = Math.max(1, Math.round((fin - inicio) / 86400000) + 1);

  // Las "otras opciones" son el resto de los resultados de la misma búsqueda,
  // sin repetir el que ya se muestra como Viaje Recomendado, con un máximo de 3.
  const MAX_OTRAS = 3;
  const otrasIds = (data.otros || []).filter((id) => id !== data.tripId);
  const trips = otrasIds.map((id) => TRIPS.find((t) => t.id === id)).filter(Boolean).slice(0, MAX_OTRAS);

  const body = document.getElementById('oo-body');

  if (!trips.length) {
    document.getElementById('oo-description').hidden = true;
    body.innerHTML = `
      <p class="oo-empty">No encontramos otras opciones para esta búsqueda.</p>
      <button type="button" class="oo-btn-editar" id="oo-btn-editar">Editar datos ingresados</button>
    `;
    document.getElementById('oo-btn-editar').addEventListener('click', () => {
      sessionStorage.setItem('reabrirViajeModal', '1');
      navigateWithFade('index.html');
    });
  }

  trips.forEach((trip) => {
    const costoTotal = trip.porNoche ? trip.precio * dias : trip.precio;
    const diferencia = formatDiferenciaOtras(trip, costoTotal, data.presupuesto, inicio, fin);

    const card = document.createElement('article');
    card.className = 'oo-card';
    card.innerHTML = `
      <h3 class="oo-card-title">${trip.nombre}</h3>
      <p class="oo-card-dates">${formatDateRange(inicio, fin)}</p>
      <div class="oo-card-photo"><img src="${trip.imagen}" alt="${trip.nombre}"></div>
      ${diferencia ? `<p class="oo-card-diff">${diferencia}</p>` : ''}
      <div class="oo-card-stats">
        <div class="mv-stat">
          <span class="mv-stat-label">COSTO TOTAL</span>
          <span class="mv-stat-value">${formatCurrency(costoTotal)}</span>
        </div>
        <div class="mv-stat-divider"></div>
        <div class="mv-stat">
          <span class="mv-stat-label">DÍAS</span>
          <span class="mv-stat-value">${dias}</span>
        </div>
      </div>
      <button type="button" class="oo-btn-interesa">Ver más</button>
    `;

    card.querySelector('.oo-btn-interesa').addEventListener('click', () => {
      // No tocamos 'viajeBusqueda': así, al volver, esta pantalla sigue
      // mostrando exactamente la misma búsqueda y lista de antes.
      sessionStorage.setItem('otrasOpcionesTripId', String(trip.id));
      navigateWithFade('viaje-detalle.html');
    });

    body.appendChild(card);
  });

  // ---------- Navegación ----------

  document.getElementById('back-btn').addEventListener('click', () => {
    navigateWithFade('viaje-recomendado.html');
  });
});
