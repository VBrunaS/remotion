import { fitText, measureText } from "@remotion/layout-utils";
import type { CSSProperties } from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Movimiento, PropsMuestra } from "./esquema";
import {
  alPulso,
  envolver,
  geometria,
  PANTALLA,
  resorte,
  valor,
  type Geo,
} from "./motor";

// Película tipográfica de 15 s, un corte por pulso. Siete tramos con recursos distintos:
// el nombre que se aprieta y se vuelve regla, palabras que llegan una a una, una palabra que se
// tacha y se transforma, un número que rueda, una cita que se apila, una línea de tiempo,
// una frase subrayada a pincel y el logo que aparece dentro de una contracción.
// Todo valor es una función pura del tiempo.

const IZQ = 80;
const ANCHO = 920;

const caja = (g: Geo, extra: CSSProperties): CSSProperties => ({
  position: "absolute",
  left: g.x,
  top: g.y,
  width: g.w,
  height: g.h,
  ...extra,
});

const secuencia = (
  nominales: number[],
  q: (s: number) => number,
  separacion: number,
  tope: number,
) => {
  const out: number[] = [];
  let previo = -1;
  for (const s of nominales) {
    let c = q(s);
    if (c > s + 0.3) c = s;
    if (c < previo + separacion) c = previo + separacion;
    c = Math.min(c, tope);
    out.push(c);
    previo = c;
  }
  return out;
};

// Trazo de pincel que se dibuja de izquierda a derecha.
const Trazo: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly grosor: number;
  readonly color: string;
  readonly avance: number;
}> = ({ x, y, w, grosor, color, avance }) => (
  <svg
    style={{
      position: "absolute",
      left: x - 10,
      top: y - grosor,
      width: w + 20,
      height: grosor * 2,
      overflow: "visible",
    }}
    viewBox={`0 0 ${w + 20} ${grosor * 2}`}
  >
    <path
      d={`M 10 ${grosor} C ${w * 0.3} ${grosor - 5}, ${w * 0.65} ${grosor + 6}, ${w + 10} ${grosor - 2}`}
      fill="none"
      stroke={color}
      strokeWidth={grosor}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - avance}
      opacity={avance > 0.001 ? 1 : 0}
    />
  </svg>
);

export const Pelicula: React.FC<{
  readonly p: PropsMuestra;
  readonly fam: string;
  readonly famFirma: string;
  readonly mov: Movimiento;
  readonly tema: { entrada: number; pulsos: number[] } | null;
}> = ({ p, fam, famFirma, mov, tema }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const k = mov.mayusculas ? 0.85 : 1;
  const gr = mov.mayusculas ? 14 : 3;
  const grosorTrazo = mov.mayusculas ? 22 : 14;
  const texto = (s: string) => (mov.mayusculas ? s.toUpperCase() : s);
  const peso = mov.pesoTitulo;
  const mayus = mov.mayusculas ? ("uppercase" as const) : ("none" as const);
  const medir = (
    s: string,
    fontSize: number,
    fontWeight: number,
    letterSpacing = mov.espaciado,
  ) =>
    measureText({
      text: texto(s),
      fontFamily: fam,
      fontSize,
      fontWeight,
      letterSpacing,
      textTransform: mayus,
      validateFontIsLoaded: true,
    }).width;
  const ajustar = (s: string, cap: number, fontWeight = peso) =>
    Math.min(
      cap,
      0.96 *
        fitText({
          text: texto(s),
          withinWidth: ANCHO,
          fontFamily: fam,
          fontWeight: String(fontWeight),
          letterSpacing: mov.espaciado,
          validateFontIsLoaded: true,
        }).fontSize,
    );

  // ---- Guion de movimiento ----
  const ev = secuencia(
    [
      0.5,
      0.75, // 0 apretar, 1 astilla → regla del encabezado
      0.95,
      1.15,
      1.35,
      1.55,
      1.75,
      1.95,
      2.15,
      2.35, // 2-9 palabras de la pregunta
      2.55, // 10 trazo bajo la última palabra
      3.15, // 11 corte a invertido, la palabra
      3.55, // 12 tachado
      3.85, // 13 transformación
      4.45, // 14 corte a la norma, el número rueda
      4.85, // 15 título
      5.1,
      5.4,
      5.7,
      6.0,
      6.3, // 16-20 líneas de la cita
      7.3, // 21 corte a la línea de tiempo
      7.5, // 22 el punto viaja
      8.3, // 23 frase de la línea
      8.9, // 24 corte invertido, consecuencia palabra a palabra
      11.0, // 25 trazo bajo la frase clave
      11.8, // 26 inundación en acento
      12.1, // 27 contracción a la caja del logo
      12.5, // 28 la caja se pliega y descubre el logo
      13.0, // 29 oferta de valor
      13.6, // 30 instagram y llamado
      14.1, // 31 firma
    ],
    alPulso(tema, 0.26),
    0.18,
    14.2,
  );

  // ---- Tramo 1. Nombre enorme que se aprieta ----
  const palabrasNombre = p.nombre.split(" ");
  const partir = (n: number) => {
    const tam = Math.ceil(palabrasNombre.length / n);
    const out: string[] = [];
    for (let i = 0; i < palabrasNombre.length; i += tam)
      out.push(palabrasNombre.slice(i, i + tam).join(" "));
    return out;
  };
  let lineasNombre = partir(1);
  let tamNombre = Math.min(...lineasNombre.map((l) => ajustar(l, 320)));
  for (const n of [2, 3]) {
    if (tamNombre >= 190 || n > palabrasNombre.length) break;
    lineasNombre = partir(n);
    tamNombre = Math.min(...lineasNombre.map((l) => ajustar(l, 320)));
  }
  const altoNombre = lineasNombre.length * tamNombre * mov.interlinea;
  const topeNombre = 960 - altoNombre / 2;
  const astilla: Geo = { x: 534, y: topeNombre, w: 12, h: altoNombre };
  const reglaEnc: Geo = { x: IZQ, y: 170, w: ANCHO, h: gr };
  const escalaNombre = valor(t, 1, [{ en: ev[0], a: 0.012, dur: 0.32 * k }]);
  const nombreVisible = t < ev[1] + 0.05;
  const formaA = geometria(t, astilla, [
    { en: ev[1], a: reglaEnc, dur: 0.35 * k },
    { en: ev[26], a: PANTALLA, dur: 0.3 },
    { en: ev[27], a: { x: 190, y: 760, w: 700, h: 400 }, dur: 0.45 * k },
    { en: ev[28], a: { x: 190, y: 1160, w: 700, h: 3 }, dur: 0.38 * k },
  ]);
  const formaAVisible = t >= ev[0] + 0.3 * k;

  // ---- Fondo por tramo (cortes secos; la inundación final cubre el último cambio) ----
  const invertido1 = t >= ev[11] && t < ev[14];
  const invertido2 = t >= ev[24] && t < ev[26] + 0.3;
  const fondoCierre = p.logoSobreTinta ? p.colorTinta : p.colorFondo;
  const fondo =
    t >= ev[26] + 0.3
      ? fondoCierre
      : invertido1 || invertido2
        ? p.colorTinta
        : p.colorFondo;
  const tinta =
    invertido1 || invertido2
      ? p.colorFondo
      : t >= ev[26] + 0.3
        ? p.logoSobreTinta
          ? p.colorFondo
          : p.colorTinta
        : p.colorTinta;

  // Cámara, un acercamiento leve por tramo.
  const inicios = [0, ev[11], ev[14], ev[21], ev[24], ev[26] + 0.3];
  const inicioTramo = inicios.filter((s) => s <= t).pop() ?? 0;
  const camara =
    1 + (mov.mayusculas ? 0.04 : 0.022) * resorte(t - inicioTramo, 3.5);

  // Rótulo de sección bajo la regla del encabezado.
  const seccion =
    t < ev[11]
      ? "La pregunta"
      : t < ev[14]
        ? "El cambio"
        : t < ev[21]
          ? "La norma"
          : t < ev[24]
            ? "El plazo"
            : "En la práctica";
  const etiquetaArea =
    p.area === "familia"
      ? "Derecho de familia"
      : p.area === "laboral"
        ? "Derecho laboral"
        : p.area === "civil"
          ? "Derecho civil e inmobiliario"
          : "Derecho de empresas";

  // ---- Tramo 2. La pregunta, palabra a palabra ----
  const tamPregunta = mov.mayusculas ? 136 : 120;
  const preguntaPlana = p.guion.pregunta.replace(/\n/g, " ");
  const lineasPregunta = envolver(
    preguntaPlana,
    {
      fontFamily: fam,
      fontSize: tamPregunta,
      fontWeight: peso,
      letterSpacing: mov.espaciado,
      textTransform: mayus,
    },
    ANCHO,
  );
  const altoLineaPregunta = tamPregunta * (mov.interlinea + 0.04);
  const topePregunta = 960 - (lineasPregunta.length * altoLineaPregunta) / 2;
  const tiempoPalabra = (i: number) =>
    i < 8 ? ev[2 + i] : ev[9] + 0.2 * (i - 7);
  const ultimaLinea = lineasPregunta[lineasPregunta.length - 1];
  const ultimaPalabra = ultimaLinea.split(" ").pop() ?? "";
  const anchoUltimaLinea = medir(ultimaLinea, tamPregunta, peso);
  const anchoUltimaPalabra = medir(ultimaPalabra, tamPregunta, peso);
  const totalPalabrasPregunta = preguntaPlana.split(/\s+/).length;

  // ---- Tramo 3. La palabra que se tacha y se transforma ----
  const antes = p.guion.antes;
  const despues = p.guion.despues;
  let pref = 0;
  while (
    pref < antes.length &&
    pref < despues.length &&
    antes[pref] === despues[pref]
  )
    pref++;
  let suf = 0;
  while (
    suf < antes.length - pref &&
    suf < despues.length - pref &&
    antes[antes.length - 1 - suf] === despues[despues.length - 1 - suf]
  )
    suf++;
  const comunIni = antes.slice(0, pref);
  const comunFin = antes.slice(antes.length - suf);
  const medioAntes = antes.slice(pref, antes.length - suf);
  const medioDespues = despues.slice(pref, despues.length - suf);
  const tamPalabra = Math.min(ajustar(antes, 230), ajustar(despues, 230));
  const transformacion = resorte(t - ev[13], 0.5 * k);
  const anchoMedio =
    medir(medioAntes, tamPalabra, peso) * (1 - transformacion) +
    medir(medioDespues, tamPalabra, peso) * transformacion;
  const anchoPalabra =
    medir(comunIni, tamPalabra, peso) +
    anchoMedio +
    medir(comunFin, tamPalabra, peso);
  const tachado =
    resorte(t - ev[12], 0.32 * k) * (1 - resorte(t - ev[13], 0.2));

  // ---- Tramo 4. El número que rueda y la cita que se apila ----
  const tamNumero = Math.min(480, ajustar(p.guion.normaNumero, 480));
  const tamCita = mov.mayusculas ? 50 : 54;
  const lineasCita = envolver(
    `«${p.guion.normaCita.replace(/\.$/, "")}».`,
    {
      fontFamily: fam,
      fontSize: tamCita,
      fontWeight: mov.pesoTexto,
      letterSpacing: "0em",
    },
    ANCHO,
  );
  const pie = `${p.guion.fuente}. Verificado el ${p.guion.fechaVerificacion}.`;

  // ---- Tramo 5. La línea de tiempo ----
  const viaje = resorte(t - ev[22], 1.1 * k);
  const tamFrase = ajustar(p.guion.linea.frase, 104);

  // ---- Tramo 6. La consecuencia palabra a palabra, con la frase clave subrayada ----
  const tamConsec = mov.mayusculas ? 96 : 88;
  const claveIni = p.guion.consecuencia.indexOf("*");
  const claveFin = p.guion.consecuencia.lastIndexOf("*") - 1;
  const consecPlana = p.guion.consecuencia.replace(/\*/g, "");
  const lineasConsec = envolver(
    consecPlana,
    {
      fontFamily: fam,
      fontSize: tamConsec,
      fontWeight: peso,
      letterSpacing: mov.espaciado,
      textTransform: mayus,
    },
    ANCHO,
  );
  const altoLineaConsec = tamConsec * (mov.interlinea + 0.08);
  const topeConsec = 960 - (lineasConsec.length * altoLineaConsec) / 2;
  const palabrasConsec = consecPlana.split(/\s+/);
  const pasoConsec = Math.min(
    0.18,
    (ev[25] - ev[24] - 0.4) / Math.max(1, palabrasConsec.length),
  );
  const trazoClave = resorte(t - ev[25], 0.5 * k);

  const colorCierre = p.logoSobreTinta ? p.colorFondo : p.colorTinta;

  return (
    <AbsoluteFill
      style={{ backgroundColor: fondo, fontFamily: fam, overflow: "hidden" }}
    >
      <AbsoluteFill
        style={{ scale: String(camara), transformOrigin: "50% 50%" }}
      >
        {/* Nombre enorme */}
        {nombreVisible ? (
          <div
            style={{
              position: "absolute",
              left: IZQ,
              width: ANCHO,
              top: topeNombre,
              color: p.colorAcento,
              fontSize: tamNombre,
              lineHeight: mov.interlinea,
              fontWeight: peso,
              letterSpacing: mov.espaciado,
              textTransform: mayus,
              scale: `${escalaNombre} 1`,
              transformOrigin: "50% 50%",
              textAlign: "center",
            }}
          >
            {lineasNombre.map((l) => (
              <div key={l}>{texto(l)}</div>
            ))}
          </div>
        ) : null}

        {/* Encabezado persistente */}
        {t >= ev[1] + 0.1 && t < ev[26] + 0.3 ? (
          <>
            <div
              style={{
                position: "absolute",
                left: IZQ,
                top: 96,
                width: ANCHO,
                height: 70,
                overflow: "hidden",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  color: tinta,
                  opacity: 0.9,
                  fontSize: 30,
                  fontWeight: mov.pesoTexto,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  lineHeight: 1.6,
                  translate: `0px ${(1 - resorte(t - ev[1] - 0.12, 0.45 * k)) * 70}px`,
                }}
              >
                {p.nombre}
              </div>
              <div
                style={{
                  color: p.colorAcento,
                  fontSize: 30,
                  fontWeight: mov.pesoTexto,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  lineHeight: 1.6,
                  translate: `0px ${(1 - resorte(t - ev[1] - 0.2, 0.45 * k)) * 70}px`,
                }}
              >
                {etiquetaArea}
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: IZQ,
                top: 170 + gr + 14,
                color: tinta,
                opacity: 0.55 * resorte(t - ev[1] - 0.3, 0.3),
                fontSize: 26,
                fontWeight: mov.pesoTexto,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {seccion}
            </div>
          </>
        ) : null}

        {/* Tramo 2. Pregunta palabra a palabra */}
        {t >= ev[2] - 0.05 && t < ev[11] ? (
          <div
            style={{
              position: "absolute",
              left: IZQ,
              top: topePregunta,
              width: ANCHO,
            }}
          >
            {(() => {
              let indice = 0;
              return lineasPregunta.map((l, li) => (
                <div
                  key={l}
                  style={{
                    height: altoLineaPregunta,
                    lineHeight: `${altoLineaPregunta}px`,
                    whiteSpace: "nowrap",
                    fontSize: tamPregunta,
                    fontWeight: peso,
                    letterSpacing: mov.espaciado,
                    textTransform: mayus,
                    color: p.colorTinta,
                  }}
                >
                  {l.split(" ").map((w) => {
                    const i = indice++;
                    const s = resorte(t - tiempoPalabra(i), 0.22 * k);
                    return (
                      <span
                        key={`${li}-${i}`}
                        style={{
                          display: "inline-block",
                          opacity: t >= tiempoPalabra(i) ? 1 : 0,
                          translate: `0px ${(1 - s) * 22}px`,
                          marginRight: "0.26em",
                        }}
                      >
                        {texto(w)}
                      </span>
                    );
                  })}
                </div>
              ));
            })()}
            <Trazo
              x={anchoUltimaLinea - anchoUltimaPalabra}
              y={lineasPregunta.length * altoLineaPregunta - 4}
              w={anchoUltimaPalabra}
              grosor={grosorTrazo}
              color={p.colorAcento}
              avance={
                t >= tiempoPalabra(totalPalabrasPregunta - 1)
                  ? resorte(t - ev[10], 0.4 * k)
                  : 0
              }
            />
          </div>
        ) : null}

        {/* Tramo 3. Palabra tachada y transformada */}
        {invertido1 ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              width: 1080,
              top: 960 - tamPalabra * 0.6,
              textAlign: "center",
              fontSize: tamPalabra,
              lineHeight: 1.2,
              fontWeight: peso,
              letterSpacing: mov.espaciado,
              textTransform: mayus,
              color: p.colorFondo,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                display: "inline-block",
                position: "relative",
                translate: `0px ${(1 - resorte(t - ev[11], 0.25 * k)) * 30}px`,
              }}
            >
              {texto(comunIni)}
              <span
                style={{
                  display: "inline-block",
                  width: anchoMedio,
                  height: tamPalabra * 1.2,
                  overflow: "hidden",
                  position: "relative",
                  verticalAlign: "top",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    whiteSpace: "pre",
                    translate: `0px ${-transformacion * tamPalabra * 1.2}px`,
                  }}
                >
                  {texto(medioAntes)}
                </span>
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    whiteSpace: "pre",
                    translate: `0px ${(1 - transformacion) * tamPalabra * 1.2}px`,
                  }}
                >
                  {texto(medioDespues)}
                </span>
              </span>
              {texto(comunFin)}
              <Trazo
                x={0}
                y={tamPalabra * 0.62}
                w={anchoPalabra}
                grosor={grosorTrazo}
                color={p.colorAcento}
                avance={tachado}
              />
            </span>
          </div>
        ) : null}

        {/* Tramo 4. Número que rueda, título y cita apilada */}
        {t >= ev[14] && t < ev[21] ? (
          <>
            <div
              style={{
                position: "absolute",
                left: IZQ,
                top: 290,
                height: tamNumero * 0.95,
                overflow: "hidden",
                display: "flex",
                color: p.colorTinta,
                fontSize: tamNumero,
                lineHeight: 0.95,
                fontWeight: peso,
                letterSpacing: mov.espaciado,
              }}
            >
              {p.guion.normaNumero.split("").map((c, i) =>
                /\d/.test(c) ? (
                  <div
                    key={`${c}-${i}`}
                    style={{
                      translate: `0px ${-valor(t, 0, [{ en: ev[14] + i * 0.08, a: Number(c), dur: 0.55 * k + i * 0.1 }]) * tamNumero * 0.95}px`,
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                      <div key={d} style={{ height: tamNumero * 0.95 }}>
                        {d}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div key={`${c}-${i}`}>{c}</div>
                ),
              )}
            </div>
            <div
              style={{
                position: "absolute",
                left: IZQ,
                top: 290 + tamNumero * 0.95 + 24,
                width: ANCHO,
                color: p.colorAcento,
                fontSize: 38,
                fontWeight: mov.pesoTexto,
                letterSpacing: mov.mayusculas ? "0.04em" : "0.01em",
                textTransform: mayus,
                opacity: t >= ev[15] ? 1 : 0,
                translate: `0px ${(1 - resorte(t - ev[15], 0.3 * k)) * 20}px`,
              }}
            >
              {p.guion.normaTitulo}
            </div>
            <div
              style={{
                position: "absolute",
                left: IZQ,
                top: 290 + tamNumero * 0.95 + 110,
                width: ANCHO,
              }}
            >
              {lineasCita.map((l, i) => {
                const en =
                  ev[16 + Math.min(i, 4)] + (i > 4 ? (i - 4) * 0.25 : 0);
                const siguiente =
                  i + 1 < lineasCita.length
                    ? ev[16 + Math.min(i + 1, 4)] +
                      (i + 1 > 4 ? (i + 1 - 4) * 0.25 : 0)
                    : Infinity;
                return (
                  <div
                    key={l}
                    style={{
                      color: p.colorTinta,
                      fontSize: tamCita,
                      fontWeight: mov.pesoTexto,
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                      opacity: t < en ? 0 : t < siguiente ? 1 : 0.42,
                      translate: `0px ${(1 - resorte(t - en, 0.25 * k)) * 18}px`,
                    }}
                  >
                    {l}
                  </div>
                );
              })}
            </div>
            <div
              style={{
                position: "absolute",
                left: IZQ,
                width: ANCHO,
                bottom: 110,
                color: p.colorTinta,
                opacity:
                  0.55 *
                  resorte(
                    t - ev[16 + Math.min(lineasCita.length - 1, 4)] - 0.2,
                    0.3,
                  ),
                fontSize: 25,
                fontWeight: mov.pesoTexto,
                lineHeight: 1.35,
              }}
            >
              {pie}
            </div>
          </>
        ) : null}

        {/* Tramo 5. Línea de tiempo */}
        {t >= ev[21] && t < ev[24] ? (
          <>
            <div
              style={{
                position: "absolute",
                left: IZQ,
                top: 800,
                width: ANCHO,
                display: "flex",
                justifyContent: "space-between",
                color: p.colorTinta,
                fontSize: 34,
                fontWeight: mov.pesoTexto,
                letterSpacing: "0.04em",
                textTransform: mayus,
              }}
            >
              <div>{texto(p.guion.linea.de)}</div>
              <div style={{ opacity: 0.35 + 0.65 * viaje }}>
                {texto(p.guion.linea.a)}
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: IZQ,
                top: 880,
                width: ANCHO,
                height: 2,
                backgroundColor: p.colorTinta,
                opacity: 0.3,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: IZQ,
                top: 880,
                width: ANCHO * viaje,
                height: 2,
                backgroundColor: p.colorAcento,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: IZQ - 11,
                top: 870,
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: p.colorAcento,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: IZQ + ANCHO - 11,
                top: 870,
                width: 22,
                height: 22,
                borderRadius: 11,
                border: `3px solid ${p.colorTinta}`,
                boxSizing: "border-box",
                backgroundColor: viaje > 0.985 ? p.colorAcento : "transparent",
                borderColor: viaje > 0.985 ? p.colorAcento : p.colorTinta,
                opacity: 0.9,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: IZQ - 15 + ANCHO * viaje,
                top: 866,
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: p.colorAcento,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: IZQ,
                top: 980,
                width: ANCHO,
                color: p.colorTinta,
                fontSize: tamFrase,
                lineHeight: mov.interlinea + 0.1,
                fontWeight: peso,
                letterSpacing: mov.espaciado,
                textTransform: mayus,
                opacity: t >= ev[23] ? 1 : 0,
                translate: `0px ${(1 - resorte(t - ev[23], 0.3 * k)) * 30}px`,
              }}
            >
              {texto(p.guion.linea.frase)}
            </div>
          </>
        ) : null}

        {/* Tramo 6. Consecuencia palabra a palabra con la frase clave subrayada */}
        {invertido2 ? (
          <div
            style={{
              position: "absolute",
              left: IZQ,
              top: topeConsec,
              width: ANCHO,
            }}
          >
            {(() => {
              let indice = 0;
              let pos = 0;
              return lineasConsec.map((l, li) => {
                const inicio = pos;
                pos += l.length + 1;
                const fin = inicio + l.length;
                const desde = Math.max(claveIni, inicio);
                const hasta = Math.min(claveFin, fin);
                const x0 =
                  hasta > desde
                    ? medir(l.slice(0, desde - inicio), tamConsec, peso)
                    : 0;
                const x1 =
                  hasta > desde
                    ? medir(l.slice(0, hasta - inicio), tamConsec, peso)
                    : 0;
                return (
                  <div
                    key={l}
                    style={{
                      position: "relative",
                      height: altoLineaConsec,
                      lineHeight: `${altoLineaConsec}px`,
                      whiteSpace: "nowrap",
                      fontSize: tamConsec,
                      fontWeight: peso,
                      letterSpacing: mov.espaciado,
                      textTransform: mayus,
                      color: p.colorFondo,
                    }}
                  >
                    {hasta > desde ? (
                      <Trazo
                        x={x0}
                        y={altoLineaConsec - 10}
                        w={x1 - x0}
                        grosor={grosorTrazo}
                        color={p.colorAcento}
                        avance={trazoClave}
                      />
                    ) : null}
                    {l.split(" ").map((w) => {
                      const i = indice++;
                      const en = ev[24] + 0.15 + i * pasoConsec;
                      const s = resorte(t - en, 0.2 * k);
                      const enClave =
                        inicio + l.indexOf(w) >= claveIni &&
                        inicio + l.indexOf(w) <= claveFin;
                      return (
                        <span
                          key={`${li}-${i}`}
                          style={{
                            display: "inline-block",
                            position: "relative",
                            opacity: t >= en ? 1 : 0,
                            translate: `0px ${(1 - s) * 22}px`,
                            marginRight: "0.26em",
                            color:
                              enClave && t >= ev[25]
                                ? p.colorAcento
                                : p.colorFondo,
                          }}
                        >
                          {texto(w)}
                        </span>
                      );
                    })}
                  </div>
                );
              });
            })()}
          </div>
        ) : null}

        {/* Tramo 7. Cierre con el logo dentro de la contracción */}
        {t >= ev[26] + 0.3 ? (
          <>
            <div
              style={{
                position: "absolute",
                left: 190,
                top: 760,
                width: 700,
                height: 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Img
                src={staticFile(p.logo)}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                left: IZQ,
                top: 1190,
                width: ANCHO,
                height: 150,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  color: colorCierre,
                  fontSize: 52,
                  fontWeight: peso,
                  letterSpacing: mov.espaciado,
                  textTransform: mayus,
                  lineHeight: 1.12,
                  textAlign: "center",
                }}
              >
                {p.guion.oferta.split(" ").map((w, i) => (
                  <span
                    key={`${w}-${i}`}
                    style={{
                      display: "inline-block",
                      marginRight: "0.26em",
                      opacity: t >= ev[29] + i * 0.12 ? 1 : 0,
                      translate: `0px ${(1 - resorte(t - ev[29] - i * 0.12, 0.22 * k)) * 24}px`,
                    }}
                  >
                    {texto(w)}
                  </span>
                ))}
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: IZQ,
                top: 1360,
                width: ANCHO,
                height: 110,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  translate: `0px ${(1 - resorte(t - ev[30], 0.5 * k)) * 110}px`,
                }}
              >
                <div
                  style={{
                    color: p.colorAcento,
                    fontSize: 38,
                    fontWeight: mov.pesoTexto,
                    letterSpacing: "0.08em",
                    lineHeight: 1.5,
                  }}
                >
                  {p.instagram}
                </div>
                <div
                  style={{
                    color: colorCierre,
                    opacity: 0.7,
                    fontSize: 28,
                    fontWeight: mov.pesoTexto,
                    letterSpacing: "0.06em",
                    lineHeight: 1.6,
                  }}
                >
                  Escríbenos por mensaje directo
                </div>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 1752,
                width: 1080,
                height: 56,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontFamily: famFirma,
                  color: colorCierre,
                  opacity: 0.6,
                  fontSize: 26,
                  letterSpacing: "0.02em",
                  textAlign: "center",
                  lineHeight: 2.1,
                  translate: `0px ${(1 - resorte(t - ev[31], 0.5 * k)) * 60}px`,
                }}
              >
                Muestra preparada por ǣs
              </div>
            </div>
          </>
        ) : null}

        {formaAVisible ? (
          <div style={caja(formaA, { backgroundColor: p.colorAcento })} />
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
