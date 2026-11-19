"""Ambil data satu ayat dari api.quran.com dan tulis src/data/<sss><aaa>.json + public/<audio>.mp3.

Guna:  python3 scripts/ambil_data.py 33:59 [recitation_id]
  recitation_id lalai 7 = Mishary Alafasy (ada masa setiap perkataan).
Output: teks Uthmani dipecah ikut perkataan (tanda waqaf dilekatkan pada perkataan
sebelumnya), masa mula/tamat setiap perkataan (ms), terjemahan Basmeih (id 39),
nama surah, tempoh audio.
"""
import json, subprocess, sys, urllib.request

KEY = sys.argv[1] if len(sys.argv) > 1 else "33:59"
REC = sys.argv[2] if len(sys.argv) > 2 else "7"
UA = {"User-Agent": "curl/8"}  # API menolak User-Agent Python lalai (403)


def get(u):
    return json.load(urllib.request.urlopen(urllib.request.Request("https://api.quran.com/api/v4/" + u, headers=UA)))


surah, ayah = KEY.split(":")
text = get(f"quran/verses/uthmani?verse_key={KEY}")["verses"][0]["text_uthmani"]
seg = get(f"recitations/{REC}/by_ayah/{KEY}?fields=segments")["audio_files"][0]
tr = get(f"quran/translations/39?verse_key={KEY}")["translations"][0]["text"]
nama = get(f"chapters/{surah}")["chapter"]["name_simple"]

words = []
for tok in text.split(" "):
    if len(tok) == 1 and words:  # tanda waqaf (ۚ ۗ ۖ) melekat pada perkataan sebelumnya
        words[-1] += " " + tok
    else:
        words.append(tok)
segs = seg["segments"]
assert len(segs) == len(words), f"bilangan segmen {len(segs)} != perkataan {len(words)}: semak manual"

url = seg["url"] if seg["url"].startswith("http") else "https://verses.quran.com/" + seg["url"]
audio = f"{int(surah):03d}{int(ayah):03d}.mp3"
with urllib.request.urlopen(urllib.request.Request(url, headers=UA)) as r, open(f"public/{audio}", "wb") as f:
    f.write(r.read())
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"public/{audio}"]).decode())

out = {
    "key": KEY,
    "rujukan": f"Surah {nama} · {KEY}",
    "audioFile": audio,
    "duration": round(dur, 3),
    "terjemahan_penuh": tr,
    "words": [{"ar": w, "start": s[2], "end": s[3]} for w, s in zip(words, segs)],
}
json.dump(out, open(f"src/data/{int(surah):03d}{int(ayah):03d}.json", "w"), ensure_ascii=False, indent=1)
print(out["rujukan"], "| audio", audio, f"{dur:.2f}s")
print("Terjemahan:", tr)
for i, w in enumerate(out["words"], 1):
    print(f"{i:>2} {w['start']/1000:6.2f}–{w['end']/1000:6.2f}  {w['ar']}")
