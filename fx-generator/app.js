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
  // Export
  atlasCount:10, atlasGap:0.1
};

// ─── Presets with tags ─────────────────────────────────────
const PRESETS = {
  laser:      {tag:'laser',    wave1:'sawtooth', baseFreq:880,  noiseType:'white', noiseMix:0.15, wave2:'sine',   osc2Octave:1,  osc2Detune:0,   osc2Mix:0.2,  fmAmount:0,    attack:0,    decay:0.2,  sustain:0,   release:0.1,  pitchStart:2000, pitchPeak:2000, pitchEnd:100,  pitchPeakTime:0,   filterType:'lowpass',  filterCutoff:8000,  filterQ:2,  lfoWave:'sine', lfoRate:10, lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:0,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:0,   delayFeedback:0,  reverbDecay:0,   reverbMix:0,    chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  explosion:  {tag:'impact',   wave1:'sawtooth', baseFreq:80,   noiseType:'white', noiseMix:0.85, wave2:'square', osc2Octave:-1, osc2Detune:0,   osc2Mix:0.3,  fmAmount:0,    attack:0,    decay:0.8,  sustain:0.1, release:0.3,  pitchStart:150,  pitchPeak:150,  pitchEnd:40,   pitchPeakTime:0,   filterType:'lowpass',  filterCutoff:2000,  filterQ:5,  lfoWave:'sine', lfoRate:3,  lfoDepth:0.3, lfoTarget:'filter', eqLow:3,  eqMid:-2, eqHigh:-6, compThreshold:-20, compRatio:8,  compMakeup:6,  bitcrush:8,  sampleReduction:12,  distortion:20,  delayTime:100, delayFeedback:0.3,reverbDecay:1.5, reverbMix:0.3,  chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  jump:       {tag:'ui',       wave1:'square',   baseFreq:300,  noiseType:'none',  noiseMix:0,    wave2:'triangle',osc2Octave:0,  osc2Detune:5,   osc2Mix:0.15, fmAmount:0,    attack:0.05, decay:0.1,  sustain:0,   release:0.05, pitchStart:150,  pitchPeak:800,  pitchEnd:600,  pitchPeakTime:0.2, filterType:'lowpass',  filterCutoff:5000,  filterQ:1,  lfoWave:'sine', lfoRate:8,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:0,  eqHigh:2,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:0,   delayFeedback:0,  reverbDecay:0,   reverbMix:0,    chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  powerup:    {tag:'ui',       wave1:'sine',     baseFreq:220,  noiseType:'none',  noiseMix:0,    wave2:'sine',   osc2Octave:1,  osc2Detune:0,   osc2Mix:0.4,  fmAmount:50,   attack:0.6,  decay:0.1,  sustain:0.8, release:0.5,  pitchStart:220,  pitchPeak:880,  pitchEnd:880,  pitchPeakTime:0.7, filterType:'lowpass',  filterCutoff:4000,  filterQ:3,  lfoWave:'sine', lfoRate:2,  lfoDepth:0.5, lfoTarget:'filter', eqLow:0,  eqMid:2,  eqHigh:3,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:200, delayFeedback:0.4,reverbDecay:1,   reverbMix:0.2,  chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  coin:       {tag:'retro',    wave1:'square',   baseFreq:988,  noiseType:'none',  noiseMix:0,    wave2:'square', osc2Octave:1,  osc2Detune:0,   osc2Mix:0.5,  fmAmount:0,    attack:0,    decay:0.15, sustain:0,   release:0.1,  pitchStart:988,  pitchPeak:1319, pitchEnd:1319, pitchPeakTime:0.1, filterType:'lowpass',  filterCutoff:10000, filterQ:1,  lfoWave:'sine', lfoRate:5,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:0,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:8,  sampleReduction:22,  distortion:0,   delayTime:0,   delayFeedback:0,  reverbDecay:0,   reverbMix:0,    chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  hit:        {tag:'impact',   wave1:'triangle', baseFreq:150,  noiseType:'white', noiseMix:0.4,  wave2:'square', osc2Octave:-1, osc2Detune:0,   osc2Mix:0.2,  fmAmount:0,    attack:0,    decay:0.15, sustain:0,   release:0.1,  pitchStart:200,  pitchPeak:200,  pitchEnd:60,   pitchPeakTime:0,   filterType:'lowpass',  filterCutoff:3000,  filterQ:8,  lfoWave:'sine', lfoRate:5,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:4,  eqMid:0,  eqHigh:-3, compThreshold:-18, compRatio:6,  compMakeup:4,  bitcrush:12, sampleReduction:16,  distortion:10,  delayTime:0,   delayFeedback:0,  reverbDecay:0.5, reverbMix:0.15, chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  zap:        {tag:'laser',    wave1:'square',   baseFreq:600,  noiseType:'none',  noiseMix:0,    wave2:'sawtooth',osc2Octave:0,  osc2Detune:0,   osc2Mix:0.3,  fmAmount:0,    attack:0,    decay:0.15, sustain:0,   release:0.05, pitchStart:1500, pitchPeak:1500, pitchEnd:200,  pitchPeakTime:0,   filterType:'lowpass',  filterCutoff:6000,  filterQ:3,  lfoWave:'sine', lfoRate:5,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:0,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:5,   delayTime:0,   delayFeedback:0,  reverbDecay:0,   reverbMix:0,    chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  shield:     {tag:'impact',   wave1:'triangle', baseFreq:200,  noiseType:'none',  noiseMix:0,    wave2:'sine',   osc2Octave:1,  osc2Detune:7,   osc2Mix:0.6,  fmAmount:30,   attack:0.02, decay:0.3,  sustain:0.3, release:0.6,  pitchStart:200,  pitchPeak:600,  pitchEnd:200,  pitchPeakTime:0.15,filterType:'lowpass',  filterCutoff:2500,  filterQ:12, lfoWave:'sine', lfoRate:4,  lfoDepth:0.4, lfoTarget:'filter', eqLow:0,  eqMid:3,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:15,  delayTime:150, delayFeedback:0.35,reverbDecay:1,   reverbMix:0.2,  chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  select:     {tag:'ui',       wave1:'sine',     baseFreq:660,  noiseType:'none',  noiseMix:0,    wave2:'sine',   osc2Octave:1,  osc2Detune:0,   osc2Mix:0.3,  fmAmount:0,    attack:0,    decay:0.08, sustain:0,   release:0.05, pitchStart:660,  pitchPeak:880,  pitchEnd:880,  pitchPeakTime:0.05,filterType:'lowpass',  filterCutoff:8000,  filterQ:1,  lfoWave:'sine', lfoRate:5,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:0,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:0,   delayFeedback:0,  reverbDecay:0,   reverbMix:0,    chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  error:      {tag:'ui',       wave1:'square',   baseFreq:200,  noiseType:'white', noiseMix:0.2,  wave2:'square', osc2Octave:0,  osc2Detune:-20, osc2Mix:0.5,  fmAmount:0,    attack:0,    decay:0.2,  sustain:0,   release:0.15, pitchStart:200,  pitchPeak:150,  pitchEnd:100,  pitchPeakTime:0.5, filterType:'lowpass',  filterCutoff:3000,  filterQ:5,  lfoWave:'sine', lfoRate:5,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:3,  eqMid:0,  eqHigh:-3, compThreshold:-18, compRatio:6,  compMakeup:4,  bitcrush:8,  sampleReduction:16,  distortion:25,  delayTime:0,   delayFeedback:0,  reverbDecay:0.3, reverbMix:0.1,  chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  sweep:      {tag:'laser',    wave1:'sawtooth', baseFreq:200,  noiseType:'none',  noiseMix:0,    wave2:'sine',   osc2Octave:0,  osc2Detune:0,   osc2Mix:0.2,  fmAmount:0,    attack:0.05, decay:0.4,  sustain:0,   release:0.2,  pitchStart:200,  pitchPeak:4000, pitchEnd:200,  pitchPeakTime:0.5, filterType:'lowpass',  filterCutoff:8000,  filterQ:4,  lfoWave:'sine', lfoRate:6,  lfoDepth:0.3, lfoTarget:'filter', eqLow:0,  eqMid:0,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:10,  delayTime:200, delayFeedback:0.4,reverbDecay:1,   reverbMix:0.2,  chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:3, phaserDepth:0.6,phaserFeedback:0.4,pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  bass_drop:  {tag:'impact',   wave1:'sawtooth', baseFreq:55,   noiseType:'none',  noiseMix:0,    wave2:'square', osc2Octave:-1, osc2Detune:0,   osc2Mix:0.5,  fmAmount:0,    attack:0.05, decay:0.6,  sustain:0.3, release:0.5,  pitchStart:200,  pitchPeak:200,  pitchEnd:40,   pitchPeakTime:0.1, filterType:'lowpass',  filterCutoff:800,   filterQ:10, lfoWave:'sine', lfoRate:4,  lfoDepth:0.4, lfoTarget:'filter', eqLow:6,  eqMid:-3, eqHigh:-6, compThreshold:-18, compRatio:8,  compMakeup:6,  bitcrush:0,  sampleReduction:48,  distortion:15,  delayTime:0,   delayFeedback:0,  reverbDecay:1.5, reverbMix:0.25, chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  alarm:      {tag:'ui',       wave1:'square',   baseFreq:800,  noiseType:'none',  noiseMix:0,    wave2:'sawtooth',osc2Octave:0,  osc2Detune:0,   osc2Mix:0.3,  fmAmount:0,    attack:0.02, decay:0.15, sustain:0.5, release:0.1,  pitchStart:800,  pitchPeak:1200, pitchEnd:800,  pitchPeakTime:0.5, filterType:'lowpass',  filterCutoff:4000,  filterQ:3,  lfoWave:'square',lfoRate:4, lfoDepth:0.6, lfoTarget:'pitch',  eqLow:0,  eqMid:3,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:5,   delayTime:0,   delayFeedback:0,  reverbDecay:0.5, reverbMix:0.1,  chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  whoosh:     {tag:'nature',   wave1:'sawtooth', baseFreq:200,  noiseType:'white', noiseMix:0.7,  wave2:'sine',   osc2Octave:0,  osc2Detune:0,   osc2Mix:0,    fmAmount:0,    attack:0.02, decay:0.3,  sustain:0,   release:0.4,  pitchStart:2000, pitchPeak:2000, pitchEnd:80,   pitchPeakTime:0,   filterType:'bandpass', filterCutoff:1500,  filterQ:2,  lfoWave:'sine', lfoRate:12, lfoDepth:0.6, lfoTarget:'filter', eqLow:0,  eqMid:4,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:100, delayFeedback:0.2,reverbDecay:1.5, reverbMix:0.3,  chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  glitch:     {tag:'fx',       wave1:'square',   baseFreq:440,  noiseType:'white', noiseMix:0.5,  wave2:'sawtooth',osc2Octave:-1, osc2Detune:50,  osc2Mix:0.4,  fmAmount:300,  attack:0,    decay:0.1,  sustain:0,   release:0.05, pitchStart:440,  pitchPeak:2000, pitchEnd:50,   pitchPeakTime:0.1, filterType:'bandpass', filterCutoff:2000,  filterQ:20, lfoWave:'square',lfoRate:15,lfoDepth:0.8, lfoTarget:'filter', eqLow:-6, eqMid:6,  eqHigh:-6, compThreshold:-12, compRatio:12, compMakeup:8,  bitcrush:4,  sampleReduction:6,   distortion:60,  delayTime:50,  delayFeedback:0.8,reverbDecay:0.3, reverbMix:0.2,  chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0.7, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  chime:      {tag:'ui',       wave1:'sine',     baseFreq:1200, noiseType:'none',  noiseMix:0,    wave2:'triangle',osc2Octave:2, osc2Detune:3,   osc2Mix:0.25, fmAmount:0,    attack:0,    decay:0.5,  sustain:0,   release:0.8,  pitchStart:1200, pitchPeak:1200, pitchEnd:1200, pitchPeakTime:0,   filterType:'lowpass',  filterCutoff:6000,  filterQ:2,  lfoWave:'sine', lfoRate:6,  lfoDepth:0.15,lfoTarget:'pitch',  eqLow:-3, eqMid:0,  eqHigh:3,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:300, delayFeedback:0.3,reverbDecay:2,   reverbMix:0.3,  chorusRate:1, chorusDepth:8,  chorusMix:0.2,phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0.3, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  click:      {tag:'ui',       wave1:'square',   baseFreq:1200, noiseType:'white', noiseMix:0.1,  wave2:'sine',   osc2Octave:0,  osc2Detune:0,   osc2Mix:0,    fmAmount:0,    attack:0,    decay:0.05, sustain:0,   release:0.02, pitchStart:1200, pitchPeak:1200, pitchEnd:400,  pitchPeakTime:0,   filterType:'highpass', filterCutoff:800,   filterQ:1,  lfoWave:'sine', lfoRate:5,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:0,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:8,  sampleReduction:11,  distortion:0,   delayTime:0,   delayFeedback:0,  reverbDecay:0,   reverbMix:0,    chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  portal:     {tag:'ambient',  wave1:'sine',     baseFreq:100,  noiseType:'pink',  noiseMix:0.2,  wave2:'triangle',osc2Octave:1,  osc2Detune:-10, osc2Mix:0.3,  fmAmount:100,  attack:1,    decay:0.3,  sustain:0.5, release:1.5,  pitchStart:50,   pitchPeak:2000, pitchEnd:100,  pitchPeakTime:0.5, filterType:'lowpass',  filterCutoff:3000,  filterQ:10, lfoWave:'sine', lfoRate:0.5,lfoDepth:0.8, lfoTarget:'filter', eqLow:3,  eqMid:0,  eqHigh:-3, compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:5,   delayTime:500, delayFeedback:0.7,reverbDecay:3,   reverbMix:0.5,  chorusRate:2, chorusDepth:15, chorusMix:0.3,phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:-0.3, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  warp:       {tag:'ambient',  wave1:'sawtooth', baseFreq:100,  noiseType:'pink',  noiseMix:0.1,  wave2:'sine',   osc2Octave:2,  osc2Detune:0,   osc2Mix:0.2,  fmAmount:100,  attack:0.5,  decay:0.2,  sustain:0.5, release:1,    pitchStart:100,  pitchPeak:3000, pitchEnd:50,   pitchPeakTime:0.6, filterType:'lowpass',  filterCutoff:5000,  filterQ:5,  lfoWave:'sine', lfoRate:1,  lfoDepth:0.6, lfoTarget:'filter', eqLow:6,  eqMid:-3, eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:10,  delayTime:400, delayFeedback:0.5,reverbDecay:2.5, reverbMix:0.4,  chorusRate:3, chorusDepth:20, chorusMix:0.4,phaserRate:0.5,phaserDepth:0.5,phaserFeedback:0.6, pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  radiation:  {tag:'ambient',  wave1:'sawtooth', baseFreq:200,  noiseType:'pink',  noiseMix:0.3,  wave2:'sawtooth',osc2Octave:0,  osc2Detune:30,  osc2Mix:0.5,  fmAmount:200,  attack:0.3,  decay:0.5,  sustain:0.6, release:0.8,  pitchStart:200,  pitchPeak:400,  pitchEnd:100,  pitchPeakTime:0.4, filterType:'bandpass', filterCutoff:1500,  filterQ:15, lfoWave:'sawtooth',lfoRate:6, lfoDepth:0.7, lfoTarget:'filter', eqLow:-3, eqMid:6,  eqHigh:-6, compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:8,  sampleReduction:8,   distortion:40,  delayTime:300, delayFeedback:0.6,reverbDecay:2,   reverbMix:0.4,  chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0.5, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  teleport:   {tag:'ambient',  wave1:'sine',     baseFreq:400,  noiseType:'pink',  noiseMix:0.15, wave2:'triangle',osc2Octave:1,  osc2Detune:15,  osc2Mix:0.4,  fmAmount:80,   attack:0.2,  decay:0.1,  sustain:0.4, release:1.2,  pitchStart:400,  pitchPeak:2400, pitchEnd:400,  pitchPeakTime:0.3, filterType:'lowpass',  filterCutoff:4000,  filterQ:8,  lfoWave:'sine', lfoRate:8,  lfoDepth:0.5, lfoTarget:'filter', eqLow:0,  eqMid:3,  eqHigh:3,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:250, delayFeedback:0.5,reverbDecay:2,   reverbMix:0.35, chorusRate:4, chorusDepth:10, chorusMix:0.25,phaserRate:2, phaserDepth:0.4,phaserFeedback:0.5,pan:-0.5, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  powerdown:  {tag:'ui',       wave1:'sawtooth', baseFreq:440,  noiseType:'none',  noiseMix:0,    wave2:'triangle',osc2Octave:-1, osc2Detune:0,   osc2Mix:0.3,  fmAmount:0,    attack:0.1,  decay:0.3,  sustain:0.2, release:0.8,  pitchStart:880,  pitchPeak:880,  pitchEnd:55,   pitchPeakTime:0.8, filterType:'lowpass',  filterCutoff:3000,  filterQ:2,  lfoWave:'sine', lfoRate:3,  lfoDepth:0.2, lfoTarget:'pitch',  eqLow:0,  eqMid:0,  eqHigh:-3, compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:5,   delayTime:100, delayFeedback:0.2,reverbDecay:0.8, reverbMix:0.15, chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  // ─── 20 NEW PRESETS ───
  retro_bounce:{tag:'retro',   wave1:'square',   baseFreq:350,  noiseType:'none',  noiseMix:0,    wave2:'triangle',osc2Octave:1,  osc2Detune:0,   osc2Mix:0.3,  fmAmount:0,    attack:0,    decay:0.1,  sustain:0,   release:0.05, pitchStart:200,  pitchPeak:700,  pitchEnd:500,  pitchPeakTime:0.2, filterType:'lowpass',  filterCutoff:5000,  filterQ:1,  lfoWave:'sine', lfoRate:5,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:0,  eqHigh:2,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:0,   delayFeedback:0,  reverbDecay:0,   reverbMix:0,    chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  retro_die:   {tag:'retro',   wave1:'sawtooth', baseFreq:400,  noiseType:'none',  noiseMix:0,    wave2:'square', osc2Octave:0,  osc2Detune:-30, osc2Mix:0.4,  fmAmount:0,    attack:0.02, decay:0.4,  sustain:0,   release:0.3,  pitchStart:400,  pitchPeak:400,  pitchEnd:50,   pitchPeakTime:0.8, filterType:'lowpass',  filterCutoff:3000,  filterQ:2,  lfoWave:'sine', lfoRate:3,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:0,  eqHigh:-3, compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:8,  sampleReduction:16,  distortion:10,  delayTime:0,   delayFeedback:0,  reverbDecay:0,   reverbMix:0,    chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  retro_1up:   {tag:'retro',   wave1:'sine',     baseFreq:520,  noiseType:'none',  noiseMix:0,    wave2:'sine',   osc2Octave:1,  osc2Detune:0,   osc2Mix:0.3,  fmAmount:0,    attack:0,    decay:0.1,  sustain:0,   release:0.1,  pitchStart:520,  pitchPeak:1040, pitchEnd:1040, pitchPeakTime:0.05,filterType:'lowpass',  filterCutoff:8000,  filterQ:1,  lfoWave:'sine', lfoRate:8,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:0,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:0,   delayFeedback:0,  reverbDecay:0,   reverbMix:0,    chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  laser_charge:{tag:'laser',   wave1:'sine',     baseFreq:200,  noiseType:'pink',  noiseMix:0.3,  wave2:'sawtooth',osc2Octave:0,  osc2Detune:0,   osc2Mix:0.2,  fmAmount:0,    attack:0.8,  decay:0.1,  sustain:0,   release:0.2,  pitchStart:200,  pitchPeak:2000, pitchEnd:2000, pitchPeakTime:1,   filterType:'lowpass',  filterCutoff:6000,  filterQ:4,  lfoWave:'sine', lfoRate:10, lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:0,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:0,   delayFeedback:0,  reverbDecay:0,   reverbMix:0,    chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  laser_burst: {tag:'laser',   wave1:'sawtooth', baseFreq:1200, noiseType:'none',  noiseMix:0,    wave2:'square', osc2Octave:0,  osc2Detune:0,   osc2Mix:0.3,  fmAmount:0,    attack:0,    decay:0.05, sustain:0,   release:0.03, pitchStart:1200, pitchPeak:1200, pitchEnd:200,  pitchPeakTime:0,   filterType:'lowpass',  filterCutoff:8000,  filterQ:2,  lfoWave:'sine', lfoRate:5,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:0,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:5,   delayTime:0,   delayFeedback:0,  reverbDecay:0,   reverbMix:0,    chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  heavy_hit:   {tag:'impact',   wave1:'sawtooth', baseFreq:60,   noiseType:'white', noiseMix:0.6,  wave2:'square', osc2Octave:-1, osc2Detune:0,   osc2Mix:0.4,  fmAmount:0,    attack:0,    decay:0.5,  sustain:0,   release:0.3,  pitchStart:150,  pitchPeak:150,  pitchEnd:30,   pitchPeakTime:0,   filterType:'lowpass',  filterCutoff:1500,  filterQ:8,  lfoWave:'sine', lfoRate:4,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:4,  eqMid:0,  eqHigh:-6, compThreshold:-20, compRatio:10, compMakeup:8,  bitcrush:0,  sampleReduction:48,  distortion:30,  delayTime:0,   delayFeedback:0,  reverbDecay:1.2, reverbMix:0.2,  chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  metal_clank: {tag:'impact',   wave1:'triangle', baseFreq:800,  noiseType:'white', noiseMix:0.3,  wave2:'sine',   osc2Octave:1,  osc2Detune:10,  osc2Mix:0.3,  fmAmount:0,    attack:0,    decay:0.3,  sustain:0,   release:0.4,  pitchStart:800,  pitchPeak:800,  pitchEnd:300,  pitchPeakTime:0,   filterType:'bandpass', filterCutoff:1000,  filterQ:12, lfoWave:'sine', lfoRate:6,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:3,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:15,  delayTime:50,  delayFeedback:0.3,reverbDecay:0.8, reverbMix:0.15, chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0.2, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  glass_break: {tag:'impact',   wave1:'sine',     baseFreq:2000, noiseType:'white', noiseMix:0.5,  wave2:'triangle',osc2Octave:0,  osc2Detune:50,  osc2Mix:0.2,  fmAmount:0,    attack:0,    decay:0.6,  sustain:0,   release:0.5,  pitchStart:2000, pitchPeak:2000, pitchEnd:100,  pitchPeakTime:0,   filterType:'highpass', filterCutoff:1500,  filterQ:5,  lfoWave:'sine', lfoRate:8,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:-6, eqMid:3,  eqHigh:6,  compThreshold:-18, compRatio:6,  compMakeup:4,  bitcrush:4,  sampleReduction:24,  distortion:20,  delayTime:0,   delayFeedback:0,  reverbDecay:1,   reverbMix:0.25, chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  toggle_on:   {tag:'ui',       wave1:'square',   baseFreq:600,  noiseType:'none',  noiseMix:0,    wave2:'sine',   osc2Octave:0,  osc2Detune:0,   osc2Mix:0.2,  fmAmount:0,    attack:0,    decay:0.06, sustain:0,   release:0.04, pitchStart:600,  pitchPeak:800,  pitchEnd:800,  pitchPeakTime:0.1, filterType:'lowpass',  filterCutoff:8000,  filterQ:1,  lfoWave:'sine', lfoRate:5,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:0,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:0,   delayFeedback:0,  reverbDecay:0,   reverbMix:0,    chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  toggle_off:  {tag:'ui',       wave1:'square',   baseFreq:800,  noiseType:'none',  noiseMix:0,    wave2:'sine',   osc2Octave:0,  osc2Detune:0,   osc2Mix:0.2,  fmAmount:0,    attack:0,    decay:0.06, sustain:0,   release:0.04, pitchStart:800,  pitchPeak:600,  pitchEnd:600,  pitchPeakTime:0.1, filterType:'lowpass',  filterCutoff:8000,  filterQ:1,  lfoWave:'sine', lfoRate:5,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:0,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:0,   delayFeedback:0,  reverbDecay:0,   reverbMix:0,    chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  hover_beep:  {tag:'ui',       wave1:'sine',     baseFreq:1200, noiseType:'none',  noiseMix:0,    wave2:'sine',   osc2Octave:0,  osc2Detune:0,   osc2Mix:0,    fmAmount:0,    attack:0,    decay:0.04, sustain:0,   release:0.02, pitchStart:1200, pitchPeak:1200, pitchEnd:1200, pitchPeakTime:0,   filterType:'lowpass',  filterCutoff:10000, filterQ:1,  lfoWave:'sine', lfoRate:5,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:0,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:0,   delayFeedback:0,  reverbDecay:0,   reverbMix:0,    chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  success_chime:{tag:'ui',      wave1:'sine',     baseFreq:784,  noiseType:'none',  noiseMix:0,    wave2:'triangle',osc2Octave:1,  osc2Detune:0,   osc2Mix:0.25, fmAmount:0,    attack:0,    decay:0.3,  sustain:0,   release:0.4,  pitchStart:784,  pitchPeak:784,  pitchEnd:784,  pitchPeakTime:0,   filterType:'lowpass',  filterCutoff:6000,  filterQ:2,  lfoWave:'sine', lfoRate:5,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:0,  eqHigh:3,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:0,   delayFeedback:0,  reverbDecay:0.5, reverbMix:0.1,  chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  fail_buzz:   {tag:'ui',       wave1:'square',   baseFreq:150,  noiseType:'white', noiseMix:0.15, wave2:'square', osc2Octave:0,  osc2Detune:-15, osc2Mix:0.3,  fmAmount:0,    attack:0,    decay:0.25, sustain:0,   release:0.15, pitchStart:150,  pitchPeak:100,  pitchEnd:80,   pitchPeakTime:0.5, filterType:'lowpass',  filterCutoff:2000,  filterQ:3,  lfoWave:'sine', lfoRate:4,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:0,  eqHigh:-3, compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:8,  sampleReduction:16,  distortion:10,  delayTime:0,   delayFeedback:0,  reverbDecay:0,   reverbMix:0,    chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  level_up:    {tag:'ui',       wave1:'sine',     baseFreq:523,  noiseType:'none',  noiseMix:0,    wave2:'sine',   osc2Octave:1,  osc2Detune:0,   osc2Mix:0.3,  fmAmount:0,    attack:0.05, decay:0.15, sustain:0,   release:0.4,  pitchStart:523,  pitchPeak:1047, pitchEnd:1047, pitchPeakTime:0.2, filterType:'lowpass',  filterCutoff:6000,  filterQ:1,  lfoWave:'sine', lfoRate:6,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:2,  eqHigh:2,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:200, delayFeedback:0.3,reverbDecay:1,   reverbMix:0.2,  chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  drone_low:   {tag:'ambient',  wave1:'sawtooth', baseFreq:55,   noiseType:'pink',  noiseMix:0.2,  wave2:'sine',   osc2Octave:0,  osc2Detune:5,   osc2Mix:0.3,  fmAmount:0,    attack:1,    decay:0.2,  sustain:0.7, release:1,    pitchStart:55,   pitchPeak:55,   pitchEnd:55,   pitchPeakTime:0,   filterType:'lowpass',  filterCutoff:400,   filterQ:3,  lfoWave:'sine', lfoRate:0.3,lfoDepth:0.5, lfoTarget:'filter', eqLow:3,  eqMid:0,  eqHigh:-6, compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:0,   delayFeedback:0,  reverbDecay:2,   reverbMix:0.3,  chorusRate:1, chorusDepth:12, chorusMix:0.3,phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  pulse_signal:{tag:'ambient',  wave1:'sine',     baseFreq:440,  noiseType:'none',  noiseMix:0,    wave2:'sine',   osc2Octave:0,  osc2Detune:0,   osc2Mix:0.2,  fmAmount:0,    attack:0.05, decay:0.1,  sustain:0.3, release:0.2,  pitchStart:440,  pitchPeak:440,  pitchEnd:440,  pitchPeakTime:0,   filterType:'lowpass',  filterCutoff:4000,  filterQ:2,  lfoWave:'square',lfoRate:2, lfoDepth:0.3, lfoTarget:'volume', eqLow:0,  eqMid:0,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:0,   delayFeedback:0,  reverbDecay:0.5, reverbMix:0.1,  chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  thunder_crack:{tag:'nature',  wave1:'sawtooth', baseFreq:40,   noiseType:'white', noiseMix:0.8,  wave2:'square', osc2Octave:-2, osc2Detune:0,   osc2Mix:0.3,  fmAmount:0,    attack:0,    decay:0.5,  sustain:0,   release:0.8,  pitchStart:200,  pitchPeak:200,  pitchEnd:20,   pitchPeakTime:0,   filterType:'lowpass',  filterCutoff:800,   filterQ:6,  lfoWave:'sine', lfoRate:3,  lfoDepth:0.3, lfoTarget:'filter', eqLow:6,  eqMid:0,  eqHigh:-6, compThreshold:-20, compRatio:8,  compMakeup:6,  bitcrush:0,  sampleReduction:48,  distortion:5,   delayTime:300, delayFeedback:0.4,reverbDecay:2,   reverbMix:0.35, chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  splash_drop: {tag:'nature',   wave1:'sine',     baseFreq:800,  noiseType:'white', noiseMix:0.4,  wave2:'triangle',osc2Octave:1,  osc2Detune:0,   osc2Mix:0.2,  fmAmount:0,    attack:0,    decay:0.15, sustain:0,   release:0.2,  pitchStart:1200, pitchPeak:1200, pitchEnd:400,  pitchPeakTime:0,   filterType:'bandpass', filterCutoff:1000,  filterQ:4,  lfoWave:'sine', lfoRate:8,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:2,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:100, delayFeedback:0.2,reverbDecay:0.8, reverbMix:0.2,  chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  fire_crackle:{tag:'nature',   wave1:'square',   baseFreq:200,  noiseType:'white', noiseMix:0.6,  wave2:'sawtooth',osc2Octave:0,  osc2Detune:20,  osc2Mix:0.2,  fmAmount:0,    attack:0,    decay:0.05, sustain:0,   release:0.05, pitchStart:200,  pitchPeak:600,  pitchEnd:100,  pitchPeakTime:0.1, filterType:'bandpass', filterCutoff:1500,  filterQ:8,  lfoWave:'sine', lfoRate:15, lfoDepth:0.5, lfoTarget:'filter', eqLow:0,  eqMid:3,  eqHigh:-3, compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:4,  sampleReduction:12,  distortion:10,  delayTime:0,   delayFeedback:0,  reverbDecay:0.3, reverbMix:0.1,  chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  footstep:    {tag:'nature',   wave1:'triangle', baseFreq:120,  noiseType:'pink',  noiseMix:0.3,  wave2:'sine',   osc2Octave:-1, osc2Detune:0,   osc2Mix:0.2,  fmAmount:0,    attack:0,    decay:0.08, sustain:0,   release:0.05, pitchStart:120,  pitchPeak:120,  pitchEnd:60,   pitchPeakTime:0,   filterType:'lowpass',  filterCutoff:2000,  filterQ:2,  lfoWave:'sine', lfoRate:5,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:0,  eqHigh:-3, compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:0,   delayFeedback:0,  reverbDecay:0,   reverbMix:0,    chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  wood_crack:  {tag:'impact',   wave1:'sawtooth', baseFreq:300,  noiseType:'white', noiseMix:0.4,  wave2:'triangle',osc2Octave:0,  osc2Detune:30,  osc2Mix:0.2,  fmAmount:0,    attack:0,    decay:0.15, sustain:0,   release:0.1,  pitchStart:400,  pitchPeak:400,  pitchEnd:100,  pitchPeakTime:0,   filterType:'bandpass', filterCutoff:800,   filterQ:6,  lfoWave:'sine', lfoRate:5,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:2,  eqMid:0,  eqHigh:-3, compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:5,   delayTime:0,   delayFeedback:0,  reverbDecay:0.5, reverbMix:0.15, chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  wind_gust:   {tag:'nature',   wave1:'sawtooth', baseFreq:150,  noiseType:'pink',  noiseMix:0.8,  wave2:'sine',   osc2Octave:0,  osc2Detune:0,   osc2Mix:0.1,  fmAmount:0,    attack:0.3,  decay:0.5,  sustain:0.5, release:0.8,  pitchStart:100,  pitchPeak:300,  pitchEnd:80,   pitchPeakTime:0.4, filterType:'bandpass', filterCutoff:600,   filterQ:3,  lfoWave:'sine', lfoRate:1,  lfoDepth:0.6, lfoTarget:'filter', eqLow:-3, eqMid:2,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:200, delayFeedback:0.3,reverbDecay:1.5, reverbMix:0.3,  chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0.3, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  scanner:     {tag:'fx',       wave1:'square',   baseFreq:800,  noiseType:'white', noiseMix:0.2,  wave2:'sawtooth',osc2Octave:0,  osc2Detune:0,   osc2Mix:0.3,  fmAmount:0,    attack:0.1,  decay:0.2,  sustain:0,   release:0.3,  pitchStart:800,  pitchPeak:2000, pitchEnd:200,  pitchPeakTime:0.3, filterType:'bandpass', filterCutoff:1500,  filterQ:10, lfoWave:'sawtooth',lfoRate:8, lfoDepth:0.7, lfoTarget:'filter', eqLow:-3, eqMid:4,  eqHigh:0,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:100, delayFeedback:0.4,reverbDecay:1,   reverbMix:0.2,  chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:3, phaserDepth:0.5,phaserFeedback:0.3,pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  static_buzz: {tag:'fx',       wave1:'sawtooth', baseFreq:60,   noiseType:'white', noiseMix:0.9,  wave2:'square', osc2Octave:0,  osc2Detune:50,  osc2Mix:0.1,  fmAmount:0,    attack:0,    decay:0.3,  sustain:0.4, release:0.2,  pitchStart:60,   pitchPeak:200,  pitchEnd:60,   pitchPeakTime:0.5, filterType:'bandpass', filterCutoff:500,   filterQ:15, lfoWave:'square',lfoRate:12,lfoDepth:0.8, lfoTarget:'filter', eqLow:0,  eqMid:3,  eqHigh:-6, compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:4,  sampleReduction:6,   distortion:30,  delayTime:0,   delayFeedback:0,  reverbDecay:0.3, reverbMix:0.1,  chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
  sonar_ping:  {tag:'ui',       wave1:'sine',     baseFreq:1000, noiseType:'none',  noiseMix:0,    wave2:'sine',   osc2Octave:1,  osc2Detune:0,   osc2Mix:0.2,  fmAmount:0,    attack:0,    decay:0.4,  sustain:0,   release:0.6,  pitchStart:1000, pitchPeak:1000, pitchEnd:250,  pitchPeakTime:0,   filterType:'lowpass',  filterCutoff:6000,  filterQ:2,  lfoWave:'sine', lfoRate:5,  lfoDepth:0,   lfoTarget:'pitch',  eqLow:0,  eqMid:0,  eqHigh:3,  compThreshold:-24, compRatio:4,  compMakeup:0,  bitcrush:0,  sampleReduction:48,  distortion:0,   delayTime:250, delayFeedback:0.4,reverbDecay:1.5, reverbMix:0.25, chorusRate:0, chorusDepth:0,  chorusMix:0,  phaserRate:0, phaserDepth:0,  phaserFeedback:0,  pan:0, modWave:'sine', modFreq:440, modAmount:0, rmAmount:0, envCurve:'linear', lfoMode:'free', lfoCycles:1, noiseCutoffStart:20000, noiseCutoffEnd:20000, noiseResonance:1, hardClip:0 },
};

// ─── DOM ───────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const canvas = $('waveCanvas');
const ctx2d = canvas.getContext('2d');
let animId = null;

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
  ];
  sliders.forEach(([id,key,parse,fmt])=>{
    const el=$(id); if(!el)return;
    el.addEventListener('input',()=>{ S[key]=parse(el.value); const ve=$('v-'+id); if(ve)ve.textContent=fmt(S[key]); });
  });

  // Selects
  ['noiseType','filterType','lfoWave','lfoTarget','exportFormat','envCurve','lfoMode',
   'envPreset','materialType','grainDiv','chugEnable','modSrc','modDst'].forEach(id=>{
    const el=$(id); if(el)el.addEventListener('change',()=>{ S[id]=el.value; });
  });

  // Module toggles
  document.querySelectorAll('.mod-h').forEach(h=>{
    h.addEventListener('click',()=>{ h.parentElement.classList.toggle('collapsed'); });
  });

  // Tabs
  document.querySelectorAll('.fx-tab').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.fx-tab').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.fx-panel').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active'); $('panel-'+btn.dataset.tab).classList.add('active');
      setTimeout(resizeCanvas,50);
      if(btn.dataset.tab==='spatial') setTimeout(resizeTrajCanvas,200);
    });
  });

  // Trigger
  const btnT = $('btnTrigger');
  if (btnT) btnT.addEventListener('click',()=>{
    AudioEngine.resume();
    const dur=AudioEngine.triggerSound(S);
    visualize(dur);
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
    randomize(); updateUI();
    AudioEngine.resume();
    const dur=AudioEngine.triggerSound(S);
    visualize(dur);
  });

  // Mutate
  const btnM = $('btnMutate');
  if (btnM) btnM.addEventListener('click',()=>{
    mutate(); updateUI();
    AudioEngine.resume();
    const dur=AudioEngine.triggerSound(S);
    visualize(dur);
  });

  // Save/Load
  const btnS = $('btnSave');
  if (btnS) btnS.addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download=`saranta-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
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
  const lightIcon = themeBtn.querySelector('.theme-icon-light');
  const darkIcon = themeBtn.querySelector('.theme-icon-dark');
  function updateThemeIcons() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    lightIcon.style.display = isLight ? 'block' : 'none';
    darkIcon.style.display = isLight ? 'none' : 'block';
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

  // Atlas Export
  const btnAtlas = $('btnAtlas');
  if (btnAtlas) btnAtlas.addEventListener('click', () => {
    btnAtlas.textContent = '...'; btnAtlas.disabled = true;
    AudioEngine.exportAtlas(S).then(() => {
      btnAtlas.textContent = 'GENERATE ATLAS + JSON'; btnAtlas.disabled = false;
    }).catch(() => {
      btnAtlas.textContent = 'GENERATE ATLAS + JSON'; btnAtlas.disabled = false;
    });
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
  Object.keys(PRESETS).forEach(k=>{
    const p=PRESETS[k];
    const name=k.replace(/_/g,' ').toUpperCase();
    if(filter && !name.toLowerCase().includes(filter.toLowerCase()) && !p.tag.toLowerCase().includes(filter.toLowerCase())) return;
    const btn=document.createElement('div');
    btn.className='preset-slot';
    btn.innerHTML=`<span class="preset-slot-name">${name}</span><span class="preset-slot-tag tag-${p.tag}">${p.tag}</span>`;
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.preset-slot').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      Object.assign(S,p); updateUI();
      AudioEngine.resume();
      const dur=AudioEngine.triggerSound(S);
      visualize(dur);
    });
    list.appendChild(btn);
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
    trajCtx.textAlign = 'center'; trajCtx.fillText('DRAW PATH WITH MOUSE', trajCanvas.width/2, trajCanvas.height/2+4);
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
  trajCanvas.addEventListener('mousedown',e=>{ trajDrawing=true; trajPoints=[]; const r=trajCanvas.getBoundingClientRect(); trajPoints.push({x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height,t:Date.now()}); drawTrajectory(); });
  trajCanvas.addEventListener('mousemove',e=>{ if(!trajDrawing) return; const r=trajCanvas.getBoundingClientRect(); trajPoints.push({x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height,t:Date.now()}); drawTrajectory(); });
  trajCanvas.addEventListener('mouseup',()=>{ trajDrawing=false; });
  trajCanvas.addEventListener('mouseleave',()=>{ trajDrawing=false; });
  const btnClear = $('btnClearTraj');
  if(btnClear) btnClear.addEventListener('click',()=>{ trajPoints=[]; drawTrajectory(); });
}

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
function visualize(duration) {
  resizeCanvas();
  const analyser=AudioEngine.getAnalyser(); if(!analyser)return;
  const bufLen=analyser.frequencyBinCount, data=new Float32Array(bufLen);
  const end=Date.now()+(duration+0.3)*1000;
  const colors=themeColors();
  if(animId)cancelAnimationFrame(animId);
  function draw() {
    if(Date.now()>end){ clearCanvas(); return; }
    animId=requestAnimationFrame(draw); analyser.getFloatTimeDomainData(data);
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
    resizeCanvas(); clearCanvas();
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
