"""Ambil teks Uthmani + masa setiap perkataan (Alafasy) dari api.quran.com, tulis src/ayat.json."""
import json, sys, urllib.request
KEY = sys.argv[1] if len(sys.argv) > 1 else "33:59"
def get(u):
    req = urllib.request.Request("https://api.quran.com/api/v4/" + u, headers={"User-Agent": "curl/8"})
    return json.load(urllib.request.urlopen(req))
text = get(f"quran/verses/uthmani?verse_key={KEY}")["verses"][0]["text_uthmani"]
seg = get(f"recitations/7/by_ayah/{KEY}?fields=segments")["audio_files"][0]
tr = get(f"quran/translations/39?verse_key={KEY}")["translations"][0]["text"]
words = []
for tok in text.split(" "):
    if len(tok) == 1 and words:  # tanda waqaf (ۚ ۗ) melekat pada perkataan sebelumnya
        words[-1] += " " + tok
    else:
        words.append(tok)
segs = seg["segments"]
assert len(segs) == len(words), (len(segs), len(words))
out = {"key": KEY, "audio": seg["url"], "terjemahan_penuh": tr,
       "words": [{"ar": w, "start": s[2], "end": s[3]} for w, s in zip(words, segs)]}
json.dump(out, open("src/ayat.json", "w"), ensure_ascii=False, indent=1)
for i, w in enumerate(out["words"], 1): print(i, w["ar"], w["start"], w["end"])
