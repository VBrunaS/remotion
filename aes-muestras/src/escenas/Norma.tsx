import { fitText } from "@remotion/layout-utils";
import {
  AbsoluteFill,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ESPERA_CORTINA, type Movimiento, type PropsMuestra } from "../esquema";

export const Norma: React.FC<{
  readonly p: PropsMuestra;
  readonly fam: string;
  readonly mov: Movimiento;
  readonly etiquetaArea: string;
}> = ({ p, fam, mov, etiquetaArea }) => {
  const frame = useCurrentFrame();
  const { width, durationInFrames } = useVideoConfig();
  const ancho = width - 160;
  const e = ESPERA_CORTINA;
  const palabras = p.guion.normaTexto.split(/\s+/).length;
  const tamTexto =
    (palabras <= 16 ? 68 : palabras <= 24 ? 58 : 50) + (mov.mayusculas ? 0 : 4);
  const tamNumero = Math.min(
    640,
    fitText({
      text: p.guion.normaNumero,
      withinWidth: ancho,
      fontFamily: fam,
      fontWeight: String(mov.pesoTitulo),
      letterSpacing: mov.espaciado,
    }).fontSize,
  );
  const pie = p.guion.fechaVerificacion
    ? `${p.guion.fuente}. Verificado el ${p.guion.fechaVerificacion}.`
    : `${p.guion.fuente}. Verificación en BCN pendiente.`;

  return (
    <AbsoluteFill style={{ backgroundColor: p.colorTinta, fontFamily: fam }}>
      <Interactive.Div
        name="Número de fondo"
        style={{
          position: "absolute",
          right: 60,
          top: 180,
          color: p.colorAcento,
          fontSize: tamNumero,
          fontWeight: mov.pesoTitulo,
          letterSpacing: mov.espaciado,
          lineHeight: 0.85,
          whiteSpace: "nowrap",
          opacity: interpolate(frame, [e, e + mov.lento], [0, 0.22], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: mov.entrada,
          }),
          scale: interpolate(frame, [e, e + mov.lento * 2], [1.08, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: mov.entrada,
            output: "perceptual-scale",
          }),
          translate: `0px ${interpolate(
            frame,
            [e, durationInFrames],
            [0, -36],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )}px`,
        }}
      >
        {p.guion.normaNumero}
      </Interactive.Div>

      <Interactive.Div
        name="Rótulo"
        style={{
          position: "absolute",
          left: 80,
          top: 100,
          color: p.colorFondo,
          fontSize: 34,
          fontWeight: mov.pesoTexto,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          opacity: interpolate(frame, [e, e + mov.normal], [0, 0.75], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: mov.entrada,
          }),
        }}
      >
        La norma · {etiquetaArea}
      </Interactive.Div>

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 300,
          color: p.colorFondo,
        }}
      >
        <Interactive.Div
          name="Título de la norma"
          style={{
            color: p.colorAcento,
            fontSize: 40,
            fontWeight: mov.pesoTexto,
            letterSpacing: mov.mayusculas ? "0.04em" : "0.01em",
            textTransform: mov.mayusculas ? "uppercase" : "none",
            marginBottom: 36,
            opacity: interpolate(frame, [e + 4, e + 4 + mov.normal], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: mov.entrada,
            }),
            translate: `0px ${interpolate(
              frame,
              [e + 4, e + 4 + mov.normal],
              [24, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: mov.entrada,
              },
            )}px`,
          }}
        >
          {p.guion.normaTitulo}
        </Interactive.Div>
        <Interactive.Div
          name="Texto de la norma"
          style={{
            fontSize: tamTexto,
            fontWeight: mov.pesoTexto,
            lineHeight: 1.18,
            letterSpacing: mov.mayusculas ? "-0.01em" : "0em",
            clipPath: `inset(0 ${interpolate(
              frame,
              [e + 8, e + 8 + mov.lento * 2],
              [100, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: mov.entrada,
              },
            )}% 0 0)`,
            translate: `0px ${interpolate(
              frame,
              [e + 8, e + 8 + mov.lento],
              [mov.mayusculas ? 40 : 0, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: mov.entrada,
              },
            )}px`,
          }}
        >
          «{p.guion.normaTexto.replace(/\.$/, "")}».
        </Interactive.Div>
      </div>

      <Interactive.Div
        name="Pie con la fuente"
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 110,
          color: p.colorFondo,
          fontSize: 27,
          fontWeight: mov.pesoTexto,
          lineHeight: 1.35,
          opacity: interpolate(
            frame,
            [e + 8 + mov.lento, e + 8 + mov.lento * 2],
            [0, 0.6],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: mov.entrada,
            },
          ),
        }}
      >
        {pie}
      </Interactive.Div>
    </AbsoluteFill>
  );
};
