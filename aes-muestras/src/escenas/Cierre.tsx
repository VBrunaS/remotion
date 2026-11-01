import {
  AbsoluteFill,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ESPERA_CORTINA, type Movimiento, type PropsMuestra } from "../esquema";

// Revelado del logo como clímax. El archivo del logo se muestra tal cual, sin redibujarlo.
export const Cierre: React.FC<{
  readonly p: PropsMuestra;
  readonly fam: string;
  readonly famFirma: string;
  readonly mov: Movimiento;
}> = ({ p, fam, famFirma, mov }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = ESPERA_CORTINA;
  const finRevelado = e + mov.lento * 2;
  const borde = interpolate(frame, [e, finRevelado], [-12, 112], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: mov.entrada,
  });
  const mascara = mov.mayusculas
    ? `linear-gradient(0deg, #000 ${borde}%, transparent ${borde + 4}%)`
    : `linear-gradient(100deg, #000 ${borde}%, transparent ${borde + 14}%)`;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: p.logoSobreTinta ? p.colorTinta : p.colorFondo,
        fontFamily: fam,
      }}
    >
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Img
          name="Logo"
          src={staticFile(p.logo)}
          style={{
            width: 700,
            maxHeight: 560,
            objectFit: "contain",
            maskImage: mascara,
            WebkitMaskImage: mascara,
            scale: String(
              interpolate(frame, [e, finRevelado], [1.06, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: mov.entrada,
                output: "perceptual-scale",
              }),
            ),
            translate: `0px ${interpolate(frame, [e, finRevelado], [-40, -60], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: mov.entrada,
            })}px`,
          }}
        />
      </AbsoluteFill>

      <Interactive.Div
        name="Instagram"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1180,
          textAlign: "center",
          color: p.logoSobreTinta ? p.colorFondo : p.colorTinta,
          fontSize: 36,
          fontWeight: mov.pesoTexto,
          letterSpacing: "0.08em",
          opacity: interpolate(
            frame,
            [finRevelado - 4, finRevelado - 4 + mov.lento],
            [0, 0.7],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: mov.entrada,
            },
          ),
          translate: `0px ${interpolate(
            frame,
            [finRevelado - 4, finRevelado - 4 + mov.lento],
            [18, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: mov.entrada,
            },
          )}px`,
        }}
      >
        {p.instagram}
      </Interactive.Div>

      <Interactive.Div
        name="Firma ǣs"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 110,
          textAlign: "center",
          fontFamily: famFirma,
          color: p.logoSobreTinta ? p.colorFondo : p.colorTinta,
          fontSize: 26,
          fontWeight: 400,
          letterSpacing: "0.02em",
          opacity: interpolate(
            frame,
            [2.3 * fps, 2.3 * fps + mov.lento],
            [0, 0.55],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: mov.entrada,
            },
          ),
        }}
      >
        Muestra preparada por ǣs
      </Interactive.Div>
    </AbsoluteFill>
  );
};
