import { Audio } from "@remotion/media";
import { HtmlInCanvasMotionBlur } from "@remotion/motion-blur";
import { useEffect, useState } from "react";
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  Sequence,
  staticFile,
  Track,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import biblioteca from "../datos/musica/biblioteca.json";
import guiones from "../datos/guiones.json";
import { Cierre } from "./escenas/Cierre";
import { Consecuencia } from "./escenas/Consecuencia";
import { Cortina } from "./escenas/Cortina";
import { Gancho } from "./escenas/Gancho";
import { Norma } from "./escenas/Norma";
import {
  DURACION_CORTINA,
  ESPERA_CORTINA,
  type PropsMuestra,
  tokensMovimiento,
} from "./esquema";
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
  const { width, height, durationInFrames } = useVideoConfig();
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
  const etiquetaArea = guiones.guiones[p.area].etiqueta;
  const tema = biblioteca.temas.find((t) => t.id === p.musica) ?? null;
  const [c1, c2, c3] = p.cortes;
  const cortinas = [
    {
      nombre: "Cortina 1",
      corte: c1,
      panel: p.colorAcento,
      texto: p.colorFondo,
    },
    {
      nombre: "Cortina 2",
      corte: c2,
      panel: p.colorFondo,
      texto: p.colorTinta,
    },
    {
      nombre: "Cortina 3",
      corte: c3,
      panel: p.colorAcento,
      texto: p.colorFondo,
    },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: p.colorFondo }}>
      <Track name="Escenas">
        <Sequence name="Gancho" durationInFrames={c1}>
          <Gancho
            p={p}
            fam={fuentes.fam}
            mov={mov}
            etiquetaArea={etiquetaArea}
          />
        </Sequence>
        <Sequence name="Norma" from={c1} durationInFrames={c2 - c1}>
          <Norma
            p={p}
            fam={fuentes.fam}
            mov={mov}
            etiquetaArea={etiquetaArea}
          />
        </Sequence>
        <Sequence name="Consecuencia" from={c2} durationInFrames={c3 - c2}>
          <Consecuencia p={p} fam={fuentes.fam} mov={mov} />
        </Sequence>
        <Sequence
          name="Cierre"
          from={c3}
          durationInFrames={durationInFrames - c3}
        >
          <Cierre p={p} fam={fuentes.fam} famFirma={fuentes.firma} mov={mov} />
        </Sequence>
      </Track>
      <Track name="Cortinas">
        {cortinas.map((c) => (
          <Sequence
            key={c.nombre}
            name={c.nombre}
            from={c.corte - ESPERA_CORTINA}
            durationInFrames={DURACION_CORTINA}
          >
            {p.desenfoque ? (
              <HtmlInCanvasMotionBlur
                width={width}
                height={height}
                samples={6}
                shutterAngle={200}
              >
                <Cortina
                  nombre={p.nombre}
                  colorPanel={c.panel}
                  colorTexto={c.texto}
                  fam={fuentes.fam}
                  mov={mov}
                />
              </HtmlInCanvasMotionBlur>
            ) : (
              <Cortina
                nombre={p.nombre}
                colorPanel={c.panel}
                colorTexto={c.texto}
                fam={fuentes.fam}
                mov={mov}
              />
            )}
          </Sequence>
        ))}
      </Track>
      {tema ? (
        <Musica
          src={staticFile(`musica/${tema.archivo}`)}
          entrada={tema.entrada}
        />
      ) : null}
    </AbsoluteFill>
  );
};
