// Horario semanal. Las clases viven en el HTML (una lista por día), así se ven y se
// editan sin JavaScript. Este módulo agrega:
//   - pestañas por día que abren en el día de hoy,
//   - filtros por disciplina y sucursal ([data-schedule-filter]),
//   - "EN VIVO" en la clase que está ocurriendo y "Siguiente" en la próxima,
//   - enlaces [data-schedule-preset="box"] que llevan al horario ya filtrado.
export function initSchedule() {
  const schedule = document.querySelector("[data-schedule]");
  if (!schedule) return;

  const tabs = [...schedule.querySelectorAll("[data-day-tab]")];
  const panels = [...schedule.querySelectorAll("[data-day-panel]")];
  const filters = [...schedule.querySelectorAll("[data-schedule-filter]")];
  const empty = schedule.querySelector("[data-schedule-empty]");
  const today = String(new Date().getDay());
  let selectedDay = panels.some((panel) => panel.dataset.dayPanel === today) ? today : panels[0]?.dataset.dayPanel;

  for (const element of schedule.querySelectorAll("[data-schedule-controls]")) element.hidden = false;
  schedule.dataset.ready = "";

  const render = () => {
    const values = Object.fromEntries(filters.map((filter) => [filter.dataset.scheduleFilter, filter.value]));
    let visible = 0;
    for (const panel of panels) {
      const isSelected = panel.dataset.dayPanel === selectedDay;
      panel.hidden = !isSelected;
      for (const session of panel.querySelectorAll("[data-discipline]")) {
        const matches = Object.entries(values).every(([key, value]) => value === "all" || session.dataset[key] === value);
        session.hidden = !matches;
        if (isSelected && matches) visible += 1;
      }
    }
    for (const tab of tabs) tab.setAttribute("aria-selected", String(tab.dataset.dayTab === selectedDay));
    if (empty) empty.hidden = visible > 0;
    markLive(panels.find((panel) => panel.dataset.dayPanel === today));
  };

  for (const tab of tabs) {
    tab.addEventListener("click", () => {
      selectedDay = tab.dataset.dayTab;
      render();
    });
  }
  for (const filter of filters) filter.addEventListener("change", render);

  for (const link of document.querySelectorAll("[data-schedule-preset]")) {
    link.addEventListener("click", () => {
      const discipline = filters.find((filter) => filter.dataset.scheduleFilter === "discipline");
      if (discipline) discipline.value = link.dataset.schedulePreset;
      render();
    });
  }

  render();
  setInterval(render, 60_000);
}

function markLive(panel) {
  if (!panel) return;
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  let nextMarked = false;
  for (const session of panel.querySelectorAll("[data-start]")) {
    const start = toMinutes(session.dataset.start);
    const end = toMinutes(session.dataset.end);
    const isLive = minutes >= start && minutes < end;
    const isNext = !nextMarked && !session.hidden && minutes < start;
    if (isNext) nextMarked = true;
    session.classList.toggle("is-live", isLive);
    session.classList.toggle("is-next", isNext);
  }
}

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
