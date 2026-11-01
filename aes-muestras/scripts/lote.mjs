#!/usr/bin/env node
// Lote diario. Toma la lista de estudios del día, renderiza un MP4 por estudio y arma la hoja de contactos.
//
// Uso:
//   node scripts/lote.mjs --fecha 2026-11-03 --lista datos/lotes/2026-11-03.txt
//   node scripts/lote.mjs --estudios wegener-abogados,enroque-abogados
//   Opciones: --sin-verificar (permite guiones sin fecha de verificación en BCN, solo para pruebas)
//             --concurrencia 2
//             --subcuadros 2 (cuadros intermedios que se mezclan para el desenfoque de movimiento)
//
// Salida: out/<fecha>/<slug>.mp4, out/<fecha>/hoja-contactos.png y out/<fecha>/manifiesto.json

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opcion = (nombre, porDefecto = null) => {
  const i = args.indexOf(`--${nombre}`);
  return i >= 0 ? args[i + 1] : porDefecto;
};
const bandera = (nombre) => args.includes(`--${nombre}`);

const fecha =
  opcion("fecha") ??
  new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Santiago" }).format(
    new Date(),
  );
const concurrencia = Number(opcion("concurrencia", "2"));
const sinVerificar = bandera("sin-verificar");
const subcuadros = Number(opcion("subcuadros", "2"));

let slugs = [];
if (opcion("estudios")) {
  slugs = opcion("estudios")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
} else {
  const lista = opcion("lista") ?? join(raiz, "datos", "lotes", `${fecha}.txt`);
  if (!existsSync(lista)) {
    console.error(
      `No existe la lista ${lista}. Crea el archivo con un slug por línea o pasa --estudios.`,
    );
    process.exit(1);
  }
  slugs = readFileSync(lista, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}

const guiones = JSON.parse(
  readFileSync(join(raiz, "datos", "guiones.json"), "utf8"),
).guiones;
const biblioteca = JSON.parse(
  readFileSync(join(raiz, "datos", "musica", "biblioteca.json"), "utf8"),
).temas;

const salida = join(raiz, "out", fecha);
mkdirSync(salida, { recursive: true });

// 1. Validar fichas y armar las propiedades de cada video.
const trabajos = [];
const excluidos = [];
for (const slug of slugs) {
  const ruta = join(raiz, "datos", "estudios", `${slug}.json`);
  if (!existsSync(ruta)) {
    excluidos.push({ slug, motivo: "no existe la ficha" });
    continue;
  }
  const f = JSON.parse(readFileSync(ruta, "utf8"));
  const faltas = [];
  if (f.estado === "excluido")
    faltas.push(`excluido en la ficha (${f.notas ?? "sin nota"})`);
  if (!f.logo || !existsSync(join(raiz, "public", f.logo)))
    faltas.push("falta el logo");
  for (const c of ["fondo", "tinta", "acento"]) {
    if (!f.colores?.[c]) faltas.push(`falta el color ${c}`);
  }
  if (!f.tipografia) faltas.push("falta la tipografía");
  if (!f.tono) faltas.push("falta el tono");
  if (!f.registro) faltas.push("falta el registro");
  const guion = guiones[f.area];
  if (!guion) faltas.push(`área desconocida (${f.area})`);
  else if (!guion.fechaVerificacion && !sinVerificar) {
    faltas.push(`el guion de ${f.area} no tiene fecha de verificación en BCN`);
  }
  const tema =
    biblioteca.find((t) => t.id === f.musica) ??
    biblioteca.find((t) => t.tono === f.tono) ??
    biblioteca[0];
  if (!tema) faltas.push("la biblioteca musical está vacía");
  if (faltas.length) {
    excluidos.push({ slug, motivo: faltas.join("; ") });
    continue;
  }
  trabajos.push({
    slug,
    archivo: join(salida, `${slug}.mp4`),
    props: {
      nombre: f.nombre,
      instagram: f.instagram ?? "",
      logo: f.logo,
      logoSobreTinta: Boolean(f.logoSobreTinta),
      colorFondo: f.colores.fondo,
      colorTinta: f.colores.tinta,
      colorAcento: f.colores.acento,
      tipografia: f.tipografia,
      area: f.area,
      tono: f.tono,
      musica: tema.id,
      entradaMusica: -1,
      registro: f.registro,
      guion: {
        pregunta: guion.pregunta,
        normaTitulo: guion.normaTitulo,
        normaNumero: guion.normaNumero,
        normaTexto: guion.normaTexto,
        normaCita: guion.normaCita,
        oferta: guion.oferta,
        fuente: guion.fuente,
        fechaVerificacion: guion.fechaVerificacion,
        consecuencia: guion.consecuencia,
        antes: guion.antes,
        despues: guion.despues,
        linea: guion.linea,
      },
      subcuadros,
    },
  });
}

console.log(
  `Lote ${fecha}: ${trabajos.length} videos por renderizar, ${excluidos.length} excluidos.`,
);
for (const e of excluidos) console.log(`  excluido ${e.slug}: ${e.motivo}`);
if (trabajos.length === 0) process.exit(excluidos.length ? 1 : 0);

// 2. Empaquetar una sola vez y renderizar en serie (cada render ya usa varios procesos del navegador).
const navegador = {
  browserExecutable:
    process.env.REMOTION_BROWSER ?? "/opt/pw-browsers/chromium",
  chromeMode: "chrome-for-testing",
};
const paquete = await bundle({
  entryPoint: join(raiz, "src", "index.ts"),
  publicDir: join(raiz, "public"),
  enableCaching: true,
});

const hechos = [];
const fallidos = [];
const inicio = Date.now();
for (const t of trabajos) {
  const t0 = Date.now();
  try {
    const composicion = await selectComposition({
      serveUrl: paquete,
      id: "Muestra",
      inputProps: t.props,
      ...navegador,
    });
    const crudo =
      subcuadros > 1 ? t.archivo.replace(/\.mp4$/, ".crudo.mp4") : t.archivo;
    await renderMedia({
      composition: composicion,
      serveUrl: paquete,
      codec: "h264",
      outputLocation: crudo,
      inputProps: t.props,
      concurrency: concurrencia,
      crf: 18,
      ...navegador,
    });
    if (subcuadros > 1) {
      // Desenfoque de movimiento real: se promedian los subcuadros y se vuelve a 30 cuadros por segundo.
      execFileSync("ffmpeg", [
        "-v",
        "error",
        "-y",
        "-i",
        crudo,
        "-vf",
        `tmix=frames=${subcuadros},select='not(mod(n\\,${subcuadros}))',setpts=N/(30*TB)`,
        "-r",
        "30",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-movflags",
        "+faststart",
        t.archivo,
      ]);
      unlinkSync(crudo);
    }
    hechos.push({ ...t, segundos: Math.round((Date.now() - t0) / 1000) });
    console.log(
      `  listo ${t.slug} (${Math.round((Date.now() - t0) / 1000)} s)`,
    );
  } catch (err) {
    fallidos.push({ slug: t.slug, motivo: String(err?.message ?? err) });
    console.log(`  falló ${t.slug}: ${err?.message ?? err}`);
  }
}

// 3. Hoja de contactos y manifiesto.
const manifiesto = {
  fecha,
  carpetaDrive: `Muestras ǣs/${fecha} (traspaso manual desde el archivo comprimido)`,
  videos: hechos.map((h) => ({
    slug: h.slug,
    nombre: h.props.nombre,
    archivo: h.archivo,
  })),
  fallidos,
  excluidos,
  duracionTotalSegundos: Math.round((Date.now() - inicio) / 1000),
};
writeFileSync(
  join(salida, "manifiesto.json"),
  JSON.stringify(manifiesto, null, 1),
);
if (hechos.length) {
  execFileSync(
    "python3",
    ["-I", join(raiz, "scripts", "hoja.py"), join(salida, "manifiesto.json")],
    {
      stdio: "inherit",
    },
  );
}
if (hechos.length) {
  // Un solo archivo comprimido con los MP4 y la hoja de contactos, para arrastrarlo a Drive.
  const zip = join(salida, `muestras-${fecha}.zip`);
  if (existsSync(zip)) unlinkSync(zip);
  execFileSync("zip", [
    "-q",
    "-j",
    zip,
    ...hechos.map((h) => h.archivo),
    join(salida, "hoja-contactos.png"),
    join(salida, "manifiesto.json"),
  ]);
  console.log(`Archivo para Drive: ${zip}`);
}
console.log(
  `Terminado en ${manifiesto.duracionTotalSegundos} s. Carpeta: ${salida}`,
);
process.exit(fallidos.length ? 1 : 0);
