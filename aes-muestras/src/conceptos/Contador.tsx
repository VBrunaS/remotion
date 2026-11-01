import { loadFont as anton } from "@remotion/google-fonts/Anton";
import { loadFont as inter } from "@remotion/google-fonts/Inter";
import { fitText } from "@remotion/layout-utils";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { PropsMuestra } from "../esquema";
import { useFuentes } from "../fuentes";
import {
  alAcento,
  alPulso,
  envolver,
  resorte,
  secuencia,
  valor,
} from "../motor";
import { etiquetaArea, Musica, temaDe } from "./comun";

// Concepto B. El contador. Números más grandes que la pantalla, paneles que empujan,
// mitades invertidas, una cinta que corre con la cita, y palabras que se desplazan entre sí.

const Odometro: React.FC<{
  readonly valor: string;
  readonly t: number;
  readonly en: number;
  readonly tam: number;
  readonly color: string;
  readonly fam: string;
}> = ({ valor: v, t, en, tam, color, fam }) => (
  <div
    style={{
      display: "flex",
      fontFamily: fam,
      fontSize: tam,
      lineHeight: 0.86,
      color,
      height: tam * 0.86,
      overflow: "hidden",
      letterSpacing: "-0.02em",
    }}
  >
    {v.split("").map((c, i) =>
      /\d/.test(c) ? (
        <div
          key={`${c}-${i}`}
          style={{
            translate: `0px ${-valor(t, 0, [{ en: en + i * 0.07, a: Number(c), dur: 0.7 + i * 0.12 }]) * tam * 0.86}px`,
          }}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
            <div key={d} style={{ height: tam * 0.86 }}>
              {d}
            </div>
          ))}
        </div>
      ) : (
        <div key={`${c}-${i}`} style={{ whiteSpace: "pre" }}>
          {c}
        </div>
      ),
    )}
  </div>
);

export const Contador: React.FC<PropsMuestra> = (p) => {
  const fuentes = useFuentes(
    () => [
      anton("normal", { subsets: ["latin", "latin-ext"] }),
      inter("normal", { subsets: ["latin", "latin-ext"] }),
    ],
    [400, 600],
  );
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!fuentes)
    return <AbsoluteFill style={{ backgroundColor: p.colorFondo }} />;
  const [pesada, ui] = fuentes;
  const t = frame / fps;
  const tema = temaDe(p);
  const ev = secuencia(
    [
      0.5, 2.1, 3.7, 5.3, 5.7, 7.3, 9.1, 9.5, 9.9, 10.3, 10.7, 11.8, 12.6, 13.3,
      14.0,
    ],
    alPulso(tema, 0.26),
    alAcento(tema, 0.22),
    [0, 1, 2, 3, 5, 6, 11],
    0.18,
    14.2,
  );
  // 0-2 cifras, 3 mitades con la pregunta, 4 segunda mitad, 5 cinta con la norma,
  // 6-10 palabras de la consecuencia que se empujan, 11 logo, 12 oferta, 13 instagram, 14 firma
  const fondo = p.colorFondo;
  const tinta = p.colorTinta;
  const acento = p.colorAcento;
  const cifras = p.guion.cifras.slice(0, 3);
  const empuje = (en: number) => resorte(t - en, 0.42);
  const pregunta = p.guion.pregunta.split("\n");
  const mitadArriba = pregunta
    .slice(0, Math.ceil(pregunta.length / 2))
    .join(" ");
  const mitadAbajo = pregunta.slice(Math.ceil(pregunta.length / 2)).join(" ");
  const lineasArriba = envolver(
    mitadArriba,
    {
      fontFamily: pesada,
      fontSize: 170,
      fontWeight: 400,
      letterSpacing: "-0.01em",
      textTransform: "uppercase",
    },
    920,
  );
  const lineasAbajo = envolver(
    mitadAbajo,
    {
      fontFamily: pesada,
      fontSize: 170,
      fontWeight: 400,
      letterSpacing: "-0.01em",
      textTransform: "uppercase",
    },
    920,
  );
  const ajustar = (s: string, cap: number) =>
    Math.min(
      cap,
      0.94 *
        fitText({
          text: s.toUpperCase(),
          withinWidth: 920,
          fontFamily: pesada,
          fontWeight: "400",
          letterSpacing: "-0.01em",
          validateFontIsLoaded: true,
        }).fontSize,
    );
  const palabras = p.guion.consecuencia
    .replace(/\*/g, "")
    .replace(/\.$/, "")
    .split(/\s+/);
  const grupos: string[] = [];
  for (let i = 0; i < palabras.length; i += 2)
    grupos.push(palabras.slice(i, i + 2).join(" "));
  const grupoActual = Math.min(
    grupos.length - 1,
    [ev[6], ev[7], ev[8], ev[9], ev[10]].filter((e) => t >= e).length - 1,
  );
  const cita = `${p.guion.normaTitulo.toUpperCase()}   ·   «${p.guion.normaCita}»   ·   `;
  const lineasOferta = envolver(
    p.guion.oferta,
    {
      fontFamily: pesada,
      fontSize: 92,
      fontWeight: 400,
      letterSpacing: "-0.01em",
      textTransform: "uppercase",
    },
    920,
  );

  return (
    <AbsoluteFill
      style={{ backgroundColor: fondo, overflow: "hidden", fontFamily: pesada }}
    >
      {/* Nombre enorme */}
      {t < ev[0] ? (
        <div
          style={{
            position: "absolute",
            left: 80,
            width: 920,
            top: 760,
            fontSize: ajustar(p.nombre, 260),
            lineHeight: 0.95,
            color: acento,
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          {p.nombre}
        </div>
      ) : null}

      {/* Cifras que empujan */}
      {t >= ev[0] && t < ev[3] ? (
        <>
          {cifras.map((c, i) => {
            const en = ev[i];
            const fin = i + 1 < 3 ? ev[i + 1] : ev[3];
            if (t < en || t >= fin + 0.6) return null;
            const entra = i === 0 ? 1 : empuje(en);
            const sale = empuje(fin);
            const colores = [
              { bg: tinta, num: fondo, et: acento },
              { bg: fondo, num: tinta, et: acento },
              { bg: acento, num: fondo, et: tinta },
            ][i];
            const dir = i % 2 === 0 ? "x" : "y";
            return (
              <AbsoluteFill
                key={c.valor}
                style={{
                  backgroundColor: colores.bg,
                  translate:
                    dir === "x"
                      ? `${(1 - entra) * 1080 - sale * 1080}px 0px`
                      : `0px ${(1 - entra) * 1920 - sale * 1920}px`,
                }}
              >
                <div style={{ position: "absolute", left: -20, top: 280 }}>
                  <Odometro
                    valor={c.valor}
                    t={t}
                    en={en + 0.05}
                    tam={c.valor.length > 2 ? 760 : 1200}
                    color={colores.num}
                    fam={pesada}
                  />
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 80,
                    bottom: 160,
                    width: 920,
                    fontFamily: ui,
                    fontSize: 40,
                    fontWeight: 600,
                    lineHeight: 1.25,
                    color: colores.et,
                    borderTop: `6px solid ${colores.et}`,
                    paddingTop: 20,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {c.etiqueta}
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 80,
                    top: 100,
                    fontFamily: ui,
                    fontSize: 28,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    color: colores.num,
                    opacity: 0.7,
                    textTransform: "uppercase",
                  }}
                >
                  {p.nombre}
                </div>
              </AbsoluteFill>
            );
          })}
        </>
      ) : null}

      {/* Mitades con la pregunta */}
      {t >= ev[3] && t < ev[5] ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 1080,
              height: 960,
              backgroundColor: fondo,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 80,
                bottom: 60,
                width: 920,
                fontSize: 170,
                lineHeight: 0.92,
                color: tinta,
                textTransform: "uppercase",
                translate: `${(1 - empuje(ev[3])) * -1080}px 0px`,
              }}
            >
              {lineasArriba.map((l) => (
                <div key={l}>{l}</div>
              ))}
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 960,
              width: 1080,
              height: 960,
              backgroundColor: tinta,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 80,
                top: 60,
                width: 920,
                fontSize: 170,
                lineHeight: 0.92,
                color: fondo,
                textTransform: "uppercase",
                translate: `${(1 - empuje(ev[4])) * 1080}px 0px`,
              }}
            >
              {lineasAbajo.map((l) => (
                <div key={l}>{l}</div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {/* Cinta con la norma */}
      {t >= ev[5] && t < ev[6] ? (
        <AbsoluteFill style={{ backgroundColor: acento }}>
          <div
            style={{
              position: "absolute",
              left: 80,
              top: 100,
              fontFamily: ui,
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "0.14em",
              color: fondo,
              opacity: 0.8,
              textTransform: "uppercase",
            }}
          >
            {etiquetaArea(p.area)}
          </div>
          <div
            style={{
              position: "absolute",
              left: 80,
              top: 560,
              width: 920,
              fontSize: 300,
              lineHeight: 0.9,
              color: fondo,
              textTransform: "uppercase",
              translate: `0px ${(1 - empuje(ev[5])) * 400}px`,
            }}
          >
            {p.guion.normaNumero}
          </div>
          <div
            style={{
              position: "absolute",
              left: 80,
              top: 880,
              width: 920,
              fontFamily: ui,
              fontSize: 40,
              fontWeight: 600,
              color: tinta,
              lineHeight: 1.2,
            }}
          >
            {p.guion.normaTitulo}
          </div>
          {[0, 1, 2].map((fila) => (
            <div
              key={fila}
              style={{
                position: "absolute",
                left: 0,
                top: 1180 + fila * 150,
                width: 1080,
                overflow: "hidden",
                whiteSpace: "nowrap",
                fontSize: 110,
                lineHeight: 1.2,
                color: fila === 1 ? tinta : fondo,
                textTransform: "uppercase",
                opacity: fila === 1 ? 1 : 0.55,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  translate: `${((fila % 2 === 0 ? -1 : 1) * ((t - ev[5]) * 520)) % 4000}px 0px`,
                }}
              >
                {cita.repeat(6)}
              </div>
            </div>
          ))}
        </AbsoluteFill>
      ) : null}

      {/* Palabras que se empujan */}
      {t >= ev[6] && t < ev[11] ? (
        <AbsoluteFill style={{ backgroundColor: tinta }}>
          {grupos.map((g, i) => {
            if (i > grupoActual || i < grupoActual - 1) return null;
            const en = [ev[6], ev[7], ev[8], ev[9], ev[10]][Math.min(i, 4)];
            const siguiente =
              i + 1 <= grupoActual
                ? [ev[6], ev[7], ev[8], ev[9], ev[10]][Math.min(i + 1, 4)]
                : Infinity;
            const entra = i === 0 ? 1 : empuje(en);
            const sale = siguiente === Infinity ? 0 : empuje(siguiente);
            const clave = (
              p.guion.consecuencia.match(/\*([^*]+)\*/)?.[1] ?? ""
            ).toLowerCase();
            const esClave =
              clave.includes(g.toLowerCase().replace(/[.,]/g, "")) &&
              g.length > 2;
            return (
              <div
                key={g}
                style={{
                  position: "absolute",
                  left: 80,
                  width: 920,
                  top: 960,
                  translate: `0px calc(-50% + ${(1 - entra) * 1200 - sale * 1200}px)`,
                  fontSize: ajustar(g, 240),
                  lineHeight: 0.92,
                  color: esClave ? acento : fondo,
                  textTransform: "uppercase",
                  textAlign: "left",
                }}
              >
                {g}
              </div>
            );
          })}
          <div
            style={{
              position: "absolute",
              left: 80,
              top: 100,
              fontFamily: ui,
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "0.14em",
              color: fondo,
              opacity: 0.7,
              textTransform: "uppercase",
            }}
          >
            En la práctica
          </div>
        </AbsoluteFill>
      ) : null}

      {/* Cierre */}
      {t >= ev[11] ? (
        <AbsoluteFill
          style={{ backgroundColor: p.logoSobreTinta ? tinta : fondo }}
        >
          <div
            style={{
              position: "absolute",
              left: 190,
              top: 420,
              width: 700,
              height: 400,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scale: String(1 + 0.5 * (1 - resorte(t - ev[11], 0.3))),
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
              left: 80,
              top: 940,
              width: 920,
              fontSize: 92,
              lineHeight: 0.95,
              color: p.logoSobreTinta ? fondo : tinta,
              textTransform: "uppercase",
            }}
          >
            {lineasOferta.map((l, i) => (
              <div key={l} style={{ overflow: "hidden" }}>
                <div
                  style={{
                    translate: `0px ${(1 - resorte(t - ev[12] - i * 0.1, 0.35)) * 110}%`,
                  }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              left: 80,
              top: 1260,
              width: 920,
              borderTop: `6px solid ${acento}`,
              paddingTop: 24,
              fontFamily: ui,
              fontSize: 40,
              fontWeight: 600,
              color: acento,
              opacity: t >= ev[13] ? 1 : 0,
              translate: `0px ${(1 - resorte(t - ev[13], 0.3)) * 30}px`,
            }}
          >
            {p.instagram}
            <div
              style={{
                fontSize: 28,
                color: p.logoSobreTinta ? fondo : tinta,
                opacity: 0.7,
                marginTop: 8,
                letterSpacing: "0.06em",
              }}
            >
              ESCRÍBENOS POR MENSAJE DIRECTO
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              width: 1080,
              top: 1760,
              textAlign: "center",
              fontFamily: ui,
              fontSize: 24,
              color: p.logoSobreTinta ? fondo : tinta,
              opacity: t >= ev[14] ? 0.6 : 0,
            }}
          >
            Muestra preparada por ǣs
          </div>
        </AbsoluteFill>
      ) : null}
      {tema ? (
        <Musica
          src={staticFile(`musica/${tema.archivo}`)}
          entrada={tema.entrada}
        />
      ) : null}
    </AbsoluteFill>
  );
};
