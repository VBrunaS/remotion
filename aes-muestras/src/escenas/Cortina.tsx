import { fitText } from "@remotion/layout-utils";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { DURACION_CORTINA, ESPERA_CORTINA, type Movimiento } from "../esquema";

// El nombre del estudio como cortina. Cubre la escena que sale, descubre la que entra.
export const Cortina: React.FC<{
  readonly nombre: string;
  readonly colorPanel: string;
  readonly colorTexto: string;
  readonly fam: string;
  readonly mov: Movimiento;
}> = ({ nombre, colorPanel, colorTexto, fam, mov }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const vertical = mov.mayusculas;
  const texto = mov.mayusculas ? nombre.toUpperCase() : nombre;
  const tam = Math.min(
    240,
    fitText({
      text: texto,
      withinWidth: width - 120,
      fontFamily: fam,
      fontWeight: String(mov.pesoTitulo),
      letterSpacing: mov.espaciado,
    }).fontSize,
  );
  const pos = interpolate(
    frame,
    [0, ESPERA_CORTINA, DURACION_CORTINA],
    [100, 0, -100],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: mov.cortina,
    },
  );
  // Velocidad del panel en este cuadro, para un leve desenfoque de movimiento sin canvas.
  const posAnterior = interpolate(
    frame - 1,
    [0, ESPERA_CORTINA, DURACION_CORTINA],
    [100, 0, -100],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: mov.cortina,
    },
  );
  const desenfoque = Math.min(14, Math.abs(pos - posAnterior) * 0.35);
  const posTexto = interpolate(
    frame,
    [0, ESPERA_CORTINA, DURACION_CORTINA],
    [36, 0, -36],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: mov.cortina,
    },
  );

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundColor: colorPanel,
          translate: vertical ? `0px ${pos}%` : `${pos}% 0px`,
          filter: `blur(${desenfoque}px)`,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: fam,
            fontSize: tam,
            fontWeight: mov.pesoTitulo,
            letterSpacing: mov.espaciado,
            color: colorTexto,
            whiteSpace: "nowrap",
            lineHeight: 1,
            translate: vertical ? `0px ${posTexto}%` : `${posTexto}% 0px`,
          }}
        >
          {texto}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
