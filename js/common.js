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

document.addEventListener('DOMContentLoaded', () => {
  // Tabs sin pantalla todavía (todas menos "Explorar")
  document.querySelectorAll('.tab:not(.active)').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Pantalla en construcción');
    });
  });
});
