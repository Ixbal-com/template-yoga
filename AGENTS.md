# Guía para agentes de IA

Este sitio es una plantilla de Ixbal: HTML, CSS y JavaScript sin dependencias ni paso de compilación. Lo que ves en `index.html` es exactamente lo que se publica.

## Reglas

- **No agregues frameworks, bundlers ni dependencias de npm.** El entorno no ejecuta `npm install`.
- **Valida siempre** con `npm run check` después de cada cambio. Debe terminar en `✓`.
- **Colores, tipografía y espacios solo en `assets/css/tokens.css`.** Los títulos usan `--font-display` y el texto `--font-sans`. No escribas colores hexadecimales fuera de ese archivo; usa `var(--color-…)`.
- **Un archivo CSS por componente o sección.** Si creas uno nuevo, impórtalo en `assets/css/main.css` dentro de su capa (`components` o `sections`).
- **Clases con convención BEM:** `bloque__elemento--modificador` (por ejemplo `service-card__title`, `button--primary`).
- **JavaScript en módulos** dentro de `assets/js/modules/`, registrados en `assets/js/main.js`. Los módulos localizan elementos con atributos `data-*` y no fallan si no los encuentran.
- **Íconos** en el sprite `assets/img/icons.svg`; agrega un `<symbol id="…">` y úsalo con `<use href="assets/img/icons.svg#…">`.
- **WhatsApp, teléfono y correo de contacto los administra Ixbal** ("Tu negocio"). No los escribas ni los cambies en el HTML: si la persona pide cambiarlos, usa la herramienta `actualizar_datos_negocio`. Cada liga lleva `data-contact="whatsapp"`, `"phone"` o `"email"`; ponlo también en las ligas nuevas.

## Datos que se repiten

Cuando cambies uno de estos datos, cámbialo en **todos** sus lugares:

| Dato | Dónde aparece |
|---|---|
| Nombre del estudio | `<title>`, `og:title`, `.brand__name`, `aria-label` del logo, JSON-LD, `data-message` del formulario, mensajes de WhatsApp de los paquetes, pie de página y `og-image.svg` |
| WhatsApp | Todos los enlaces con `data-contact="whatsapp"` (formato `https://wa.me/52XXXXXXXXXX`, también en cada paquete y en el retiro). El formulario toma el número del primero |
| Dirección | `#visitanos`, `src` del mapa y `address` del JSON-LD |
| Horario del estudio | Tabla `[data-hours]` en `#visitanos` (`data-days`, `data-open`, `data-close`) y `openingHoursSpecification` del JSON-LD |
| Disciplinas | Tarjetas `.path` de `#caminos` (con su `data-schedule-preset`), `<option>` del filtro `data-schedule-filter="discipline"`, `data-discipline` y `.session__tag` de cada clase, color en `tokens.css` (`--color-yoga`…), pestañas de `#paquetes` y `<option>` del formulario |
| Instructores | Tarjetas `.teacher` de `#instructores` y `.session__teacher` de cada clase del horario |
| Clase de prueba | Botón del encabezado, hero, título de `#primera-vez` y `og-image.svg` |
| Retiro | `#retiro`: texto, fecha en `data-countdown` (AAAA-MM-DD) y en `[data-countdown-date]`, precio y mensaje de WhatsApp |
| Color principal | `--color-primary` en `tokens.css`, `theme-color`, `logo.svg`, `favicon.svg`, `og-image.svg`, `placeholder.svg` |

`npm run check` detecta WhatsApp o teléfonos distintos entre sí, archivos que no existen, anclas rotas, imágenes sin `alt` y JSON-LD inválido.

## Horario, paquetes y retiro

- **Horario** (`assets/js/modules/schedule.js`): un `<section data-day-panel>` por día (0 = domingo … 6 = sábado) con un `<li class="session">` por clase, con `data-start` y `data-end` en 24 h, `data-discipline` y `data-level`. Abre en el día de hoy y marca la clase en curso y la siguiente. Los filtros comparan `data-discipline` y `data-level` con el `value` de sus `<option>`.
- **Paquetes** (`assets/js/modules/tabs.js`): cada botón `data-tab` abre su `.packs__panel data-tab-panel`. El paquete destacado lleva `pack--featured` y `.pack__badge`.
- **Retiro** (`assets/js/modules/countdown.js`): `data-countdown="2026-11-13"` y `data-countdown-time="09:00"`. Cuando pase la fecha, cambia la fecha o quita la sección.

## Espacios de imagen

Cada foto del sitio vive en un espacio declarado en `template.json` → `imageSlots`:

```html
<figure class="media media--square" data-slot="galeria-1" data-placeholder data-hint="Foto del local · 1:1">
  <img src="assets/img/placeholder.svg" alt="Descripción de la foto" width="1200" height="1200" loading="lazy">
</figure>
```

Para poner una foto real en un espacio:

1. Cambia el `src` del `<img>` por la ruta de la foto. Las fotos que se suben desde Ixbal llegan a `images/` (por ejemplo `images/fachada.jpg`); usa esa ruta tal cual, sin mover ni renombrar el archivo.
2. Escribe un `alt` que describa la foto real y actualiza `width` y `height` con sus medidas.
3. Borra `data-placeholder` y `data-hint` del `<figure>`. Así desaparece la etiqueta de relleno.
4. No cambies la clase `media--…` ni el `data-slot`: CSS recorta la foto a la proporción del espacio.

Las fotos de `images/` que trae la plantilla son de ejemplo (generadas con IA para Estudio Raíz): reemplázalas por las del negocio real siguiendo los mismos pasos, y borra del repositorio las de ejemplo que ya no se usen.

Si la persona sube varias fotos sin decir dónde van, asígnalas según la `label` de cada espacio en `imageSlots`. `npm run check` dice cuántos espacios siguen con imagen de relleno.

## Estructura

```
index.html                 Página única, dividida en secciones con comentarios ============
assets/css/main.css        Orden de capas e imports
assets/css/tokens.css      Identidad visual (edita aquí primero)
assets/css/base.css        Reset y elementos HTML
assets/css/layout.css      Contenedores, secciones, rejillas
assets/css/components/     Piezas reutilizables (botón, tarjeta, encabezado…)
assets/css/sections/       Estilos propios de cada sección de la página
assets/css/utilities.css   Clases de una sola responsabilidad
assets/js/main.js          Registra los módulos
assets/js/modules/         Comportamiento (menú, horario y "Abierto ahora", año, horario de clases, pestañas, cuenta regresiva, formulario a WhatsApp)
assets/img/                Logo, íconos e imágenes de relleno
images/                    Fotos que sube la persona desde Ixbal (se crea al subir la primera)
template.json              Metadatos para la galería de plantillas de Ixbal
scripts/check.mjs          Validador sin dependencias
```

## Tareas comunes

- **Agregar una clase:** copia un `<li class="session">` en el día que toca, en orden de hora; ajusta `data-start`, `data-end`, `data-discipline`, `data-level`, la duración en `<small>` y el instructor.
- **Nueva disciplina (por ejemplo barre):** agrega su `<option>` en el filtro de disciplina, su color `--color-barre` en `tokens.css`, la regla `.session__tag--barre::before` en `sections/schedule.css`, su `<option>` en el formulario y, si tiene precios propios, su pestaña en `#paquetes`.
- **Solo yoga (sin reformer):** borra la tarjeta de reformer en `#caminos` (y su espacio `camino-reformer`), las clases y opciones de reformer, y las pestañas de reformer y combinado en `#paquetes` (con una sola pestaña, borra también el bloque `.packs__tabs`).
- **Sin retiro:** borra la sección `#retiro`, su enlace en el menú y su espacio `retiro` en `imageSlots`. Quita `countdown` de `"modules"` en `template.json` y su `import` en `main.js`.
- **Cambiar precios:** edita `.pack__price` y `.pack__note` de cada paquete.
- **Quitar una sección:** borra el `<section>` completo y su enlace en `.site-nav__list`.
- **Nuevo espacio de imagen:** agrega el `<figure class="media" data-slot="…">` y su entrada en `imageSlots` de `template.json`.
