import { zColor, zTextarea } from "@remotion/zod-types";
import { Easing } from "remotion";
import { z } from "zod";

export const TIPOGRAFIAS = [
  "Playfair Display",
  "Cormorant Garamond",
  "Libre Baskerville",
  "Fraunces",
  "Instrument Serif",
  "Newsreader",
  "Archivo",
  "Archivo Black",
  "Inter",
  "Space Grotesk",
  "Manrope",
  "Syne",
  "Oswald",
] as const;

export const esquemaMuestra = z.object({
  nombre: z.string().describe("Nombre exacto del estudio"),
  instagram: z.string().describe("Usuario de Instagram, con @"),
  logo: z
    .string()
    .describe("Ruta del logo dentro de public/, por ejemplo logos/estudio.svg"),
  logoSobreTinta: z
    .boolean()
    .describe(
      "El logo solo se lee sobre fondo oscuro; el cierre usa la tinta de fondo",
    ),
  colorFondo: zColor().describe("Color de fondo (campo claro)"),
  colorTinta: zColor().describe("Color de tinta (campo oscuro)"),
  colorAcento: zColor().describe("Color de acento del estudio"),
  tipografia: z.enum(TIPOGRAFIAS),
  area: z.enum(["familia", "laboral", "civil", "empresas"]),
  tono: z.enum(["sobrio", "moderno", "cercano", "energico"]),
  musica: z.string().describe("Id del tema en datos/musica/biblioteca.json"),
  registro: z.enum(["editorial", "cinetico"]),
  guion: z.object({
    pregunta: zTextarea().describe("Gancho. Saltos de línea manuales"),
    normaTitulo: z.string(),
    normaNumero: z.string().describe("Número grande de fondo"),
    normaTexto: zTextarea().describe("Cita literal de la norma"),
    fuente: z.string().describe("Pie con la fuente"),
    fechaVerificacion: z
      .string()
      .describe("Fecha de verificación en BCN, vacío si está pendiente"),
    consecuencia: zTextarea().describe(
      "Una idea. La frase clave entre *asteriscos*",
    ),
  }),
  cortes: z
    .array(z.number())
    .length(3)
    .describe("Cuadros de los tres cortes, ajustados al pulso"),
  desenfoque: z
    .boolean()
    .describe(
      "Desenfoque de movimiento por canvas en las cortinas (necesita HTML-in-canvas). Apagado, se usa un desenfoque CSS según la velocidad",
    ),
});

export type PropsMuestra = z.infer<typeof esquemaMuestra>;

export const ESPERA_CORTINA = 8;
export const DURACION_CORTINA = 16;

export const tokensMovimiento = (
  registro: PropsMuestra["registro"],
  tono: PropsMuestra["tono"],
) => {
  const factor = { sobrio: 1.15, moderno: 1, cercano: 1.1, energico: 0.8 }[
    tono
  ];
  const base =
    registro === "editorial"
      ? { rapido: 11, normal: 15, lento: 24 }
      : { rapido: 6, normal: 9, lento: 14 };
  return {
    rapido: Math.round(base.rapido * factor),
    normal: Math.round(base.normal * factor),
    lento: Math.round(base.lento * factor),
    entrada:
      registro === "editorial"
        ? Easing.bezier(0.4, 0, 0.2, 1)
        : Easing.bezier(0.2, 0, 0, 1),
    salida: Easing.bezier(0.3, 0, 1, 1),
    cortina: Easing.bezier(0.7, 0, 0.2, 1),
    mayusculas: registro === "cinetico",
    pesoTitulo: registro === "cinetico" ? 900 : 500,
    pesoTexto: registro === "cinetico" ? 700 : 400,
    espaciado: registro === "cinetico" ? "-0.03em" : "-0.015em",
    interlinea: registro === "cinetico" ? 0.9 : 1.02,
  };
};

export type Movimiento = ReturnType<typeof tokensMovimiento>;
