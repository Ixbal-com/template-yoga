// Validación sin dependencias: corre en segundos y no necesita `npm install`.
// Ixbal la ejecuta como `npm run build` después de cada cambio del agente.
import { readFile, readdir, access } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const slotsInHtml = [];
let pendingSlots = 0;

const htmlFiles = (await readdir(root)).filter((name) => name.endsWith(".html"));
const cssFiles = await listFiles(join(root, "assets/css"), ".css");

for (const file of htmlFiles) {
  const html = await readFile(join(root, file), "utf8");
  await checkLocalReferences(file, html, /\s(?:src|href)="([^"]+)"/g);
  checkHtmlBasics(file, html);
  checkContactConsistency(file, html);
  checkJsonLd(file, html);
  checkImageSlots(file, html);
  await checkTranslations(file, html);
}

for (const file of cssFiles) {
  const css = await readFile(file, "utf8");
  await checkLocalReferences(relative(root, file), css, /url\(["']?([^"')]+)["']?\)/g);
  checkBraces(relative(root, file), css);
}

const manifest = JSON.parse(await readFile(join(root, "template.json"), "utf8"));
for (const key of ["id", "name", "entry", "fields", "imageSlots"]) {
  if (!manifest[key]) errors.push(`template.json: falta el campo "${key}".`);
}
const manifestSlots = (manifest.imageSlots ?? []).map((slot) => slot.id);
for (const id of slotsInHtml) {
  if (!manifestSlots.includes(id)) errors.push(`template.json: falta el espacio de imagen "${id}" en imageSlots.`);
}
for (const id of manifestSlots) {
  if (!slotsInHtml.includes(id)) errors.push(`template.json: el espacio de imagen "${id}" no existe en el HTML.`);
}

if (errors.length) {
  console.error(`✗ ${errors.length} problema(s):\n${errors.map((error) => `  - ${error}`).join("\n")}`);
  process.exit(1);
}
const pending = pendingSlots ? ` · ${pendingSlots} espacio(s) de imagen por llenar` : "";
console.log(`✓ Sitio válido (${htmlFiles.length} HTML, ${cssFiles.length} CSS)${pending}.`);

async function checkLocalReferences(file, text, pattern) {
  const base = dirname(join(root, file));
  for (const [, reference] of text.matchAll(pattern)) {
    if (/^(https?:|mailto:|tel:|data:|#|\/\/)/.test(reference)) continue;
    const path = reference.split(/[?#]/)[0];
    if (!path) continue;
    try {
      await access(resolve(base, path));
    } catch {
      errors.push(`${file}: el archivo "${reference}" no existe.`);
    }
  }
}

function checkHtmlBasics(file, html) {
  if (!/<title\b[^>]*>[^<]+<\/title>/.test(html)) errors.push(`${file}: falta <title>.`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) errors.push(`${file}: falta la meta descripción.`);
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) errors.push(`${file}: debe tener exactamente un <h1>.`);
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(tag)) errors.push(`${file}: imagen sin atributo alt: ${tag.slice(0, 80)}…`);
  }
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(([, id]) => id);
  for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.includes(anchor)) errors.push(`${file}: el enlace "#${anchor}" no apunta a ninguna sección.`);
  }
}

// WhatsApp, teléfono y correo aparecen en varios lugares; todos deben coincidir.
function checkContactConsistency(file, html) {
  for (const [kind, pattern] of [
    ["whatsapp", /href="https:\/\/wa\.me\/(\d+)[^"]*"[^>]*data-contact="whatsapp"/g],
    ["phone", /href="tel:([^"]+)"[^>]*data-contact="phone"/g],
    ["email", /href="mailto:([^"?]+)[^"]*"[^>]*data-contact="email"/g],
  ]) {
    const values = new Set([...html.matchAll(pattern)].map(([, value]) => value));
    if (values.size > 1) errors.push(`${file}: hay ${kind} distintos (${[...values].join(", ")}).`);
  }
}

function checkJsonLd(file, html) {
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(json);
    } catch (error) {
      errors.push(`${file}: JSON-LD inválido (${error.message}).`);
    }
  }
}

// Cada <figure data-slot> es un espacio de imagen declarado en template.json → imageSlots.
// data-placeholder indica que todavía muestra la imagen de relleno.
function checkImageSlots(file, html) {
  for (const [tag] of html.matchAll(/<figure\b[^>]*\sdata-slot="[^"]*"[^>]*>/g)) {
    const id = tag.match(/data-slot="([^"]*)"/)[1];
    if (slotsInHtml.includes(id)) errors.push(`${file}: el espacio de imagen "${id}" está repetido.`);
    slotsInHtml.push(id);
    if (/\sdata-placeholder(?=[\s>=])/.test(tag)) pendingSlots += 1;
  }
}

// Idiomas extra: <html data-languages="es,en"> y un i18n/<idioma>.json por cada uno
// después del primero, con exactamente las claves de data-i18n y data-i18n-attr.
async function checkTranslations(file, html) {
  const languages = html.match(/<html\b[^>]*\sdata-languages="([^"]+)"/)?.[1].split(",").map((lang) => lang.trim()) ?? [];
  if (languages.length < 2) return;

  const keys = new Set([...html.matchAll(/\sdata-i18n="([^"]+)"/g)].map(([, key]) => key));
  for (const [, list] of html.matchAll(/\sdata-i18n-attr="([^"]+)"/g)) {
    for (const pair of list.split(";")) {
      const key = pair.split(":")[1]?.trim();
      if (key) keys.add(key);
    }
  }
  const whatsappNumbers = new Set([...html.matchAll(/wa\.me\/(\d+)/g)].map(([, number]) => number));

  for (const lang of languages.slice(1)) {
    const name = `i18n/${lang}.json`;
    let dictionary;
    try {
      dictionary = JSON.parse(await readFile(join(root, name), "utf8"));
    } catch (error) {
      errors.push(`${name}: no existe o no es JSON válido (${error.message}).`);
      continue;
    }
    for (const key of keys) {
      if (typeof dictionary[key] !== "string") errors.push(`${name}: falta la traducción de "${key}".`);
    }
    for (const [key, value] of Object.entries(dictionary)) {
      if (!keys.has(key)) errors.push(`${name}: la clave "${key}" no se usa en ${file}.`);
      for (const [, number] of String(value).matchAll(/wa\.me\/(\d+)/g)) {
        if (!whatsappNumbers.has(number)) errors.push(`${name}: "${key}" usa un WhatsApp distinto (${number}).`);
      }
    }
  }
}

function checkBraces(file, css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const opened = (withoutComments.match(/{/g) ?? []).length;
  const closed = (withoutComments.match(/}/g) ?? []).length;
  if (opened !== closed) errors.push(`${file}: llaves desbalanceadas ({ ${opened} / } ${closed}).`);
}

async function listFiles(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => join(entry.parentPath ?? entry.path, entry.name));
}
