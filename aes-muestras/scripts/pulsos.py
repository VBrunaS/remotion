#!/usr/bin/env python3
"""Analiza los pulsos de un tema una sola vez y lo registra en datos/musica/biblioteca.json.

Uso:
  python3 scripts/pulsos.py public/musica/tema.mp3 --id tema --titulo "Nombre" --tono sobrio \
      --fuente "ElevenLabs ..." --licencia "..."

Guarda bpm, pulsos (segundos), tiempos fuertes (uno cada cuatro pulsos) y la entrada
(segundo en que el tema alcanza su energía plena) para que la plantilla corte en el pulso.
"""
import argparse, json, os, sys
import numpy as np
import librosa

ap = argparse.ArgumentParser()
ap.add_argument("archivo")
ap.add_argument("--id", required=True)
ap.add_argument("--titulo", required=True)
ap.add_argument("--tono", required=True, choices=["sobrio", "moderno", "cercano", "energico"])
ap.add_argument("--fuente", default="")
ap.add_argument("--licencia", default="")
ap.add_argument("--entrada", type=float, default=None, help="forzar el segundo de entrada")
ap.add_argument("--biblioteca", default=os.path.join(os.path.dirname(__file__), "..", "datos", "musica", "biblioteca.json"))
a = ap.parse_args()

y, sr = librosa.load(a.archivo, sr=22050, mono=True)
dur = float(len(y) / sr)
onset = librosa.onset.onset_strength(y=y, sr=sr)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, onset_envelope=onset, units="time", trim=False)
tempo = float(np.atleast_1d(tempo)[0])
beats = [round(float(b), 3) for b in beats]

# tiempo fuerte: de las cuatro fases posibles, la que suma más energía de ataque
frames = librosa.time_to_frames(beats, sr=sr)
mejor, mejor_e = 0, -1
for fase in range(4):
    e = float(np.sum(onset[np.clip(frames[fase::4], 0, len(onset) - 1)]))
    if e > mejor_e:
        mejor, mejor_e = fase, e
fuertes = beats[mejor::4]

# entrada: primer instante en que la energía (RMS suavizada) supera el 60 % de su máximo
rms = librosa.feature.rms(y=y)[0]
rms_s = np.convolve(rms, np.ones(8) / 8, mode="same")
idx = int(np.argmax(rms_s > 0.6 * rms_s.max()))
entrada = a.entrada if a.entrada is not None else round(float(librosa.frames_to_time(idx, sr=sr)), 3)
# ajustar la entrada al tiempo fuerte más cercano
if fuertes:
    entrada = min(fuertes, key=lambda t: abs(t - entrada))

entrada_item = {
    "id": a.id,
    "titulo": a.titulo,
    "archivo": os.path.basename(a.archivo),
    "tono": a.tono,
    "fuente": a.fuente,
    "licencia": a.licencia,
    "duracion": round(dur, 3),
    "bpm": round(tempo, 2),
    "entrada": entrada,
    "pulsos": beats,
    "fuertes": [round(t, 3) for t in fuertes],
}

os.makedirs(os.path.dirname(a.biblioteca), exist_ok=True)
bib = {"temas": []}
if os.path.exists(a.biblioteca):
    bib = json.load(open(a.biblioteca))
bib["temas"] = [t for t in bib["temas"] if t["id"] != a.id] + [entrada_item]
bib["temas"].sort(key=lambda t: t["id"])
json.dump(bib, open(a.biblioteca, "w"), ensure_ascii=False, indent=1)
print(f"{a.id}: {tempo:.1f} bpm, {len(beats)} pulsos, entrada {entrada}s, duración {dur:.1f}s")
