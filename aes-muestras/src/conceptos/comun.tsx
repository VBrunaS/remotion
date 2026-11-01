import { Audio } from "@remotion/media";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import biblioteca from "../../datos/musica/biblioteca.json";
import type { PropsMuestra } from "../esquema";
import type { Tema } from "../motor";

export const Musica: React.FC<{
  readonly src: string;
  readonly entrada: number;
}> = ({ src, entrada }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <Audio
      name="Tema"
      src={src}
      trimBefore={Math.round(entrada * fps)}
      volume={interpolate(
        frame,
        [0, 0.4 * fps, durationInFrames - 1.4 * fps, durationInFrames - 2],
        [0, 1, 1, 0],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        },
      )}
    />
  );
};

export const temaDe = (p: PropsMuestra): Tema | null => {
  const base =
    (biblioteca.temas as Tema[]).find((t) => t.id === p.musica) ?? null;
  return base
    ? {
        ...base,
        entrada: p.entradaMusica >= 0 ? p.entradaMusica : base.entrada,
      }
    : null;
};

export const etiquetaArea = (area: PropsMuestra["area"]) =>
  area === "familia"
    ? "Derecho de familia"
    : area === "laboral"
      ? "Derecho laboral"
      : area === "civil"
        ? "Derecho civil e inmobiliario"
        : "Derecho de empresas";

// Texto escrito a máquina: cuántos caracteres van a la vista en el instante t.
export const escrito = (
  texto: string,
  t: number,
  inicio: number,
  porSegundo: number,
) =>
  texto.slice(
    0,
    Math.max(0, Math.min(texto.length, Math.floor((t - inicio) * porSegundo))),
  );

// Papel con grano y viñeta, dibujado sin imágenes.
export const Papel: React.FC<{
  readonly color: string;
  readonly semilla: number;
}> = ({ color, semilla }) => (
  <svg
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    viewBox="0 0 1080 1920"
    preserveAspectRatio="none"
  >
    <defs>
      <filter id={`grano-${semilla}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="2"
          seed={semilla}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="table" tableValues="0 0.09" />
        </feComponentTransfer>
      </filter>
      <radialGradient id={`vineta-${semilla}`} cx="50%" cy="45%" r="75%">
        <stop offset="60%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.14" />
      </radialGradient>
    </defs>
    <rect width="1080" height="1920" fill={color} />
    <rect width="1080" height="1920" filter={`url(#grano-${semilla})`} />
    <rect width="1080" height="1920" fill={`url(#vineta-${semilla})`} />
  </svg>
);
