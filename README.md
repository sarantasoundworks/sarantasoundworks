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

**Signal chain:** Auto-Gain → Saturation → HPF → Mastering EQ → 3-Band Multiband Comp → Passive EQ → Bus Comp → Stereo Width → LUFS Normalization → True Peak Limiter

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

The **Lozengrad** series is a collection of 23 free JSFX plugins for REAPER, designed for heavy music production. Detailed documentation with signal flow analysis, parameter descriptions, and algorithm explanations is available on the site.

| # | Plugin | Type |
|---|---|---|
| 01 | **Lozengrad Amfi** | Guitar amp sim with noise gate, 3-stage cascading distortion, 3 cab IRs, mid spice, bus comp |
| 02 | **Lozengrad Amfi V2** | Guitar amp sim with V3 noise gate (2ms lookahead, hysteresis, 4:1 expander), Classic/Hard amp modes, interactive tone stack, power amp sag/presence/resonance, transient enhancer, harmonic exciter |
| 03 | **Lozengrad Bas Amfi** | Split-band bass amp sim v1.2 — multi-stage preamp (6-stage), power amp with transformer saturation, Speaker Coloration Engine (10-stage cab sim), frequency-dependent drive, auto oversampling |
| — | **Lozengrad Bas Amfi Legacy** | Original single-stage bass amp sim maintained as separate plugin — simpler 3-stage hard clip, basic cab sim |
| 04 | **Lozengrad Balans EQ** | 8-band parametric EQ with RBJ biquads, save-on-switch band management, FFT + EQ curve overlay |
| 05 | **Lozengrad EQuinox** | 2-band tone EQ with asymmetric filter pairing for smile curve shaping |
| 06 | **Lozengrad Feeltre** | 8-mode filter (LPF/HPF/BPF/APF/Tilt EQ/Low Shelf/High Shelf/Tilt Shelf) with custom log frequency mapping |
| 07 | **Lozengrad Kompresor V2** | VCA compressor with dynamic saturation, punch compensation, dual-stage release, auto makeup, feedforward/feedback |
| 08 | **Lozengrad Kompresor** | VCA compressor with dual-stage release, detector thrust HPF, feedforward/feedback modes, analog output saturation |
| 09 | **Lozengrad MB Saturasyon V2** | 3-band multiband saturation with LR4 crossovers, 4 saturation modes per band, character macro, 4 output stage models, AUTO oversampling |
| 10 | **Lozengrad MB Saturasyon** | 3-band multiband saturation with LR4 crossovers, 4 saturation modes, per-band auto gain, oversampling |
| 11 | **Lozengrad Klip** | 4-mode clipper (Hard/Soft/Tube/Tape) with harmonic tilt, frequency weight, half-band FIR oversampling |
| 12 | **Lozengrad MicroDelay** | M/S stereo width modulator using Mackey-Glass chaotic DDE, hybrid Lagrange/Thiran interpolation |
| 13 | **Lozengrad Pedal** | 7-mode guitar distortion pedal simulation with pre/post EQ and tone response display |
| 14 | **Lozengrad RetroSpec** | FFT spectrum visualizer with 11 visual styles and 13 color themes — purely cosmetic, zero latency |
| 15 | **Lozengrad Spektra** | FFT spectral density controller with EMA profile, local contrast analysis, psychoacoustic weighting |
| 16 | **Lozengrad Spyke** | Transient shaper with 3-envelope detection (fast/slow/sustain), level-normalized gain modulation |
| 17 | **Lozengrad Trafo** | Dual-path transformer saturator (Nickel asymmetric + Iron symmetric w/ hysteresis) with ADAA |
| 18 | **Lozengrad Hudut** | True peak brickwall limiter with polyphase oversampling, dynamic release, harmonic inflator |
| 19 | **Lozengrad Guitarbus One** | Adaptive guitar bus — single-knob continuous analysis of chug density, palm mute ratio, pick attack; drives mud suppression, bus compressor, mid saturation, precision EQ, 4-band MB comp, harshness control |
| 20 | **Lozengrad Drumbus One** | Adaptive drum bus — single-knob analysis of low/mid/presence/air bands, crest factor, transient density; drives cleanup EQ, transient shaper, compressor, saturation, tone EQ, clipper, limiter |
| 21 | **Lozengrad Masterbus One** | Adaptive mastering bus — tape saturation, passive tube EQ, soft clipper, bus compressor, precision mastering EQ (static + dynamic bands), true peak limiter |
| 22 | **Lozengrad Synthbus One** | Adaptive synth bus — sub anchor, resonance tamer, glue compressor, ensemble widener, harmonic warmth, precision EQ, 4-band MB comp |
| 23 | **Lozengrad Bassbus One** | Adaptive bass bus — dual-zone intensity (0-50 clean, 50-100 grit+slam), mud suppression, feedback bass comp, sub weight enhancer, harmonic saturation, string noise control, parallel slam comp |

All plugins are available as a single download from the site or via the [GitHub repository](https://github.com/sarantasoundworks/Saranta-Soundworks-JSFX-Pack). Licensed under the Saranta Soundworks Free License (SSFL) v1.0. See the [Legal page](legal.html#plugin-license) for terms.

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
├── legal.html              Legal (Terms, License, Privacy, Cookie, Trademark)
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
- **Lozengrad JSFX Series** — 23 free REAPER plugins with detailed documentation
- **Free to use commercially**

---

## Links

- [Website](https://sarantasoundworks.com)
- [SoundCloud](https://soundcloud.com/saranta-596980414)
- [Spotify](https://open.spotify.com/intl-tr/artist/6l97qlvDhzQlezBQWjhp3e)
- [Instagram](https://instagram.com/sarantasoundworks)
- [GitHub](https://github.com/sarantasoundworks)

---

## License

All code, design, content, and plugins are licensed under the **Saranta Soundworks Free License (SSFL) v1.0**. See the [LICENSE](LICENSE) file for the full license text and the [Legal page](legal.html#plugin-license) for terms and FAQ.

---

*© 2026 Burak Balta*
