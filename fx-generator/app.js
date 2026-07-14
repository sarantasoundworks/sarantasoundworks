import AudioEngine from './js/AudioEngine.js';
console.log('APP.JS LOADED');

// ─── State ─────────────────────────────────────────────────
const S = {
  wave1:'sine', baseFreq:440, noiseType:'none', noiseMix:0,
  wave2:'square', osc2Octave:0, osc2Detune:0, osc2Mix:0, fmAmount:0,
  modWave:'sine', modFreq:440, modAmount:0, rmAmount:0,
  attack:0, decay:0.2, sustain:0, release:0.1, envCurve:'linear',
  pitchStart:440, pitchPeak:440, pitchEnd:440, pitchPeakTime:0.5,
  filterType:'lowpass', filterCutoff:20000, filterQ:1,
  lfoWave:'sine', lfoRate:5, lfoDepth:0, lfoTarget:'pitch', lfoMode:'free', lfoCycles:1,
  eqLow:0, eqMid:0, eqHigh:0,
  compThreshold:-24, compRatio:4, compMakeup:0,
  bitcrush:0, sampleReduction:48,
  distortion:0, delayTime:0, delayFeedback:0,
  reverbDecay:0, reverbMix:0,
  chorusRate:0, chorusDepth:0, chorusMix:0,
  phaserRate:0, phaserDepth:0, phaserFeedback:0,
  pan:0, exportFormat:'wav',
  noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1,
  hardClip:0,
  // Spatial
  dopplerAmt:0, hrtfPan:0,
  envPreset:'none', distance:0, airAbsorb:0,
  // Advanced
  materialType:'none', stiffness:0.5, damping:0.5, ksDecay:0.5,
  grainBPM:120, grainDiv:16, stutterDepth:0,
  chugEnable:0, chugFreq:90, chugSat:0, chugPunch:0,
  modSrc:'none', modDst:'none', modMatAmt:0,
  intensity:0.5,
  // Export
  atlasCount:10, atlasGap:0.1, normalize:true, spriteFormat:'json',
  // Layers (state inited after DEFAULT_STATE below)
  activeLayer:0, layers:[]
};

const DEFAULT_STATE = structuredClone(S);
const delta = (o) => ({ ...DEFAULT_STATE, ...o });
// Init default layer
S.layers = [{name:'Layer 1', volume:1, mute:false, state:structuredClone(DEFAULT_STATE)}];

// ─── Presets with tags ─────────────────────────────────────
const PRESETS = {
  laser:      delta({ tag:'laser',    wave1:'sawtooth', baseFreq:880, noiseType:'white', noiseMix:0.15, wave2:'sine', osc2Octave:1, osc2Mix:0.2, pitchStart:2000, pitchPeak:2000, pitchEnd:100, pitchPeakTime:0, filterCutoff:8000, filterQ:2, lfoRate:10 }),
  explosion:  delta({ tag:'impact',   wave1:'sawtooth', baseFreq:80, noiseType:'white', noiseMix:0.85, wave2:'square', osc2Octave:-1, osc2Mix:0.3, decay:0.8, sustain:0.1, release:0.3, pitchStart:150, pitchPeak:150, pitchEnd:40, filterCutoff:2000, filterQ:5, lfoRate:3, lfoDepth:0.3, lfoTarget:'filter', eqLow:3, eqMid:-2, eqHigh:-6, compThreshold:-20, compRatio:8, compMakeup:6, bitcrush:8, sampleReduction:12, distortion:20, delayTime:100, delayFeedback:0.3, reverbDecay:1.5, reverbMix:0.3 }),
  jump:       delta({ tag:'ui',       wave1:'square', baseFreq:300, wave2:'triangle', osc2Detune:5, osc2Mix:0.15, attack:0.05, decay:0.1, release:0.05, pitchStart:150, pitchPeak:800, pitchEnd:600, pitchPeakTime:0.2, filterCutoff:5000, eqHigh:2 }),
  powerup:    delta({ tag:'ui',       wave1:'sine', baseFreq:220, wave2:'sine', osc2Octave:1, osc2Mix:0.4, fmAmount:50, attack:0.6, sustain:0.8, release:0.5, pitchStart:220, pitchPeak:880, pitchEnd:880, pitchPeakTime:0.7, filterCutoff:4000, filterQ:3, lfoRate:2, lfoDepth:0.5, lfoTarget:'filter', eqMid:2, eqHigh:3, delayTime:200, delayFeedback:0.4, reverbDecay:1, reverbMix:0.2 }),
  coin:       delta({ tag:'retro',    wave1:'square', baseFreq:988, wave2:'square', osc2Octave:1, osc2Mix:0.5, decay:0.15, pitchStart:988, pitchPeak:1319, pitchEnd:1319, pitchPeakTime:0.1, filterCutoff:10000, bitcrush:8, sampleReduction:22 }),
  hit:        delta({ tag:'impact',   wave1:'triangle', baseFreq:150, noiseType:'white', noiseMix:0.4, wave2:'square', osc2Octave:-1, osc2Mix:0.2, decay:0.15, pitchStart:200, pitchPeak:200, pitchEnd:60, filterCutoff:3000, filterQ:8, eqLow:4, eqHigh:-3, compThreshold:-18, compRatio:6, compMakeup:4, bitcrush:12, sampleReduction:16, distortion:10, reverbDecay:0.5, reverbMix:0.15 }),
  zap:        delta({ tag:'laser',    wave1:'square', baseFreq:600, wave2:'sawtooth', osc2Mix:0.3, decay:0.15, release:0.05, pitchStart:1500, pitchPeak:1500, pitchEnd:200, filterCutoff:6000, filterQ:3, distortion:5 }),
  shield:     delta({ tag:'impact',   wave1:'triangle', baseFreq:200, wave2:'sine', osc2Octave:1, osc2Detune:7, osc2Mix:0.6, fmAmount:30, attack:0.02, decay:0.3, sustain:0.3, release:0.6, pitchStart:200, pitchPeak:600, pitchEnd:200, pitchPeakTime:0.15, filterCutoff:2500, filterQ:12, lfoRate:4, lfoDepth:0.4, lfoTarget:'filter', eqMid:3, distortion:15, delayTime:150, delayFeedback:0.35, reverbDecay:1, reverbMix:0.2 }),
  select:     delta({ tag:'ui',       wave1:'sine', baseFreq:660, wave2:'sine', osc2Octave:1, osc2Mix:0.3, decay:0.08, release:0.05, pitchStart:660, pitchPeak:880, pitchEnd:880, pitchPeakTime:0.05, filterCutoff:8000 }),
  error:      delta({ tag:'ui',       wave1:'square', baseFreq:200, noiseType:'white', noiseMix:0.2, wave2:'square', osc2Detune:-20, osc2Mix:0.5, decay:0.2, release:0.15, pitchStart:200, pitchPeak:150, pitchEnd:100, pitchPeakTime:0.5, filterCutoff:3000, filterQ:5, eqLow:3, eqHigh:-3, compThreshold:-18, compRatio:6, compMakeup:4, bitcrush:8, sampleReduction:16, distortion:25, reverbDecay:0.3, reverbMix:0.1 }),
  sweep:      delta({ tag:'laser',    wave1:'sawtooth', baseFreq:200, wave2:'sine', osc2Mix:0.2, attack:0.05, decay:0.4, release:0.2, pitchStart:200, pitchPeak:4000, pitchEnd:200, pitchPeakTime:0.5, filterCutoff:8000, filterQ:4, lfoRate:6, lfoDepth:0.3, lfoTarget:'filter', distortion:10, delayTime:200, delayFeedback:0.4, reverbDecay:1, reverbMix:0.2, phaserRate:3, phaserDepth:0.6, phaserFeedback:0.4 }),
  bass_drop:  delta({ tag:'impact',   wave1:'sawtooth', baseFreq:55, wave2:'square', osc2Octave:-1, osc2Mix:0.5, attack:0.05, decay:0.6, sustain:0.3, release:0.5, pitchStart:200, pitchPeak:200, pitchEnd:40, pitchPeakTime:0.1, filterCutoff:800, filterQ:10, lfoRate:4, lfoDepth:0.4, lfoTarget:'filter', eqLow:6, eqMid:-3, eqHigh:-6, compThreshold:-18, compRatio:8, compMakeup:6, distortion:15, reverbDecay:1.5, reverbMix:0.25 }),
  alarm:      delta({ tag:'ui',       wave1:'square', baseFreq:800, wave2:'sawtooth', osc2Mix:0.3, attack:0.02, decay:0.15, sustain:0.5, release:0.1, pitchStart:800, pitchPeak:1200, pitchEnd:800, pitchPeakTime:0.5, filterCutoff:4000, filterQ:3, lfoWave:'square', lfoRate:4, lfoDepth:0.6, eqMid:3, distortion:5, reverbDecay:0.5, reverbMix:0.1 }),
  whoosh:     delta({ tag:'nature',   wave1:'sawtooth', baseFreq:200, noiseType:'white', noiseMix:0.7, attack:0.02, decay:0.3, release:0.4, pitchStart:2000, pitchPeak:2000, pitchEnd:80, filterType:'bandpass', filterCutoff:1500, filterQ:2, lfoRate:12, lfoDepth:0.6, lfoTarget:'filter', eqMid:4, delayTime:100, delayFeedback:0.2, reverbDecay:1.5, reverbMix:0.3 }),
  glitch:     delta({ tag:'fx',       wave1:'square', baseFreq:440, noiseType:'white', noiseMix:0.5, wave2:'sawtooth', osc2Octave:-1, osc2Detune:50, osc2Mix:0.4, fmAmount:300, decay:0.1, release:0.05, pitchStart:440, pitchPeak:2000, pitchEnd:50, pitchPeakTime:0.1, filterType:'bandpass', filterCutoff:2000, filterQ:20, lfoWave:'square', lfoRate:15, lfoDepth:0.8, lfoTarget:'filter', eqLow:-6, eqMid:6, eqHigh:-6, compThreshold:-12, compRatio:12, compMakeup:8, bitcrush:4, sampleReduction:6, distortion:60, delayTime:50, delayFeedback:0.8, reverbDecay:0.3, reverbMix:0.2, pan:0.7 }),
  chime:      delta({ tag:'ui',       wave1:'sine', baseFreq:1200, wave2:'triangle', osc2Octave:2, osc2Detune:3, osc2Mix:0.25, decay:0.5, release:0.8, filterCutoff:6000, filterQ:2, lfoRate:6, lfoDepth:0.15, eqLow:-3, eqHigh:3, delayTime:300, delayFeedback:0.3, reverbDecay:2, reverbMix:0.3, chorusRate:1, chorusDepth:8, chorusMix:0.2, pan:0.3 }),
  click:      delta({ tag:'ui',       wave1:'square', baseFreq:1200, noiseType:'white', noiseMix:0.1, decay:0.05, release:0.02, pitchStart:1200, pitchPeak:1200, pitchEnd:400, filterType:'highpass', filterCutoff:800, bitcrush:8, sampleReduction:11 }),
  portal:     delta({ tag:'ambient',  wave1:'sine', baseFreq:100, noiseType:'pink', noiseMix:0.2, wave2:'triangle', osc2Octave:1, osc2Detune:-10, osc2Mix:0.3, fmAmount:100, attack:1, decay:0.3, sustain:0.5, release:1.5, pitchStart:50, pitchPeak:2000, pitchEnd:100, pitchPeakTime:0.5, filterCutoff:3000, filterQ:10, lfoRate:0.5, lfoDepth:0.8, lfoTarget:'filter', eqLow:3, eqHigh:-3, distortion:5, delayTime:500, delayFeedback:0.7, reverbDecay:3, reverbMix:0.5, chorusRate:2, chorusDepth:15, chorusMix:0.3, pan:-0.3 }),
  warp:       delta({ tag:'ambient',  wave1:'sawtooth', baseFreq:100, noiseType:'pink', noiseMix:0.1, wave2:'sine', osc2Octave:2, osc2Mix:0.2, fmAmount:100, attack:0.5, decay:0.2, sustain:0.5, release:1, pitchStart:100, pitchPeak:3000, pitchEnd:50, pitchPeakTime:0.6, filterCutoff:5000, filterQ:5, lfoRate:1, lfoDepth:0.6, lfoTarget:'filter', eqLow:6, eqMid:-3, distortion:10, delayTime:400, delayFeedback:0.5, reverbDecay:2.5, reverbMix:0.4, chorusRate:3, chorusDepth:20, chorusMix:0.4, phaserRate:0.5, phaserDepth:0.5, phaserFeedback:0.6 }),
  radiation:  delta({ tag:'ambient',  wave1:'sawtooth', baseFreq:200, noiseType:'pink', noiseMix:0.3, wave2:'sawtooth', osc2Detune:30, osc2Mix:0.5, fmAmount:200, attack:0.3, decay:0.5, sustain:0.6, release:0.8, pitchStart:200, pitchPeak:400, pitchEnd:100, pitchPeakTime:0.4, filterType:'bandpass', filterCutoff:1500, filterQ:15, lfoWave:'sawtooth', lfoRate:6, lfoDepth:0.7, lfoTarget:'filter', eqLow:-3, eqMid:6, eqHigh:-6, bitcrush:8, sampleReduction:8, distortion:40, delayTime:300, delayFeedback:0.6, reverbDecay:2, reverbMix:0.4, pan:0.5 }),
  teleport:   delta({ tag:'ambient',  wave1:'sine', baseFreq:400, noiseType:'pink', noiseMix:0.15, wave2:'triangle', osc2Octave:1, osc2Detune:15, osc2Mix:0.4, fmAmount:80, attack:0.2, decay:0.1, sustain:0.4, release:1.2, pitchStart:400, pitchPeak:2400, pitchEnd:400, pitchPeakTime:0.3, filterCutoff:4000, filterQ:8, lfoRate:8, lfoDepth:0.5, lfoTarget:'filter', eqMid:3, eqHigh:3, delayTime:250, delayFeedback:0.5, reverbDecay:2, reverbMix:0.35, chorusRate:4, chorusDepth:10, chorusMix:0.25, phaserRate:2, phaserDepth:0.4, phaserFeedback:0.5, pan:-0.5 }),
  powerdown:  delta({ tag:'ui',       wave1:'sawtooth', baseFreq:440, wave2:'triangle', osc2Octave:-1, osc2Mix:0.3, attack:0.1, decay:0.3, sustain:0.2, release:0.8, pitchStart:880, pitchPeak:880, pitchEnd:55, pitchPeakTime:0.8, filterCutoff:3000, filterQ:2, lfoRate:3, lfoDepth:0.2, eqHigh:-3, distortion:5, delayTime:100, delayFeedback:0.2, reverbDecay:0.8, reverbMix:0.15 }),
  // ─── 20 NEW PRESETS ───
  retro_bounce:delta({ tag:'retro',   wave1:'square', baseFreq:350, wave2:'triangle', osc2Octave:1, osc2Mix:0.3, pitchStart:200, pitchPeak:700, pitchEnd:500, pitchPeakTime:0.2, filterCutoff:5000, eqHigh:2 }),
  retro_die:   delta({ tag:'retro',   wave1:'sawtooth', baseFreq:400, wave2:'square', osc2Detune:-30, osc2Mix:0.4, attack:0.02, decay:0.4, release:0.3, pitchStart:400, pitchPeak:400, pitchEnd:50, pitchPeakTime:0.8, filterCutoff:3000, filterQ:2, eqHigh:-3, bitcrush:8, sampleReduction:16, distortion:10 }),
  retro_1up:   delta({ tag:'retro',   wave1:'sine', baseFreq:520, wave2:'sine', osc2Octave:1, osc2Mix:0.3, decay:0.1, pitchStart:520, pitchPeak:1040, pitchEnd:1040, pitchPeakTime:0.05, filterCutoff:8000, lfoRate:8 }),
  laser_charge:delta({ tag:'laser',   wave1:'sine', baseFreq:200, noiseType:'pink', noiseMix:0.3, wave2:'sawtooth', osc2Mix:0.2, attack:0.8, decay:0.1, release:0.2, pitchStart:200, pitchPeak:2000, pitchEnd:2000, pitchPeakTime:1, filterCutoff:6000, filterQ:4, lfoRate:10 }),
  laser_burst: delta({ tag:'laser',   wave1:'sawtooth', baseFreq:1200, wave2:'square', osc2Mix:0.3, decay:0.05, release:0.03, pitchStart:1200, pitchPeak:1200, pitchEnd:200, filterCutoff:8000, filterQ:2, distortion:5 }),
  heavy_hit:   delta({ tag:'impact',  wave1:'sawtooth', baseFreq:60, noiseType:'white', noiseMix:0.6, wave2:'square', osc2Octave:-1, osc2Mix:0.4, decay:0.5, release:0.3, pitchStart:150, pitchPeak:150, pitchEnd:30, filterCutoff:1500, filterQ:8, eqLow:4, eqHigh:-6, compThreshold:-20, compRatio:10, compMakeup:8, distortion:30, reverbDecay:1.2, reverbMix:0.2 }),
  metal_clank: delta({ tag:'impact',  wave1:'triangle', baseFreq:800, noiseType:'white', noiseMix:0.3, wave2:'sine', osc2Octave:1, osc2Detune:10, osc2Mix:0.3, decay:0.3, release:0.4, pitchStart:800, pitchPeak:800, pitchEnd:300, filterType:'bandpass', filterCutoff:1000, filterQ:12, lfoRate:6, eqMid:3, distortion:15, delayTime:50, delayFeedback:0.3, reverbDecay:0.8, reverbMix:0.15, pan:0.2 }),
  glass_break: delta({ tag:'impact',  wave1:'sine', baseFreq:2000, noiseType:'white', noiseMix:0.5, wave2:'triangle', osc2Detune:50, osc2Mix:0.2, decay:0.6, release:0.5, pitchStart:2000, pitchPeak:2000, pitchEnd:100, filterType:'highpass', filterCutoff:1500, filterQ:5, eqLow:-6, eqMid:3, eqHigh:6, compThreshold:-18, compRatio:6, compMakeup:4, bitcrush:4, sampleReduction:24, distortion:20, reverbDecay:1, reverbMix:0.25 }),
  toggle_on:   delta({ tag:'ui',      wave1:'square', baseFreq:600, wave2:'sine', osc2Mix:0.2, decay:0.06, release:0.04, pitchStart:600, pitchPeak:800, pitchEnd:800, pitchPeakTime:0.1, filterCutoff:8000 }),
  toggle_off:  delta({ tag:'ui',      wave1:'square', baseFreq:800, wave2:'sine', osc2Mix:0.2, decay:0.06, release:0.04, pitchStart:800, pitchPeak:600, pitchEnd:600, pitchPeakTime:0.1, filterCutoff:8000 }),
  hover_beep:  delta({ tag:'ui',      wave1:'sine', baseFreq:1200, decay:0.04, release:0.02, filterCutoff:10000 }),
  success_chime:delta({ tag:'ui',     wave1:'sine', baseFreq:784, wave2:'triangle', osc2Octave:1, osc2Mix:0.25, decay:0.3, release:0.4, filterCutoff:6000, filterQ:2, eqHigh:3, reverbDecay:0.5, reverbMix:0.1 }),
  fail_buzz:   delta({ tag:'ui',      wave1:'square', baseFreq:150, noiseType:'white', noiseMix:0.15, wave2:'square', osc2Detune:-15, osc2Mix:0.3, decay:0.25, release:0.15, pitchStart:150, pitchPeak:100, pitchEnd:80, pitchPeakTime:0.5, filterCutoff:2000, filterQ:3, eqHigh:-3, bitcrush:8, sampleReduction:16, distortion:10 }),
  level_up:    delta({ tag:'ui',      wave1:'sine', baseFreq:523, wave2:'sine', osc2Octave:1, osc2Mix:0.3, attack:0.05, decay:0.15, release:0.4, pitchStart:523, pitchPeak:1047, pitchEnd:1047, pitchPeakTime:0.2, filterCutoff:6000, eqMid:2, eqHigh:2, delayTime:200, delayFeedback:0.3, reverbDecay:1, reverbMix:0.2 }),
  drone_low:   delta({ tag:'ambient', wave1:'sawtooth', baseFreq:55, noiseType:'pink', noiseMix:0.2, wave2:'sine', osc2Detune:5, osc2Mix:0.3, attack:1, decay:0.2, sustain:0.7, release:1, filterCutoff:400, filterQ:3, lfoRate:0.3, lfoDepth:0.5, lfoTarget:'filter', eqLow:3, eqHigh:-6, reverbDecay:2, reverbMix:0.3, chorusRate:1, chorusDepth:12, chorusMix:0.3 }),
  pulse_signal:delta({ tag:'ambient', wave1:'sine', baseFreq:440, wave2:'sine', osc2Mix:0.2, attack:0.05, decay:0.1, sustain:0.3, release:0.2, filterCutoff:4000, filterQ:2, lfoWave:'square', lfoRate:2, lfoDepth:0.3, lfoTarget:'volume', reverbDecay:0.5, reverbMix:0.1 }),
  thunder_crack:delta({ tag:'nature',wave1:'sawtooth', baseFreq:40, noiseType:'white', noiseMix:0.8, wave2:'square', osc2Octave:-2, osc2Mix:0.3, decay:0.5, release:0.8, pitchStart:200, pitchPeak:200, pitchEnd:20, filterCutoff:800, filterQ:6, lfoRate:3, lfoDepth:0.3, lfoTarget:'filter', eqLow:6, eqHigh:-6, compThreshold:-20, compRatio:8, compMakeup:6, distortion:5, delayTime:300, delayFeedback:0.4, reverbDecay:2, reverbMix:0.35 }),
  splash_drop: delta({ tag:'nature', wave1:'sine', baseFreq:800, noiseType:'white', noiseMix:0.4, wave2:'triangle', osc2Octave:1, osc2Mix:0.2, pitchStart:1200, pitchPeak:1200, pitchEnd:400, filterType:'bandpass', filterCutoff:1000, filterQ:4, lfoRate:8, eqMid:2, delayTime:100, delayFeedback:0.2, reverbDecay:0.8, reverbMix:0.2 }),
  fire_crackle:delta({ tag:'nature', wave1:'square', baseFreq:200, noiseType:'white', noiseMix:0.6, wave2:'sawtooth', osc2Detune:20, osc2Mix:0.2, pitchStart:200, pitchPeak:600, pitchEnd:100, pitchPeakTime:0.1, filterType:'bandpass', filterCutoff:1500, filterQ:8, lfoRate:15, lfoDepth:0.5, lfoTarget:'filter', eqMid:3, eqHigh:-3, bitcrush:4, sampleReduction:12, distortion:10, reverbDecay:0.3, reverbMix:0.1 }),
  footstep:    delta({ tag:'nature', wave1:'triangle', baseFreq:120, noiseType:'pink', noiseMix:0.3, wave2:'sine', osc2Octave:-1, osc2Mix:0.2, decay:0.08, release:0.05, pitchStart:120, pitchPeak:120, pitchEnd:60, filterCutoff:2000, filterQ:2, eqHigh:-3 }),
  wood_crack:  delta({ tag:'impact', wave1:'sawtooth', baseFreq:300, noiseType:'white', noiseMix:0.4, wave2:'triangle', osc2Detune:30, osc2Mix:0.2, pitchStart:400, pitchPeak:400, pitchEnd:100, filterType:'bandpass', filterCutoff:800, filterQ:6, eqLow:2, eqHigh:-3, distortion:5, reverbDecay:0.5, reverbMix:0.15 }),
  wind_gust:   delta({ tag:'nature', wave1:'sawtooth', baseFreq:150, noiseType:'pink', noiseMix:0.8, osc2Mix:0.1, attack:0.3, decay:0.5, sustain:0.5, release:0.8, pitchStart:100, pitchPeak:300, pitchEnd:80, pitchPeakTime:0.4, filterType:'bandpass', filterCutoff:600, filterQ:3, lfoRate:1, lfoDepth:0.6, lfoTarget:'filter', eqLow:-3, eqMid:2, delayTime:200, delayFeedback:0.3, reverbDecay:1.5, reverbMix:0.3, pan:0.3 }),
  scanner:     delta({ tag:'fx',      wave1:'square', baseFreq:800, noiseType:'white', noiseMix:0.2, wave2:'sawtooth', osc2Mix:0.3, attack:0.1, decay:0.2, release:0.3, pitchStart:800, pitchPeak:2000, pitchEnd:200, pitchPeakTime:0.3, filterType:'bandpass', filterCutoff:1500, filterQ:10, lfoWave:'sawtooth', lfoRate:8, lfoDepth:0.7, lfoTarget:'filter', eqLow:-3, eqMid:4, delayTime:100, delayFeedback:0.4, reverbDecay:1, reverbMix:0.2, phaserRate:3, phaserDepth:0.5, phaserFeedback:0.3 }),
  static_buzz: delta({ tag:'fx',      wave1:'sawtooth', baseFreq:60, noiseType:'white', noiseMix:0.9, wave2:'square', osc2Detune:50, osc2Mix:0.1, decay:0.3, sustain:0.4, release:0.2, pitchStart:60, pitchPeak:200, pitchEnd:60, pitchPeakTime:0.5, filterType:'bandpass', filterCutoff:500, filterQ:15, lfoWave:'square', lfoRate:12, lfoDepth:0.8, lfoTarget:'filter', eqMid:3, eqHigh:-6, bitcrush:4, sampleReduction:6, distortion:30, reverbDecay:0.3, reverbMix:0.1 }),
  sonar_ping:  delta({ tag:'ui',      wave1:'sine', baseFreq:1000, wave2:'sine', osc2Octave:1, osc2Mix:0.2, decay:0.4, release:0.6, pitchStart:1000, pitchPeak:1000, pitchEnd:250, filterCutoff:6000, filterQ:2, eqHigh:3, delayTime:250, delayFeedback:0.4, reverbDecay:1.5, reverbMix:0.25 }),

  // ─── New v2 presets ──────────────────────────────────────────
  metal_resonance:delta({ tag:'impact', wave1:'triangle', baseFreq:600, noiseType:'white', noiseMix:0.2, wave2:'sine', osc2Octave:2, osc2Detune:5, osc2Mix:0.15, decay:0.6, release:0.4, pitchStart:600, pitchPeak:600, pitchEnd:200, filterType:'bandpass', filterCutoff:800, filterQ:18, lfoRate:4, lfoDepth:0.3, lfoTarget:'filter', eqMid:4, distortion:8, delayTime:60, delayFeedback:0.2, reverbDecay:1.2, reverbMix:0.15, materialType:'metal', stiffness:0.7, damping:0.3, ksDecay:0.8, modSrc:'lfo1', modDst:'filter', modMatAmt:0.3 }),
  glass_hum:    delta({ tag:'ambient', wave1:'sine', baseFreq:220, noiseType:'none', noiseMix:0, wave2:'sine', osc2Octave:1, osc2Detune:3, osc2Mix:0.3, attack:0.5, decay:1, sustain:0.6, release:2, filterCutoff:4000, filterQ:2, lfoRate:0.8, lfoDepth:0.4, lfoTarget:'pitch', eqLow:2, eqMid:4, reverbDecay:3, reverbMix:0.4, chorusRate:1.5, chorusDepth:10, chorusMix:0.3, materialType:'glass', stiffness:0.9, damping:0.4, ksDecay:1.5 }),
  depth_charge: delta({ tag:'impact', wave1:'sawtooth', baseFreq:40, noiseType:'white', noiseMix:0.6, wave2:'square', osc2Octave:-2, osc2Mix:0.4, attack:0.1, decay:0.8, sustain:0.2, release:0.6, pitchStart:200, pitchPeak:200, pitchEnd:25, filterCutoff:400, filterQ:12, lfoRate:2, lfoDepth:0.5, lfoTarget:'filter', eqLow:8, eqMid:-3, eqHigh:-8, compThreshold:-22, compRatio:10, compMakeup:8, distortion:20, reverbDecay:2.5, reverbMix:0.3, chugEnable:'1', chugFreq:80, chugSat:0.4, chugPunch:0.6 }),
  stutter_fx:   delta({ tag:'fx',      wave1:'square', baseFreq:200, noiseType:'white', noiseMix:0.3, wave2:'sawtooth', osc2Detune:30, osc2Mix:0.2, decay:0.3, release:0.2, pitchStart:200, pitchPeak:800, pitchEnd:100, pitchPeakTime:0.3, filterType:'bandpass', filterCutoff:1000, filterQ:15, lfoWave:'square', lfoRate:10, lfoDepth:0.6, lfoTarget:'filter', eqMid:5, bitcrush:6, sampleReduction:10, distortion:30, delayTime:40, delayFeedback:0.7, reverbDecay:0.5, reverbMix:0.15, grainBPM:140, grainDiv:16, stutterDepth:0.7 }),
  earthquake:   delta({ tag:'impact', wave1:'sawtooth', baseFreq:30, noiseType:'pink', noiseMix:0.5, wave2:'square', osc2Octave:-2, osc2Mix:0.3, attack:0.3, decay:0.6, sustain:0.4, release:0.8, pitchStart:60, pitchPeak:60, pitchEnd:20, filterCutoff:300, filterQ:15, lfoRate:0.5, lfoDepth:0.7, lfoTarget:'filter', eqLow:8, eqMid:-2, eqHigh:-10, compThreshold:-24, compRatio:12, compMakeup:10, distortion:15, reverbDecay:3, reverbMix:0.3, chugEnable:'1', chugFreq:60, chugSat:0.5, chugPunch:0.8, materialType:'metal', stiffness:0.3, damping:0.6, ksDecay:1.2 }),
  sci_fi_alarm: delta({ tag:'laser',   wave1:'square', baseFreq:900, noiseType:'none', noiseMix:0, wave2:'sawtooth', osc2Octave:-1, osc2Detune:10, osc2Mix:0.3, attack:0.05, decay:0.2, sustain:0.6, release:0.1, pitchStart:900, pitchPeak:900, pitchEnd:400, pitchPeakTime:0.6, filterCutoff:3000, filterQ:4, lfoWave:'square', lfoRate:6, lfoDepth:0.5, lfoTarget:'pitch', eqMid:3, eqHigh:2, compThreshold:-16, compRatio:6, compMakeup:4, delayTime:200, delayFeedback:0.5, reverbDecay:0.8, reverbMix:0.2, modSrc:'lfo2', modDst:'pitch', modMatAmt:0.4 }),
  organic_pad:  delta({ tag:'ambient', wave1:'triangle', baseFreq:130, noiseType:'pink', noiseMix:0.15, wave2:'sine', osc2Octave:1, osc2Detune:8, osc2Mix:0.4, attack:1.5, decay:0.5, sustain:0.8, release:2, filterCutoff:2000, filterQ:3, lfoRate:0.3, lfoDepth:0.6, lfoTarget:'filter', eqLow:4, eqMid:3, eqHigh:-2, reverbDecay:3, reverbMix:0.5, chorusRate:2, chorusDepth:15, chorusMix:0.35, phaserRate:0.4, phaserDepth:0.3, phaserFeedback:0.5, materialType:'glass', stiffness:0.5, damping:0.5, ksDecay:0.6 }),
  data_corrupt: delta({ tag:'fx',      wave1:'square', baseFreq:500, noiseType:'white', noiseMix:0.5, wave2:'sawtooth', osc2Detune:100, osc2Mix:0.5, fmAmount:500, decay:0.15, release:0.1, pitchStart:500, pitchPeak:2000, pitchEnd:50, pitchPeakTime:0.05, filterType:'bandpass', filterCutoff:2500, filterQ:30, lfoWave:'square', lfoRate:18, lfoDepth:0.9, lfoTarget:'filter', eqLow:-6, eqMid:8, eqHigh:-6, compThreshold:-10, compRatio:15, compMakeup:10, bitcrush:2, sampleReduction:4, distortion:80, delayTime:30, delayFeedback:0.85, reverbDecay:0.2, reverbMix:0.1, pan:0.8, grainBPM:160, grainDiv:32, stutterDepth:0.9 }),
  footsteps_gravel:delta({ tag:'nature',wave1:'triangle', baseFreq:100, noiseType:'pink', noiseMix:0.5, osc2Mix:0, attack:0.01, decay:0.06, release:0.03, pitchStart:100, pitchPeak:100, pitchEnd:50, filterCutoff:4000, filterQ:2, eqLow:4, eqHigh:-4, compThreshold:-12, compRatio:4, compMakeup:2, bitcrush:14, sampleReduction:30, distortion:5, reverbDecay:0.15, reverbMix:0.05, grainBPM:160, grainDiv:16, stutterDepth:0.3 }),
  resonance_sweep:delta({ tag:'laser', wave1:'sawtooth', baseFreq:300, noiseType:'pink', noiseMix:0.2, wave2:'sine', osc2Octave:1, osc2Mix:0.15, attack:0.1, decay:0.5, release:0.3, pitchStart:300, pitchPeak:5000, pitchEnd:100, pitchPeakTime:0.4, filterType:'bandpass', filterCutoff:2000, filterQ:25, lfoRate:5, lfoDepth:0.5, lfoTarget:'filter', eqMid:5, eqHigh:-3, delayTime:80, delayFeedback:0.3, reverbDecay:1.5, reverbMix:0.2, materialType:'metal', stiffness:0.4, damping:0.7, ksDecay:0.5, pan:-0.4 }),
  horror_drone:  delta({ tag:'ambient',wave1:'sawtooth', baseFreq:40, noiseType:'pink', noiseMix:0.3, wave2:'sine', osc2Octave:-1, osc2Detune:15, osc2Mix:0.4, attack:0.5, decay:0.3, sustain:0.5, release:1.5, filterCutoff:500, filterQ:6, lfoRate:0.2, lfoDepth:0.8, lfoTarget:'filter', eqLow:6, eqMid:2, eqHigh:-8, reverbDecay:4, reverbMix:0.5, chorusRate:0.8, chorusDepth:20, chorusMix:0.4, phaserRate:0.3, phaserDepth:0.6, phaserFeedback:0.7, materialType:'glass', stiffness:0.2, damping:0.8, ksDecay:2, pan:0.2, modSrc:'lfo1', modDst:'pitch', modMatAmt:0.15 }),
  shield_hit:   delta({ tag:'impact', wave1:'triangle', baseFreq:400, noiseType:'white', noiseMix:0.4, wave2:'square', osc2Octave:1, osc2Detune:20, osc2Mix:0.3, attack:0.01, decay:0.2, release:0.1, pitchStart:400, pitchPeak:400, pitchEnd:100, filterCutoff:5000, filterQ:8, eqLow:-2, eqMid:6, eqHigh:3, compThreshold:-16, compRatio:8, compMakeup:6, distortion:20, reverbDecay:0.6, reverbMix:0.2, chugEnable:'1', chugFreq:100, chugSat:0.3, chugPunch:0.5, materialType:'metal', stiffness:0.8, damping:0.2, ksDecay:0.3, pan:-0.3 }),
};

// ─── Intensity Maps ─────────────────────────────────────────
const INTENSITY_MAPS = {
  laser: [
    { param:'baseFreq', min:400, max:2000 }, { param:'noiseMix', min:0, max:0.4 },
    { param:'pitchStart', min:800, max:3000 }, { param:'pitchEnd', min:100, max:800 },
    { param:'filterCutoff', min:4000, max:16000 }, { param:'distortion', min:0, max:40 },
    { param:'bitcrush', min:0, max:8 }, { param:'reverbMix', min:0, max:0.4 },
  ],
  impact: [
    { param:'baseFreq', min:40, max:200 }, { param:'noiseMix', min:0, max:0.8 },
    { param:'decay', min:0.1, max:1.5 }, { param:'pitchEnd', min:20, max:200 },
    { param:'filterCutoff', min:500, max:6000 }, { param:'distortion', min:0, max:50 },
    { param:'compThreshold', min:-30, max:-10 }, { param:'compMakeup', min:0, max:12 },
    { param:'reverbDecay', min:0.3, max:2.5 }, { param:'reverbMix', min:0, max:0.5 },
  ],
  ui: [
    { param:'baseFreq', min:200, max:1200 }, { param:'pitchStart', min:200, max:1000 },
    { param:'pitchEnd', min:200, max:1200 }, { param:'filterCutoff', min:3000, max:12000 },
    { param:'eqHigh', min:-3, max:6 }, { param:'reverbDecay', min:0.1, max:1.5 },
    { param:'reverbMix', min:0, max:0.3 },
  ],
  retro: [
    { param:'baseFreq', min:200, max:800 }, { param:'osc2Mix', min:0, max:0.5 },
    { param:'filterCutoff', min:3000, max:10000 }, { param:'bitcrush', min:0, max:12 },
    { param:'sampleReduction', min:22, max:48 },
  ],
  ambient: [
    { param:'baseFreq', min:40, max:300 }, { param:'noiseMix', min:0, max:0.4 },
    { param:'attack', min:0.1, max:2 }, { param:'release', min:0.3, max:3 },
    { param:'pitchStart', min:50, max:500 }, { param:'pitchEnd', min:50, max:500 },
    { param:'filterCutoff', min:1000, max:8000 }, { param:'lfoDepth', min:0, max:0.8 },
    { param:'delayTime', min:100, max:800 }, { param:'delayFeedback', min:0.2, max:0.7 },
    { param:'reverbDecay', min:1, max:4 }, { param:'reverbMix', min:0.2, max:0.6 },
  ],
  fx: [
    { param:'noiseMix', min:0, max:0.7 }, { param:'osc2Detune', min:0, max:100 },
    { param:'fmAmount', min:0, max:500 }, { param:'filterCutoff', min:500, max:6000 },
    { param:'filterQ', min:2, max:30 }, { param:'lfoRate', min:2, max:20 },
    { param:'lfoDepth', min:0, max:0.9 }, { param:'bitcrush', min:0, max:12 },
    { param:'distortion', min:0, max:70 }, { param:'delayFeedback', min:0, max:0.8 },
    { param:'reverbMix', min:0, max:0.4 },
  ],
  nature: [
    { param:'noiseMix', min:0, max:0.8 }, { param:'pitchStart', min:200, max:2000 },
    { param:'pitchEnd', min:20, max:400 }, { param:'filterCutoff', min:300, max:4000 },
    { param:'lfoRate', min:1, max:15 }, { param:'lfoDepth', min:0, max:0.7 },
    { param:'delayTime', min:50, max:400 }, { param:'delayFeedback', min:0, max:0.5 },
    { param:'reverbDecay', min:0.5, max:3 }, { param:'reverbMix', min:0.1, max:0.5 },
  ],
};
function applyIntensity(val) {
  const activeSlot = document.querySelector('.preset-slot.active');
  if (!activeSlot) return;
  const tag = activeSlot.querySelector('.preset-slot-tag')?.textContent;
  const map = INTENSITY_MAPS[tag];
  if (!map) return;
  // Find the matching preset key
  const presetName = activeSlot.querySelector('.preset-slot-name')?.textContent;
  const key = Object.keys(PRESETS).find(k => k.replace(/_/g,' ').toUpperCase() === presetName);
  const base = key ? PRESETS[key] : DEFAULT_STATE;
  map.forEach(m => {
    const baseVal = m.param in base ? base[m.param] : DEFAULT_STATE[m.param];
    S[m.param] = m.min + (m.max - m.min) * val;
    if (S[m.param] > m.max) S[m.param] = m.max;
    if (S[m.param] < m.min) S[m.param] = m.min;
  });
}

// ─── DOM ───────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const canvas = $('waveCanvas');
const ctx2d = canvas.getContext('2d');
const specCanvas = $('specCanvas');
const specCtx = specCanvas?.getContext('2d');
let animId = null;
const USER_PRESETS_KEY = 'saranta-user-presets';

// ─── Undo/Redo ─────────────────────────────────────────────
const history = [structuredClone(S)];
let historyPos = 0;
function saveState() {
  history.splice(historyPos + 1);
  history.push(structuredClone(S));
  historyPos++;
  if (history.length > 20) history.shift();
}
function undo() {
  if (historyPos <= 0) return;
  Object.assign(S, history[--historyPos]);
  updateUI();
  renderLayers();
  playSound();
}
function redo() {
  if (historyPos >= history.length - 1) return;
  Object.assign(S, history[++historyPos]);
  updateUI();
  renderLayers();
  playSound();
}

// ─── Trigger helpers ─────────────────────────────────────────
function playSound() {
  AudioEngine.resume();
  const dur = AudioEngine.triggerSound(S);
  visualize(dur);
}
function doTrigger() {
  playSound();
}

// ─── Layers ─────────────────────────────────────────────────
function saveLayer(idx) {
  const full = structuredClone(S);
  delete full.layers; delete full.activeLayer;
  S.layers[idx].state = full;
}
function loadLayer(idx) {
  const l = S.layers[idx];
  if (!l) return;
  saveLayer(S.activeLayer);
  S.activeLayer = idx;
  Object.keys(l.state).forEach(k => { S[k] = l.state[k]; });
  Object.keys(DEFAULT_STATE).forEach(k => {
    if (k === 'layers' || k === 'activeLayer') return;
    if (!(k in l.state)) S[k] = DEFAULT_STATE[k];
  });
  updateUI();
  renderLayers();
}
function renderLayers() {
  const strip = $('layerStrip');
  if (!strip) return;
  strip.innerHTML = '';
  S.layers.forEach((l, i) => {
    const el = document.createElement('div');
    el.className = 'layer-item' + (i === S.activeLayer ? ' active' : '');
    el.innerHTML = `
      <span class="layer-name">${l.name}</span>
      <input type="range" class="layer-vol-slider" min="0" max="1" step="0.01" value="${l.volume}">
      <span class="layer-vol">${Math.round(l.volume*100)}%</span>
      <button class="layer-mute">${l.mute ? '🔇' : '🔊'}</button>
      <button class="layer-del">&times;</button>`;
    el.addEventListener('click', e => {
      if (e.target.closest('button') || e.target.closest('input')) return;
      loadLayer(i);
    });
    el.querySelector('.layer-vol-slider').addEventListener('input', e => {
      e.stopPropagation();
      S.layers[i].volume = +e.target.value;
      renderLayers();
    });
    el.querySelector('.layer-mute').addEventListener('click', e => {
      e.stopPropagation();
      if (S.layers.length <= 1) return;
      S.layers.splice(i, 1);
      if (S.activeLayer >= S.layers.length) S.activeLayer = S.layers.length - 1;
      else if (S.activeLayer > i) S.activeLayer--;
      loadLayer(S.activeLayer);
    });
    strip.appendChild(el);
  });
}
function addLayer() {
  const idx = S.layers.length;
  const cleanState = structuredClone(DEFAULT_STATE);
  delete cleanState.layers; delete cleanState.activeLayer;
  S.layers.push({name:`Layer ${idx+1}`, volume:1, mute:false, state:cleanState});
  renderLayers();
}
function playAllLayers() {
  AudioEngine.resume();
  const t = AudioEngine.ctx.currentTime + 0.01;
  const dur = AudioEngine.dur(S);
  AudioEngine.triggerAll(S.layers, t, dur);
  visualize(dur);
}

// ─── Bind UI ───────────────────────────────────────────────
function bind() {
  // Wave buttons
  document.querySelectorAll('#wave1Btns .wave-btn').forEach(b => {
    b.addEventListener('click', () => {
      S.wave1 = b.dataset.v;
      document.querySelectorAll('#wave1Btns .wave-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    });
  });
  document.querySelectorAll('#wave2Btns .wave-btn').forEach(b => {
    b.addEventListener('click', () => {
      S.wave2 = b.dataset.v;
      document.querySelectorAll('#wave2Btns .wave-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    });
  });
  document.querySelectorAll('#modWaveBtns .wave-btn').forEach(b => {
    b.addEventListener('click', () => {
      S.modWave = b.dataset.v;
      document.querySelectorAll('#modWaveBtns .wave-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    });
  });

  // Sliders
  const sliders = [
    ['baseFreq','baseFreq',v=>+v,v=>Math.round(v)], ['noiseMix','noiseMix',v=>+v,v=>v.toFixed(2)],
    ['osc2Octave','osc2Octave',v=>+v,v=>v], ['osc2Detune','osc2Detune',v=>+v,v=>Math.round(v)],
    ['osc2Mix','osc2Mix',v=>+v,v=>v.toFixed(2)], ['fmAmount','fmAmount',v=>+v,v=>Math.round(v)],
    ['modFreq','modFreq',v=>+v,v=>Math.round(v)], ['modAmount','modAmount',v=>+v,v=>Math.round(v)],
    ['rmAmount','rmAmount',v=>+v,v=>v.toFixed(2)],
    ['attack','attack',v=>+v,v=>v.toFixed(2)], ['decay','decay',v=>+v,v=>v.toFixed(2)],
    ['sustain','sustain',v=>+v,v=>v.toFixed(2)], ['release','release',v=>+v,v=>v.toFixed(2)],
    ['pitchStart','pitchStart',v=>+v,v=>Math.round(v)], ['pitchPeak','pitchPeak',v=>+v,v=>Math.round(v)],
    ['pitchEnd','pitchEnd',v=>+v,v=>Math.round(v)], ['pitchPeakTime','pitchPeakTime',v=>+v,v=>v.toFixed(2)],
    ['filterCutoff','filterCutoff',v=>+v,v=>Math.round(v)], ['filterQ','filterQ',v=>+v,v=>v.toFixed(1)],
    ['lfoRate','lfoRate',v=>+v,v=>v.toFixed(1)], ['lfoDepth','lfoDepth',v=>+v,v=>v.toFixed(2)],
    ['lfoCycles','lfoCycles',v=>+v,v=>v.toFixed(1)],
    ['eqLow','eqLow',v=>+v,v=>(v>0?'+':'')+Math.round(v)], ['eqMid','eqMid',v=>+v,v=>(v>0?'+':'')+Math.round(v)],
    ['eqHigh','eqHigh',v=>+v,v=>(v>0?'+':'')+Math.round(v)], ['compThreshold','compThreshold',v=>+v,v=>Math.round(v)],
    ['compRatio','compRatio',v=>+v,v=>v.toFixed(1)], ['compMakeup','compMakeup',v=>+v,v=>Math.round(v)],
    ['bitcrush','bitcrush',v=>+v,v=>v+'-bit'], ['sampleReduction','sampleReduction',v=>+v,v=>v+'k'],
    ['distortion','distortion',v=>+v,v=>Math.round(v)], ['delayTime','delayTime',v=>+v,v=>Math.round(v)],
    ['delayFeedback','delayFeedback',v=>+v,v=>v.toFixed(2)], ['reverbDecay','reverbDecay',v=>+v,v=>v.toFixed(1)],
    ['reverbMix','reverbMix',v=>+v,v=>v.toFixed(2)], ['chorusRate','chorusRate',v=>+v,v=>v.toFixed(1)],
    ['chorusDepth','chorusDepth',v=>+v,v=>v.toFixed(1)], ['chorusMix','chorusMix',v=>+v,v=>v.toFixed(2)],
    ['phaserRate','phaserRate',v=>+v,v=>v.toFixed(1)], ['phaserDepth','phaserDepth',v=>+v,v=>v.toFixed(2)],
    ['phaserFeedback','phaserFeedback',v=>+v,v=>v.toFixed(2)], ['pan','pan',v=>+v,v=>v.toFixed(2)],
    ['noiseCutoffStart','noiseCutoffStart',v=>+v,v=>Math.round(v)], ['noiseCutoffEnd','noiseCutoffEnd',v=>+v,v=>Math.round(v)],
    ['noiseResonance','noiseResonance',v=>+v,v=>v.toFixed(1)], ['hardClip','hardClip',v=>+v,v=>v.toFixed(2)],
    // Spatial
    ['dopplerAmt','dopplerAmt',v=>+v,v=>v.toFixed(2)], ['hrtfPan','hrtfPan',v=>+v,v=>v.toFixed(2)],
    ['distance','distance',v=>+v,v=>Math.round(v)], ['airAbsorb','airAbsorb',v=>+v,v=>v.toFixed(2)],
    // Advanced
    ['stiffness','stiffness',v=>+v,v=>v.toFixed(2)], ['damping','damping',v=>+v,v=>v.toFixed(2)], ['ksDecay','ksDecay',v=>+v,v=>v.toFixed(2)],
    ['grainBPM','grainBPM',v=>+v,v=>Math.round(v)], ['stutterDepth','stutterDepth',v=>+v,v=>v.toFixed(2)],
    ['chugFreq','chugFreq',v=>+v,v=>Math.round(v)], ['chugSat','chugSat',v=>+v,v=>v.toFixed(2)], ['chugPunch','chugPunch',v=>+v,v=>v.toFixed(2)],
    ['modMatAmt','modMatAmt',v=>+v,v=>v.toFixed(2)],
    // Export
    ['atlasCount','atlasCount',v=>+v,v=>Math.round(v)], ['atlasGap','atlasGap',v=>+v,v=>v.toFixed(2)],
    ['intensity','intensity',v=>+v,v=>v.toFixed(2)],
  ];
  sliders.forEach(([id,key,parse,fmt])=>{
    const el=$(id); if(!el)return;
    el.addEventListener('input',()=>{ S[key]=parse(el.value); const ve=$('v-'+id); if(ve)ve.textContent=fmt(S[key]); });
  });

  // Selects
  ['noiseType','filterType','lfoWave','lfoTarget','exportFormat','envCurve','lfoMode',
   'envPreset','materialType','grainDiv','chugEnable','modSrc','modDst','spriteFormat'].forEach(id=>{
    const el=$(id); if(el)el.addEventListener('change',()=>{ S[id]=el.value; });
  });

  // Checkboxes
  const normCb = $('normalize');
  if (normCb) normCb.addEventListener('change', () => { S.normalize = normCb.checked; });

  // Tabs
  document.querySelectorAll('.fx-tab').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.fx-tab').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.fx-panel').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active'); const panel = $('panel-'+btn.dataset.tab); if (panel) panel.classList.add('active');
      setTimeout(resizeCanvas,50);
      if(btn.dataset.tab==='spatial') setTimeout(resizeTrajCanvas,200);
    });
  });

  // Trigger
  const btnT = $('btnTrigger');
  if (btnT) btnT.addEventListener('click', ()=>{ saveState(); doTrigger(); });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON') return;
    if (e.code === 'Space') { e.preventDefault(); saveState(); doTrigger(); }
    if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey) { saveState(); if (btnR) btnR.click(); }
    if (e.code === 'KeyM' && !e.ctrlKey && !e.metaKey) { saveState(); if (btnM) btnM.click(); }
    if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey) && !e.shiftKey) { e.preventDefault(); undo(); }
    if ((e.code === 'KeyZ' && (e.ctrlKey || e.metaKey) && e.shiftKey) || (e.code === 'KeyY' && (e.ctrlKey || e.metaKey))) { e.preventDefault(); redo(); }
  });

  // Export
  const btnE = $('btnExport');
  if (btnE) btnE.addEventListener('click',async()=>{
    btnE.textContent='...'; btnE.disabled=true;
    try{ await AudioEngine.exportSound(S,S.exportFormat); }catch(e){ console.error(e); }
    btnE.textContent='EXPORT'; btnE.disabled=false;
  });

  // Random
  const btnR = $('btnRandom');
  if (btnR) btnR.addEventListener('click',()=>{
    saveState(); randomize(); updateUI();
    doTrigger();
  });

  // Mutate
  const btnM = $('btnMutate');
  if (btnM) btnM.addEventListener('click',()=>{
    saveState(); mutate(); updateUI();
    doTrigger();
  });

  // Save to localStorage (MY PRESETS)
  const btnS = $('btnSave');
  if (btnS) btnS.addEventListener('click',()=>{
    const name = prompt('Preset name:', '');
    if (!name) return;
    const saveState = structuredClone(S);
    delete saveState.layers; delete saveState.activeLayer;
    const presets = JSON.parse(localStorage.getItem(USER_PRESETS_KEY) || '{}');
    presets[name] = saveState;
    localStorage.setItem(USER_PRESETS_KEY, JSON.stringify(presets));
    renderUserPresets();
  });
  const btnL = $('btnLoad');
  if (btnL) btnL.addEventListener('click',()=>$('fileInput').click());
  const fileIn = $('fileInput');
  if (fileIn) fileIn.addEventListener('change',e=>{
    if(!e.target.files[0])return;
    const r=new FileReader();
    r.onload=ev=>{ try{ Object.assign(S,JSON.parse(ev.target.result)); updateUI(); }catch(err){} };
    r.readAsText(e.target.files[0]); e.target.value='';
  });

  // Preset search
  const pSearch = $('presetSearch');
  if (pSearch) pSearch.addEventListener('input',e=>renderPresets(e.target.value));

  // Theme toggle
  const themeBtn = $('btnTheme');
  if (!themeBtn) return;
  const lightIcon = themeBtn.querySelector('.theme-icon-light');
  const darkIcon = themeBtn.querySelector('.theme-icon-dark');
  function updateThemeIcons() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (lightIcon) lightIcon.style.display = isLight ? 'block' : 'none';
    if (darkIcon) darkIcon.style.display = isLight ? 'none' : 'block';
  }
  themeBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const isLight = html.getAttribute('data-theme') === 'light';
    if (isLight) {
      html.removeAttribute('data-theme');
      localStorage.setItem('saranta-theme', 'dark');
    } else {
      html.setAttribute('data-theme', 'light');
      localStorage.setItem('saranta-theme', 'light');
    }
    updateThemeIcons();
  });

  // Trajectory Canvas
  bindTrajectory();

  // Intensity Macro
  const btnIntensity = $('btnApplyIntensity');
  if (btnIntensity) btnIntensity.addEventListener('click', () => {
    saveState();
    applyIntensity(S.intensity);
    updateUI();
    doTrigger();
  });

  // Morph
  const morphA = $('morphA'), morphB = $('morphB'), morphAmt = $('morphAmt');
  if (morphA && morphB) {
    const names = Object.keys(PRESETS);
    names.forEach(n => { morphA.innerHTML += `<option value="${n}">${n.replace(/_/g,' ').toUpperCase()}</option>`; });
    names.forEach(n => { morphB.innerHTML += `<option value="${n}">${n.replace(/_/g,' ').toUpperCase()}</option>`; });
    morphB.value = names[1] || names[0];
  }
  if (morphAmt) morphAmt.addEventListener('input', () => { const v=$('v-morphAmt'); if(v) v.textContent=(+morphAmt.value).toFixed(2); });
  const btnMorph = $('btnMorph');
  if (btnMorph && morphA && morphB) btnMorph.addEventListener('click', () => {
    const pa = PRESETS[morphA.value], pb = PRESETS[morphB.value];
    if (!pa || !pb) return;
    const amt = +morphAmt.value;
    const blended = {};
    Object.keys(DEFAULT_STATE).forEach(k => {
      if (k === 'layers' || k === 'activeLayer') return;
      const va = pa[k], vb = pb[k];
      if (typeof va === 'number' && typeof vb === 'number') {
        blended[k] = va + (vb - va) * amt;
      } else {
        blended[k] = amt < 0.5 ? va : vb;
      }
    });
    saveState();
    Object.assign(S, blended);
    updateUI();
    doTrigger();
  });

  // Atlas Export
  const btnAtlas = $('btnAtlas');
  if (btnAtlas) btnAtlas.addEventListener('click', () => {
    btnAtlas.textContent = '...'; btnAtlas.disabled = true;
    AudioEngine.exportAtlas(S).then(() => {
      btnAtlas.textContent = 'GENERATE ATLAS'; btnAtlas.disabled = false;
    }).catch(() => {
      btnAtlas.textContent = 'GENERATE ATLAS'; btnAtlas.disabled = false;
    });
  });

  // Layers
  const btnAddLayer = $('btnAddLayer');
  if (btnAddLayer) btnAddLayer.addEventListener('click', addLayer);
  const btnPlayAll = $('btnPlayAll');
  if (btnPlayAll) btnPlayAll.addEventListener('click', playAllLayers);

  // Batch Export All
  const btnExportAll = $('btnExportAll');
  if (btnExportAll) btnExportAll.addEventListener('click', async () => {
    btnExportAll.textContent = '...'; btnExportAll.disabled = true;
    try {
      for (const name of Object.keys(PRESETS)) {
        const p = PRESETS[name];
        const fname = `saranta_${name}.wav`;
        // Ensure envPreset, materialType, chugEnable etc are propagated from preset defaults
        const state = { ...structuredClone(DEFAULT_STATE), ...p };
        await AudioEngine.exportSound(state, 'wav', fname);
      }
    } catch (e) { console.error(e); }
    btnExportAll.textContent = 'EXPORT ALL PRESETS'; btnExportAll.disabled = false;
  });
}

function updateUI() {
  document.querySelectorAll('#wave1Btns .wave-btn').forEach(b=>b.classList.toggle('active',b.dataset.v===S.wave1));
  document.querySelectorAll('#wave2Btns .wave-btn').forEach(b=>b.classList.toggle('active',b.dataset.v===S.wave2));
  document.querySelectorAll('#modWaveBtns .wave-btn').forEach(b=>b.classList.toggle('active',b.dataset.v===S.modWave));
  Object.keys(S).forEach(id=>{ const el=$(id); if(el)el.value=S[id]; });
  document.querySelectorAll('input[type="range"]').forEach(el=>{
    if($('v-'+el.id)) el.dispatchEvent(new Event('input'));
  });
}

function mutate() {
  const vary = (val, min, max, pct) => {
    const range = (max - min) * pct;
    const newVal = val + (Math.random() - 0.5) * 2 * range;
    return Math.max(min, Math.min(max, newVal));
  };
  S.baseFreq = vary(S.baseFreq, 20, 4000, 0.02);
  S.osc2Mix = vary(S.osc2Mix, 0, 1, 0.03);
  S.osc2Detune = vary(S.osc2Detune, -1200, 1200, 0.02);
  S.fmAmount = vary(S.fmAmount, 0, 1000, 0.03);
  S.modFreq = vary(S.modFreq, 20, 4000, 0.03);
  S.modAmount = vary(S.modAmount, 0, 2000, 0.03);
  S.rmAmount = vary(S.rmAmount, 0, 1, 0.02);
  S.attack = vary(S.attack, 0, 2, 0.03);
  S.decay = vary(S.decay, 0.01, 2, 0.03);
  S.sustain = vary(S.sustain, 0, 1, 0.03);
  S.release = vary(S.release, 0.01, 3, 0.03);
  S.filterCutoff = vary(S.filterCutoff, 20, 20000, 0.03);
  S.filterQ = vary(S.filterQ, 0.1, 30, 0.03);
  S.lfoRate = vary(S.lfoRate, 0.1, 20, 0.03);
  S.lfoDepth = vary(S.lfoDepth, 0, 1, 0.03);
  S.lfoCycles = vary(S.lfoCycles, 0.5, 10, 0.03);
  S.noiseMix = vary(S.noiseMix, 0, 1, 0.03);
  S.noiseCutoffStart = vary(S.noiseCutoffStart, 20, 20000, 0.03);
  S.noiseCutoffEnd = vary(S.noiseCutoffEnd, 20, 20000, 0.03);
  S.noiseResonance = vary(S.noiseResonance, 0.1, 30, 0.03);
  S.distortion = vary(S.distortion, 0, 100, 0.03);
  S.hardClip = vary(S.hardClip, 0, 1, 0.02);
  S.bitcrush = Math.round(vary(S.bitcrush, 0, 16, 0.05));
  S.sampleReduction = Math.round(vary(S.sampleReduction, 1, 48, 0.03));
  S.delayTime = vary(S.delayTime, 0, 1000, 0.03);
  S.delayFeedback = vary(S.delayFeedback, 0, 0.9, 0.03);
  S.reverbDecay = vary(S.reverbDecay, 0, 5, 0.03);
  S.reverbMix = vary(S.reverbMix, 0, 1, 0.03);
  S.pan = vary(S.pan, -1, 1, 0.03);
  S.eqLow = vary(S.eqLow, -12, 12, 0.05);
  S.eqMid = vary(S.eqMid, -12, 12, 0.05);
  S.eqHigh = vary(S.eqHigh, -12, 12, 0.05);
  S.compThreshold = vary(S.compThreshold, -60, 0, 0.05);
  S.compRatio = vary(S.compRatio, 1, 20, 0.05);
  S.compMakeup = vary(S.compMakeup, 0, 24, 0.05);
  S.chorusRate = vary(S.chorusRate, 0, 10, 0.05);
  S.chorusDepth = vary(S.chorusDepth, 0, 30, 0.05);
  S.chorusMix = vary(S.chorusMix, 0, 1, 0.05);
  S.phaserRate = vary(S.phaserRate, 0, 10, 0.05);
  S.phaserDepth = vary(S.phaserDepth, 0, 1, 0.05);
  S.phaserFeedback = vary(S.phaserFeedback, 0, 0.9, 0.05);
}

function randomize() {
  const savedLayers = S.layers; const savedActive = S.activeLayer;
  Object.assign(S, structuredClone(DEFAULT_STATE));
  S.layers = savedLayers; S.activeLayer = savedActive;
  const waves=['sine','square','sawtooth','triangle'], ftypes=['lowpass','highpass','bandpass','notch'];
  S.wave1=waves[Math.floor(Math.random()*4)]; S.wave2=waves[Math.floor(Math.random()*4)];
  S.baseFreq=50+Math.random()*2000; S.noiseType=['none','white','pink'][Math.floor(Math.random()*3)]; S.noiseMix=Math.random()*0.5;
  S.osc2Octave=Math.floor(Math.random()*5)-2; S.osc2Detune=(Math.random()-0.5)*100; S.osc2Mix=Math.random()*0.6; S.fmAmount=Math.random()*500;
  S.modWave=waves[Math.floor(Math.random()*4)]; S.modFreq=50+Math.random()*2000; S.modAmount=Math.random()*800; S.rmAmount=Math.random()*0.6;
  S.filterType=ftypes[Math.floor(Math.random()*4)]; S.filterCutoff=200+Math.random()*15000; S.filterQ=0.5+Math.random()*15;
  S.lfoRate=0.5+Math.random()*15; S.lfoDepth=Math.random()*0.8; S.lfoTarget=['pitch','volume','filter'][Math.floor(Math.random()*3)]; S.lfoMode=['free','oneshot'][Math.floor(Math.random()*2)]; S.lfoCycles=0.5+Math.random()*5;
  S.attack=Math.random()*0.3; S.decay=0.05+Math.random()*0.8; S.sustain=Math.random(); S.release=0.05+Math.random()*0.8; S.envCurve=['linear','exponential'][Math.floor(Math.random()*2)];
  S.pitchStart=50+Math.random()*2000; S.pitchPeak=50+Math.random()*3000; S.pitchEnd=30+Math.random()*1500; S.pitchPeakTime=Math.random();
  S.distortion=Math.random()*40; S.delayTime=Math.random()*300; S.delayFeedback=Math.random()*0.5; S.reverbDecay=Math.random()*2; S.reverbMix=Math.random()*0.4;
  S.noiseCutoffStart=200+Math.random()*15000; S.noiseCutoffEnd=200+Math.random()*15000; S.noiseResonance=0.5+Math.random()*15;
  S.hardClip=Math.random()*0.5;
  S.eqLow=(Math.random()-0.5)*24; S.eqMid=(Math.random()-0.5)*24; S.eqHigh=(Math.random()-0.5)*24;
  S.compThreshold=-60+Math.random()*60; S.compRatio=1+Math.random()*19; S.compMakeup=Math.random()*24;
  S.bitcrush=Math.floor(Math.random()*17); S.sampleReduction=1+Math.floor(Math.random()*48);
  S.chorusRate=Math.random()*6; S.chorusDepth=Math.random()*20; S.chorusMix=Math.random()*0.5;
  S.phaserRate=Math.random()*6; S.phaserDepth=Math.random()*0.8; S.phaserFeedback=Math.random()*0.6;
  S.pan=(Math.random()-0.5)*2;
}

// ─── Preset list ───────────────────────────────────────────
function renderPresets(filter='') {
  const list=$('presetList'); list.innerHTML='';
  const tags = {};
  Object.keys(PRESETS).forEach(k=>{
    const p=PRESETS[k]; const tag = p.tag || 'other';
    if (!tags[tag]) tags[tag] = [];
    tags[tag].push(k);
  });
  const tagOrder = ['ui','impact','laser','retro','ambient','nature','fx'];
  tagOrder.forEach(tag => {
    if (!tags[tag]) return;
    const matching = tags[tag].filter(k => {
      if (!filter) return true;
      const name=k.replace(/_/g,' ').toUpperCase();
      return name.toLowerCase().includes(filter.toLowerCase()) || tag.toLowerCase().includes(filter.toLowerCase());
    });
    if (matching.length === 0) return;
    const header = document.createElement('div');
    header.className = 'preset-tag-header'; header.textContent = tag.toUpperCase();
    list.appendChild(header);
    matching.forEach(k => {
      const p=PRESETS[k];
      const name=k.replace(/_/g,' ').toUpperCase();
      const btn=document.createElement('div');
      btn.className='preset-slot';
      btn.innerHTML=`<span class="preset-slot-name">${name}</span>`;
      btn.addEventListener('click',()=>{
        document.querySelectorAll('.preset-slot').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const savedLayers = S.layers; const savedActive = S.activeLayer;
        Object.assign(S,structuredClone(DEFAULT_STATE),p);
        S.layers = savedLayers; S.activeLayer = savedActive;
        updateUI();
        playSound();
      });
      list.appendChild(btn);
    });
  });
}

// ─── User Presets ────────────────────────────────────────────
function renderUserPresets() {
  const list = $('userPresetList');
  if (!list) return;
  const presets = JSON.parse(localStorage.getItem(USER_PRESETS_KEY) || '{}');
  const names = Object.keys(presets);
  list.innerHTML = '<div class="user-presets-header">MY PRESETS</div>';
  if (names.length === 0) {
    list.innerHTML += '<div class="user-presets-empty">No saved presets</div>';
    return;
  }
  names.forEach(name => {
    const el = document.createElement('div');
    el.className = 'preset-slot user-preset-slot';
    el.innerHTML = `<span class="preset-slot-name">${name}</span>
      <span class="user-preset-actions">
        <button class="user-preset-del" data-name="${name}">&times;</button>
      </span>`;
    el.addEventListener('click', () => {
      const presets = JSON.parse(localStorage.getItem(USER_PRESETS_KEY) || '{}');
      const p = presets[name];
      if (!p) return;
      document.querySelectorAll('.preset-slot').forEach(b => b.classList.remove('active'));
      el.classList.add('active');
      const savedLayers = S.layers; const savedActive = S.activeLayer;
      Object.assign(S, structuredClone(DEFAULT_STATE), p);
      S.layers = savedLayers; S.activeLayer = savedActive;
      updateUI();
      playSound();
    });
    el.querySelector('.user-preset-del').addEventListener('click', e => {
      e.stopPropagation();
      const presets = JSON.parse(localStorage.getItem(USER_PRESETS_KEY) || '{}');
      delete presets[name];
      localStorage.setItem(USER_PRESETS_KEY, JSON.stringify(presets));
      renderUserPresets();
    });
    list.appendChild(el);
  });
}

// ─── Visualizer ────────────────────────────────────────────
// ─── Trajectory Canvas ─────────────────────────────────────
let trajPoints = [];
let trajDrawing = false;
const trajCanvas = document.getElementById('trajCanvas');
let trajCtx = null;

function resizeTrajCanvas() {
  if(!trajCanvas) return;
  const rect = trajCanvas.parentElement.getBoundingClientRect();
  if(rect.width>0 && rect.height>0){ trajCanvas.width=rect.width; trajCanvas.height=rect.height; }
  else { trajCanvas.width=300; trajCanvas.height=180; }
  drawTrajectory();
}
function drawTrajectory() {
  if(!trajCanvas || !trajCtx) return;
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg2').trim();
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  const dim = getComputedStyle(document.documentElement).getPropertyValue('--dim').trim();
  trajCtx.fillStyle = bg;
  trajCtx.fillRect(0,0,trajCanvas.width,trajCanvas.height);
  // Crosshair
  trajCtx.strokeStyle = dim; trajCtx.lineWidth = 0.5; trajCtx.setLineDash([4,4]);
  trajCtx.beginPath(); trajCtx.moveTo(trajCanvas.width/2,0); trajCtx.lineTo(trajCanvas.width/2,trajCanvas.height); trajCtx.stroke();
  trajCtx.beginPath(); trajCtx.moveTo(0,trajCanvas.height/2); trajCtx.lineTo(trajCanvas.width,trajCanvas.height/2); trajCtx.stroke();
  trajCtx.setLineDash([]);
  // Path
  if(trajPoints.length>=2){
    trajCtx.strokeStyle = accent; trajCtx.lineWidth = 2; trajCtx.beginPath();
    trajPoints.forEach((p,i)=>{ const x=p.x*trajCanvas.width, y=p.y*trajCanvas.height; i===0?trajCtx.moveTo(x,y):trajCtx.lineTo(x,y); });
    trajCtx.stroke();
  }
  // Points
  trajPoints.forEach(p=>{
    trajCtx.fillStyle = accent;
    trajCtx.beginPath(); trajCtx.arc(p.x*trajCanvas.width,p.y*trajCanvas.height,3,0,Math.PI*2); trajCtx.fill();
  });
  // Instruction text
  if(trajPoints.length===0){
    trajCtx.fillStyle = dim; trajCtx.font = '10px "Space Mono", monospace';
    trajCtx.textAlign = 'center';     trajCtx.fillText('DRAW PATH', trajCanvas.width/2, trajCanvas.height/2+4);
  }
}
function getDopplerFromTraj() {
  if(trajPoints.length<2) return 0;
  const last = trajPoints[trajPoints.length-1];
  const prev = trajPoints[trajPoints.length-2];
  const dx = (last.x-prev.x)*trajCanvas.width;
  const dy = (last.y-prev.y)*trajCanvas.height;
  const dt = Math.max(1, last.t-prev.t);
  const speed = Math.sqrt(dx*dx+dy*dy)/dt;
  // Approaching = positive detune, receding = negative
  const dir = dx; // left-right motion
  return (dir>0?-1:1) * Math.min(speed*0.5, 500) * S.dopplerAmt;
}
function getHRTFPosition() {
  if(trajPoints.length===0) return {x:0,y:0,z:0};
  const p = trajPoints[trajPoints.length-1];
  return {x:(p.x-0.5)*2, y:(p.y-0.5)*2, z:-1};
}
function bindTrajectory() {
  if(!trajCanvas) return;
  trajCtx = trajCanvas.getContext('2d');
  trajCanvas.addEventListener('pointerdown',e=>{ e.preventDefault(); trajDrawing=true; trajPoints=[]; const r=trajCanvas.getBoundingClientRect(); trajPoints.push({x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height,t:Date.now()}); drawTrajectory(); });
  trajCanvas.addEventListener('pointermove',e=>{ if(!trajDrawing) return; e.preventDefault(); const r=trajCanvas.getBoundingClientRect(); trajPoints.push({x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height,t:Date.now()}); drawTrajectory(); });
  trajCanvas.addEventListener('pointerup',()=>{ trajDrawing=false; });
  trajCanvas.addEventListener('pointerleave',()=>{ trajDrawing=false; });
  trajCanvas.style.touchAction = 'none';
  const btnClear = $('btnClearTraj');
  if(btnClear) btnClear.addEventListener('click',()=>{ trajPoints=[]; drawTrajectory(); });
}

// Expose to global scope for AudioEngine (ES module scope)
window.getDopplerFromTraj = getDopplerFromTraj;
window.getHRTFPosition = getHRTFPosition;

function themeColors() {
  const s = getComputedStyle(document.documentElement);
  return {
    bg: s.getPropertyValue('--bg2').trim(),
    border: s.getPropertyValue('--border').trim(),
    accent: s.getPropertyValue('--accent').trim(),
    accent3: s.getPropertyValue('--accent3').trim(),
  };
}
function resizeCanvas() {
  const rect=canvas.parentElement.getBoundingClientRect();
  if(rect.width>0 && rect.height>0){ canvas.width=rect.width; canvas.height=rect.height; }
}
function resizeSpecCanvas() {
  if (!specCanvas) return;
  const parent = specCanvas.parentElement;
  const w = parent ? parent.getBoundingClientRect().width : 300;
  specCanvas.width = w; specCanvas.height = 60;
}
function visualize(duration) {
  resizeCanvas();
  resizeSpecCanvas();
  const analyser=AudioEngine.getAnalyser(); if(!analyser)return;
  const bufLen=analyser.frequencyBinCount, data=new Float32Array(bufLen);
  const freqData=new Float32Array(bufLen);
  const end=Date.now()+(duration+0.3)*1000;
  const colors=themeColors();
  if(animId)cancelAnimationFrame(animId);
  function draw() {
    if(Date.now()>end){ clearCanvas(); spectrumClear(); return; }
    animId=requestAnimationFrame(draw); analyser.getFloatTimeDomainData(data);
    // Waveform
    ctx2d.fillStyle=colors.bg; ctx2d.fillRect(0,0,canvas.width,canvas.height);
    ctx2d.strokeStyle=colors.border; ctx2d.globalAlpha=0.4; ctx2d.lineWidth=0.5;
    ctx2d.beginPath(); ctx2d.moveTo(0,canvas.height/2); ctx2d.lineTo(canvas.width,canvas.height/2); ctx2d.stroke();
    ctx2d.globalAlpha=1.0;
    const grad=ctx2d.createLinearGradient(0,0,canvas.width,0);
    grad.addColorStop(0,colors.accent3); grad.addColorStop(0.5,colors.accent); grad.addColorStop(1,colors.accent3);
    ctx2d.strokeStyle=grad; ctx2d.lineWidth=2; ctx2d.shadowColor=colors.accent; ctx2d.shadowBlur=10; ctx2d.beginPath();
    const sw=canvas.width/bufLen;
    for(let i=0,x=0;i<bufLen;i++,x+=sw){ const y=(data[i]*0.5+0.5)*canvas.height; i===0?ctx2d.moveTo(x,y):ctx2d.lineTo(x,y); }
    ctx2d.stroke(); ctx2d.shadowBlur=0;
    // Spectrum
    if (specCtx) {
      analyser.getFloatFrequencyData(freqData);
      const bw = specCanvas.width / bufLen;
      specCtx.fillStyle = colors.bg;
      specCtx.fillRect(0, 0, specCanvas.width, specCanvas.height);
      specCtx.fillStyle = colors.accent;
      for (let i = 0; i < bufLen; i++) {
        const h = (freqData[i] + 140) / 140 * specCanvas.height;
        if (h > 0) specCtx.fillRect(i * bw, specCanvas.height - h, Math.max(1, bw - 1), h);
      }
    }
  }
  draw();
}
function clearCanvas() {
  const colors=themeColors();
  ctx2d.fillStyle=colors.bg; ctx2d.fillRect(0,0,canvas.width,canvas.height);
  ctx2d.strokeStyle=colors.border; ctx2d.globalAlpha=0.4; ctx2d.lineWidth=0.5;
  ctx2d.beginPath(); ctx2d.moveTo(0,canvas.height/2); ctx2d.lineTo(canvas.width,canvas.height/2); ctx2d.stroke();
  ctx2d.globalAlpha=1.0;
}
function spectrumClear() {
  if (!specCtx || !specCanvas) return;
  const colors=themeColors();
  specCtx.fillStyle=colors.bg;
  specCtx.fillRect(0,0,specCanvas.width,specCanvas.height);
}

// ─── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  console.log('DOM LOADED');
  const storedTheme = localStorage.getItem('saranta-theme');
  if (storedTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');
  else if (!storedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  try {
    bind(); console.log('BIND OK');
    renderPresets(); console.log('PRESETS OK');
    updateUI(); console.log('UI OK');
    renderLayers(); console.log('LAYERS OK');
    renderUserPresets(); console.log('USER PRESETS OK');
    resizeCanvas(); clearCanvas();
    resizeSpecCanvas(); spectrumClear();
    resizeTrajCanvas(); console.log('TRAJ OK');
  } catch (err) {
    console.error('INIT ERROR:', err);
  }
  const lightIcon = document.querySelector('.theme-icon-light');
  const darkIcon = document.querySelector('.theme-icon-dark');
  if(lightIcon && darkIcon){
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    lightIcon.style.display = isLight ? 'block' : 'none';
    darkIcon.style.display = isLight ? 'none' : 'block';
  }
});
