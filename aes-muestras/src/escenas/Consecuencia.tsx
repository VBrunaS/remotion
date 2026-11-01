import {
  AbsoluteFill,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ESPERA_CORTINA, type Movimiento, type PropsMuestra } from "../esquema";

export const Consecuencia: React.FC<{
  readonly p: PropsMuestra;
  readonly fam: string;
  readonly mov: Movimiento;
}> = ({ p, fam, mov }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const e = ESPERA_CORTINA;
  const trozos = p.guion.consecuencia.split("*");
  const palabras = p.guion.consecuencia.split(/\s+/).length;
  const tam = (palabras <= 14 ? 100 : 88) + (mov.mayusculas ? 4 : -4);

  return (
    <AbsoluteFill style={{ backgroundColor: p.colorFondo, fontFamily: fam }}>
      <Interactive.Div
        name="Rótulo"
        style={{
          position: "absolute",
          left: 80,
          top: 100,
          color: p.colorTinta,
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
        En la práctica
      </Interactive.Div>

      <Interactive.Div
        name="Barra de acento"
        style={{
          position: "absolute",
          left: 80,
          top: 160,
          height: mov.mayusculas ? 18 : 3,
          backgroundColor: p.colorAcento,
          width: interpolate(
            frame,
            [e + 2, e + 2 + mov.lento * 1.5],
            [0, width - 160],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: mov.entrada,
            },
          ),
        }}
      />

      <Interactive.Div
        name="Consecuencia"
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: "50%",
          color: p.colorTinta,
          fontSize: tam,
          fontWeight: mov.pesoTitulo,
          letterSpacing: mov.espaciado,
          lineHeight: mov.interlinea + 0.12,
          textTransform: mov.mayusculas ? "uppercase" : "none",
          translate: `0px ${interpolate(
            frame,
            [e + 6, e + 6 + mov.lento],
            [-44, -50],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: mov.entrada,
            },
          )}%`,
          opacity: interpolate(frame, [e + 6, e + 6 + mov.lento], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: mov.entrada,
          }),
        }}
      >
        {trozos.map((t, i) => (
          <span
            key={`${i}-${t}`}
            style={{
              color: i % 2 === 1 ? p.colorAcento : undefined,
            }}
          >
            {t}
          </span>
        ))}
      </Interactive.Div>

      <Interactive.Div
        name="Instagram"
        style={{
          position: "absolute",
          left: 80,
          bottom: 110,
          color: p.colorTinta,
          fontSize: 30,
          fontWeight: mov.pesoTexto,
          letterSpacing: "0.04em",
          opacity: interpolate(
            frame,
            [e + 6 + mov.lento, e + 6 + mov.lento * 2],
            [0, 0.55],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: mov.entrada,
            },
          ),
        }}
      >
        {p.instagram}
      </Interactive.Div>
    </AbsoluteFill>
  );
};
