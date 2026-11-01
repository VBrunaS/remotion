import { loadFont as archivo } from "@remotion/google-fonts/Archivo";
import { loadFont as archivoBlack } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as cormorant } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as fraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as instrument } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as inter } from "@remotion/google-fonts/Inter";
import { loadFont as libre } from "@remotion/google-fonts/LibreBaskerville";
import { loadFont as manrope } from "@remotion/google-fonts/Manrope";
import { loadFont as newsreader } from "@remotion/google-fonts/Newsreader";
import { loadFont as oswald } from "@remotion/google-fonts/Oswald";
import { loadFont as playfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as spaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as syne } from "@remotion/google-fonts/Syne";
import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";
import type { TIPOGRAFIAS } from "./esquema";

type Cargada = { fontFamily: string; waitUntilDone: () => Promise<unknown> };
type Cargador = () => Cargada;

const subsets = () => ({
  subsets: ["latin", "latin-ext"] as ["latin", "latin-ext"],
});

// Cada familia se carga solo cuando un estudio la usa.
export const cargadores: Record<(typeof TIPOGRAFIAS)[number], Cargador> = {
  "Playfair Display": () => playfair("normal", subsets()),
  "Cormorant Garamond": () => cormorant("normal", subsets()),
  "Libre Baskerville": () => libre("normal", subsets()),
  Fraunces: () => fraunces("normal", subsets()),
  "Instrument Serif": () => instrument("normal", subsets()),
  Newsreader: () => newsreader("normal", subsets()),
  Archivo: () => archivo("normal", subsets()),
  "Archivo Black": () => archivoBlack("normal", subsets()),
  Inter: () => inter("normal", subsets()),
  "Space Grotesk": () => spaceGrotesk("normal", subsets()),
  Manrope: () => manrope("normal", subsets()),
  Syne: () => syne("normal", subsets()),
  Oswald: () => oswald("normal", subsets()),
};

// Inter siempre se carga para la firma «ǣs», que necesita el glifo ǣ.
export const cargarInter = () => inter("normal", subsets());

// Espera un grupo de fuentes (hoja de estilos y pesos) antes de medir y dibujar texto.
export const useFuentes = (
  cargar: () => Cargada[],
  pesos: number[] = [400, 700],
) => {
  const [familias, setFamilias] = useState<string[] | null>(null);
  useEffect(() => {
    const h = delayRender("Cargando tipografías");
    const cargadas = cargar();
    Promise.all(cargadas.map((c) => c.waitUntilDone()))
      .then(() =>
        Promise.all(
          cargadas.flatMap((c) =>
            pesos.map((peso) =>
              document.fonts.load(`${peso} 100px "${c.fontFamily}"`),
            ),
          ),
        ),
      )
      .then(() => {
        setFamilias(cargadas.map((c) => c.fontFamily));
        continueRender(h);
      })
      .catch((err) => cancelRender(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return familias;
};
