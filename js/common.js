// Utilidades compartidas entre todas las páginas del sitio.

let toastTimer;

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function formatCurrency(n) {
  return '$' + Number(n).toLocaleString('es-AR');
}

function formatDateShort(d) {
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

function formatDateLong(d) {
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Transición progresiva entre pantallas: la página actual se desvanece antes de
// navegar, y la que llega arranca en opacidad 0 y se desvanece hacia adentro (ver
// abajo). Entre las dos, el cambio de pantalla se siente gradual, no instantáneo.
const PAGE_FADE_MS = 260;

function navigateWithFade(url, extraDelay = 0) {
  const app = document.querySelector('.app');
  if (app) app.classList.remove('page-visible');
  setTimeout(() => { window.location.href = url; }, PAGE_FADE_MS + extraDelay);
}

(function fadeInOnLoad() {
  const app = document.querySelector('.app');
  if (!app) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => app.classList.add('page-visible'));
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  // Tabs sin pantalla todavía (todas menos "Explorar")
  document.querySelectorAll('.tab:not(.active)').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Pantalla en construcción');
    });
  });
});
