import { loadFont as anton } from "@remotion/google-fonts/Anton";
import { loadFont as caveat } from "@remotion/google-fonts/Caveat";
import { loadFont as specialElite } from "@remotion/google-fonts/SpecialElite";
import { fitText, measureText } from "@remotion/layout-utils";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { PropsMuestra } from "../esquema";
import { useFuentes } from "../fuentes";
import { alAcento, alPulso, envolver, resorte, secuencia } from "../motor";
import { escrito, etiquetaArea, Musica, Papel, temaDe } from "./comun";

// Concepto A. El expediente. Todo ocurre sobre papel. Texto a máquina, timbres que golpean,
// destacador, nota al margen a mano, hojas que se pasan y un sello con el logo al final.

const Sello: React.FC<{
  readonly texto: string;
  readonly color: string;
  readonly fam: string;
  readonly impacto: number;
  readonly x: number;
  readonly y: number;
  readonly rot: number;
  readonly tam: number;
}> = ({ texto, color, fam, impacto, x, y, rot, tam }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      padding: `${tam * 0.18}px ${tam * 0.32}px`,
      border: `${Math.max(6, tam * 0.09)}px solid ${color}`,
      borderRadius: tam * 0.12,
      color,
      fontFamily: fam,
      fontSize: tam,
      lineHeight: 1,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
      opacity: impacto > 0.001 ? 0.92 : 0,
      rotate: `${rot}deg`,
      scale: String(1 + 0.9 * (1 - impacto)),
      transformOrigin: "50% 50%",
      mixBlendMode: "multiply",
    }}
  >
    {texto}
  </div>
);

export const Expediente: React.FC<PropsMuestra> = (p) => {
  const fuentes = useFuentes(
    () => [
      specialElite("normal", { subsets: ["latin"] }),
      caveat("normal", { subsets: ["latin", "latin-ext"] }),
      anton("normal", { subsets: ["latin", "latin-ext"] }),
    ],
    [400],
  );
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!fuentes)
    return <AbsoluteFill style={{ backgroundColor: p.colorFondo }} />;
  const [maquina, mano, timbre] = fuentes;
  const t = frame / fps;
  const tema = temaDe(p);
  const ev = secuencia(
    [0.6, 0.9, 3.4, 4.6, 5.0, 6.8, 7.5, 8.9, 9.4, 11.0, 11.9, 12.3, 13.4, 14.1],
    alPulso(tema, 0.26),
    alAcento(tema, 0.22),
    [2, 3, 5, 7, 9, 10],
    0.18,
    14.3,
  );
  // 0 nombre→membrete, 1 pregunta a máquina, 2 timbre, 3 pasar hoja, 4 norma a máquina,
  // 5 destacador y nota al margen, 6 timbre de plazo, 7 pasar hoja, 8 consecuencia a máquina,
  // 9 subrayado a mano, 10 sello con logo, 11 oferta a máquina, 12 instagram, 13 firma

  const papel = p.colorFondo;
  const tinta = p.colorTinta;
  const acento = p.colorAcento;
  const medir = (s: string, fontSize: number) =>
    measureText({
      text: s,
      fontFamily: maquina,
      fontSize,
      fontWeight: 400,
      validateFontIsLoaded: true,
    }).width;
  const pregunta = p.guion.pregunta.replace(/\n/g, " ");
  const lineasPregunta = envolver(
    pregunta,
    {
      fontFamily: maquina,
      fontSize: 84,
      fontWeight: 400,
      letterSpacing: "0em",
    },
    920,
  );
  const cita = `«${p.guion.normaCita}».`;
  const lineasCita = envolver(
    cita,
    {
      fontFamily: maquina,
      fontSize: 60,
      fontWeight: 400,
      letterSpacing: "0em",
    },
    920,
  );
  const consecuencia = p.guion.consecuencia.replace(/\*/g, "");
  const lineasConsec = envolver(
    consecuencia,
    {
      fontFamily: maquina,
      fontSize: 72,
      fontWeight: 400,
      letterSpacing: "0em",
    },
    920,
  );
  const clave = p.guion.consecuencia.match(/\*([^*]+)\*/)?.[1] ?? "";
  const cursor = Math.floor(t * 3) % 2 === 0 ? "▍" : " ";
  const tamTimbre = (texto: string, cap: number) =>
    Math.min(
      cap,
      0.8 *
        fitText({
          text: texto.toUpperCase(),
          withinWidth: 820,
          fontFamily: timbre,
          fontWeight: "400",
          letterSpacing: "0.06em",
          validateFontIsLoaded: true,
        }).fontSize,
    );
  const tamNota = Math.min(
    96,
    0.95 *
      fitText({
        text: p.guion.linea.frase,
        withinWidth: 900,
        fontFamily: mano,
        fontWeight: "400",
        validateFontIsLoaded: true,
      }).fontSize,
  );
  // golpe de timbre: la hoja se sacude y se asienta
  const sacudida = (en: number) =>
    t >= en ? 14 * (1 - resorte(t - en, 0.35)) : 0;
  const temblor = sacudida(ev[2]) + sacudida(ev[6]) + sacudida(ev[10]);
  // hojas: 0 pregunta, 1 norma, 2 consecuencia y cierre
  const hojaActual = t < ev[3] ? 0 : t < ev[7] ? 1 : 2;
  const pasar = (en: number) => resorte(t - en, 0.5);

  const escribir = (lineas: string[], inicio: number, porSegundo: number) => {
    let acumulado = 0;
    return lineas.map((l) => {
      const ini = inicio + acumulado / porSegundo;
      acumulado += l.length + 1;
      return { l, ini };
    });
  };
  const lineasP = escribir(lineasPregunta, ev[1], 26);
  const lineasN = escribir(lineasCita, ev[4] + 0.3, 30);
  const lineasC = escribir(lineasConsec, ev[8], 28);
  const totalP = pregunta.length / 26;

  const Hoja: React.FC<{
    readonly indice: number;
    readonly children: React.ReactNode;
  }> = ({ indice, children }) => {
    const salida =
      indice === 0 ? pasar(ev[3]) : indice === 1 ? pasar(ev[7]) : 0;
    if (indice < hojaActual && salida > 0.999) return null;
    return (
      <AbsoluteFill
        style={{
          translate: `0px ${-salida * 2100}px`,
          rotate: `${-salida * 3}deg`,
          transformOrigin: "20% 0%",
          boxShadow:
            indice <= hojaActual ? "0 20px 60px rgba(0,0,0,0.25)" : "none",
          overflow: "hidden",
        }}
      >
        <Papel color={papel} semilla={indice + 1} />
        {children}
      </AbsoluteFill>
    );
  };

  const membrete = (
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 96,
        width: 920,
        display: "flex",
        justifyContent: "space-between",
        fontFamily: maquina,
        fontSize: 28,
        color: tinta,
        opacity: 0.8,
        borderBottom: `2px solid ${tinta}`,
        paddingBottom: 14,
      }}
    >
      <div>{p.nombre}</div>
      <div style={{ color: acento }}>{etiquetaArea(p.area)}</div>
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: tinta, overflow: "hidden" }}>
      <AbsoluteFill style={{ translate: `0px ${temblor}px` }}>
        {/* Hoja 3 (abajo de todo): consecuencia y cierre */}
        <Hoja indice={2}>
          {membrete}
          <div
            style={{
              position: "absolute",
              left: 80,
              top: 300,
              width: 920,
              fontFamily: maquina,
              fontSize: 72,
              lineHeight: 1.25,
              color: tinta,
            }}
          >
            {lineasC.map(({ l, ini }, i) => {
              const txt = escrito(l, t, ini, 28);
              const esUltima = i === lineasC.length - 1;
              const desde = l.indexOf(clave);
              return (
                <div
                  key={l}
                  style={{ position: "relative", whiteSpace: "pre" }}
                >
                  {txt}
                  {esUltima && txt.length === l.length && t < ev[11]
                    ? cursor
                    : ""}
                  {desde >= 0 ? (
                    <svg
                      style={{
                        position: "absolute",
                        left: medir(l.slice(0, desde), 72) - 6,
                        top: 78,
                        width: medir(clave, 72) + 12,
                        height: 22,
                        overflow: "visible",
                      }}
                    >
                      <path
                        d={`M 2 12 C ${medir(clave, 72) * 0.3} 4, ${medir(clave, 72) * 0.6} 20, ${medir(clave, 72) + 8} 10`}
                        fill="none"
                        stroke={acento}
                        strokeWidth={7}
                        strokeLinecap="round"
                        pathLength={1}
                        strokeDasharray={1}
                        strokeDashoffset={1 - resorte(t - ev[9], 0.4)}
                        opacity={t >= ev[9] ? 1 : 0}
                      />
                    </svg>
                  ) : null}
                </div>
              );
            })}
          </div>
          {/* Sello con el logo */}
          <div
            style={{
              position: "absolute",
              left: 540 - 250,
              top: 880,
              width: 500,
              height: 500,
              borderRadius: 250,
              border: `10px solid ${acento}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: t >= ev[10] ? 0.95 : 0,
              scale: String(1 + 0.7 * (1 - resorte(t - ev[10], 0.3))),
              rotate: "-6deg",
              mixBlendMode: p.logoSobreTinta ? "normal" : "multiply",
              backgroundColor: p.logoSobreTinta ? tinta : "transparent",
            }}
          >
            <Img
              src={staticFile(p.logo)}
              style={{ width: 360, maxHeight: 300, objectFit: "contain" }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: 80,
              top: 1440,
              width: 920,
              fontFamily: maquina,
              fontSize: 44,
              lineHeight: 1.3,
              color: tinta,
              whiteSpace: "pre-wrap",
            }}
          >
            {escrito(p.guion.oferta, t, ev[11], 30)}
            {t >= ev[11] && t < ev[12] ? cursor : ""}
          </div>
          <div
            style={{
              position: "absolute",
              left: 80,
              top: 1540,
              width: 920,
              fontFamily: maquina,
              fontSize: 36,
              color: acento,
              whiteSpace: "pre",
            }}
          >
            {escrito(
              `${p.instagram}  ·  escríbenos por mensaje directo`,
              t,
              ev[12],
              40,
            )}
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              width: 1080,
              top: 1760,
              textAlign: "center",
              fontFamily: maquina,
              fontSize: 24,
              color: tinta,
              opacity: t >= ev[13] ? 0.6 : 0,
            }}
          >
            Muestra preparada por ǣs
          </div>
        </Hoja>

        {/* Hoja 2: la norma */}
        <Hoja indice={1}>
          {membrete}
          <div
            style={{
              position: "absolute",
              left: 80,
              top: 300,
              fontFamily: maquina,
              fontSize: 32,
              color: acento,
              whiteSpace: "pre",
            }}
          >
            {escrito(p.guion.normaTitulo.toUpperCase(), t, ev[4], 40)}
          </div>
          <div
            style={{
              position: "absolute",
              left: 80,
              top: 380,
              width: 920,
              fontFamily: maquina,
              fontSize: 60,
              lineHeight: 1.3,
              color: tinta,
            }}
          >
            {lineasN.map(({ l, ini }) => (
              <div key={l} style={{ position: "relative", whiteSpace: "pre" }}>
                {/* destacador detrás del texto */}
                <div
                  style={{
                    position: "absolute",
                    left: -8,
                    top: 8,
                    height: 64,
                    width: (medir(l, 60) + 16) * resorte(t - ev[5], 0.45),
                    backgroundColor: acento,
                    opacity: 0.35,
                    mixBlendMode: "multiply",
                    borderRadius: 4,
                  }}
                />
                <span style={{ position: "relative" }}>
                  {escrito(l, t, ini, 30)}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              left: 80,
              top: 760,
              width: 920,
              fontFamily: maquina,
              fontSize: 26,
              lineHeight: 1.4,
              color: tinta,
              opacity: 0.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {escrito(
              `${p.guion.fuente}. Verificado el ${p.guion.fechaVerificacion}.`,
              t,
              ev[5],
              90,
            )}
          </div>
          {/* nota al margen a mano */}
          <div
            style={{
              position: "absolute",
              left: 100,
              top: 1000,
              fontFamily: mano,
              fontSize: tamNota,
              color: acento,
              rotate: "-4deg",
              whiteSpace: "nowrap",
              clipPath: `inset(0 ${(1 - resorte(t - ev[5] - 0.25, 0.5)) * 100}% 0 0)`,
            }}
          >
            {p.guion.linea.frase.replace(/\.$/, "")}
          </div>
          <Sello
            texto={p.guion.linea.a}
            color={acento}
            fam={timbre}
            impacto={resorte(t - ev[6], 0.22)}
            x={110}
            y={1180}
            rot={-7}
            tam={tamTimbre(p.guion.linea.a, 110)}
          />
        </Hoja>

        {/* Hoja 1: nombre y pregunta */}
        <Hoja indice={0}>
          {t < ev[0] ? (
            <div
              style={{
                position: "absolute",
                left: 80,
                width: 920,
                top: 640,
                fontFamily: maquina,
                fontSize: 150,
                lineHeight: 1.05,
                color: acento,
                textAlign: "center",
              }}
            >
              {p.nombre}
            </div>
          ) : (
            membrete
          )}
          <div
            style={{
              position: "absolute",
              left: 80,
              top: 420,
              width: 920,
              fontFamily: maquina,
              fontSize: 84,
              lineHeight: 1.25,
              color: tinta,
            }}
          >
            {lineasP.map(({ l, ini }, i) => (
              <div key={l} style={{ whiteSpace: "pre" }}>
                {escrito(l, t, ini, 26)}
                {i === lineasP.length - 1 &&
                t >= ev[1] &&
                t < ev[1] + totalP + 0.6
                  ? cursor
                  : ""}
              </div>
            ))}
          </div>
          <Sello
            texto={p.guion.despues}
            color={acento}
            fam={timbre}
            impacto={resorte(t - ev[2], 0.22)}
            x={120}
            y={1120}
            rot={-9}
            tam={tamTimbre(p.guion.despues, 118)}
          />
        </Hoja>
      </AbsoluteFill>
      {tema ? (
        <Musica
          src={staticFile(`musica/${tema.archivo}`)}
          entrada={tema.entrada}
        />
      ) : null}
    </AbsoluteFill>
  );
};
