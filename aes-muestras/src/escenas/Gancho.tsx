import { fitText } from "@remotion/layout-utils";
import {
  AbsoluteFill,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Movimiento, PropsMuestra } from "../esquema";

export const Gancho: React.FC<{
  readonly p: PropsMuestra;
  readonly fam: string;
  readonly mov: Movimiento;
  readonly etiquetaArea: string;
}> = ({ p, fam, mov, etiquetaArea }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const ancho = width - 160;
  const texto = (t: string) => (mov.mayusculas ? t.toUpperCase() : t);

  // El nombre se parte en 1, 2 o 3 líneas hasta que quede enorme.
  const palabras = p.nombre.split(" ");
  const partir = (n: number) => {
    const tam = Math.ceil(palabras.length / n);
    const out: string[] = [];
    for (let i = 0; i < palabras.length; i += tam) {
      out.push(palabras.slice(i, i + tam).join(" "));
    }
    return out;
  };
  const medir = (ls: string[]) =>
    Math.min(
      ...ls.map(
        (l) =>
          fitText({
            text: texto(l),
            withinWidth: ancho,
            fontFamily: fam,
            fontWeight: String(mov.pesoTitulo),
            letterSpacing: mov.espaciado,
            validateFontIsLoaded: true,
          }).fontSize,
      ),
    );
  let lineasNombre = partir(1);
  let tamNombre = medir(lineasNombre);
  for (const n of [2, 3]) {
    if (tamNombre >= 190 || n > palabras.length) break;
    lineasNombre = partir(n);
    tamNombre = medir(lineasNombre);
  }
  tamNombre = Math.min(tamNombre, 320);

  const lineasPregunta = p.guion.pregunta.split("\n");
  const tamLineas = lineasPregunta.map((l) =>
    Math.min(
      mov.mayusculas ? 170 : 128,
      // 4 % de margen porque la medición y el render pueden diferir levemente.
      0.96 *
        fitText({
          text: texto(l),
          withinWidth: ancho,
          fontFamily: fam,
          fontWeight: String(mov.pesoTitulo),
          letterSpacing: mov.espaciado,
          validateFontIsLoaded: true,
        }).fontSize,
    ),
  );
  // En el registro cinético cada línea llena el ancho; en el editorial todas comparten tamaño.
  const tamPregunta = (i: number) =>
    mov.mayusculas ? tamLineas[i] : Math.min(...tamLineas);

  const sostener = 12;

  return (
    <AbsoluteFill style={{ backgroundColor: p.colorFondo, fontFamily: fam }}>
      <Interactive.Div
        name="Nombre enorme"
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: "50%",
          color: p.colorAcento,
          fontSize: tamNombre,
          fontWeight: mov.pesoTitulo,
          letterSpacing: mov.espaciado,
          lineHeight: mov.interlinea,
          textTransform: mov.mayusculas ? "uppercase" : "none",
          translate: `0px ${interpolate(
            frame,
            [sostener, sostener + mov.normal],
            [-50, -56],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: mov.salida,
            },
          )}%`,
          opacity: interpolate(
            frame,
            [sostener, sostener + mov.normal],
            [1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: mov.salida,
            },
          ),
        }}
      >
        {lineasNombre.map((l) => (
          <div key={l}>{texto(l)}</div>
        ))}
      </Interactive.Div>

      <Interactive.Div
        name="Nombre pequeño"
        style={{
          position: "absolute",
          left: 80,
          top: 100,
          color: p.colorTinta,
          fontSize: 34,
          fontWeight: mov.pesoTexto,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          opacity: interpolate(
            frame,
            [sostener + 2, sostener + 2 + mov.normal],
            [0, 0.85],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: mov.entrada,
            },
          ),
          translate: `0px ${interpolate(
            frame,
            [sostener + 2, sostener + 2 + mov.normal],
            [16, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: mov.entrada,
            },
          )}px`,
        }}
      >
        {p.nombre}
      </Interactive.Div>

      <Interactive.Div
        name="Área"
        style={{
          position: "absolute",
          left: 80,
          top: 148,
          color: p.colorAcento,
          fontSize: 34,
          fontWeight: mov.pesoTexto,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          opacity: interpolate(
            frame,
            [sostener + 6, sostener + 6 + mov.normal],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: mov.entrada,
            },
          ),
        }}
      >
        {etiquetaArea}
      </Interactive.Div>

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: "50%",
          translate: "0px -50%",
          color: p.colorTinta,
          fontWeight: mov.pesoTitulo,
          letterSpacing: mov.espaciado,
          lineHeight: mov.interlinea + 0.06,
          textTransform: mov.mayusculas ? "uppercase" : "none",
        }}
      >
        {lineasPregunta.map((l, i) => (
          <div
            key={l}
            style={{
              fontSize: tamPregunta(i),
              whiteSpace: "nowrap",
              opacity: interpolate(
                frame,
                [sostener + 6 + i * 4, sostener + 6 + i * 4 + mov.lento],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: mov.entrada,
                },
              ),
              translate: `0px ${interpolate(
                frame,
                [sostener + 6 + i * 4, sostener + 6 + i * 4 + mov.lento],
                [70, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: mov.entrada,
                },
              )}px`,
            }}
          >
            {texto(l)}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
