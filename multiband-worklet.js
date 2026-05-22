'use strict';

const BAND_COUNT = 4;
const SUB_BANDS = 8;

let bandFreqs = [100, 300, 3000, 20000];
let bandThresholds = [-18, -18, -18, -18];
let bandRatios = [4, 4, 4, 4];
let bandAttacks = [0.01, 0.01, 0.01, 0.01];
let bandReleases = [0.1, 0.1, 0.1, 0.1];
let bandGains = [0, 0, 0, 0];
let bandEnabled = [1, 1, 1, 1];
let bandSpectral = [false, false, false, false];

let envLevel = new Float32Array(BAND_COUNT);
let subEnv = new Float32Array(BAND_COUNT * SUB_BANDS);

let grMsgCounter = 0;

var fState = [];
function resetFilters() {
  fState = [];
  for (var b = 0; b < BAND_COUNT; b++) {
    fState.push({
      lpL: {x1:0, x2:0, y1:0, y2:0},
      lpR: {x1:0, x2:0, y1:0, y2:0},
      hpL: {x1:0, x2:0, y1:0, y2:0},
      hpR: {x1:0, x2:0, y1:0, y2:0},
      bp: []
    });
    for (var s = 0; s < SUB_BANDS; s++) {
      fState[b].bp.push({x1:0, x2:0, y1:0, y2:0, env:0});
    }
  }
}
resetFilters();

function biquadLPF(input, freq, sr, s) {
  var K = Math.tan(Math.PI * freq / sr);
  var K2 = K * K;
  var n = 1 / (1 + K * 1.414213562 + K2);
  var b0 = K2 * n, b1 = 2 * b0;
  var a1 = 2 * (K2 - 1) * n;
  var a2 = (1 - K * 1.414213562 + K2) * n;
  var y = b0 * input + b1 * s.x1 + b0 * s.x2 - a1 * s.y1 - a2 * s.y2;
  s.x2 = s.x1; s.x1 = input; s.y2 = s.y1; s.y1 = y;
  return y;
}

function biquadHPF(input, freq, sr, s) {
  var K = Math.tan(Math.PI * freq / sr);
  var K2 = K * K;
  var n = 1 / (1 + K * 1.414213562 + K2);
  var b0 = n, b1 = -2 * n, b2 = n;
  var a1 = 2 * (K2 - 1) * n;
  var a2 = (1 - K * 1.414213562 + K2) * n;
  var y = b0 * input + b1 * s.x1 + b2 * s.x2 - a1 * s.y1 - a2 * s.y2;
  s.x2 = s.x1; s.x1 = input; s.y2 = s.y1; s.y1 = y;
  return y;
}

function biquadBPF(input, freq, bw, sr, s) {
  var w0 = 2 * Math.PI * freq / sr;
  var alpha = Math.sin(w0) / (2 * bw);
  var b0 = 1 + alpha;
  var b1 = -2 * Math.cos(w0);
  var b2 = 1 - alpha;
  var a0 = 1 + alpha;
  var a1 = -2 * Math.cos(w0);
  var a2 = 1 - alpha;
  var y = (b0 * input + b1 * s.x1 + b2 * s.x2 - a1 * s.y1 - a2 * s.y2) / a0;
  s.x2 = s.x1; s.x1 = input; s.y2 = s.y1; s.y1 = y;
  return y;
}

class MultibandProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    for (var i = 0; i < BAND_COUNT; i++) envLevel[i] = 0;
    for (var i = 0; i < BAND_COUNT * SUB_BANDS; i++) subEnv[i] = 0;
    grMsgCounter = 0;

    this.port.onmessage = (e) => {
      if (e.data.type === 'params') {
        if (e.data.freqs) bandFreqs = e.data.freqs;
        if (e.data.thresholds) for (var i = 0; i < BAND_COUNT; i++) bandThresholds[i] = e.data.thresholds[i];
        if (e.data.ratios) for (var i = 0; i < BAND_COUNT; i++) bandRatios[i] = Math.max(1, e.data.ratios[i]);
        if (e.data.attacks) for (var i = 0; i < BAND_COUNT; i++) bandAttacks[i] = e.data.attacks[i];
        if (e.data.releases) for (var i = 0; i < BAND_COUNT; i++) bandReleases[i] = e.data.releases[i];
        if (e.data.gains) for (var i = 0; i < BAND_COUNT; i++) bandGains[i] = e.data.gains[i];
        if (e.data.enabled) {
          for (var i = 0; i < BAND_COUNT; i++) bandEnabled[i] = e.data.enabled[i] ? 1 : 0;
        }
        if (e.data.spectral) for (var i = 0; i < BAND_COUNT; i++) bandSpectral[i] = !!e.data.spectral[i];
      }
    };
    this.port.postMessage({ type: 'ready' });
  }

  process(inputs, outputs) {
    var input = inputs[0], output = outputs[0];
    if (!input || !input.length || !output) return true;

    var iL = input[0], iR = input[1] || input[0];
    var oL = output[0], oR = output[1] || output[0];
    var len = iL.length;
    var sr = sampleRate || 44100;

    var bL = new Array(BAND_COUNT), bR = new Array(BAND_COUNT);
    for (var b = 0; b < BAND_COUNT; b++) { bL[b] = new Float32Array(len); bR[b] = new Float32Array(len); }

    var hiL = new Float32Array(len), hiR = new Float32Array(len);
    for (var n = 0; n < len; n++) { hiL[n] = iL[n]; hiR[n] = iR[n]; }

    for (var b = 0; b < BAND_COUNT - 1; b++) {
      var st = fState[b];
      for (var n = 0; n < len; n++) {
        var lo = biquadLPF(hiL[n], bandFreqs[b], sr, st.lpL);
        var hi = biquadHPF(hiL[n], bandFreqs[b], sr, st.hpL);
        bL[b][n] += lo;
        hiL[n] = hi;
        var loR = biquadLPF(hiR[n], bandFreqs[b], sr, st.lpR);
        var hiROut = biquadHPF(hiR[n], bandFreqs[b], sr, st.hpR);
        bR[b][n] += loR;
        hiR[n] = hiROut;
      }
    }
    bL[BAND_COUNT - 1] = hiL;
    bR[BAND_COUNT - 1] = hiR;

    var bandGR = new Float32Array(BAND_COUNT);
    var subGR = new Float32Array(BAND_COUNT * SUB_BANDS);
    for (var n = 0; n < len; n++) oL[n] = 0;
    for (var n = 0; n < len; n++) oR[n] = 0;

    for (var b = 0; b < BAND_COUNT; b++) {
      var atkC = Math.exp(-1 / (bandAttacks[b] * sr + 0.0001));
      var relC = Math.exp(-1 / (bandReleases[b] * sr + 0.0001));
      var threshDb = bandThresholds[b];
      var threshLin = Math.pow(10, threshDb / 20);
      var ratio = Math.max(1, bandRatios[b]);
      var makeup = Math.pow(10, bandGains[b] / 20);
      var en = bandEnabled[b];
      var isSpectral = bandSpectral[b];

      var subFreqs = [25, 40, 63, 100, 160, 250, 400, 630];
      if(b === 1) subFreqs = [80, 125, 200, 315, 500, 800, 1250, 2000];
      else if(b === 2) subFreqs = [400, 630, 1000, 1600, 2500, 4000, 6300, 10000];
      else if(b === 3) subFreqs = [2000, 3150, 5000, 8000, 12500, 16000, 20000, 20000];

      for (var n = 0; n < len; n++) {
        var env = (Math.abs(bL[b][n]) + Math.abs(bR[b][n])) * 0.5;
        
        if (env > envLevel[b]) envLevel[b] = atkC * envLevel[b] + (1 - atkC) * env;
        else envLevel[b] = relC * envLevel[b] + (1 - relC) * env;

        var gain = 1.0;
         var grDb = 0;

         if (bandEnabled[b] === 0) {
           // Band is disabled, mute this band
           continue;
         }

         if (en && envLevel[b] > threshLin && envLevel[b] > 0) {
          var dbOver = 20 * Math.log10(envLevel[b] / threshLin);
          if (dbOver > 0) {
            grDb = dbOver * (1 - 1 / ratio);
            gain = Math.pow(10, -grDb / 20);
            bandGR[b] += grDb;
          }
        }

        if (isSpectral && en) {
          for (var s = 0; s < SUB_BANDS; s++) {
            var bp = fState[b].bp[s];
            var subOut = biquadBPF(env, subFreqs[s], 1.5, sr, bp);
            var subIdx = b * SUB_BANDS + s;
            if (Math.abs(subOut) > subEnv[subIdx]) subEnv[subIdx] = atkC * subEnv[subIdx] + (1 - atkC) * Math.abs(subOut);
            else subEnv[subIdx] = relC * subEnv[subIdx] + (1 - relC) * Math.abs(subOut);
            
            var subThresh = threshLin * 0.4;
            if (subEnv[subIdx] > subThresh && subEnv[subIdx] > 0) {
              var subDb = 20 * Math.log10(subEnv[subIdx] / subThresh);
              if (subDb > 0) {
                var subGainDb = subDb * 0.3;
                gain *= Math.pow(10, -subGainDb / 20);
                subGR[subIdx] += subGainDb;
              }
            }
          }
        }

        if (en) gain *= makeup;
        oL[n] += bL[b][n] * gain;
        oR[n] += bR[b][n] * gain;
      }
    }

    grMsgCounter++;
    if (grMsgCounter >= 10) {
      grMsgCounter = 0;
      var grVals = [];
      for (var b = 0; b < BAND_COUNT; b++) {
        grVals.push(len > 0 ? bandGR[b] / len : 0);
      }
      this.port.postMessage({ type: 'gr', values: grVals });
    }

    return true;
  }
}

registerProcessor('multiband-processor', MultibandProcessor);