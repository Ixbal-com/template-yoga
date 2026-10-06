# Plantilla Ixbal · Estudio de yoga y pilates

Plantilla para estudios de yoga, pilates reformer y meditación. Estilo **atardecer en la bahía**: ciruela profundo, arena y durazno, fotos a todo lo ancho, arcos y mucho aire (títulos en Marcellus, texto en Work Sans).

**Incluye:** hero a pantalla completa, **dos caminos (yoga o reformer) que llevan al horario ya filtrado**, clase de prueba con formulario a WhatsApp, **horario semanal con pestañas por día, filtros por disciplina y nivel y la clase en curso marcada**, paquetes por disciplina en pestañas, instructores, **retiro con cuenta regresiva a una fecha fija**, mosaico del estudio, opiniones y visítanos con horario y mapa.

Ejemplo: **Estudio Raíz**, Puerto Vallarta.

## Uso

```bash
npm run dev     # servidor local en http://localhost:4321
npm run check   # valida el sitio (sin dependencias)
```

Ábrela con un servidor, no con doble clic: los navegadores no ejecutan módulos de JavaScript desde `file://`.

## Personalizar

1. **Identidad:** colores (incluido uno por disciplina) y tipografía en `assets/css/tokens.css`.
2. **Contenido:** clases, paquetes, instructores y retiro en `index.html`, organizado por secciones.
3. **Imágenes:** 12 espacios de imagen listados en `imageSlots` de `template.json`, con fotos de ejemplo en `images/` generadas con IA (`gpt-image-2.5-sunburst`). Reemplázalas por fotos reales; ver [AGENTS.md](AGENTS.md#espacios-de-imagen).

Las reglas de arquitectura, la lista de datos que se repiten y cómo funcionan el horario, los paquetes y el retiro están en [AGENTS.md](AGENTS.md).

## Módulos compartidos

Los archivos de `scripts/check.mjs` y de `assets/js/modules/` (y los CSS iniciales de los módulos) vienen de la biblioteca de plantillas Ixbal (`biblioteca/`). Esta plantilla usa `tabs`, `schedule`, `countdown` y `whatsapp-form` (ver `"modules"` en `template.json`). Para cambiarlos en todas las plantillas, edítalos en la biblioteca y corre `npm run sync` ahí.

## Publicar

Es un sitio estático: sirve la raíz del repositorio en GitHub Pages, Netlify, Vercel o AWS Amplify.

> Antes de publicar, convierte `assets/img/og-image.svg` a PNG de 1200 × 630 y usa una URL absoluta en `og:image`: WhatsApp y Facebook no muestran vistas previas en SVG.
