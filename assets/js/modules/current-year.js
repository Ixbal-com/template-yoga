// Mantiene actualizado el año del aviso de derechos en el pie de página.
export function initCurrentYear() {
  for (const element of document.querySelectorAll("[data-current-year]")) {
    element.textContent = String(new Date().getFullYear());
  }
}
