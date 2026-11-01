import { type CalculateMetadataFunction, Composition } from "remotion";
import { esquemaMuestra, type PropsMuestra } from "./esquema";
import { Muestra } from "./Muestra";

// Los subcuadros multiplican la tasa de cuadros; el lote los mezcla después en 30 cuadros por segundo.
const porSubcuadros: CalculateMetadataFunction<PropsMuestra> = ({ props }) => ({
  fps: 30 * props.subcuadros,
  durationInFrames: 450 * props.subcuadros,
});

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Muestra"
      component={Muestra}
      schema={esquemaMuestra}
      calculateMetadata={porSubcuadros}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        nombre: "Wegener Abogados",
        instagram: "@wegenerabogados",
        logo: "logos/_prueba.svg",
        logoSobreTinta: false,
        colorFondo: "#f4efe6",
        colorTinta: "#1b2a41",
        colorAcento: "#8a6d3b",
        tipografia: "Playfair Display" as const,
        area: "laboral" as const,
        tono: "sobrio" as const,
        musica: "quiet-reflections",
        registro: "editorial" as const,
        guion: {
          pregunta: "¿Te despidieron\ncon las cotizaciones\nimpagas?",
          normaTitulo: "Código del Trabajo, artículo 162, inciso 5°",
          normaNumero: "162",
          normaTexto:
            "Si el empleador no hubiere efectuado el integro de dichas cotizaciones previsionales al momento del despido, éste no producirá el efecto de poner término al contrato de trabajo.",
          fuente:
            "Código del Trabajo, art. 162 incs. 5° y 7° (DFL 1 de 2002, Ministerio del Trabajo). Biblioteca del Congreso Nacional, bcn.cl/leychile",
          fechaVerificacion: "domingo 1 de noviembre de 2026",
          consecuencia:
            "El empleador sigue debiendo *las remuneraciones y cotizaciones* hasta que pague y lo comunique por escrito.",
          antes: "Despido",
          despues: "Despido nulo",
          linea: {
            de: "Despido",
            a: "Cotizaciones al día",
            frase: "Sin pago, no hay despido.",
          },
        },
        subcuadros: 1,
      }}
    />
  );
};
