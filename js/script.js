document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('toast');
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function formatCurrency(n) {
    return '$' + Number(n).toLocaleString('es-AR');
  }

  // Grupo de chips de filtro reutilizable (home + modal), con botón "+" para agregar uno propio
  function setupChipGroup(containerEl, addBtnEl) {
    containerEl.querySelectorAll('.chip[data-chip]').forEach((chip) => {
      chip.addEventListener('click', () => chip.classList.toggle('active'));
    });
    if (addBtnEl) {
      addBtnEl.addEventListener('click', () => {
        const label = prompt('Nombre del filtro que querés agregar:');
        if (!label) return;
        const chip = document.createElement('button');
        chip.className = 'chip active';
        chip.dataset.chip = label.toLowerCase();
        chip.innerHTML = `<span>${label}</span>`;
        chip.addEventListener('click', () => chip.classList.toggle('active'));
        containerEl.insertBefore(chip, addBtnEl);
      });
    }
  }

  setupChipGroup(document.querySelector('.chips-scroll:not(#modal-chips)'), document.getElementById('add-chip'));
  setupChipGroup(document.getElementById('modal-chips'), document.getElementById('modal-add-chip'));

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

  // Tabs sin pantalla todavía
  document.querySelectorAll('.tab:not(.active)').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Pantalla en construcción');
    });
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

  // Slider de presupuesto
  const budgetSlider = document.getElementById('budget-slider');
  const budgetValue = document.getElementById('budget-value');

  function updateBudgetUI() {
    const min = Number(budgetSlider.min);
    const max = Number(budgetSlider.max);
    const val = Number(budgetSlider.value);
    const percent = ((val - min) / (max - min)) * 100;
    budgetSlider.style.background =
      `linear-gradient(to right, var(--grey-inactive) 0%, var(--grey-inactive) ${percent}%, var(--natural-light) ${percent}%, var(--natural-light) 100%)`;
    budgetValue.textContent = val === 0 ? '$0' : formatCurrency(val);
  }

  budgetSlider.addEventListener('input', updateBudgetUI);
  updateBudgetUI();

  // Calendario de fechas disponibles
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const calMonthEl = document.getElementById('cal-month');
  const calGridEl = document.getElementById('cal-grid');
  const calPrevBtn = document.getElementById('cal-prev');
  const calNextBtn = document.getElementById('cal-next');

  let viewDate = new Date(2025, 9, 1); // Octubre 2025, como en el diseño
  let rangeStart = new Date(2025, 9, 14);
  let rangeEnd = new Date(2025, 9, 18);

  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function isInRange(date) {
    if (!rangeStart) return false;
    const end = rangeEnd || rangeStart;
    const lo = rangeStart < end ? rangeStart : end;
    const hi = rangeStart < end ? end : rangeStart;
    return date >= lo && date <= hi;
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

  // Adjuntar archivo
  const attachBtn = document.getElementById('attach-btn');
  const attachInput = document.getElementById('attach-input');
  const menteInput = document.getElementById('mente-input');

  attachBtn.addEventListener('click', () => attachInput.click());
  attachInput.addEventListener('change', () => {
    const file = attachInput.files[0];
    if (file) {
      menteInput.value = file.name;
      showToast(`Adjuntaste "${file.name}"`);
    }
  });

  // Buscar viaje: junta todo lo elegido en el modal
  document.getElementById('buscar-viaje-btn').addEventListener('click', () => {
    const budget = Number(budgetSlider.value);
    const interesesActivos = Array.from(document.querySelectorAll('#modal-chips .chip.active span'))
      .map((s) => s.textContent);

    const dateFmt = (d) => d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
    let fechas = 'sin definir';
    if (rangeStart && rangeEnd) fechas = `${dateFmt(rangeStart)} - ${dateFmt(rangeEnd)}`;
    else if (rangeStart) fechas = dateFmt(rangeStart);

    const partes = [`Presupuesto ${formatCurrency(budget)}`, `Fechas: ${fechas}`];
    if (interesesActivos.length) partes.push(`Intereses: ${interesesActivos.join(', ')}`);

    closeModal();
    showToast(`Buscando tu viaje más viable — ${partes.join(' · ')}`);
  });
});
