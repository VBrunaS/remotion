#!/usr/bin/env python3
"""Hoja de contactos del lote. Un cuadro por video (el revelado del logo) con el nombre del estudio.

Uso: python3 scripts/hoja.py out/<fecha>/manifiesto.json
"""
import json, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

manifiesto = json.load(open(sys.argv[1]))
carpeta = os.path.dirname(os.path.abspath(sys.argv[1]))
videos = manifiesto["videos"]
if not videos:
    sys.exit(0)

ANCHO, ALTO, ETIQUETA = 270, 480, 46
COLUMNAS = 6
filas = (len(videos) + COLUMNAS - 1) // COLUMNAS
hoja = Image.new("RGB", (COLUMNAS * ANCHO, filas * (ALTO + ETIQUETA)), "#111111")
dibujo = ImageDraw.Draw(hoja)
try:
    fuente = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
except OSError:
    fuente = ImageFont.load_default()

with tempfile.TemporaryDirectory() as tmp:
    for i, v in enumerate(videos):
        cuadro = os.path.join(tmp, f"{i}.png")
        # cuadro a los 13,5 s, con el logo ya revelado
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-ss", "13.5", "-i", v["archivo"], "-frames:v", "1",
             "-vf", f"scale={ANCHO}:{ALTO}", cuadro],
            check=True,
        )
        img = Image.open(cuadro)
        x, y = (i % COLUMNAS) * ANCHO, (i // COLUMNAS) * (ALTO + ETIQUETA)
        hoja.paste(img, (x, y))
        dibujo.text((x + 8, y + ALTO + 12), v["nombre"][:30], fill="#f2f2f2", font=fuente)

destino = os.path.join(carpeta, "hoja-contactos.png")
hoja.save(destino)
print(f"Hoja de contactos: {destino} ({len(videos)} videos)")
