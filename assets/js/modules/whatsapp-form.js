// Formulario sin servidor: arma un mensaje con los campos y lo abre en WhatsApp.
// El texto sale de data-message en el <form>; cada {campo} se reemplaza por el
// valor del campo con ese name. El número se toma del primer enlace
// [data-contact="whatsapp"] de la página, así que solo existe en un lugar.
// Una línea del mensaje cuyos {campos} quedaron todos vacíos se omite (por ejemplo,
// "Notas: {notas}" sin notas, o los datos de un paso condicional que no aplica).
export function initWhatsappForm() {
  const link = document.querySelector('[data-contact="whatsapp"]');
  if (!link) return;
  const phone = new URL(link.href).pathname.replace(/\D/g, "");

  for (const form of document.querySelectorAll("[data-whatsapp-form]")) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const message = (form.dataset.message ?? "")
        .split("\n")
        .map((line) => fillLine(line, data))
        .filter((line) => line !== null)
        .join("\n")
        .replace(/[ \t]+([.,])/g, "$1")
        .trim();
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    });
  }
}

// Devuelve la línea con sus campos llenos, o null si tenía campos y todos están vacíos.
function fillLine(line, data) {
  let fields = 0;
  let filled = 0;
  const text = line.replace(/\{(\w+)\}/g, (_, name) => {
    const value = String(data.get(name) ?? "").trim();
    fields += 1;
    if (value) filled += 1;
    return value;
  });
  return fields && !filled ? null : text;
}
