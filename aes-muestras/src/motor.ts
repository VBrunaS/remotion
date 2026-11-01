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
