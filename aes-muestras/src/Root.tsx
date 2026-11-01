import { type CalculateMetadataFunction, Composition } from "remotion";
import biblioteca from "../datos/musica/biblioteca.json";
import { esquemaMuestra, type PropsMuestra } from "./esquema";
import { CORTES_PELICULA, elegirEntrada, type Tema } from "./motor";
import { Contador } from "./conceptos/Contador";
import { Conversacion } from "./conceptos/Conversacion";
import { Expediente } from "./conceptos/Expediente";
import { Muestra } from "./Muestra";

// Los subcuadros multiplican la tasa de cuadros; el lote los mezcla después en 30 cuadros por segundo.
const porSubcuadros: CalculateMetadataFunction<PropsMuestra> = ({ props }) => {
  const tema =
    (biblioteca.temas as Tema[]).find((t) => t.id === props.musica) ?? null;
  const entradaMusica =
    props.entradaMusica >= 0 || !tema
      ? props.entradaMusica
      : elegirEntrada(tema, CORTES_PELICULA, 15);
  return {
    fps: 30 * props.subcuadros,
    durationInFrames: 450 * props.subcuadros,
    props: { ...props, entradaMusica },
  };
};

// Los tres conceptos comparten las mismas propiedades (se duplican para que Studio las edite por separado).
const propsConcepto: PropsMuestra = {
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
  musica: "revelation-of-light",
  entradaMusica: -1,
  registro: "editorial" as const,
  guion: {
    pregunta: "¿Te despidieron\ncon las cotizaciones\nimpagas?",
    normaTitulo: "Código del Trabajo, artículo 162, inciso 5°",
    normaNumero: "162",
    normaCita:
      "éste no producirá el efecto de poner término al contrato de trabajo",
    normaTexto:
      "Si el empleador no hubiere efectuado el integro de dichas cotizaciones previsionales al momento del despido, éste no producirá el efecto de poner término al contrato de trabajo.",
    fuente:
      "Código del Trabajo, art. 162 incs. 5° y 7° (DFL 1 de 2002, Ministerio del Trabajo). Biblioteca del Congreso Nacional, bcn.cl/leychile",
    fechaVerificacion: "domingo 1 de noviembre de 2026",
    consecuencia:
      "Sigue debiendo *remuneraciones y cotizaciones* hasta que pague.",
    oferta: "Revisamos tu finiquito antes de firmar.",
    antes: "Despido",
    despues: "Despido nulo",
    linea: {
      de: "Despido",
      a: "Cotizaciones al día",
      frase: "Sin pago, no hay despido.",
    },
    chat: [
      {
        de: "cliente",
        texto:
          "Me despidieron y resulta que no me habían pagado las cotizaciones.",
      },
      {
        de: "estudio",
        texto:
          "Entonces ese despido no produce efecto. Código del Trabajo, art. 162.",
        documento: true,
      },
      { de: "cliente", texto: "¿Y me tienen que seguir pagando?" },
      {
        de: "estudio",
        texto:
          "Sí. Remuneraciones y cotizaciones hasta que paguen y te lo comuniquen por escrito.",
      },
      {
        de: "estudio",
        texto: "Revisamos tu finiquito antes de firmar. ¿Agendamos?",
        boton: true,
      },
    ],
    cifras: [
      { valor: "162", etiqueta: "artículo del Código del Trabajo" },
      {
        valor: "0",
        etiqueta: "efecto de un despido con cotizaciones impagas",
      },
      {
        valor: "3",
        etiqueta: "días hábiles para avisar el despido por escrito",
      },
    ],
  },
  subcuadros: 1,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
          musica: "revelation-of-light",
          entradaMusica: -1,
          registro: "editorial" as const,
          guion: {
            pregunta: "¿Te despidieron\ncon las cotizaciones\nimpagas?",
            normaTitulo: "Código del Trabajo, artículo 162, inciso 5°",
            normaNumero: "162",
            normaCita:
              "éste no producirá el efecto de poner término al contrato de trabajo",
            normaTexto:
              "Si el empleador no hubiere efectuado el integro de dichas cotizaciones previsionales al momento del despido, éste no producirá el efecto de poner término al contrato de trabajo.",
            fuente:
              "Código del Trabajo, art. 162 incs. 5° y 7° (DFL 1 de 2002, Ministerio del Trabajo). Biblioteca del Congreso Nacional, bcn.cl/leychile",
            fechaVerificacion: "domingo 1 de noviembre de 2026",
            consecuencia:
              "Sigue debiendo *remuneraciones y cotizaciones* hasta que pague.",
            oferta: "Revisamos tu finiquito antes de firmar.",
            antes: "Despido",
            despues: "Despido nulo",
            linea: {
              de: "Despido",
              a: "Cotizaciones al día",
              frase: "Sin pago, no hay despido.",
            },
            chat: [
              {
                de: "cliente",
                texto:
                  "Me despidieron y resulta que no me habían pagado las cotizaciones.",
              },
              {
                de: "estudio",
                texto:
                  "Entonces ese despido no produce efecto. Código del Trabajo, art. 162.",
                documento: true,
              },
              { de: "cliente", texto: "¿Y me tienen que seguir pagando?" },
              {
                de: "estudio",
                texto:
                  "Sí. Remuneraciones y cotizaciones hasta que paguen y te lo comuniquen por escrito.",
              },
              {
                de: "estudio",
                texto: "Revisamos tu finiquito antes de firmar. ¿Agendamos?",
                boton: true,
              },
            ],
            cifras: [
              { valor: "162", etiqueta: "artículo del Código del Trabajo" },
              {
                valor: "0",
                etiqueta: "efecto de un despido con cotizaciones impagas",
              },
              {
                valor: "3",
                etiqueta: "días hábiles para avisar el despido por escrito",
              },
            ],
          },
          subcuadros: 1,
        }}
      />
      <Composition
        id="Expediente"
        component={Expediente}
        schema={esquemaMuestra}
        calculateMetadata={porSubcuadros}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={propsConcepto}
      />
      <Composition
        id="Contador"
        component={Contador}
        schema={esquemaMuestra}
        calculateMetadata={porSubcuadros}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={propsConcepto}
      />
      <Composition
        id="Conversacion"
        component={Conversacion}
        schema={esquemaMuestra}
        calculateMetadata={porSubcuadros}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={propsConcepto}
      />
    </>
  );
};
