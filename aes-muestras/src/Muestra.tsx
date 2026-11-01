import { Audio } from "@remotion/media";
import { useEffect, useState } from "react";
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import biblioteca from "../datos/musica/biblioteca.json";
import { Pelicula } from "./Pelicula";
import { type PropsMuestra, tokensMovimiento } from "./esquema";
import type { Tema } from "./motor";
import { cargadores, cargarInter } from "./fuentes";

const Musica: React.FC<{ readonly src: string; readonly entrada: number }> = ({
  src,
  entrada,
}) => {
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
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )}
    />
  );
};

export const Muestra: React.FC<PropsMuestra> = (p) => {
  const [fuentes, setFuentes] = useState<{ fam: string; firma: string } | null>(
    null,
  );

  useEffect(() => {
    const h = delayRender(`Cargando tipografía ${p.tipografia}`);
    const principal = cargadores[p.tipografia]();
    const inter = cargarInter();
    // Además de esperar la hoja de estilos, se exige cada peso usado, para medir el texto con la fuente real.
    Promise.all([principal.waitUntilDone(), inter.waitUntilDone()])
      .then(() =>
        Promise.all(
          [400, 500, 700, 900].map((peso) =>
            document.fonts.load(`${peso} 100px "${principal.fontFamily}"`),
          ),
        ),
      )
      .then(() => {
        setFuentes({ fam: principal.fontFamily, firma: inter.fontFamily });
        continueRender(h);
      })
      .catch((err) => cancelRender(err));
  }, [p.tipografia]);

  if (!fuentes) {
    return <AbsoluteFill style={{ backgroundColor: p.colorFondo }} />;
  }

  const mov = tokensMovimiento(p.registro, p.tono);
  const base =
    (biblioteca.temas as Tema[]).find((t) => t.id === p.musica) ?? null;
  const tema = base
    ? {
        ...base,
        entrada: p.entradaMusica >= 0 ? p.entradaMusica : base.entrada,
      }
    : null;

  return (
    <AbsoluteFill style={{ backgroundColor: p.colorFondo }}>
      <Pelicula
        p={p}
        fam={fuentes.fam}
        famFirma={fuentes.firma}
        mov={mov}
        tema={tema}
      />
      {tema ? (
        <Musica
          src={staticFile(`musica/${tema.archivo}`)}
          entrada={tema.entrada}
        />
      ) : null}
    </AbsoluteFill>
  );
};
