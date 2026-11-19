"""Ambil matan hadis dari fawazahmed0/hadith-api (jsDelivr) dan jana src/data/hadis_<kitab>_<no>.json.

Guna:
  python3 scripts/ambil_hadis.py bukhari 7320 --groups 5,4,6,6,2 --baca 10,6,11,11,6

Tiada audio bacaan untuk hadis, jadi masa setiap perkataan dijana ikut rentak membaca:
  --groups : bilangan perkataan Arab bagi setiap frasa (mesti jumlah = bilangan perkataan matan)
  --baca   : bilangan perkataan terjemahan setiap frasa (untuk masa membaca)
Matan = teks selepas tanda petik pertama (sanad dibuang). Audio = ambien angin (public/ambien_angin.mp3).
"""
import argparse, json, re, urllib.request

p = argparse.ArgumentParser()
p.add_argument("kitab")
p.add_argument("no", type=int)
p.add_argument("--groups", required=True)
p.add_argument("--baca", required=True)
p.add_argument("--perkataan", type=float, default=0.62, help="saat setiap perkataan Arab")
p.add_argument("--wpm", type=float, default=3.0, help="perkataan terjemahan dibaca sesaat")
args = p.parse_args()

NAMA = {"bukhari": "Sahih al-Bukhari", "muslim": "Sahih Muslim"}
url = f"https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-{args.kitab}/{args.no}.json"
text = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "curl/8"})))["hadiths"][0]["text"]

matan = text[text.index('"') :]
matan = re.sub(r'[‏"،.؛:]', " ", matan)
words = matan.split()
groups = [int(x) for x in args.groups.split(",")]
baca = [int(x) for x in args.baca.split(",")]
assert sum(groups) == len(words), f"jumlah --groups {sum(groups)} != {len(words)} perkataan: {' '.join(words)}"

out_words, t, i = [], 0.3, 0
for n, tw in zip(groups, baca):
    for _ in range(n):
        out_words.append({"ar": words[i], "start": round(t * 1000), "end": round((t + args.perkataan) * 1000)})
        t += args.perkataan
        i += 1
    t += max(0.0, tw / args.wpm - n * args.perkataan) + 0.6  # masa membaca terjemahan
dur = round(t + 0.4, 3)

out = {
    "key": f"{args.kitab}:{args.no}",
    "rujukan": f"{NAMA.get(args.kitab, args.kitab)} · no. {args.no}",
    "audioFile": "ambien_angin.mp3",
    "duration": dur,
    "arFont": "Amiri",
    "teks_penuh": text,
    "words": out_words,
}
fn = f"src/data/hadis_{args.kitab}_{args.no}.json"
json.dump(out, open(fn, "w"), ensure_ascii=False, indent=1)
print(fn, f"{dur:.1f}s")
for k, w in enumerate(out_words, 1):
    print(f"{k:>2} {w['start']/1000:6.2f}  {w['ar']}")
