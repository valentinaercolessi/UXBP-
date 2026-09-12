document.addEventListener('DOMContentLoaded', () => {
  // Grupo de chips de filtro reutilizable (home + modal), con botón "+" para agregar uno propio
  function setupChipGroup(containerEl, addBtnEl, onChange) {
    containerEl.querySelectorAll('.chip[data-chip]').forEach((chip) => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
        if (onChange) onChange();
      });
    });
    if (addBtnEl) {
      addBtnEl.addEventListener('click', () => {
        const label = prompt('Nombre del filtro que querés agregar:');
        if (!label) return;
        const chip = document.createElement('button');
        chip.className = 'chip active';
        chip.dataset.chip = label.toLowerCase();
        chip.innerHTML = `<span>${label}</span>`;
        chip.addEventListener('click', () => {
          chip.classList.toggle('active');
          if (onChange) onChange();
        });
        containerEl.insertBefore(chip, addBtnEl);
        if (onChange) onChange();
      });
    }
  }

  setupChipGroup(document.querySelector('.chips-scroll:not(#modal-chips)'), document.getElementById('add-chip'));

  // Búsqueda principal (sin backend por ahora)
  const searchForm = document.getElementById('search-form');
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('search-input').value.trim();
    if (query) showToast(`Buscando "${query}"…`);
  });

  document.getElementById('mic-btn').addEventListener('click', () => {
    showToast('Búsqueda por voz próximamente');
  });

  // Resultados de búsqueda en el home
  const resultsSection = document.getElementById('search-results');
  const resultsGrid = document.getElementById('search-results-grid');
  const resultsCount = document.getElementById('search-results-count');

  function renderResults(trips) {
    resultsGrid.innerHTML = '';
    if (trips.length === 0) {
      resultsGrid.innerHTML = '<p class="no-results">No encontramos viajes con esos filtros. Probá ajustar el presupuesto, las fechas o los intereses.</p>';
    } else {
      trips.forEach((trip) => {
        const card = document.createElement('a');
        card.className = 'card';
        card.href = '#';
        card.addEventListener('click', (e) => {
          e.preventDefault();
          showToast(`Viste ${trip.nombre} en Resultados de tu búsqueda`);
        });
        card.innerHTML = `
          <div class="card-image"><img src="${trip.imagen}" alt="${trip.nombre}"></div>
          <div class="card-info">
            <h3 class="card-title">${trip.nombre}</h3>
            <p class="card-price">Desde ${formatCurrency(trip.precio)}${trip.porNoche ? ' /noche' : ''}</p>
          </div>`;
        resultsGrid.appendChild(card);
      });
    }
    resultsCount.textContent = trips.length ? `(${trips.length})` : '';
    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.getElementById('clear-results').addEventListener('click', () => {
    resultsSection.hidden = true;
  });

  // Si venimos de "Otras opciones" en la pantalla de Viaje Recomendado, mostramos esa lista
  const pendingIds = sessionStorage.getItem('pendingResults');
  if (pendingIds) {
    sessionStorage.removeItem('pendingResults');
    try {
      const ids = JSON.parse(pendingIds);
      const trips = ids.map((id) => TRIPS.find((t) => t.id === id)).filter(Boolean);
      renderResults(trips);
    } catch (e) {
      // ignorar datos corruptos
    }
  }

  // ---------- Modal "Viaje más viable" ----------

  const modal = document.getElementById('viaje-modal');
  const ctaViable = document.getElementById('cta-viable');
  const modalClose = document.getElementById('modal-close');

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => modal.classList.add('open'));
    });
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; }, 250);
  }

  ctaViable.addEventListener('click', openModal);
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  // ---------- Acordeón de secciones ----------

  const accordionSections = Array.from(document.querySelectorAll('.accordion-section'));

  function setOpenSection(id) {
    accordionSections.forEach((section) => {
      const isTarget = section.id === id;
      section.classList.toggle('open', isTarget);
      section.querySelector('.accordion-header').setAttribute('aria-expanded', String(isTarget));
    });
  }

  function isSectionOpen(id) {
    const section = document.getElementById(id);
    return section && section.classList.contains('open');
  }

  accordionSections.forEach((section) => {
    section.querySelector('.accordion-header').addEventListener('click', () => {
      const willOpen = !section.classList.contains('open');
      setOpenSection(willOpen ? section.id : null);
    });
  });

  setOpenSection('section-presupuesto');

  // Slider de presupuesto
  const budgetSlider = document.getElementById('budget-slider');
  const budgetValue = document.getElementById('budget-value');
  const summaryPresupuesto = document.getElementById('summary-presupuesto');

  function updateBudgetUI() {
    const min = Number(budgetSlider.min);
    const max = Number(budgetSlider.max);
    const val = Number(budgetSlider.value);
    const percent = ((val - min) / (max - min)) * 100;
    budgetSlider.style.background =
      `linear-gradient(to right, var(--grey-inactive) 0%, var(--grey-inactive) ${percent}%, var(--natural-light) ${percent}%, var(--natural-light) 100%)`;
    budgetValue.textContent = val === 0 ? '$0' : formatCurrency(val);
    summaryPresupuesto.textContent = val === 0 ? 'Sin definir' : formatCurrency(val);
  }

  budgetSlider.addEventListener('input', updateBudgetUI);
  budgetSlider.addEventListener('change', () => {
    if (isSectionOpen('section-presupuesto')) setOpenSection('section-fechas');
  });
  updateBudgetUI();

  // Calendario de fechas disponibles
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const calMonthEl = document.getElementById('cal-month');
  const calGridEl = document.getElementById('cal-grid');
  const calPrevBtn = document.getElementById('cal-prev');
  const calNextBtn = document.getElementById('cal-next');
  const summaryFechas = document.getElementById('summary-fechas');

  let viewDate = new Date(2025, 9, 1); // Octubre 2025, como en el diseño
  let rangeStart = new Date(2025, 9, 14);
  let rangeEnd = new Date(2025, 9, 18);

  function isInRange(date) {
    if (!rangeStart) return false;
    const end = rangeEnd || rangeStart;
    const lo = rangeStart < end ? rangeStart : end;
    const hi = rangeStart < end ? end : rangeStart;
    return date >= lo && date <= hi;
  }

  function updateFechasSummary() {
    if (rangeStart && rangeEnd) {
      summaryFechas.textContent = `${formatDateShort(rangeStart)} - ${formatDateShort(rangeEnd)}`;
    } else if (rangeStart) {
      summaryFechas.textContent = formatDateShort(rangeStart);
    } else {
      summaryFechas.textContent = 'Sin definir';
    }
  }

  function renderCalendar() {
    calMonthEl.textContent = monthNames[viewDate.getMonth()];
    calGridEl.innerHTML = '';

    const firstWeekday = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

    for (let i = 0; i < firstWeekday; i++) {
      const empty = document.createElement('div');
      empty.className = 'calendar-day empty';
      calGridEl.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'calendar-day';
      cell.textContent = String(d).padStart(2, '0');
      if (isInRange(date)) cell.classList.add('selected');
      cell.addEventListener('click', () => {
        let justCompletedRange = false;
        if (!rangeStart || rangeEnd) {
          rangeStart = date;
          rangeEnd = null;
        } else if (date < rangeStart) {
          rangeStart = date;
        } else {
          rangeEnd = date;
          justCompletedRange = true;
        }
        renderCalendar();
        updateFechasSummary();
        if (justCompletedRange && isSectionOpen('section-fechas')) {
          setOpenSection('section-intereses');
        }
      });
      calGridEl.appendChild(cell);
    }
  }

  calPrevBtn.addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    renderCalendar();
  });
  calNextBtn.addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    renderCalendar();
  });

  renderCalendar();
  updateFechasSummary();

  // Intereses (dentro del modal)
  const summaryIntereses = document.getElementById('summary-intereses');

  function updateInteresesSummary() {
    const activos = Array.from(document.querySelectorAll('#modal-chips .chip.active span')).map((s) => s.textContent);
    summaryIntereses.textContent = activos.length ? activos.join(', ') : 'Sin definir';
  }

  setupChipGroup(document.getElementById('modal-chips'), document.getElementById('modal-add-chip'), updateInteresesSummary);

  // Adjuntar archivo / "¿Ya tenés algo en mente?"
  const attachBtn = document.getElementById('attach-btn');
  const attachInput = document.getElementById('attach-input');
  const menteInput = document.getElementById('mente-input');
  const summaryMente = document.getElementById('summary-mente');

  function updateMenteSummary() {
    const val = menteInput.value.trim();
    summaryMente.textContent = val || 'Sin definir';
  }

  menteInput.addEventListener('input', updateMenteSummary);

  attachBtn.addEventListener('click', () => attachInput.click());
  attachInput.addEventListener('change', () => {
    const file = attachInput.files[0];
    if (file) {
      menteInput.value = file.name;
      updateMenteSummary();
      showToast(`Adjuntaste "${file.name}"`);
    }
  });

  // Buscar viaje: filtra los datos mockeados y te lleva a la pantalla de Viaje Recomendado
  document.getElementById('buscar-viaje-btn').addEventListener('click', () => {
    const presupuesto = Number(budgetSlider.value);
    const intereses = Array.from(document.querySelectorAll('#modal-chips .chip.active')).map((c) => c.dataset.chip);
    const texto = menteInput.value.trim();

    const resultados = buscarViajes({
      presupuesto,
      inicio: rangeStart,
      fin: rangeEnd,
      intereses,
      texto,
    });

    if (!resultados.length) {
      closeModal();
      showToast('No encontramos resultados para esa búsqueda');
      return;
    }

    const elegido = elegirMasViable(resultados, { presupuesto, intereses });

    sessionStorage.setItem('viajeBusqueda', JSON.stringify({
      tripId: elegido.id,
      presupuesto,
      inicio: rangeStart.toISOString(),
      fin: (rangeEnd || rangeStart).toISOString(),
      intereses,
      texto,
      otros: resultados.map((t) => t.id),
    }));

    window.location.href = 'viaje-recomendado.html';
  });
});
