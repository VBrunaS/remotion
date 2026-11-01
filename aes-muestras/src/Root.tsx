import { type CalculateMetadataFunction, Composition } from "remotion";
import biblioteca from "../datos/musica/biblioteca.json";
import { esquemaMuestra, type PropsMuestra } from "./esquema";
import { Muestra } from "./Muestra";

// Los tres cortes nominales (3 s, 7 s, 11 s) se ajustan al pulso más cercano del tema.
const ajustarCortes: CalculateMetadataFunction<PropsMuestra> = ({ props }) => {
  const fps = 30;
  const tema = biblioteca.temas.find((t) => t.id === props.musica);
  const cortes = [3, 7, 11].map((s) => {
    if (!tema) return s * fps;
    const objetivo = s + tema.entrada;
    const pulso = tema.pulsos.reduce((a, b) =>
      Math.abs(b - objetivo) < Math.abs(a - objetivo) ? b : a,
    );
    return Math.abs(pulso - objetivo) <= 0.4
      ? Math.round((pulso - tema.entrada) * fps)
      : s * fps;
  });
  return { props: { ...props, cortes } };
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Muestra"
      component={Muestra}
      schema={esquemaMuestra}
      calculateMetadata={ajustarCortes}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        nombre: "Wegener Abogados",
        instagram: "@wegenerabogados",
        logo: "logos/_prueba.svg",
        colorFondo: "#f4efe6",
        colorTinta: "#1b2a41",
        colorAcento: "#8a6d3b",
        tipografia: "Playfair Display" as const,
        area: "laboral" as const,
        tono: "sobrio" as const,
        musica: "precision-cut",
        registro: "editorial" as const,
        guion: {
          pregunta: "¿Te despidieron\ncon las cotizaciones\nimpagas?",
          normaTitulo: "Código del Trabajo, artículo 162, inciso 5°",
          normaNumero: "162",
          normaTexto:
            "Si el empleador no hubiere efectuado el integro de dichas cotizaciones previsionales al momento del despido, éste no producirá el efecto de poner término al contrato de trabajo.",
          fuente:
            "Código del Trabajo, art. 162 incs. 5° y 7° (DFL 1 de 2002, Ministerio del Trabajo). Biblioteca del Congreso Nacional, bcn.cl/leychile",
          fechaVerificacion: "",
          consecuencia:
            "El empleador sigue debiendo *las remuneraciones y cotizaciones* hasta que pague y lo comunique por escrito.",
        },
        cortes: [90, 210, 330],
        desenfoque: false,
      }}
    />
  );
};
