# Saranta Soundworks

**Free browser-based audio mastering tools and REAPER JSFX plugins for heavy music.** No install, no DAW — open the page, load your file, and process.

Built from scratch with the Web Audio API by [Burak Balta](https://github.com/sarantasoundworks).

> Live at [sarantasoundworks.com](https://sarantasoundworks.com)

---

## Web Audio Tools

### Mastering Suite (`mastering-suite.html`)

A full mastering-grade signal chain that runs entirely in the browser. Drag-and-drop reorderable module rack with per-module bypass toggles.

| Module | Description |
|---|---|
| **Parametric EQ Studio** | 8-band parametric EQ with dynamic EQ, Auto EQ (genre-matched ISO 266 LTAS curves), FFT analyzer, solo/bypass per band, oversampling |
| **Tape Saturator** | Analog tape emulation with drive, bias, mix, tape speed modes, input/output metering and clip detection |
| **Compressor** | Full dynamics processor with threshold, ratio, attack, release, knee, makeup gain |
| **Multiband Compressor** | 3-band (low/mid/high) multiband dynamics with independent threshold, ratio, attack, release, gain and knee per band |
| **Clipper** | Soft/hard clipper for transparent loudness maximization and transient control |
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

## REAPER JSFX Plugins (`lozengrad.html`)

The **Lozengrad** series is a collection of 16 free, open-source JSFX plugins for REAPER, designed for heavy music production. Detailed documentation with signal flow analysis, parameter descriptions, and algorithm explanations is available on the site.

| # | Plugin | Type |
|---|---|---|
| 01 | **Lozengrad Amfi** | Guitar amp sim with noise gate, 3-stage cascading distortion, 3 cab IRs, mid spice, bus comp |
| 02 | **Lozengrad Balans EQ** | 8-band parametric EQ with RBJ biquads, save-on-switch band management, FFT + EQ curve overlay |
| 03 | **Lozengrad EQuinox** | 2-band tone EQ with asymmetric filter pairing for smile curve shaping |
| 04 | **Lozengrad Feeltre** | 8-mode filter (LPF/HPF/BPF/APF/Tilt EQ/Low Shelf/High Shelf/Tilt Shelf) with custom log frequency mapping |
| 05 | **Lozengrad Spyke** | Transient shaper with 3-envelope detection (fast/slow/sustain), level-normalized gain modulation |
| 06 | **Lozengrad Kompresor** | VCA compressor with dual-stage release, detector thrust HPF, feedforward/feedback modes, analog output saturation |
| 07 | **Lozengrad Kompresor V2** | VCA compressor with dynamic saturation, punch compensation, dual-stage release, auto makeup, feedforward/feedback |
| 08 | **Lozengrad MB Saturasyon** | 3-band multiband saturation with LR4 crossovers, 4 saturation modes, per-band auto gain, oversampling |
| 09 | **Lozengrad MB Saturasyon V2** | 3-band multiband saturation with LR4 crossovers, 4 saturation modes per band, character macro, 4 output stage models, AUTO oversampling |
| 10 | **Lozengrad Klip** | 4-mode clipper (Hard/Soft/Tube/Tape) with harmonic tilt, frequency weight, half-band FIR oversampling |
| 11 | **Lozengrad MicroDelay** | M/S stereo width modulator using Mackey-Glass chaotic DDE, hybrid Lagrange/Thiran interpolation |
| 12 | **Lozengrad RetroSpec** | FFT spectrum visualizer with 11 visual styles and 13 color themes — purely cosmetic, zero latency |
| 13 | **Lozengrad Spektra** | FFT spectral density controller with EMA profile, local contrast analysis, psychoacoustic weighting |
| 14 | **Lozengrad Trafo** | Dual-path transformer saturator (Nickel asymmetric + Iron symmetric w/ hysteresis) with ADAA |
| 15 | **Lozengrad Pedal** | 7-mode guitar distortion pedal simulation with pre/post EQ and tone response display |
| 16 | **Lozengrad Hudut** | True peak brickwall limiter with polyphase oversampling, dynamic release, harmonic inflator |

All plugins are available as a single download from the site or via the [GitHub repository](https://github.com/sarantasoundworks/Saranta-Soundworks-JSFX-Pack). MIT licensed.

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
├── tools.html              Tools index page
├── mastering-suite.html    Mastering Suite
├── mastermind.html         Auto mastering
├── beatmaster.html         Step sequencer & rhythm game
├── lozengrad.html          Lozengrad JSFX Plugin Series docs
├── tips.html               Mixing guide
├── privacy.html            Privacy policy
├── autoEQ.js               Auto EQ matching algorithm (ISO 266 LTAS)
├── genreReferenceCurves.json  Genre-specific EQ reference curves
├── multiband-processor.cpp    C++ multiband comp (WASM target)
├── multiband-worklet.js       AudioWorklet processor
├── server.js               Local dev server
├── run.bat                 Windows quick-start
├── fx-generator/           Audio FX generator tool
├── synth/                  Browser-based synthesizer
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
- **Lozengrad JSFX Series** — 16 free, open-source REAPER plugins with detailed documentation
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
