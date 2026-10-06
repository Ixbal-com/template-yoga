// Cuenta regresiva a un evento. Ejemplo:
//   <div data-countdown="last-saturday" data-countdown-time="08:00">
// Reglas: "last-saturday" (último sábado de cada mes), "day-15" (día 15 de cada mes)
// o una fecha fija "2026-11-20" (evento único; al pasar, se queda en ceros).
// Rellena [data-countdown-days|hours|minutes] y [data-countdown-date], esta última
// en el idioma de <html lang> y de nuevo con el evento "i18n:change".
export function initCountdown() {
  for (const element of document.querySelectorAll("[data-countdown]")) {
    const [hours, minutes] = (element.dataset.countdownTime ?? "08:00").split(":").map(Number);
    const target = nextOccurrence(element.dataset.countdown, hours, minutes);
    if (!target) continue;

    const dateLabel = element.querySelector("[data-countdown-date]");
    const paintDate = () => {
      if (!dateLabel) return;
      dateLabel.textContent = target.toLocaleDateString(document.documentElement.lang || "es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    };
    paintDate();
    document.addEventListener("i18n:change", paintDate);

    const tick = () => {
      const remaining = Math.max(0, target - new Date());
      const set = (unit, value) => {
        const node = element.querySelector(`[data-countdown-${unit}]`);
        if (node) node.textContent = String(value).padStart(2, "0");
      };
      set("days", Math.floor(remaining / 86_400_000));
      set("hours", Math.floor(remaining / 3_600_000) % 24);
      set("minutes", Math.floor(remaining / 60_000) % 60);
    };
    tick();
    setInterval(tick, 30_000);
  }
}

function nextOccurrence(rule, hours, minutes) {
  const fixed = rule.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (fixed) return new Date(Number(fixed[1]), Number(fixed[2]) - 1, Number(fixed[3]), hours, minutes);

  const now = new Date();
  for (let offset = 0; offset < 3; offset += 1) {
    const year = now.getFullYear();
    const month = now.getMonth() + offset;
    let date;
    if (rule === "last-saturday") {
      date = new Date(year, month + 1, 0, hours, minutes);
      date.setDate(date.getDate() - ((date.getDay() + 1) % 7));
    } else if (/^day-\d+$/.test(rule)) {
      date = new Date(year, month, Number(rule.slice(4)), hours, minutes);
    } else {
      return null;
    }
    if (date > now) return date;
  }
  return null;
}
