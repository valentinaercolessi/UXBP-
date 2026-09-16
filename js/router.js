// Router de la app unificada: reemplaza la navegación real entre archivos
// .html por un intercambio de contenido dentro del mismo documento, pero
// reproduciendo el mismo comportamiento de antes (misma transición de fade,
// mismo hash de vuelta/adelante del navegador, mismo controlador JS de cada
// pantalla corriendo desde cero en cada visita).

window.PageInit = window.PageInit || {};

const ROUTES = {
  'index.html': { template: 'tpl-explorar', title: 'exploramundo — Explorar', init: () => window.PageInit.explorar() },
  'mis-viajes.html': { template: 'tpl-mis-viajes', title: 'exploramundo — Mis viajes', init: () => window.PageInit.misViajes() },
  'otras-opciones.html': { template: 'tpl-otras-opciones', title: 'exploramundo — Otras opciones', init: () => window.PageInit.otrasOpciones() },
  'viaje-detalle.html': { template: 'tpl-viaje-detalle', title: 'exploramundo — Detalle del viaje', init: () => window.PageInit.detalle() },
  'viaje-recomendado.html': { template: 'tpl-viaje-recomendado', title: 'exploramundo — Viaje Recomendado', init: () => window.PageInit.recomendado() },
};

let currentPage = null;

function bindTabbar() {
  document.querySelectorAll('.tab[href]').forEach((tab) => {
    const href = tab.getAttribute('href');
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      if (href === '#') {
        showToast('Pantalla en construcción');
        return;
      }
      if (tab.classList.contains('active')) return;
      navigateWithFade(href);
    });
  });
}

function doMount(name) {
  const route = ROUTES[name] || ROUTES['index.html'];
  const key = ROUTES[name] ? name : 'index.html';
  currentPage = key;

  const app = document.querySelector('.app');
  const tpl = document.getElementById(route.template);
  app.classList.remove('page-visible', 'page-fade-slow');
  app.innerHTML = '';
  app.appendChild(tpl.content.cloneNode(true));
  document.title = route.title;

  route.init();
  bindTabbar();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => app.classList.add('page-visible'));
  });
}

// Punto de entrada usado por navigateWithFade() y por las guardas de
// sessionStorage de cada pantalla (equivalente a lo que antes era
// window.location.href = 'algo.html').
window.routerMount = function (name) {
  if (location.hash.replace(/^#/, '') !== name) {
    location.hash = name;
  }
  doMount(name);
};

// Atrás/adelante del navegador: sin fade de salida (como con una navegación
// real de vuelta), solo el fade de entrada que ya hace doMount().
window.addEventListener('hashchange', () => {
  const name = decodeURIComponent(location.hash.replace(/^#/, '')) || 'index.html';
  if (name === currentPage) return;
  doMount(name);
});

document.addEventListener('DOMContentLoaded', () => {
  const initial = decodeURIComponent(location.hash.replace(/^#/, '')) || 'index.html';
  doMount(initial);
});
