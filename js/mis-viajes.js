document.addEventListener('DOMContentLoaded', () => {

  // ---------- Segmentos: Activos / Pasados / Guardados ----------

  const segments = Array.from(document.querySelectorAll('.mv-segment'));
  const panels = {
    activos: document.getElementById('mv-panel-activos'),
    pasados: document.getElementById('mv-panel-pasados'),
    guardados: document.getElementById('mv-panel-guardados'),
  };

  segments.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.segment;
      segments.forEach((s) => {
        s.classList.toggle('active', s === btn);
        s.setAttribute('aria-selected', String(s === btn));
      });
      Object.entries(panels).forEach(([key, panel]) => { panel.hidden = key !== target; });
    });
  });

  // ---------- Guardados: viajes reales guardados por el usuario ----------

  function formatSubtitulo(record, esElMasReciente) {
    if (esElMasReciente) return 'Resultado de tu última búsqueda.';
    const fecha = new Date(record.guardadoEn);
    const dd = String(fecha.getDate()).padStart(2, '0');
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const yy = String(fecha.getFullYear()).slice(-2);
    return `Resultado de tu búsqueda del ${dd}/${mm}/${yy}.`;
  }

  function buildCard(record, esElMasReciente) {
    const entry = document.createElement('div');
    entry.className = 'mv-entry';
    entry.innerHTML = `
      <article class="mv-card">
        <button type="button" class="mv-delete-btn" aria-label="Eliminar viaje guardado">
          <img src="assets/icons/icon-close-circle.svg" alt="">
        </button>
        <div class="mv-card-top">
          <div class="mv-card-photo"><img src="${record.imagen}" alt="${record.nombre}"></div>
          <div class="mv-card-info">
            <h3 class="mv-card-title">${record.nombre}</h3>
            <p class="mv-card-dates">${formatDateRange(new Date(record.inicio), new Date(record.fin))}</p>
            <p class="mv-card-sub">${formatSubtitulo(record, esElMasReciente)}</p>
            <div class="mv-card-stats">
              <div class="mv-stat">
                <span class="mv-stat-label">COSTO TOTAL</span>
                <span class="mv-stat-value">${formatCurrency(record.costoTotal)}</span>
              </div>
              <div class="mv-stat-divider"></div>
              <div class="mv-stat">
                <span class="mv-stat-label">DÍAS</span>
                <span class="mv-stat-value">${record.dias}</span>
              </div>
            </div>
          </div>
        </div>
      </article>
      <button type="button" class="cta-button mv-reservar-btn">Reservar</button>
    `;
    entry.querySelector('.mv-reservar-btn').addEventListener('click', () => {
      showToast('La reserva va a estar disponible próximamente');
    });
    entry.querySelector('.mv-delete-btn').addEventListener('click', () => {
      openDeleteConfirm(record.id);
    });
    return entry;
  }

  function renderGroup(records, listId, countId, idDelMasReciente) {
    const list = document.getElementById(listId);
    const count = document.getElementById(countId);
    list.innerHTML = '';
    count.textContent = records.length ? `(${records.length})` : '';
    records
      .slice()
      .sort((a, b) => new Date(b.guardadoEn) - new Date(a.guardadoEn))
      .forEach((record) => list.appendChild(buildCard(record, record.id === idDelMasReciente)));
  }

  function renderGuardados() {
    const guardados = getSavedTrips();
    const viables = guardados.filter((r) => r.categoria !== 'otras');
    const otras = guardados.filter((r) => r.categoria === 'otras');

    // Solo el viaje guardado más reciente de todos (sea cual sea su categoría)
    // dice "última búsqueda"; el resto muestra la fecha en que se guardó.
    const masReciente = guardados.reduce(
      (a, b) => (!a || new Date(b.guardadoEn) > new Date(a.guardadoEn) ? b : a),
      null
    );
    const idDelMasReciente = masReciente ? masReciente.id : null;

    document.getElementById('mv-section-viables').hidden = viables.length === 0;
    document.getElementById('mv-section-otras').hidden = otras.length === 0;
    document.getElementById('mv-divider').hidden = viables.length === 0 || otras.length === 0;
    document.getElementById('mv-empty-guardados').hidden = guardados.length > 0;

    renderGroup(viables, 'mv-list-viables', 'mv-count-viables', idDelMasReciente);
    renderGroup(otras, 'mv-list-otras', 'mv-count-otras', idDelMasReciente);
  }

  // ---------- Confirmación para eliminar un viaje guardado ----------

  const confirmOverlay = document.getElementById('mv-confirm-overlay');
  let pendingDeleteId = null;

  function openDeleteConfirm(id) {
    pendingDeleteId = id;
    confirmOverlay.hidden = false;
    confirmOverlay.getBoundingClientRect();
    requestAnimationFrame(() => confirmOverlay.classList.add('open'));
  }

  function closeDeleteConfirm() {
    confirmOverlay.classList.remove('open');
    pendingDeleteId = null;
    setTimeout(() => { confirmOverlay.hidden = true; }, 220);
  }

  confirmOverlay.addEventListener('click', (e) => {
    if (e.target === confirmOverlay) closeDeleteConfirm();
  });

  document.getElementById('mv-confirm-cancel').addEventListener('click', closeDeleteConfirm);

  document.getElementById('mv-confirm-delete').addEventListener('click', () => {
    if (pendingDeleteId) {
      removeSavedTrip(pendingDeleteId);
      renderGuardados();
    }
    closeDeleteConfirm();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !confirmOverlay.hidden) closeDeleteConfirm();
  });

  renderGuardados();
});
