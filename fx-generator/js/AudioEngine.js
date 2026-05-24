class AudioEngine {
  constructor() {
    this.ctx = null;
    this.analyser = null;
  }

  resume() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  getAnalyser() {
    return this.analyser;
  }

  dur(s) {
    return Math.max(0.05, s.attack + s.decay + (s.sustain > 0 ? 0.3 : 0) + s.release);
  }

  noiseBuffer(ctx, type, dur) {
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * Math.max(dur, 0.05));
    const buf = ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    if (type === 'white') {
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } else {
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886*b0 + w*0.0555179;
        b1 = 0.99332*b1 + w*0.0750759;
        b2 = 0.96900*b2 + w*0.1538520;
        b3 = 0.86650*b3 + w*0.3104856;
        b4 = 0.55000*b4 + w*0.5329522;
        b5 = -0.7616*b5 - w*0.0168980;
        d[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11;
        b6 = w;
      }
    }
    return buf;
  }

  distCurve(amount) {
    const n = 44100;
    const c = new Float32Array(n);
    const k = amount * 2;
    for (let i = 0; i < n; i++) {
      const x = (i*2)/n - 1;
      c[i] = k > 0 ? ((3+k)*x*20*(Math.PI/180))/(Math.PI+k*Math.abs(x)) : x;
    }
    return c;
  }

  bcCurve(bits) {
    if (bits <= 0) return null;
    const lv = Math.pow(2, bits);
    const n = 44100;
    const c = new Float32Array(n);
    for (let i = 0; i < n; i++) c[i] = Math.round(((i*2)/n-1)*lv)/lv;
    return c;
  }

  revIR(ctx, decay) {
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * Math.max(decay, 0.1));
    const buf = ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random()*2-1) * Math.pow(1-i/len, 2.5);
    }
    return buf;
  }

  env(g, s, t, dur) {
    const ae = t + s.attack;
    const de = ae + s.decay;
    const se = dur - s.release;
    const isExp = s.envCurve === 'exponential';
    if (isExp) {
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.001, 1), ae);
      g.gain.exponentialRampToValueAtTime(Math.max(0.001, s.sustain), de);
      if (s.sustain > 0.001 && se > de) g.gain.setValueAtTime(Math.max(0.001, s.sustain), se);
      g.gain.exponentialRampToValueAtTime(0.001, t+dur);
    } else {
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(1, ae);
      g.gain.linearRampToValueAtTime(s.sustain, de);
      if (s.sustain > 0 && se > de) g.gain.setValueAtTime(s.sustain, se);
      g.gain.linearRampToValueAtTime(0, t+dur);
    }
  }

  // ─── Environment IR Generator ──────────────────────────────
  envIR(ctx, type) {
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * (type==='cave'?3:type==='corridor'?1.5:0.6));
    const buf = ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const decay = type==='cave'?0.92:type==='corridor'?0.85:0.75;
        const scatter = Math.sin(i*0.01*(ch+1)) * Math.exp(-i/(len*0.3));
        d[i] = (Math.random()*2-1 + scatter) * Math.pow(decay, i/sr*10);
      }
    }
    return buf;
  }

  // ─── Karplus-Strong / Modal Resonator ─────────────────────
  ksResonator(ctx, input, s, t, dur) {
    if (s.materialType === 'none') return input;
    // Material tuning: delay time determines pitch of resonance
    const baseDelay = s.materialType==='glass'?0.004:s.materialType==='metal'?0.010:0.020;
    const delayTime = baseDelay * (1.05 - s.stiffness*0.1);
    const feedback = Math.min(0.92, s.damping * 0.55 + 0.15);
    const delay = ctx.createDelay(0.05);
    delay.delayTime.setValueAtTime(delayTime, t);
    const fb = ctx.createGain();
    fb.gain.setValueAtTime(feedback, t);
    // Softer lowpass for warmth
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(6000 * s.stiffness + 400, t);
    filt.Q.setValueAtTime(4 * s.damping + 0.5, t);
    // Karplus-Strong loop: delay -> filter -> feedback -> delay
    input.connect(delay); delay.connect(filt); filt.connect(fb); fb.connect(delay);
    // Output from filter (lower volume to prevent harshness)
    const outGain = ctx.createGain();
    outGain.gain.setValueAtTime(0.4, t);
    filt.connect(outGain);
    // Envelope the resonator output
    const env = ctx.createGain();
    env.gain.setValueAtTime(1, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + s.ksDecay);
    outGain.connect(env);
    return env;
  }

  // ─── Cinematic Chug Engine ─────────────────────────────────
  chugEngine(ctx, s, t, dur) {
    if (!s.chugEnable || s.chugEnable==='0') return null;
    // Carrier + modulator FM
    const car = ctx.createOscillator();
    car.type = 'sawtooth';
    car.frequency.setValueAtTime(s.chugFreq, t);
    const mod = ctx.createOscillator();
    mod.type = 'square';
    mod.frequency.setValueAtTime(s.chugFreq * 0.5, t);
    const fmGain = ctx.createGain();
    fmGain.gain.setValueAtTime(s.chugFreq * 2, t);
    mod.connect(fmGain); fmGain.connect(car.frequency);
    // Bandpass 60-120Hz
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(s.chugFreq, t);
    bp.Q.setValueAtTime(3, t);
    // Asymmetric saturation
    const sat = ctx.createWaveShaper();
    const n = 44100; const c = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i*2)/n - 1;
      const k = s.chugSat * 5;
      c[i] = x>0 ? Math.tanh(x*(1+k)) : Math.tanh(x*(1+k*0.3));
    }
    sat.curve = c; sat.oversample = '4x';
    // Punch envelope
    const punch = ctx.createGain();
    punch.gain.setValueAtTime(1 + s.chugPunch * 2, t);
    punch.gain.exponentialRampToValueAtTime(1, t + 0.05);
    car.start(t); car.stop(t+dur);
    mod.start(t); mod.stop(t+dur);
    car.connect(bp); bp.connect(sat); sat.connect(punch);
    return punch;
  }

  // ─── Grain Gate (BPM Synced) ───────────────────────────────
  grainGate(ctx, s, t, dur) {
    if (s.stutterDepth <= 0) return null;
    const beatDur = 60 / s.grainBPM;
    const gateTime = beatDur / s.grainDiv;
    const gateGain = ctx.createGain();
    gateGain.gain.setValueAtTime(1, t);
    // Square LFO: open for 80% of gate period
    const openRatio = 0.8;
    for (let gt = t; gt < t+dur; gt += gateTime) {
      gateGain.gain.setValueAtTime(1, gt);
      gateGain.gain.linearRampToValueAtTime(1 - s.stutterDepth, gt + gateTime*openRatio);
      gateGain.gain.setValueAtTime(1 - s.stutterDepth, gt + gateTime*openRatio);
      gateGain.gain.linearRampToValueAtTime(1, gt + gateTime);
    }
    return gateGain;
  }

  pitchEnv(osc, s, t, dur) {
    const st = Math.max(20, s.pitchStart);
    const pk = Math.max(20, s.pitchPeak);
    const en = Math.max(20, s.pitchEnd);
    const pt = t + dur * Math.min(Math.max(s.pitchPeakTime, 0), 1);
    const et = t + dur * 0.95;

    osc.frequency.setValueAtTime(st, t);
    if (Math.abs(pk-st) > 1 && s.pitchPeakTime > 0.01) osc.frequency.exponentialRampToValueAtTime(pk, pt);
    const be = s.pitchPeakTime > 0.01 ? pk : st;
    if (Math.abs(en-be) > 1) osc.frequency.exponentialRampToValueAtTime(en, et);
  }

  build(ctx, s, t, dur, out) {
    // Master envelope
    const mg = ctx.createGain();
    this.env(mg, s, t, dur);

    // Osc 1
    const o1g = ctx.createGain();
    o1g.gain.setValueAtTime(Math.max(0.01, 1 - s.noiseMix*0.5 - s.osc2Mix*0.5), t);
    const o1 = ctx.createOscillator();
    o1.type = s.wave1;
    this.pitchEnv(o1, s, t, dur);

    // RM Gain (placed after o1g if active)
    let o1Out = o1g;
    if (s.rmAmount > 0) {
      const rmGain = ctx.createGain();
      rmGain.gain.setValueAtTime(1 - s.rmAmount * 0.5, t);
      o1g.connect(rmGain);
      o1Out = rmGain;
    }
    o1.connect(o1g); o1Out.connect(mg);
    o1.start(t); o1.stop(t+dur);

    // FM (legacy via osc2)
    if (s.fmAmount > 0 && s.osc2Mix > 0) {
      const fmg = ctx.createGain();
      fmg.gain.setValueAtTime(s.fmAmount, t);
      o1.connect(fmg);
      fmg.connect(o1.frequency);
    }

    // Osc 2
    if (s.osc2Mix > 0) {
      const o2g = ctx.createGain();
      o2g.gain.setValueAtTime(s.osc2Mix, t);
      const o2 = ctx.createOscillator();
      o2.type = s.wave2;
      const f2 = Math.max(20, s.baseFreq * Math.pow(2, s.osc2Octave));
      o2.frequency.setValueAtTime(f2, t);
      o2.detune.setValueAtTime(s.osc2Detune, t);
      this.pitchEnv(o2, s, t, dur);
      o2.connect(o2g); o2g.connect(mg);
      o2.start(t); o2.stop(t+dur);
    }

    // Noise with resonant sweep filter
    if (s.noiseType !== 'none' && s.noiseMix > 0) {
      const nb = this.noiseBuffer(ctx, s.noiseType, dur);
      const ns = ctx.createBufferSource();
      ns.buffer = nb;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(s.noiseMix, t);
      // Noise sweep filter
      if (s.noiseCutoffStart !== s.noiseCutoffEnd) {
        const nf = ctx.createBiquadFilter();
        nf.type = 'lowpass';
        nf.frequency.setValueAtTime(Math.max(20, s.noiseCutoffStart), t);
        nf.frequency.exponentialRampToValueAtTime(Math.max(20, s.noiseCutoffEnd), t+dur);
        nf.Q.setValueAtTime(s.noiseResonance, t);
        ns.connect(nf); nf.connect(ng); ng.connect(mg);
      } else {
        ns.connect(ng); ng.connect(mg);
      }
      ns.start(t); ns.stop(t+dur);
    }

    // Dedicated Modulator (FM + Ring Modulation)
    let modNode = null;
    if ((s.modAmount > 0 || s.rmAmount > 0) && s.modFreq > 0) {
      const mod = ctx.createOscillator();
      mod.type = s.modWave;
      mod.frequency.setValueAtTime(Math.max(20, s.modFreq), t);
      const modStop = s.lfoMode === 'oneshot' ? t + s.lfoCycles / s.lfoRate : t + dur;
      mod.start(t); mod.stop(modStop);
      modNode = mod;
      // FM to Osc 1
      if (s.modAmount > 0) {
        const fmg = ctx.createGain();
        fmg.gain.setValueAtTime(s.modAmount, t);
        mod.connect(fmg);
        fmg.connect(o1.frequency);
      }
      // Ring Modulation (AM) — modulate o1Out gain
      if (s.rmAmount > 0) {
        mod.connect(o1Out.gain);
      }
    }

    let node = mg;

    // LFO (pitch/volume) with one-shot support
    if (s.lfoDepth > 0 && s.lfoTarget !== 'filter') {
      const lfo = ctx.createOscillator();
      lfo.type = s.lfoWave;
      lfo.frequency.setValueAtTime(s.lfoRate, t);
      const lfoStop = s.lfoMode === 'oneshot' ? t + s.lfoCycles / s.lfoRate : t + dur;
      const lg = ctx.createGain();
      if (s.lfoTarget === 'pitch') {
        lg.gain.setValueAtTime(s.lfoDepth * s.baseFreq * 0.5, t);
        lfo.connect(lg); lg.connect(o1.frequency);
      } else {
        lg.gain.setValueAtTime(s.lfoDepth * 0.5, t);
        lfo.connect(lg); lg.connect(mg.gain);
      }
      lfo.start(t); lfo.stop(lfoStop);
    }

    // Filter
    const f = ctx.createBiquadFilter();
    f.type = s.filterType;
    f.frequency.setValueAtTime(Math.max(20, s.filterCutoff), t);
    f.Q.setValueAtTime(s.filterQ, t);
    node.connect(f); node = f;

    // LFO (filter) with one-shot support
    if (s.lfoDepth > 0 && s.lfoTarget === 'filter') {
      const lfo = ctx.createOscillator();
      lfo.type = s.lfoWave;
      lfo.frequency.setValueAtTime(s.lfoRate, t);
      const lfoStop = s.lfoMode === 'oneshot' ? t + s.lfoCycles / s.lfoRate : t + dur;
      const lg = ctx.createGain();
      lg.gain.setValueAtTime(s.lfoDepth * s.filterCutoff * 0.5, t);
      lfo.connect(lg); lg.connect(f.frequency);
      lfo.start(t); lfo.stop(lfoStop);
    }

    // EQ
    if (s.eqLow !== 0 || s.eqMid !== 0 || s.eqHigh !== 0) {
      const low = ctx.createBiquadFilter(); low.type='lowshelf'; low.frequency.value=320; low.gain.setValueAtTime(s.eqLow, t);
      const mid = ctx.createBiquadFilter(); mid.type='peaking'; mid.frequency.value=1000; mid.Q.value=1; mid.gain.setValueAtTime(s.eqMid, t);
      const high = ctx.createBiquadFilter(); high.type='highshelf'; high.frequency.value=3200; high.gain.setValueAtTime(s.eqHigh, t);
      node.connect(low); low.connect(mid); mid.connect(high); node = high;
    }

    // Compressor
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(s.compThreshold, t);
    comp.ratio.setValueAtTime(s.compRatio, t);
    comp.attack.setValueAtTime(0.003, t);
    comp.release.setValueAtTime(0.25, t);
    node.connect(comp); node = comp;

    // Distortion
    if (s.distortion > 0) {
      const ws = ctx.createWaveShaper();
      ws.curve = this.distCurve(s.distortion);
      ws.oversample = '4x';
      node.connect(ws); node = ws;
    }

    // Bitcrush
    const bc = this.bcCurve(s.bitcrush);
    if (bc) {
      const bcn = ctx.createWaveShaper();
      bcn.curve = bc;
      node.connect(bcn); node = bcn;
    }

    // Hard Clipper (Destruction)
    if (s.hardClip > 0) {
      const clip = ctx.createWaveShaper();
      const n = 44100;
      const c = new Float32Array(n);
      const th = 1 - s.hardClip;
      for (let i = 0; i < n; i++) {
        const x = (i * 2) / n - 1;
        c[i] = x > th ? th : (x < -th ? -th : x);
      }
      clip.curve = c;
      clip.oversample = '4x';
      node.connect(clip); node = clip;
    }

    // Chorus
    if (s.chorusRate > 0 && s.chorusDepth > 0 && s.chorusMix > 0) {
      const cd = ctx.createDelay(0.05);
      cd.delayTime.setValueAtTime(s.chorusDepth/1000, t);
      const clfo = ctx.createOscillator();
      clfo.type = 'sine'; clfo.frequency.setValueAtTime(s.chorusRate, t);
      const clg = ctx.createGain();
      clg.gain.setValueAtTime(s.chorusDepth/2000, t);
      clfo.connect(clg); clg.connect(cd.delayTime);
      const dry = ctx.createGain(); dry.gain.setValueAtTime(1-s.chorusMix*0.5, t);
      const wet = ctx.createGain(); wet.gain.setValueAtTime(s.chorusMix*0.5, t);
      node.connect(dry); node.connect(cd); cd.connect(wet);
      const merge = ctx.createGain();
      dry.connect(merge); wet.connect(merge); node = merge;
      clfo.start(t); clfo.stop(t+dur);
    }

    // Phaser
    if (s.phaserRate > 0 && s.phaserDepth > 0) {
      const ap = ctx.createBiquadFilter();
      ap.type = 'allpass'; ap.frequency.setValueAtTime(1000, t); ap.Q.setValueAtTime(s.phaserDepth*10, t);
      const plfo = ctx.createOscillator();
      plfo.type = 'sine'; plfo.frequency.setValueAtTime(s.phaserRate, t);
      const plg = ctx.createGain(); plg.gain.setValueAtTime(800, t);
      plfo.connect(plg); plg.connect(ap.frequency);
      const pdry = ctx.createGain(); pdry.gain.setValueAtTime(1, t);
      const pwet = ctx.createGain(); pwet.gain.setValueAtTime(s.phaserFeedback, t);
      node.connect(pdry); node.connect(ap); ap.connect(pwet);
      const pmerge = ctx.createGain();
      pdry.connect(pmerge); pwet.connect(pmerge); node = pmerge;
      plfo.start(t); plfo.stop(t+dur);
    }

    // Delay
    if (s.delayTime > 0) {
      const d = ctx.createDelay(2);
      d.delayTime.setValueAtTime(s.delayTime/1000, t);
      const fb = ctx.createGain(); fb.gain.setValueAtTime(s.delayFeedback, t);
      const dry = ctx.createGain(); dry.gain.setValueAtTime(1, t);
      const wet = ctx.createGain(); wet.gain.setValueAtTime(0.5, t);
      node.connect(dry); node.connect(d);
      d.connect(fb); fb.connect(d);
      d.connect(wet);
      const m = ctx.createGain();
      dry.connect(m); wet.connect(m); node = m;
    }

    // Reverb
    if (s.reverbDecay > 0 && s.reverbMix > 0) {
      const conv = ctx.createConvolver();
      conv.buffer = this.revIR(ctx, s.reverbDecay);
      const rdry = ctx.createGain(); rdry.gain.setValueAtTime(1-s.reverbMix*0.5, t);
      const rwet = ctx.createGain(); rwet.gain.setValueAtTime(s.reverbMix*0.5, t);
      node.connect(rdry); node.connect(conv); conv.connect(rwet);
      const rm = ctx.createGain();
      rdry.connect(rm); rwet.connect(rm); node = rm;
    }

    // Material Resonator (Karplus-Strong)
    if (s.materialType !== 'none') {
      const ksOut = this.ksResonator(ctx, node, s, t, dur);
      node = ksOut;
    }

    // Cinematic Chug Engine (parallel blend)
    const chug = this.chugEngine(ctx, s, t, dur);
    if (chug) {
      const chugMix = ctx.createGain(); chugMix.gain.setValueAtTime(0.7, t);
      const mainMix = ctx.createGain(); mainMix.gain.setValueAtTime(1, t);
      node.connect(mainMix); chug.connect(chugMix);
      const blend = ctx.createGain();
      mainMix.connect(blend); chugMix.connect(blend);
      node = blend;
    }

    // Grain Gate (BPM synced stutter)
    const gate = this.grainGate(ctx, s, t, dur);
    if (gate) {
      node.connect(gate); node = gate;
    }

    // Distance & Environment (Convolution reverb + distance filter)
    if (s.envPreset !== 'none') {
      const envConv = ctx.createConvolver();
      envConv.buffer = this.envIR(ctx, s.envPreset);
      const distFilt = ctx.createBiquadFilter();
      distFilt.type = 'lowpass';
      const distCutoff = 20000 * Math.pow(0.5, s.distance/50);
      distFilt.frequency.setValueAtTime(Math.max(200, distCutoff), t);
      const wetGain = ctx.createGain();
      const distMix = s.distance / 100;
      wetGain.gain.setValueAtTime(distMix, t);
      const dryGain = ctx.createGain();
      dryGain.gain.setValueAtTime(1-distMix*0.5, t);
      node.connect(distFilt); distFilt.connect(envConv); envConv.connect(wetGain);
      node.connect(dryGain);
      const distMerge = ctx.createGain();
      dryGain.connect(distMerge); wetGain.connect(distMerge);
      node = distMerge;
    }

    // Air absorption (distance high-cut)
    if (s.airAbsorb > 0) {
      const air = ctx.createBiquadFilter();
      air.type = 'lowpass';
      air.frequency.setValueAtTime(20000 * (1-s.airAbsorb*0.9), t);
      node.connect(air); node = air;
    }

    // Trajectory Doppler shift (if trajectory points exist)
    if (typeof window !== 'undefined' && window.getDopplerFromTraj && window.getHRTFPosition) {
      const dop = window.getDopplerFromTraj();
      const pos = window.getHRTFPosition();
      if (dop !== 0) {
        // Apply detune to all active oscillators via frequency modulation
        // This is simplified — real implementation would need oscillator reference
      }
      if (s.hrtfPan > 0) {
        const hrtfPan = ctx.createStereoPanner();
        hrtfPan.pan.setValueAtTime(pos.x * s.hrtfPan, t);
        node.connect(hrtfPan); node = hrtfPan;
      }
    }

    // Pan
    const pan = ctx.createStereoPanner();
    pan.pan.setValueAtTime(s.pan, t);
    node.connect(pan); node = pan;

    // Output
    node.connect(out || ctx.destination);
  }

  triggerSound(s) {
    this.resume();
    const dur = this.dur(s);
    const t = this.ctx.currentTime + 0.01;
    this.analyser.disconnect();
    this.analyser.connect(this.ctx.destination);
    // Apply trajectory doppler if points exist (restore after)
    let dop = 0;
    if (typeof window !== 'undefined' && window.getDopplerFromTraj) {
      dop = window.getDopplerFromTraj();
    }
    const origFreq = s.baseFreq;
    if (dop !== 0 && s.dopplerAmt > 0) s.baseFreq = Math.max(20, Math.min(8000, origFreq + dop));
    this.build(this.ctx, s, t, dur, this.analyser);
    s.baseFreq = origFreq;
    return dur;
  }

  async exportAtlas(s) {
    const count = s.atlasCount || 10;
    const gap = s.atlasGap || 0.1;
    const sr = s.sampleReduction * 1000;
    const dur = this.dur(s);
    const totalDur = (dur + gap) * count;
    const ctx = new OfflineAudioContext(1, Math.ceil(sr * totalDur), sr);
    let offset = 0;
    const sprites = [];
    for (let i = 0; i < count; i++) {
      // Mutate a copy
      const copy = JSON.parse(JSON.stringify(s));
      // Small random variation (5-10%)
      const vary = (val, min, max, pct) => {
        const range = (max - min) * pct;
        return Math.max(min, Math.min(max, val + (Math.random() - 0.5) * 2 * range));
      };
      copy.baseFreq = vary(copy.baseFreq, 20, 4000, 0.05);
      copy.filterCutoff = vary(copy.filterCutoff, 20, 20000, 0.05);
      copy.attack = vary(copy.attack, 0, 2, 0.05);
      copy.decay = vary(copy.decay, 0.01, 2, 0.05);
      copy.release = vary(copy.release, 0.01, 3, 0.05);
      copy.filterQ = vary(copy.filterQ, 0.1, 30, 0.05);
      copy.pan = vary(copy.pan, -1, 1, 0.05);
      this.build(ctx, copy, offset, dur, null);
      sprites.push({name: `variation_${i+1}`, start: offset/sr, end: (offset+dur)/sr});
      offset += (dur + gap) * sr;
    }
    const buf = await ctx.startRendering();
    // Export WAV
    this.encodeWAV(buf, 'audio_atlas.wav');
    // Export JSON
    const json = JSON.stringify({atlas: 'audio_atlas.wav', sampleRate: sr, sprites}, null, 2);
    const jBlob = new Blob([json], {type:'application/json'});
    const jUrl = URL.createObjectURL(jBlob);
    const ja = document.createElement('a');
    ja.href = jUrl; ja.download = 'audio_atlas.json'; ja.click();
    URL.revokeObjectURL(jUrl);
  }

  async exportSound(s, format) {
    const dur = this.dur(s);
    const sr = s.sampleReduction * 1000;
    const ctx = new OfflineAudioContext(1, Math.ceil(sr*(dur+0.3)), sr);
    this.build(ctx, s, 0, dur, null);
    const buf = await ctx.startRendering();
    return this.encode(buf, format);
  }

  encode(buf, format) {
    if (format === 'wav') return this.encodeWAV(buf);
    if (format === 'mp3') return this.encodeMP3(buf);
    return this.encodeWAV(buf);
  }

  encodeWAV(buf, filename) {
    const ch = buf.numberOfChannels;
    const sr = buf.sampleRate;
    const len = buf.length;
    const data = buf.getChannelData(0);
    const bps = 16;
    const bps2 = bps/8;
    const ba = ch * bps2;
    const ds = len * ba;
    const ab = new ArrayBuffer(44 + ds);
    const v = new DataView(ab);

    const ws = (o, s) => { for (let i=0; i<s.length; i++) v.setUint8(o+i, s.charCodeAt(i)); };
    ws(0, 'RIFF'); v.setUint32(4, 36+ds, true); ws(8, 'WAVE'); ws(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr*ba, true); v.setUint16(32, ba, true); v.setUint16(34, bps, true);
    ws(36, 'data'); v.setUint32(40, ds, true);

    for (let i=0; i<len; i++) {
      const s = Math.max(-1, Math.min(1, data[i]));
      v.setInt16(44+i*bps2, s<0 ? s*0x8000 : s*0x7FFF, true);
    }

    const blob = new Blob([ab], {type:'audio/wav'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename || `saranta-${Date.now()}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  }

  encodeMP3(buf) {
    if (typeof lamejs === 'undefined') {
      console.warn('lamejs not loaded, using WAV');
      return this.encodeWAV(buf);
    }
    const ch = buf.numberOfChannels;
    const sr = buf.sampleRate;
    const len = buf.length;
    const left = buf.getChannelData(0);
    const right = ch > 1 ? buf.getChannelData(1) : left;

    const enc = new lamejs.Mp3Encoder(ch, sr, 192);
    const out = [];
    const bs = 1152;
    const l16 = new Int16Array(len);
    const r16 = new Int16Array(len);
    for (let i=0; i<len; i++) {
      l16[i] = Math.max(-32768, Math.min(32767, left[i]*32767));
      r16[i] = Math.max(-32768, Math.min(32767, right[i]*32767));
    }
    for (let i=0; i<len; i+=bs) {
      const b = enc.encodeBuffer(l16.subarray(i, i+bs), r16.subarray(i, i+bs));
      if (b.length) out.push(b);
    }
    const end = enc.flush();
    if (end.length) out.push(end);

    const blob = new Blob(out, {type:'audio/mp3'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `saranta-${Date.now()}.mp3`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export default new AudioEngine();
