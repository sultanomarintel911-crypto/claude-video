# Design notes (from the approved "Kisah MCR" video)

## Look
- Canvas 1080×1920, 30 fps, LEAD 1.5 s intro before the voice, OUTRO 4 s credits.
- Palette: BG `#08080a`, bone `#eee7d8`, accent red `#d0142c`, dim `#8d8679`. Pick one accent that suits the topic (e.g. gold for success stories, teal for science); keep the 3-tone discipline.
- Fonts (fontsource): Bebas Neue (headlines), UnifrakturMaguntia (gothic titles — swap for topic), Special Elite (typewriter labels), Montserrat 800 (subtitles). Install extras with `npm i @fontsource/<name>` and add to the `useFonts` list in Video.tsx.
- Texture: drifting radial "smoke", faint moving vertical lines, grain PNG overlay (changes every 2 frames), vignette. Keeps a text-only video from feeling flat.
- Motion: `pop` (scale 1.5–2.6 → 1 with blur) for reveal words, `rise` for labels, `backOut` easing for stamps/cards, shake + red flash on IMPACTS only (≈1 per beat, not more).

## Layout zones (full-res px)
- Header: y 92–170 (title, tag with blinking dot, chapter bar showing only the current chapter label — showing all labels overlaps when chapters are close).
- Content: y 260–1500.
- Subtitles: top 1585, Montserrat 800 58px, unspoken words dim, current word on red pill.

## Problems found in QA and their fixes
- Element shrinking into a compact header collided with the next element (70,000 / YAHUDI). Fix: fade the big version out and fade in a separate compact one-line version instead of scaling.
- Stamp placed after cards with negative margin ran into subtitles. Fix: absolutely position stamps over the cards' container.
- Icon on a pyramid apex covered the tier label. Fix: scale icon to 0.6 and move label down.
- Rotating ring behind text cut through words. Fix: make the ring much larger than the text block and 50% opacity.
- Bebas width ≈ 0.42 × font-size per character; check long words (e.g. 13 chars at 170px ≈ 930px) fit in 1080 minus margins.
- `Typed` caret blinks forever — fine for short holds; hide if a scene holds long.

## Audio
- Voice: loudnorm I=-15. SFX 0.15–0.45 volume. Final limiter at 0.89.
- Source clips from TikTok/Threads often have background music baked in; it cannot be cleanly removed — mention it.
