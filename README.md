# Saranta Soundworks

**Free browser-based audio mastering tools for heavy music.** No install, no DAW — open the page, load your file, and process.

Built from scratch with the Web Audio API by [Burak Balta](https://github.com/sarantasoundworks).

> Live at [sarantasoundworks.com](https://sarantasoundworks.com)

---

## Tools

### Mastering Suite (`tools.html`)

A full mastering-grade signal chain that runs entirely in the browser. Drag-and-drop reorderable module rack with per-module bypass toggles.

| Module | Description |
|---|---|
| **Parametric EQ Studio** | 8-band parametric EQ with dynamic EQ, Auto EQ (genre-matched ISO 266 LTAS curves), FFT analyzer, solo/bypass per band, oversampling |
| **Tape Saturator** | Analog tape emulation with drive, bias, mix, tape speed modes, input/output metering and clip detection |
| **Compressor** | Full dynamics processor with threshold, ratio, attack, release, knee, makeup gain |
| **Stereo Imager** | M/S-based stereo width control |
| **LUFS Meter** | ITU-R BS.1770-4 compliant integrated loudness metering |

### MasterMind (`mastermind.html`)

One-click automated mastering pipeline. Upload any audio file and get a -14 LUFS broadcast-standard master in seconds.

**Signal chain:** Auto-Gain → Saturation → HPF → Mastering EQ → 3-Band Multiband Comp → Manley Massive Passive EQ → SSL 4000G Bus Comp → Stereo Width → LUFS Normalization → True Peak Limiter

Includes A/B monitoring with original/mastered toggle and a 3-band fine-tune EQ for final adjustments.

### BeatMaster (`beatmaster.html`)

Browser-based step sequencer and rhythm game.

- **Sequencer:** 16-step grid with 4 channels (kick, snare, hi-hat, perc), up to 4 bars, adjustable BPM (60–200), preset grooves, MIDI export
- **Game mode:** Notes fall in lanes — hit them in time. Combos, multipliers, HP system, BPM escalation, and particle effects
- **Wild Mode:** Procedurally generated patterns that regenerate every loop
- **Global Leaderboard:** Firebase-powered score tracking

### Mixing Tips (`tips.html`)

A structured mixing guide based on the Saranta Method — covering drums, bass, guitars, vocals, synths, orchestral, post FX, and mastering for heavy music.

---

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS — zero frameworks, zero build step
- **Audio Engine:** Web Audio API + custom DSP (biquad filters, compressors, LUFS measurement, tape saturation)
- **Fonts:** [Space Mono](https://fonts.google.com/specimen/Space+Mono) + [Syne](https://fonts.google.com/specimen/Syne)
- **Hosting:** Cloudflare Pages
- **Backend:** Cloudflare Functions (contact form, Firebase config proxy)
- **Database:** Firebase Firestore (BeatMaster leaderboard)
- **WASM (experimental):** `multiband-processor.cpp` — C++ multiband compressor compiled to WASM via Emscripten

---

## Project Structure

```
├── index.html              Landing page
├── tools.html              Mastering Suite
├── mastermind.html         Auto mastering
├── beatmaster.html         Step sequencer & rhythm game
├── tips.html               Mixing guide
├── privacy.html            Privacy policy
├── autoEQ.js               Auto EQ matching algorithm (ISO 266 LTAS)
├── genreReferenceCurves.json  Genre-specific EQ reference curves
├── multiband-processor.cpp    C++ multiband comp (WASM target)
├── multiband-worklet.js       AudioWorklet processor
├── server.js               Local dev server
├── run.bat                 Windows quick-start
├── functions/
│   └── api/
│       ├── submit.js       Contact form handler
│       └── firebase-config.js  Firebase config proxy
├── wrangler.jsonc          Cloudflare Pages config
├── _headers                Cloudflare security headers
├── robots.txt
├── sitemap.xml
└── design.json             Brand identity & UI specs
```

---

## Local Development

```bash
# Option 1: Node server
node server.js

# Option 2: Python
python -m http.server 8000

# Option 3: Windows shortcut
run.bat
```

Then open `http://localhost:8000` (or the port shown).

---

## Deployment

Deployed via [Cloudflare Pages](https://pages.cloudflare.com/) using [Wrangler](https://developers.cloudflare.com/workers/wrangler/):

```bash
npx wrangler pages deploy .
```

The `functions/` directory is automatically picked up by Cloudflare Functions.

---

## Features at a Glance

- **No install required** — runs in any modern browser with Web Audio API support
- **No DAW needed** — drag & drop a WAV file and start processing
- **Real-time DSP** — all processing happens client-side in the browser
- **Genre-specific Auto EQ** — reference curves for metal and heavy music genres
- **ITU-R BS.1770-4 LUFS** — broadcast-compliant loudness measurement
- **Mobile responsive** — works on phones and tablets
- **Free and open source**

---

## Links

- [Website](https://sarantasoundworks.com)
- [SoundCloud](https://soundcloud.com/saranta-596980414)
- [Spotify](https://open.spotify.com/intl-tr/artist/6l97qlvDhzQlezBQWjhp3e)
- [Instagram](https://instagram.com/sarantasoundworks)
- [GitHub](https://github.com/sarantasoundworks)

---

## License

This project is licensed under the **MIT License** — do whatever you want with it. See [LICENSE](LICENSE) for details.

---

*© 2026 Burak Balta*
