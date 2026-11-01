import { loadFont as inter } from "@remotion/google-fonts/Inter";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { PropsMuestra } from "../esquema";
import { useFuentes } from "../fuentes";
import { alAcento, alPulso, resorte, secuencia } from "../motor";
import { etiquetaArea, Musica, temaDe } from "./comun";

// Concepto C. La conversación. El video es un chat entre un cliente y el estudio. Indicador de
// escribiendo, burbujas que llegan, una tarjeta con la norma verificada, un botón para agendar,
// y el perfil del estudio al cierre.

export const Conversacion: React.FC<PropsMuestra> = (p) => {
  const fuentes = useFuentes(
    () => [inter("normal", { subsets: ["latin", "latin-ext"] })],
    [400, 500, 600, 700],
  );
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!fuentes)
    return <AbsoluteFill style={{ backgroundColor: p.colorFondo }} />;
  const [ui] = fuentes;
  const t = frame / fps;
  const tema = temaDe(p);
  const mensajes = p.guion.chat.slice(0, 5);
  const ev = secuencia(
    [0.5, 1.0, 1.7, 3.0, 4.0, 5.9, 6.6, 7.6, 9.6, 10.6, 11.9, 12.8, 13.5, 14.1],
    alPulso(tema, 0.26),
    alAcento(tema, 0.22),
    [0, 2, 4, 6, 8, 10],
    0.18,
    14.2,
  );
  // 0 nombre→cabecera; luego por mensaje (escribiendo, llega): 1-2, 3-4, 5-6, 7-8, 9-10; 11 cierre, 12 instagram, 13 firma
  const fondo = p.colorFondo;
  const tinta = p.colorTinta;
  const acento = p.colorAcento;
  const llegadas = [ev[2], ev[4], ev[6], ev[8], ev[10]];
  const escribiendo = [ev[1], ev[3], ev[5], ev[7], ev[9]];
  const visibles = mensajes.filter((_, i) => t >= llegadas[i]).length;
  const escribiendoAhora = mensajes.findIndex(
    (_, i) => t >= escribiendo[i] && t < llegadas[i],
  );
  const cierre = t >= ev[11];
  // altura aproximada de cada burbuja para desplazar la conversación cuando no cabe
  const alto = (m: (typeof mensajes)[number]) =>
    120 +
    Math.ceil(m.texto.length / 34) * 54 +
    (m.documento ? 230 : 0) +
    (m.boton ? 110 : 0);
  const totalVisible =
    mensajes.slice(0, visibles).reduce((a, m) => a + alto(m), 0) +
    (escribiendoAhora >= 0 ? 110 : 0);
  const desplazamiento = Math.max(0, totalVisible - 1300);
  const mezcla = (a: string, b: string, k: number) => {
    const h = (c: string) =>
      [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    const [r1, g1, b1] = h(a);
    const [r2, g2, b2] = h(b);
    return `rgb(${Math.round(r1 + (r2 - r1) * k)},${Math.round(g1 + (g2 - g1) * k)},${Math.round(b1 + (b2 - b1) * k)})`;
  };
  const burbujaCliente = mezcla(fondo, tinta, 0.08);

  return (
    <AbsoluteFill
      style={{ backgroundColor: fondo, fontFamily: ui, overflow: "hidden" }}
    >
      {t < ev[0] ? (
        <div
          style={{
            position: "absolute",
            left: 80,
            width: 920,
            top: 700,
            fontSize: 150,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            color: acento,
            textAlign: "center",
          }}
        >
          {p.nombre}
        </div>
      ) : null}

      {t >= ev[0] && !cierre ? (
        <>
          {/* Cabecera del chat */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 1080,
              height: 230,
              backgroundColor: fondo,
              borderBottom: `2px solid ${mezcla(fondo, tinta, 0.12)}`,
              display: "flex",
              alignItems: "center",
              gap: 28,
              padding: "70px 60px 0",
              boxSizing: "border-box",
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: 104,
                height: 104,
                borderRadius: 52,
                backgroundColor: p.logoSobreTinta ? tinta : fondo,
                border: `2px solid ${mezcla(fondo, tinta, 0.15)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                scale: String(0.6 + 0.4 * resorte(t - ev[0], 0.4)),
              }}
            >
              <Img
                src={staticFile(p.logo)}
                style={{ width: 80, height: 80, objectFit: "contain" }}
              />
            </div>
            <div
              style={{
                translate: `0px ${(1 - resorte(t - ev[0], 0.4)) * 20}px`,
              }}
            >
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: tinta,
                  letterSpacing: "-0.01em",
                }}
              >
                {p.nombre}
              </div>
              <div
                style={{
                  fontSize: 28,
                  color: acento,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: acento,
                    display: "inline-block",
                  }}
                />
                {etiquetaArea(p.area)} · en línea
              </div>
            </div>
          </div>

          {/* Hilo */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 260,
              width: 1080,
              translate: `0px ${-desplazamiento}px`,
            }}
          >
            {mensajes.slice(0, visibles).map((m, i) => {
              const s = resorte(t - llegadas[i], 0.4);
              const delEstudio = m.de === "estudio";
              return (
                <div
                  key={`${i}-${m.texto}`}
                  style={{
                    display: "flex",
                    justifyContent: delEstudio ? "flex-end" : "flex-start",
                    padding: "0 60px",
                    marginBottom: 28,
                    scale: String(0.9 + 0.1 * s),
                    translate: `0px ${(1 - s) * 40}px`,
                    transformOrigin: delEstudio ? "100% 100%" : "0% 100%",
                  }}
                >
                  <div
                    style={{
                      maxWidth: 820,
                      backgroundColor: delEstudio ? acento : burbujaCliente,
                      color: delEstudio ? fondo : tinta,
                      borderRadius: 36,
                      borderBottomRightRadius: delEstudio ? 8 : 36,
                      borderBottomLeftRadius: delEstudio ? 36 : 8,
                      padding: "30px 40px",
                      fontSize: 40,
                      lineHeight: 1.3,
                      fontWeight: 500,
                    }}
                  >
                    {m.texto}
                    {m.documento ? (
                      <div
                        style={{
                          marginTop: 24,
                          backgroundColor: fondo,
                          color: tinta,
                          borderRadius: 22,
                          padding: "24px 28px",
                          display: "flex",
                          gap: 22,
                          alignItems: "flex-start",
                        }}
                      >
                        <svg
                          width="56"
                          height="68"
                          viewBox="0 0 56 68"
                          style={{ flexShrink: 0 }}
                        >
                          <path
                            d="M4 4 H36 L52 20 V64 H4 Z"
                            fill="none"
                            stroke={acento}
                            strokeWidth="5"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M36 4 V20 H52"
                            fill="none"
                            stroke={acento}
                            strokeWidth="5"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14 34 H42 M14 46 H42"
                            stroke={acento}
                            strokeWidth="5"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div>
                          <div style={{ fontSize: 30, fontWeight: 700 }}>
                            {p.guion.normaTitulo}
                          </div>
                          <div
                            style={{
                              fontSize: 28,
                              lineHeight: 1.35,
                              marginTop: 8,
                              opacity: 0.85,
                            }}
                          >
                            «{p.guion.normaCita}».
                          </div>
                          <div
                            style={{
                              fontSize: 22,
                              marginTop: 10,
                              color: acento,
                              fontWeight: 600,
                            }}
                          >
                            Verificado en bcn.cl · {p.guion.fechaVerificacion}
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {m.boton ? (
                      <div
                        style={{
                          marginTop: 24,
                          border: `3px solid ${fondo}`,
                          borderRadius: 18,
                          padding: "18px 28px",
                          textAlign: "center",
                          fontWeight: 700,
                          fontSize: 34,
                          letterSpacing: "0.02em",
                        }}
                      >
                        Agendar una llamada
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
            {escribiendoAhora >= 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    mensajes[escribiendoAhora].de === "estudio"
                      ? "flex-end"
                      : "flex-start",
                  padding: "0 60px",
                }}
              >
                <div
                  style={{
                    backgroundColor:
                      mensajes[escribiendoAhora].de === "estudio"
                        ? acento
                        : burbujaCliente,
                    borderRadius: 36,
                    padding: "26px 34px",
                    display: "flex",
                    gap: 12,
                  }}
                >
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        backgroundColor:
                          mensajes[escribiendoAhora].de === "estudio"
                            ? fondo
                            : tinta,
                        display: "inline-block",
                        opacity:
                          0.35 + 0.65 * (Math.floor(t * 4) % 3 === d ? 1 : 0),
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {cierre ? (
        <AbsoluteFill
          style={{
            backgroundColor: p.logoSobreTinta ? tinta : fondo,
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 560,
              width: 700,
              height: 360,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scale: String(0.8 + 0.2 * resorte(t - ev[11], 0.4)),
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
              top: 1000,
              width: 920,
              textAlign: "center",
              fontSize: 56,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              color: p.logoSobreTinta ? fondo : tinta,
              opacity: t >= ev[11] + 0.2 ? 1 : 0,
              translate: `0px ${(1 - resorte(t - ev[11] - 0.2, 0.4)) * 30}px`,
            }}
          >
            {p.guion.oferta}
          </div>
          <div
            style={{
              position: "absolute",
              top: 1230,
              width: 640,
              textAlign: "center",
              backgroundColor: acento,
              color: fondo,
              borderRadius: 24,
              padding: "26px 0",
              fontSize: 38,
              fontWeight: 700,
              opacity: t >= ev[12] ? 1 : 0,
              scale: String(0.9 + 0.1 * resorte(t - ev[12], 0.35)),
            }}
          >
            Escríbenos · {p.instagram}
          </div>
          <div
            style={{
              position: "absolute",
              top: 1760,
              width: 1080,
              textAlign: "center",
              fontSize: 24,
              color: p.logoSobreTinta ? fondo : tinta,
              opacity: t >= ev[13] ? 0.6 : 0,
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
