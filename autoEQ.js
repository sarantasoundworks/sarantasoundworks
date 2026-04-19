/**
 * Auto EQ (EQ Match) Algorithm for 8-Band Parametric EQ
 * ISO 266 1/3 Octave LTAS Reference Curves + Weighted Least Squares
 * Implements: psychoacoustic weighting, edge frequency tapering,
 * gain/Q guardrails, and dry/wet amount control.
 */

const ISO_FREQS = [
  20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400,
  500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000,
  6300, 8000, 10000, 12500, 16000, 20000
];

const PSYCHO_WEIGHTS = [
  0.15, 0.18, 0.22, 0.28, 0.35, 0.42, 0.52, 0.60, 0.68, 0.75,
  0.82, 0.88, 0.93, 0.97, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00,
  1.00, 1.00, 1.00, 0.97, 0.90, 0.80, 0.65, 0.50, 0.38, 0.28, 0.20
];

const GUARDRAILS = {
  MAX_GAIN: 8,
  MAX_Q: 2.5,
  EDGE_LO: 30,
  EDGE_HI: 15000,
  TAPER_LO: 50,
  TAPER_HI: 12500,
};

class AutoEQ {
  constructor(genreLTAS) {
    this.genreLTAS = genreLTAS;
    this.isoFreqs = ISO_FREQS;
    this.psychoW = PSYCHO_WEIGHTS;
  }

  edgeWeight(f) {
    if (f < GUARDRAILS.EDGE_LO) return 0;
    if (f < GUARDRAILS.TAPER_LO) return (f - GUARDRAILS.EDGE_LO) / (GUARDRAILS.TAPER_LO - GUARDRAILS.EDGE_LO);
    if (f > GUARDRAILS.EDGE_HI) return 0;
    if (f > GUARDRAILS.TAPER_HI) return (GUARDRAILS.EDGE_HI - f) / (GUARDRAILS.EDGE_HI - GUARDRAILS.TAPER_HI);
    return 1;
  }

  psychoWeightAt(f) {
    f = Math.max(20, Math.min(20000, f));
    var logF = Math.log10(f);
    var t = (logF - Math.log10(20)) / (Math.log10(20000) - Math.log10(20)) * (this.isoFreqs.length - 1);
    var lo = Math.floor(t), hi = Math.min(lo + 1, this.psychoW.length - 1);
    var r = t - lo;
    return this.psychoW[lo] * (1 - r) + this.psychoW[hi] * r;
  }

  combinedWeight(f) {
    return this.edgeWeight(f) * this.psychoWeightAt(f);
  }

  clampGain(g) {
    return Math.max(-GUARDRAILS.MAX_GAIN, Math.min(GUARDRAILS.MAX_GAIN, g));
  }

  clampQ(q) {
    return Math.max(0.3, Math.min(GUARDRAILS.MAX_Q, q));
  }

  interpolateLTAS(ltasValues, targetFreqs) {
    var iso = this.isoFreqs;
    return targetFreqs.map(f => {
      var lo = 0;
      for (var k = 0; k < iso.length - 1; k++) {
        if (iso[k] <= f && f < iso[k + 1]) { lo = k; break; }
        if (k === iso.length - 2) lo = k;
      }
      var hi = Math.min(lo + 1, iso.length - 1);
      if (iso[lo] === iso[hi]) return ltasValues[lo];
      var r = (Math.log10(f) - Math.log10(iso[lo])) / (Math.log10(iso[hi]) - Math.log10(iso[lo]));
      return ltasValues[lo] + r * (ltasValues[hi] - ltasValues[lo]);
    });
  }

  normalizeTo1k(values, freqs) {
    var idx1k = freqs.reduce((best, f, i) => Math.abs(f - 1000) < Math.abs(freqs[best] - 1000) ? i : best, 0);
    var ref = values[idx1k] || 0;
    return values.map(v => v - ref);
  }

  calculateDelta(sourceDB, sourceFreqs, genre, amount) {
    var g = this.genreLTAS[genre];
    if (!g) throw new Error('Unknown genre: ' + genre);

    var targetAtSource = this.interpolateLTAS(g.ltas, sourceFreqs);
    var sourceNorm = this.normalizeTo1k(sourceDB, sourceFreqs);
    var targetNorm = this.normalizeTo1k(targetAtSource, sourceFreqs);

    return sourceFreqs.map((f, i) => {
      var delta = targetNorm[i] - sourceNorm[i];
      var w = this.combinedWeight(f);
      return this.clampGain(delta * w * amount);
    });
  }

  calculateEQ(sourceSpectrum, sourceFreqs, genre, amount) {
    amount = Math.max(0, Math.min(1, amount || 0.7));
    var delta = this.calculateDelta(sourceSpectrum, sourceFreqs, genre, amount);

    var bandDefs = [
      { freq: 60,   type: 'lowshelf'  },
      { freq: 120,  type: 'peaking'   },
      { freq: 300,  type: 'peaking'   },
      { freq: 800,  type: 'peaking'   },
      { freq: 2500, type: 'peaking'   },
      { freq: 5000, type: 'peaking'   },
      { freq: 10000,type: 'peaking'   },
      { freq: 20000,type: 'highshelf' },
    ];

    var bands = bandDefs.map(def => {
      var wSum = 0, wTotal = 0;
      for (var i = 0; i < sourceFreqs.length; i++) {
        var dist = Math.abs(Math.log2(sourceFreqs[i] / def.freq));
        var w = Math.exp(-0.5 * (dist / 0.8) ** 2) * this.combinedWeight(sourceFreqs[i]);
        wSum += delta[i] * w;
        wTotal += w;
      }
      var gain = wTotal > 0 ? wSum / wTotal : 0;
      return {
        frequency: def.freq,
        gain: this.clampGain(gain),
        q: this.clampQ(gain === 0 ? 1.0 : 1.0 + 0.1 * Math.abs(gain)),
        type: def.type,
      };
    });

    return bands;
  }

  applyToFilters(filters, bands, audioContext) {
    bands.forEach((band, i) => {
      if (i >= filters.length) return;
      var f = filters[i];
      f.frequency.setTargetAtTime(band.frequency, audioContext.currentTime, 0.02);
      f.Q.setTargetAtTime(band.q, audioContext.currentTime, 0.02);
      f.gain.setTargetAtTime(band.gain, audioContext.currentTime, 0.02);
    });
  }
}

export { AutoEQ, ISO_FREQS, PSYCHO_WEIGHTS, GUARDRAILS };
