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
    setTimeout(() => { modal.hidden = true; }, 400);
  }

  ctaViable.addEventListener('click', openModal);
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  // Si venimos de "Editar datos ingresados" en Otras opciones, reabrimos este overlay
  if (sessionStorage.getItem('reabrirViajeModal')) {
    sessionStorage.removeItem('reabrirViajeModal');
    openModal();
  }

  // ---------- Acordeón de secciones ----------

  const accordionSections = Array.from(document.querySelectorAll('.accordion-section'));

  function setOpenSection(id) {
    accordionSections.forEach((section) => {
      const isTarget = section.id === id;
      section.classList.toggle('open', isTarget);
      section.querySelector('.accordion-header').setAttribute('aria-expanded', String(isTarget));
    });
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

  const PRESUPUESTO_MINIMO_RECOMENDADO = 300000;

  // El resumen junto a "Presupuesto disponible" queda persistente igual que
  // en Fechas/Intereses/Mente (muestra el monto elegido aunque estés en otro
  // desplegable). Al cruzar el mínimo recomendado, ese mismo lugar muestra
  // un aviso en azul por 3 segundos y después vuelve a mostrar el monto.
  let superabaMinimo = false;
  let avisoMinimoTimer = null;

  function textoResumenPresupuesto(val) {
    return val === 0 ? 'Sin definir' : formatCurrency(val);
  }

  function updateBudgetUI({ skipDisplay = false } = {}) {
    const min = Number(budgetSlider.min);
    const max = Number(budgetSlider.max);
    const val = Number(budgetSlider.value);
    const percent = ((val - min) / (max - min)) * 100;
    budgetSlider.style.background =
      `linear-gradient(to right, var(--grey-inactive) 0%, var(--grey-inactive) ${percent}%, var(--natural-light) ${percent}%, var(--natural-light) 100%)`;
    // Mientras se está tipeando el monto a mano no se reformatea en cada
    // tecla (rompía la escritura en mobile); eso se hace recién al
    // terminar (blur/Enter).
    if (!skipDisplay) budgetValue.value = val === 0 ? '$0' : formatCurrency(val);

    const superaMinimo = val > PRESUPUESTO_MINIMO_RECOMENDADO;
    budgetValue.classList.toggle('sobre-minimo', superaMinimo);

    if (!superaMinimo) {
      // Por debajo del mínimo (o en $0): sin aviso, muestra el monto ya.
      clearTimeout(avisoMinimoTimer);
      summaryPresupuesto.classList.remove('aviso-minimo');
      summaryPresupuesto.textContent = textoResumenPresupuesto(val);
    } else if (!superabaMinimo) {
      // Recién cruza el mínimo: aviso temporal en azul.
      summaryPresupuesto.textContent = 'Mínimo recomendado';
      summaryPresupuesto.classList.add('aviso-minimo');
      clearTimeout(avisoMinimoTimer);
      avisoMinimoTimer = setTimeout(() => {
        summaryPresupuesto.classList.remove('aviso-minimo');
        summaryPresupuesto.textContent = textoResumenPresupuesto(Number(budgetSlider.value));
      }, 3000);
    } else if (!summaryPresupuesto.classList.contains('aviso-minimo')) {
      // Ya pasó el aviso y se sigue moviendo el slider: el monto acompaña.
      summaryPresupuesto.textContent = textoResumenPresupuesto(val);
    }
    superabaMinimo = superaMinimo;
  }

  budgetSlider.addEventListener('input', updateBudgetUI);

  // También se puede escribir el presupuesto a mano con el teclado, además
  // de mover el slider. Se limpia todo lo que no sea dígito (soporta pegar
  // "$1.500.000" tal cual) y se clampea al rango del slider.
  function parseBudgetInput(raw) {
    const digits = raw.replace(/\D/g, '');
    return digits ? Number(digits) : 0;
  }

  // Al tocar para escribir, si todavía dice "$0" lo dejamos en blanco (solo
  // el "$") para no tener que borrar el cero a mano antes de tipear.
  budgetValue.addEventListener('focus', () => {
    if (budgetValue.value === '$0') budgetValue.value = '$';
    const end = budgetValue.value.length;
    budgetValue.setSelectionRange(end, end);
  });

  budgetValue.addEventListener('input', () => {
    const min = Number(budgetSlider.min);
    const max = Number(budgetSlider.max);
    const val = Math.min(max, Math.max(min, parseBudgetInput(budgetValue.value)));
    budgetSlider.value = val;
    updateBudgetUI({ skipDisplay: true });
  });

  // Recién al salir del campo (o tocar Enter) se reformatea con el "$" y
  // los puntos de miles.
  budgetValue.addEventListener('blur', () => updateBudgetUI());
  budgetValue.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') budgetValue.blur();
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
  let rangeStart = null;
  let rangeEnd = null;

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
        if (!rangeStart || rangeEnd) {
          rangeStart = date;
          rangeEnd = null;
        } else if (date < rangeStart) {
          rangeStart = date;
        } else {
          rangeEnd = date;
        }
        renderCalendar();
        updateFechasSummary();
        // Al completar el rango (se tocó la fecha de vuelta), el
        // desplegable de fechas se cierra solo y pasa a Preferencias, pero
        // con una pequeña pausa: así da tiempo a ver la fecha ya
        // seleccionada antes de que la sección cambie, en vez de saltar
        // instantáneo y sentirse automático.
        if (rangeStart && rangeEnd) {
          setTimeout(() => setOpenSection('section-intereses'), 450);
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
  setupChipGroup(document.getElementById('modal-chips'), document.getElementById('modal-add-chip'));

  // Loader: se muestra mientras "buscamos" el viaje más viable
  const searchLoader = document.getElementById('search-loader');
  const SEARCH_DELAY = 3500;

  function showLoader() {
    searchLoader.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => searchLoader.classList.add('show'));
    });
  }

  function hideLoader() {
    searchLoader.classList.remove('show');
    setTimeout(() => { searchLoader.hidden = true; }, 500);
  }

  // Buscar viaje: filtra los datos mockeados y te lleva a la pantalla de Viaje Recomendado
  document.getElementById('buscar-viaje-btn').addEventListener('click', () => {
    const presupuesto = Number(budgetSlider.value);
    const intereses = Array.from(document.querySelectorAll('#modal-chips .chip.active')).map((c) => c.dataset.chip);
    // El calendario arranca sin selección; si no se eligió nada, buscamos
    // igual con un rango por defecto en vez de bloquear la búsqueda.
    const busquedaInicio = rangeStart || new Date(2025, 9, 14);
    const busquedaFin = rangeEnd || rangeStart || new Date(2025, 9, 18);

    const resultados = buscarViajes({
      presupuesto,
      inicio: busquedaInicio,
      fin: busquedaFin,
      intereses,
    });

    closeModal();
    showLoader();
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      if (!resultados.length) {
        hideLoader();
        document.body.style.overflow = '';
        showToast('No encontramos resultados para esa búsqueda');
        return;
      }

      const elegido = elegirMasViable(resultados, { presupuesto, intereses });
      const otrasOpciones = buscarOtrasOpciones({
        presupuesto,
        inicio: busquedaInicio,
        fin: busquedaFin,
        intereses,
      });

      sessionStorage.setItem('viajeBusqueda', JSON.stringify({
        tripId: elegido.id,
        presupuesto,
        inicio: busquedaInicio.toISOString(),
        fin: busquedaFin.toISOString(),
        intereses,
        otros: otrasOpciones.map((t) => t.id),
      }));

      // Fade de salida más lento (y con un extra de espera) para que la
      // transición del loader hacia la pantalla de resultado se sienta más
      // pausada que una navegación común.
      navigateWithFade('viaje-recomendado.html', 150, true);
    }, SEARCH_DELAY);
  });
});
