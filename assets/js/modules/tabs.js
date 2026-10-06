// Pestañas genéricas: un contenedor [data-tabs] con botones [data-tab="id"] y
// paneles [data-tab-panel="id"]. Sin JavaScript todos los paneles se ven seguidos.
export function initTabs() {
  for (const container of document.querySelectorAll("[data-tabs]")) {
    const tabs = [...container.querySelectorAll("[data-tab]")];
    const panels = [...container.querySelectorAll("[data-tab-panel]")];
    if (!tabs.length) continue;

    const list = tabs[0].closest("[role='tablist']");
    if (list) list.hidden = false;

    const select = (id) => {
      for (const tab of tabs) tab.setAttribute("aria-selected", String(tab.dataset.tab === id));
      for (const panel of panels) panel.hidden = panel.dataset.tabPanel !== id;
    };

    for (const tab of tabs) tab.addEventListener("click", () => select(tab.dataset.tab));
    select(tabs[0].dataset.tab);
  }
}
