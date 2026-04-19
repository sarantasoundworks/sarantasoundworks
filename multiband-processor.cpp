// Saranta Multiband Compressor - WASM Core Processor
// Compile with: emcc -s WASM=1 -s EXPORTED_FUNCTIONS="['_multiband_process','_multiband_init']" -o multiband.wasm multiband-processor.cpp

#include <cstdint>
#include <cmath>
#include <cstring>
#include <algorithm>

extern "C" {

#define MAX_BANDS 4
#define FFT_SIZE 2048
#define TYPICAL_SAMPLE_RATE 44100

struct BandState {
    float threshold;
    float ratio;
    float attack;
    float release;
    float gain;
    float envelope;
    uint8_t spectral_mode;
    uint8_t padding[3];
};

struct ProcessorState {
    BandState bands[MAX_BANDS];
    float ring_buffer[TYPICAL_SAMPLE_RATE * 4];
    uint32_t ring_write_pos;
    uint32_t sample_rate;
    
    float fft_real[FFT_SIZE];
    float fft_imag[FFT_SIZE];
    float window[FFT_SIZE];
    float overlap_buffer[FFT_SIZE];
    
    float gr_reduction;
    int32_t enabled;
};

static ProcessorState g_proc;

__attribute__((import_name("sandbox_get_now")))
double sandbox_get_now();

__attribute__((import_name("emscripten_notify_growth")))
void emscripten_notify_growth(int growth);

void multiband_init() {
    memset(&g_proc, 0, sizeof(ProcessorState));
    
    g_proc.sample_rate = TYPICAL_SAMPLE_RATE;
    g_proc.ring_write_pos = FFT_SIZE;
    g_proc.enabled = 1;
    
    for (int i = 0; i < FFT_SIZE; i++) {
        g_proc.window[i] = 0.5f * (1.0f - cosf(2.0f * 3.14159265359f * i / (FFT_SIZE - 1)));
    }
    
    for (int b = 0; b < MAX_BANDS; b++) {
        g_proc.bands[b].threshold = 0.0f;
        g_proc.bands[b].ratio = 4.0f;
        g_proc.bands[b].attack = 0.01f;
        g_proc.bands[b].release = 0.1f;
        g_proc.bands[b].gain = 0.0f;
        g_proc.bands[b].envelope = 0.0f;
        g_proc.bands[b].spectral_mode = 0;
    }
}

void multiband_set_band_params(int band, float threshold, float ratio, float attack, float release, float gain) {
    if (band < 0 || band >= MAX_BANDS) return;
    
    g_proc.bands[band].threshold = threshold;
    g_proc.bands[band].ratio = ratio;
    g_proc.bands[band].attack = attack;
    g_proc.bands[band].release = release;
    g_proc.bands[band].gain = gain;
}

void multiband_set_spectral_mode(int band, uint8_t mode) {
    if (band < 0 || band >= MAX_BANDS) return;
    g_proc.bands[band].spectral_mode = mode;
}

void multiband_set_threshold_db(int band, float db) {
    if (band < 0 || band >= MAX_BANDS) return;
    g_proc.bands[band].threshold = powf(10.0f, db / 20.0f);
}

void multiband_set_ratio(int band, float ratio) {
    if (band < 0 || band >= MAX_BANDS) return;
    g_proc.bands[band].ratio = ratio;
}

void multiband_set_attack_ms(int band, float ms) {
    if (band < 0 || band >= MAX_BANDS) return;
    g_proc.bands[band].attack = ms / 1000.0f;
}

void multiband_set_release_ms(int band, float ms) {
    if (band < 0 || band >= MAX_BANDS) return;
    g_proc.bands[band].release = ms / 1000.0f;
}

void multiband_set_gain_db(int band, float db) {
    if (band < 0 || band >= MAX_BANDS) return;
    g_proc.bands[band].gain = db;
}

void multiband_set_freq(int band, float freq) {
    (void)band;
    (void)freq;
}

void multiband_process_stft(float* input_left, float* input_right, 
                          float* output_left, float* output_right,
                          int num_samples) {
    if (!g_proc.enabled) {
        memcpy(output_left, input_left, num_samples * sizeof(float));
        memcpy(output_right, input_right, num_samples * sizeof(float));
        return;
    }
    
    float max_gr = 0.0f;
    
    for (int b = 0; b < MAX_BANDS; b++) {
        BandState& band = g_proc.bands[b];
        
        if (band.spectral_mode) {
            max_gr += process_band_spectral(input_left, input_right, output_left, output_right, 
                                        num_samples, band, b);
        }
    }
    
    g_proc.gr_reduction = max_gr;
}

void multiband_process_standard(float* input_left, float* input_right,
                             float* output_left, float* output_right,
                             int num_samples) {
    if (!g_proc.enabled) {
        memcpy(output_left, input_left, num_samples * sizeof(float));
        memcpy(output_right, input_right, num_samples * sizeof(float));
        return;
    }
    
    float max_gr = 0.0f;
    
    for (int i = 0; i < num_samples; i++) {
        float left = input_left[i];
        float right = input_right[i];
        
        float mid = (left + right) * 0.5f;
        float side = (left - right) * 0.5f;
        
        for (int b = 0; b < MAX_BANDS; b++) {
            BandState& band = g_proc.bands[b];
            
            if (!band.spectral_mode) {
                float env = fabsf(mid);
                
                float attack_coeff = band.attack > 0.0f ? 
                    expf(-1.0f / (band.attack * g_proc.sample_rate)) : 0.0f;
                float release_coeff = band.release > 0.0f ?
                    expf(-1.0f / (band.release * g_proc.sample_rate)) : 1.0f;
                
                float target_env = env;
                if (target_env > band.envelope) {
                    band.envelope = attack_coeff * band.envelope + (1.0f - attack_coeff) * target_env;
                } else {
                    band.envelope = release_coeff * band.envelope + (1.0f - release_coeff) * target_env;
                }
                
                float gain = 1.0f;
                if (band.threshold > 0.0f && band.envelope > band.threshold) {
                    float db_over = 20.0f * log10f(band.envelope / band.threshold);
                    if (db_over > 0.0f) {
                        float compressed_db = db_over * (1.0f - 1.0f / band.ratio);
                        gain = powf(10.0f, -compressed_db / 20.0f);
                    }
                }
                
                float makeup = powf(10.0f, band.gain / 20.0f);
                gain *= makeup;
                
                left *= gain;
                right *= gain;
            }
        }
        
        output_left[i] = left;
        output_right[i] = right;
        
        max_gr = fmaxf(max_gr, 1.0f - fabsf(left / (input_left[i] + 0.0001f)));
    }
    
    g_proc.gr_reduction = max_gr * 20.0f;
}

float process_band_spectral(float* input_left, float* input_right,
                         float* output_left, float* output_right,
                         int num_samples, BandState& band, int band_idx) {
    (void)band_idx;
    
    float gain = 1.0f;
    float makeup = powf(10.0f, band.gain / 20.0f);
    
    float env = 0.0f;
    for (int i = 0; i < num_samples; i++) {
        float mid = (input_left[i] + input_right[i]) * 0.5f;
        env += fabsf(mid);
    }
    env /= num_samples;
    
    if (band.threshold > 0.0f && env > band.threshold) {
        float db_over = 20.0f * log10f(env / band.threshold);
        if (db_over > 0.0f) {
            float compressed_db = db_over * (1.0f - 1.0f / band.ratio);
            gain = powf(10.0f, -compressed_db / 20.0f);
        }
    }
    
    for (int i = 0; i < num_samples; i++) {
        output_left[i] = input_left[i] * gain * makeup;
        output_right[i] = input_right[i] * gain * makeup;
    }
    
    return fabsf(1.0f - gain);
}

void multiband_process(float* input_left, float* input_right,
                     float* output_left, float* output_right,
                     int num_samples) {
    if (!g_proc.enabled) {
        memcpy(output_left, input_left, num_samples * sizeof(float));
        memcpy(output_right, input_right, num_samples * sizeof(float));
        return;
    }
    
    for (int i = 0; i < num_samples; i++) {
        float left_in = input_left[i];
        float right_in = input_right[i];
        
        float left = left_in;
        float right = right_in;
        
        for (int b = 0; b < MAX_BANDS; b++) {
            BandState& band = g_proc.bands[b];
            
            if (band.spectral_mode) {
                float env = fabsf((left + right) * 0.5f);
                float makeup = powf(10.0f, band.gain / 20.0f);
                
                float gain = 1.0f;
                if (band.threshold > 0.0f && env > band.threshold) {
                    float db_over = 20.0f * log10f(env / band.threshold);
                    if (db_over > 0.0f) {
                        float compressed_db = db_over * (1.0f - 1.0f / band.ratio);
                        gain = powf(10.0f, -compressed_db / 20.0f);
                    }
                }
                
                left *= gain * makeup;
                right *= gain * makeup;
            } else {
                float mid = (left + right) * 0.5f;
                float env = fabsf(mid);
                
                float attack_coeff = band.attack > 0.0f ?
                    expf(-1.0f / (band.attack * g_proc.sample_rate)) : 1.0f;
                float release_coeff = band.release > 0.0f ?
                    expf(-1.0f / (band.release * g_proc.sample_rate)) : 1.0f;
                
                float target_env = env;
                if (target_env > band.envelope) {
                    band.envelope = attack_coeff * band.envelope + (1.0f - attack_coeff) * target_env;
                } else {
                    band.envelope = release_coeff * band.envelope + (1.0f - release_coeff) * target_env;
                }
                
                float gain = 1.0f;
                if (band.threshold > 0.0f && band.envelope > band.threshold) {
                    float db_over = 20.0f * log10f(band.envelope / band.threshold);
                    if (db_over > 0.0f) {
                        float compressed_db = db_over * (1.0f - 1.0f / band.ratio);
                        gain = powf(10.0f, -compressed_db / 20.0f);
                    }
                }
                
                float makeup = powf(10.0f, band.gain / 20.0f);
                
                left *= gain * makeup;
                right *= gain * makeup;
            }
        }
        
        output_left[i] = left;
        output_right[i] = right;
    }
}

float multiband_get_gr() {
    return g_proc.gr_reduction;
}

void multiband_bypass(int enable) {
    g_proc.enabled = enable ? 1 : 0;
}

} // extern "C"