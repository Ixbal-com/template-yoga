// Formulario sin servidor: arma un mensaje con los campos y lo abre en WhatsApp.
// El texto sale de data-message en el <form>; cada {campo} se reemplaza por el
// valor del campo con ese name. El número se toma del primer enlace
// [data-contact="whatsapp"] de la página, así que solo existe en un lugar.
export function initWhatsappForm() {
  const link = document.querySelector('[data-contact="whatsapp"]');
  if (!link) return;
  const phone = new URL(link.href).pathname.replace(/\D/g, "");

  for (const form of document.querySelectorAll("[data-whatsapp-form]")) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const message = (form.dataset.message ?? "")
        .replace(/\{(\w+)\}/g, (_, name) => String(data.get(name) ?? "").trim())
        .replace(/\s+([.,])/g, "$1")
        .trim();
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    });
  }
}
