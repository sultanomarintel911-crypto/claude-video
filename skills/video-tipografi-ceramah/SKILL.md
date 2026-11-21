---
name: video-tipografi-ceramah
description: Turn a clip of speech (ceramah, kuliah, talk, podcast, lecture, interview, TikTok/Threads/Reels video) into a text-only kinetic-typography infographic video — animated headlines, icons, maps, diagrams, counters and word-by-word karaoke subtitles over the original voice, no speaker footage — using Whisper word timestamps + Remotion (1080×1920 vertical). Use this whenever the user uploads/links a video or audio of someone talking and asks for a "video tulisan je", "video teks", "infografik dari ceramah", "kinetic typography", "lyric/quote video", "subtitle animasi", "buat video macam motion graphic", or wants a section of a talk ("start dekat part X sampai habis cerita X") turned into an engaging text video, even if they don't say Remotion or infographic.
---

# Video Tipografi dari Ceramah

Converts a talk into a vertical motion-graphics video where **only text and graphics are on screen** and the original speech is the soundtrack. Every visual beat is locked to the speaker's word timestamps, so the text "speaks" with the voice.

Reply to the user in their language (often Malay). Keep on-screen text in the language of the talk.

## Bundled files

- `scripts/transcribe.py` — faster-whisper with word timestamps → JSON (handles the PyAV bug by decoding via ffmpeg).
- `scripts/words.py` — print `word@time` for a time range (to fill the transcript table).
- `scripts/prep.py` — cut + loudnorm the voice segment, make film-grain tiles, generate SFX into `public/`.
- `scripts/sfx.py` — synthesizes ~34 cinematic SFX (impacts, whoosh, riser, taiko, drumroll, blip, typing, stinger, sub_drop, braam, kilauan, kamera, warp, koir, dengung…). Needs numpy + scipy.
- `scripts/stills.sh`, `scripts/contact_sheet.py` — render half-size stills and tile them for visual QA.
- `assets/template/` — a working Remotion project (the "Kisah MCR / Black Parade" video the user approved). Read `references/design.md` before changing the look.
  - `src/data.ts` — timing constants, transcript `RAW`, `CHAPTERS`, `IMPACTS`, `SFX`, header text. **Rewrite per video.**
  - `src/ui.tsx` — reusable system: Background (red smoke, grain, vignette), Header with chapter progress bar, karaoke `Subtitles`, `Win` (scene window with fade), `Typed`, `useP` progress hook, `pop`/`rise` presets, screen shake + flash. Usually keep as is.
  - `src/scenes.tsx` — **example** scenes (acronym expansion, vinyl title, checklist cards + stamp, glitch headline + 0→70,000 counter, d3-geo map with pin, eye, pyramid hierarchy, marching procession, dossier fact card, rotating loop, credits). Replace with scenes for the new content; reuse patterns freely.
  - `src/Video.tsx` — composes scenes, loads fonts (delayRender), places voice + SFX audio.

## Workflow

### 1. Set up and transcribe
```bash
pip install -q faster-whisper scipy pillow numpy
mkdir -p <repo>/bahan/<nama> && cp "<upload>" <repo>/bahan/<nama>/sumber.mp4     # keep raw inputs out of git
python3 -I <skill>/scripts/transcribe.py <repo>/bahan/<nama>/sumber.mp4 <repo>/bahan/<nama>/tx.json --model medium --lang ms
```
Also grab 4–6 frames (`ffmpeg -ss T -frames:v 1`) and look at them: on-screen captions often name the topic, speaker and song/book title, which tells you correct spellings Whisper will miss.

### 2. Pick the segment
If the user names a part ("start dekat part MCR sampai habis cerita MCR"), find the first sentence that introduces it and the sentence that closes that story — stop before the speaker pivots to a new topic, and mention in the final reply where the next topic begins in case they want it extended. Start ~0.3 s before the first word; end just after the last word, before the next word starts.

### 3. Write `data.ts`
Copy the template: `cp -r <skill>/assets/template <repo>/<project> && cd <repo>/<project> && npm install`.
Then `python3 <skill>/scripts/words.py tx.json START END` and build `RAW` as `['word', absTime]`, prefixing `|` where a new subtitle line should start (break at phrase boundaries, ≤ ~7 words). **Correct Whisper's mistakes** — names, titles, religious/technical terms, slang — using context and the on-screen captions; keep the speaker's words otherwise. Tell the user which corrections you made.
Set `CLIP_START/CLIP_END`, `HEADER_TITLE/TAG`, 4–7 `CHAPTERS`, `IMPACTS` on the big reveal words, and an `SFX` list (volumes 0.15–0.45 — voice must stay dominant).

### 4. Design scenes (`scenes.tsx`)
Storyboard first: list the speaker's beats with times and decide one visual idea per beat. Turn ideas into **infographic devices**, not just big words:
- named thing → acronym expansion / title card with an icon
- number → counter rolling up, with unit word popping after
- place → d3-geo map (world-atlas) with pulsing pin and label
- list of groups → pyramid / stacked tiers / cards revealed as each is said
- process or comparison → two cards with ✓, arrows, timeline
- emphasis word ("TAPI…", "PERHATIKAN") → huge single word with stinger + shake, then shrink to a header
- summary → dossier/checklist card where each row ticks on its word
- closing idea → simple symbolic icon (loop, eye, flag) + credits (speaker name, source)

Time every element with `P(absTime)` from `useP()` so it appears **on the word**. Scenes live in `<Win a b>` windows; keep the content zone between y≈260 and y≈1500 (header above, subtitles at y≈1585). Small factual context chips (year, origin) are fine but tell the user you added them.

### 5. Prep audio/SFX, check stills, render
```bash
python3 <skill>/scripts/prep.py <sumber.mp4> <project> START END
npx tsc --noEmit -p .
npx remotion bundle src/index.ts --out-dir=out/bundle --log=error
bash <skill>/scripts/stills.sh <project> <frames...>     # one frame mid-way through each beat
python3 <skill>/scripts/contact_sheet.py out/stills sheet.jpg <frames...>   # then view sheet.jpg
```
Frame = `round((abs - CLIP_START + LEAD) * 30)`. **Look at every sheet** and fix overlaps before the full render — typical problems are listed in `references/design.md`. Re-bundle after edits (`rm -rf out/bundle`).

Full render (~3 min per minute of video on 4 cores):
```bash
npx remotion render src/index.ts VideoTipografi out/_mentah.mp4 --crf=18 --concurrency=4 --log=error
ffmpeg -y -loglevel error -i out/_mentah.mp4 -c:v copy -af "alimiter=limit=0.89:attack=3:release=80:level=disabled,aresample=48000" -c:a aac -b:a 192k -movflags +faststart out/<Nama>.mp4
```
`remotion.config.ts` points at the preinstalled headless Chromium (`/opt/pw-browsers/...`); adjust the path if it differs (`ls /opt/pw-browsers`).

### Options the user may ask for

**Speaker in a round corner frame** ("masukkan penyampai dalam frame bulat"): find the real video band first (screen recordings have UI bars — check a full-res frame for the rows where the picture is), then
`python3 -I <skill>/scripts/penyampai_bulat.py sumber.mp4 public/video/penyampai.mp4 START END --band Y0 Y1` → face-tracked, smoothed square clip. Render it with the `Speaker` component from `assets/contoh-kuliah/ui.tsx` (OffthreadVideo, borderRadius 50%, gold ring, "PENYAMPAI" pill; top-right, d≈300) and keep scene titles to its left (`SceneTitle`). Check stills that the face is inside the circle.

**Clearer voice** ("suara upgrade"): `bash <skill>/scripts/suara_jelas.sh sumber.mp4 public/audio/suara.wav START END` (RNNoise + FFT denoise, de-mud, presence boost, compressor, loudnorm). Sanity-check by re-transcribing a slice of both versions with Whisper — the enhanced one must not score worse.

**Hadith / ayat / Arabic quotes** ("hadis dan maksud jelas"): Whisper `--lang ms` skips Arabic recitation — re-run that time range with `--lang ar` (and Malay ranges separately, `condition_on_previous_text=False`) to get word times. Display Arabic **with harakat** in Amiri (`@fontsource/amiri`), word-by-word highlighted as recited (`ArabKaraoke`, RTL), then the Malay *maksud* in the same card under a "MAKSUDNYA" divider, revealed as the speaker translates; show the narrator chain as a small diagram and the source (e.g. Riwayat at-Tirmizi). Hide the bottom subtitles while the hadith card is up so viewers read one thing. Use the canonical Arabic text of the hadith, but follow what the speaker actually read for gradings/wording and tell the user if anything is uncertain. `assets/contoh-kuliah/` is a full worked example (calm emerald/gold theme, large Montserrat text, icon cards, checklists, conditions, rumusan).

**"Mudah dibaca semua golongan"**: sentence-case Montserrat 800, subtitles ≥ 60px on a dark pill, body text ≥ 44px, high contrast cream-on-dark, calm motion (no shake/glitch), one idea per screen.

### 6. Deliver
Copy the mp4 to the working directory, send it to the user (SendUserFile, display render), commit source (node_modules/public/out are gitignored) and push to the session branch. In the reply: segment chosen (timestamps + first/last sentence), scene list, spelling corrections, anything added that the speaker didn't say, and any limitation (e.g. original background music can't be removed).
