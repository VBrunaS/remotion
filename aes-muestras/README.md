# Muestras ǣs

Plantilla de Remotion para producir en lote videos de muestra (15 s, vertical 1080 × 1920, 30 cuadros por segundo) con la marca de un estudio jurídico distinto en cada uno. La muestra es privada y nunca se publica.

## Qué hay en cada carpeta

- `src/` la plantilla. `Root.tsx` registra la composición `Muestra` con su esquema editable en Remotion Studio. `Muestra.tsx` carga la tipografía y la música. `Pelicula.tsx` es la película completa en un solo componente, siete tramos donde cada valor es una función del tiempo. `motor.ts` tiene los resortes en forma cerrada, la geometría, el ajuste al pulso y la envoltura de texto. `esquema.ts` define las propiedades y los tokens de movimiento por registro y tono. `fuentes.ts` carga la tipografía elegida desde Google Fonts.
- `datos/prospectos.json` la lista completa de prospectos (convertida desde la planilla).
- `datos/estudios/<slug>.json` la ficha de cada estudio. Nombre exacto, Instagram, web, área, logo, colores, tipografía, tono con su fundamento, registro, tema musical y estado (`pendiente`, `listo`, `excluido`).
- `datos/guiones.json` los cuatro guiones jurídicos (familia, laboral, civil e inmobiliario, empresas) con la norma literal, la fuente y la fecha de verificación en BCN. Si la fecha está vacía, el lote se niega a renderizar.
- `datos/musica/biblioteca.json` la biblioteca musical con los pulsos ya analizados, el tono de cada tema y su licencia.
- `datos/lotes/<fecha>.txt` la lista de estudios del día, un slug por línea.
- `public/logos/` los logos originales descargados, nunca redibujados. `public/musica/` los temas en MP3.
- `scripts/pulsos.py` analiza los pulsos de un tema una sola vez. `scripts/lote.mjs` renderiza el lote del día. `scripts/hoja.py` arma la hoja de contactos.

## Cómo se produce un video

1. La ficha del estudio aporta nombre, logo, colores, tipografía, área, tono y registro.
2. El guion se toma de `datos/guiones.json` según el área.
3. El tema se elige por el tono de la ficha (o por el campo `musica` si está fijado). `scripts/pulsos.py` guarda de cada tema sus pulsos, sus acentos (los golpes que el oído nota) y su curva de energía. Al armar cada video, `elegirEntrada` prueba cada pulso del tema como punto de partida y se queda con el que pone acentos sobre los siete cortes de escena y la energía subiendo hacia el logo (`entradaMusica` en las propiedades; -1 es automático). Después, cada corte se mueve al acento fuerte más cercano y cada evento menor al pulso más cercano.
4. Tramos de la película (15 s, un corte por pulso). El nombre enorme se aprieta hasta una astilla que se vuelve la regla del encabezado. La pregunta llega palabra a palabra y la última se subraya a pincel. En un cuadro invertido una palabra se tacha y se transforma en otra (`antes` y `despues` del guion). El número del artículo rueda como un odómetro y la cita se apila línea a línea atenuando la anterior. Una línea de tiempo recorre el plazo (`linea` del guion). La consecuencia llega palabra a palabra y la frase clave se subraya en el color del estudio. La regla inunda la pantalla, se contrae en la caja del logo y se pliega para descubrirlo. Cierra con el Instagram y la firma «Muestra preparada por ǣs».
5. Desenfoque de movimiento. El lote renderiza con `--subcuadros 2` (60 cuadros por segundo) y los promedia de a dos con ffmpeg para volver a 30, lo que da un desenfoque real en los movimientos rápidos. En Studio se previsualiza con 1 subcuadro.

## Comandos

```bash
# Vista previa interactiva (Remotion Studio)
npm run dev

# Un video de prueba con las propiedades por defecto
npx remotion render Muestra out/prueba.mp4

# Analizar los pulsos de un tema nuevo (una vez)
python3 scripts/pulsos.py public/musica/tema.mp3 --id tema --titulo "Título" --tono sobrio --fuente "..." --licencia "..."

# El lote de hoy (lee datos/lotes/<fecha de hoy>.txt)
node scripts/lote.mjs

# Un lote concreto
node scripts/lote.mjs --fecha 2026-11-03 --lista datos/lotes/2026-11-03.txt
node scripts/lote.mjs --estudios wegener-abogados,enroque-abogados --sin-verificar --subcuadros 2
```

La salida queda en `out/<fecha>/` con un MP4 por estudio, `hoja-contactos.png`, `manifiesto.json` y `muestras-<fecha>.zip` con todo junto. Claude envía ese zip en la conversación y el usuario lo arrastra a la carpeta «Muestras ǣs» de su Drive, en una subcarpeta con la fecha.

## Rutina diaria («haz el lote de hoy»)

1. Agregar las fichas nuevas en `datos/estudios/` (Instagram, web, logo descargado a `public/logos/`, colores, tono con fundamento, registro).
2. Verificar en BCN las normas de `datos/guiones.json` y poner la fecha del día en `fechaVerificacion`.
3. Escribir `datos/lotes/<fecha>.txt` con los slugs del día.
4. `node scripts/lote.mjs`.
5. Revisar `hoja-contactos.png`, recibir el zip y arrastrarlo a Drive (carpeta «Muestras ǣs», subcarpeta con la fecha).

## Notas del entorno

- En la nube de Claude el navegador de Remotion no se puede descargar, por eso `remotion.config.ts` apunta al Chrome instalado en `/opt/pw-browsers/chromium`. En otro computador, borrar esas dos líneas o cambiar la ruta (variable `REMOTION_BROWSER` para el lote).
- `datos/musica/catalogo-elevenlabs.json` guarda todos los temas pregenerados leídos de las páginas de ElevenLabs (título, etiquetas, URL) para elegir nuevos sin volver a navegar. `scripts/pulsos.py` los incorpora a la biblioteca.
