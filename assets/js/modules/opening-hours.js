// Horarios de apertura. Cada [data-hours-scope] (por ejemplo, una sucursal) tiene su
// tabla [data-hours] y su aviso [data-open-status]; si no hay ámbitos, usa toda la
// página. Marca el día de hoy y muestra "Abierto ahora" o "Cerrado"; una fila con
// data-break="14:00-16:00" cierra en ese rango (hora de comida). Los textos
// salen de data-text-open y data-text-closed para que se puedan traducir, y se
// vuelven a pintar cada minuto y cuando cambia el idioma.
export function initOpeningHours() {
  const scopes = document.querySelectorAll("[data-hours-scope]");
  const render = () => {
    for (const scope of scopes.length ? scopes : [document]) renderScope(scope, new Date());
  };
  render();
  setInterval(render, 60_000);
  document.addEventListener("i18n:change", render);
}

function renderScope(scope, now) {
  const table = scope.querySelector("[data-hours]");
  if (!table) return;

  const today = now.getDay();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const todayRow = [...table.querySelectorAll("tr[data-days]")].find((row) =>
    row.dataset.days.split(",").map(Number).includes(today),
  );

  todayRow?.classList.add("is-today");

  const status = scope.querySelector("[data-open-status]");
  if (!status) return;

  const { open, close } = todayRow?.dataset ?? {};
  const [breakStart, breakEnd] = (todayRow?.dataset.break ?? "").split("-");
  const inBreak = Boolean(breakStart && breakEnd) && minutesNow >= toMinutes(breakStart) && minutesNow < toMinutes(breakEnd);
  const isOpen = Boolean(open && close) && minutesNow >= toMinutes(open) && minutesNow < toMinutes(close) && !inBreak;
  const closesAt = breakStart && minutesNow < toMinutes(breakStart) ? breakStart : close;
  const openText = status.dataset.textOpen ?? "Abierto ahora · cierra a las {close}";
  const closedText = status.dataset.textClosed ?? "Cerrado en este momento";

  status.textContent = isOpen ? openText.replace("{close}", closesAt) : closedText;
  status.classList.toggle("is-open", isOpen);
  status.hidden = false;
}

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
