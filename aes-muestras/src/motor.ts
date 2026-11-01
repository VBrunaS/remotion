import { measureText } from "@remotion/layout-utils";

// Resorte críticamente amortiguado en forma cerrada. Sube de 0 a 1 sin sobrepaso
// y llega al 99 % en `dur` segundos. Función pura del tiempo.
export const resorte = (t: number, dur: number): number => {
  if (t <= 0) return 0;
  const x = (6.6 / dur) * t;
  return 1 - (1 + x) * Math.exp(-x);
};

export type Cambio = { en: number; a: number; dur: number };

// Un valor con varios destinos es la suma de un resorte por cambio.
export const valor = (t: number, base: number, cambios: Cambio[]): number => {
  let v = base;
  let previo = base;
  for (const c of cambios) {
    v += (c.a - previo) * resorte(t - c.en, c.dur);
    previo = c.a;
  }
  return v;
};

export type Geo = { x: number; y: number; w: number; h: number };
export type CambioGeo = { en: number; a: Geo; dur: number };

export const geometria = (t: number, base: Geo, cambios: CambioGeo[]): Geo => ({
  x: valor(
    t,
    base.x,
    cambios.map((c) => ({ en: c.en, a: c.a.x, dur: c.dur })),
  ),
  y: valor(
    t,
    base.y,
    cambios.map((c) => ({ en: c.en, a: c.a.y, dur: c.dur })),
  ),
  w: valor(
    t,
    base.w,
    cambios.map((c) => ({ en: c.en, a: c.a.w, dur: c.dur })),
  ),
  h: valor(
    t,
    base.h,
    cambios.map((c) => ({ en: c.en, a: c.a.h, dur: c.dur })),
  ),
});

export const PANTALLA: Geo = { x: -60, y: -60, w: 1200, h: 2040 };

// Los instantes nominales del guion de movimiento se mueven al pulso más cercano del tema.
export const alPulso = (
  tema: { entrada: number; pulsos: number[] } | null,
  tolerancia: number,
) => {
  if (!tema) return (s: number) => s;
  const relativos = tema.pulsos
    .map((p) => p - tema.entrada)
    .filter((p) => p >= 0);
  return (s: number) => {
    let mejor = s;
    let dist = tolerancia;
    for (const p of relativos) {
      const d = Math.abs(p - s);
      if (d < dist) {
        dist = d;
        mejor = p;
      }
    }
    return mejor;
  };
};

// Parte un texto en líneas que caben en `ancho`, midiendo con la fuente real.
export const envolver = (
  texto: string,
  estilo: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    letterSpacing: string;
    textTransform?: "uppercase" | "none";
  },
  ancho: number,
): string[] => {
  const palabras = texto.split(/\s+/).filter(Boolean);
  const lineas: string[] = [];
  let actual = "";
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    const { width } = measureText({
      text: prueba,
      fontFamily: estilo.fontFamily,
      fontSize: estilo.fontSize,
      fontWeight: estilo.fontWeight,
      letterSpacing: estilo.letterSpacing,
      textTransform: estilo.textTransform ?? "none",
      validateFontIsLoaded: true,
    });
    if (width <= ancho || !actual) {
      actual = prueba;
    } else {
      lineas.push(actual);
      actual = p;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
};

export type Tema = {
  id: string;
  archivo: string;
  entrada: number;
  duracion: number;
  pulsos: number[];
  acentos?: number[][];
  energia?: number[];
  energiaPaso?: number;
};

// Fuerza del acento más cercano a un instante absoluto del tema, dentro de una ventana.
const acentoEn = (tema: Tema, t: number, ventana: number) => {
  let mejor = 0;
  for (const [a, f] of tema.acentos ?? []) {
    if (Math.abs(a - t) <= ventana && f > mejor) mejor = f;
  }
  return mejor;
};

const energiaEn = (tema: Tema, t: number) => {
  const e = tema.energia ?? [];
  if (!e.length) return 0.5;
  const i = Math.max(
    0,
    Math.min(e.length - 1, Math.floor(t / (tema.energiaPaso ?? 0.5))),
  );
  return e[i];
};

// Elige el segundo del tema donde debe partir el video. Prueba cada pulso como inicio y se queda con
// el que pone acentos en los cortes de escena y la energía creciendo hacia el logo.
export const elegirEntrada = (
  tema: Tema,
  cortes: { en: number; peso: number }[],
  duracionVideo: number,
) => {
  if (!tema.acentos?.length) return tema.entrada;
  let mejor = tema.entrada;
  let mejorPuntaje = -Infinity;
  for (const c of tema.pulsos) {
    if (c + duracionVideo + 0.5 > tema.duracion) break;
    let puntaje = 0;
    for (const k of cortes) puntaje += k.peso * acentoEn(tema, c + k.en, 0.09);
    const inicio = energiaEn(tema, c + 1);
    const final = energiaEn(tema, c + duracionVideo - 2.5);
    puntaje += 0.8 * final + 0.4 * inicio - 0.6 * Math.max(0, inicio - final);
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejor = c;
    }
  }
  return mejor;
};

// Mueve un instante nominal al acento fuerte más cercano (relativo a la entrada).
export const alAcento = (tema: Tema | null, tolerancia: number) => {
  if (!tema?.acentos?.length) return alPulso(tema, tolerancia);
  const fuertes = tema.acentos
    .filter(([, f]) => f >= 0.3)
    .map(([a]) => a - tema.entrada)
    .filter((a) => a >= 0);
  return (s: number) => {
    let mejor = s;
    let dist = tolerancia;
    for (const a of fuertes) {
      const d = Math.abs(a - s);
      if (d < dist) {
        dist = d;
        mejor = a;
      }
    }
    return mejor;
  };
};

// Cortes de escena de la película, en segundos nominales, con su peso para elegir la entrada.
export const CORTES_PELICULA = [
  { en: 0.5, peso: 1 },
  { en: 3.15, peso: 1 },
  { en: 4.45, peso: 1 },
  { en: 7.3, peso: 1 },
  { en: 8.9, peso: 1 },
  { en: 11.8, peso: 1.2 },
  { en: 12.5, peso: 1.5 },
];

// Instantes nominales movidos al pulso (o al acento, para los cortes), en orden y con separación mínima.
export const secuencia = (
  nominales: number[],
  q: (s: number) => number,
  qCorte: (s: number) => number,
  cortes: number[],
  separacion: number,
  tope: number,
) => {
  const out: number[] = [];
  let previo = -1;
  for (const [i, s] of nominales.entries()) {
    let c = cortes.includes(i) ? qCorte(s) : q(s);
    if (c > s + 0.3) c = s;
    if (c < previo + separacion) c = previo + separacion;
    c = Math.min(c, tope);
    out.push(c);
    previo = c;
  }
  return out;
};
