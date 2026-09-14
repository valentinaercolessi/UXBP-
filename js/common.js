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

const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Íconos de intereses (montaña, gastronomía, etc.), compartidos por las pantallas
// que muestran los intereses elegidos por el usuario en una búsqueda.
const INTEREST_ICONS = {
  montana: 'assets/icons/terrain.svg',
  gastronomia: 'assets/icons/restaurant.svg',
  historia: 'assets/icons/menu_book_group1.svg',
  arte: 'assets/icons/palette.svg',
};

// De los intereses que el usuario eligió en la búsqueda, los que tienen ícono
// conocido (o, si no marcó ninguno reconocible, los del propio viaje).
function resolverInteresesConIcono(interesesElegidos, interesesDelViaje) {
  const elegidosConIcono = (interesesElegidos || []).filter((i) => INTEREST_ICONS[i]);
  return elegidosConIcono.length
    ? elegidosConIcono
    : (interesesDelViaje || []).filter((i) => INTEREST_ICONS[i]);
}

// "Del 14 al 18 de octubre" (o "Del 28 de octubre al 3 de noviembre" si cruza de mes)
function formatDateRange(inicio, fin) {
  const mismoMes = inicio.getMonth() === fin.getMonth() && inicio.getFullYear() === fin.getFullYear();
  if (mismoMes) {
    return `Del ${inicio.getDate()} al ${fin.getDate()} de ${MONTH_NAMES[inicio.getMonth()]}`;
  }
  return `Del ${inicio.getDate()} de ${MONTH_NAMES[inicio.getMonth()]} al ${fin.getDate()} de ${MONTH_NAMES[fin.getMonth()]}`;
}

// ---------- Viajes guardados (persisten entre sesiones) ----------

const SAVED_TRIPS_KEY = 'viajesGuardados';

function getSavedTrips() {
  try {
    const raw = localStorage.getItem(SAVED_TRIPS_KEY);
    const trips = raw ? JSON.parse(raw) : [];
    return Array.isArray(trips) ? trips : [];
  } catch (e) {
    return [];
  }
}

function addSavedTrip(record) {
  const trips = getSavedTrips();
  trips.push(record);
  localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(trips));
}

function removeSavedTrip(id) {
  const trips = getSavedTrips().filter((t) => t.id !== id);
  localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(trips));
}

// Transición progresiva entre pantallas: la página actual se desvanece antes de
// navegar, y la que llega arranca desvanecida y se asienta hacia adentro (ver abajo).
// Entre las dos, el cambio de pantalla se siente fluido y dinámico, no instantáneo.
const PAGE_FADE_MS = 460;
const PAGE_FADE_SLOW_MS = 900;

function navigateWithFade(url, extraDelay = 0, slow = false) {
  const app = document.querySelector('.app');
  if (app) {
    if (slow) app.classList.add('page-fade-slow');
    app.classList.remove('page-visible');
  }
  setTimeout(() => { window.location.href = url; }, (slow ? PAGE_FADE_SLOW_MS : PAGE_FADE_MS) + extraDelay);
}

(function fadeInOnLoad() {
  const app = document.querySelector('.app');
  if (!app) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => app.classList.add('page-visible'));
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  // Tabs sin pantalla todavía (las que todavía apuntan a "#")
  document.querySelectorAll('.tab:not(.active)[href="#"]').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Pantalla en construcción');
    });
  });

  // Tabs con pantalla real: navegación suave con fade en vez de la recarga dura
  // del navegador, para que el cambio se sienta parte de la misma app.
  document.querySelectorAll('.tab:not(.active):not([href="#"])').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      navigateWithFade(tab.getAttribute('href'));
    });
  });
});
