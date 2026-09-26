// Web Audio API & Speech Synthesis helper for SUGASTHA Portal

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Hospital OPD Announcement Chime (Classic Ding-Dong-Ding)
 */
export function playHospitalChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Notes: E5 (659Hz) -> C5 (523Hz) -> G4 (392Hz)
    const notes = [
      { freq: 659.25, time: now, dur: 0.35 },
      { freq: 523.25, time: now + 0.35, dur: 0.35 },
      { freq: 392.00, time: now + 0.70, dur: 0.65 }
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.25, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + dur);
    });
  } catch (e) {
    console.warn('Audio chime play failed:', e);
  }
}

/**
 * Success beep for QR / PIN Verification
 */
export function playSuccessBeep() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.setValueAtTime(1318.5, now + 0.08); // E6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {
    console.warn('Audio beep failed:', e);
  }
}

/**
 * Emergency Alarm for RED Triage
 */
export function playEmergencyAlarm() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    for (let i = 0; i < 2; i++) {
      const start = now + (i * 0.4);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(850, start);
      osc.frequency.linearRampToValueAtTime(1200, start + 0.2);

      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.35);
    }
  } catch (e) {
    console.warn('Emergency alarm failed:', e);
  }
}

/**
 * Phone ringing tone simulator (US/India style dual frequency 400Hz + 450Hz)
 */
export function playPhoneRing(durationMs: number = 2000) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const durSec = durationMs / 1000;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(400, now);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(450, now);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.setValueAtTime(0.15, now + durSec - 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durSec);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + durSec);
    osc2.stop(now + durSec);
  } catch (e) {
    console.warn('Phone ring tone failed:', e);
  }
}

/**
 * Phone Keypad DTMF Beep
 */
export function playKeypadBeep(digit: string) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const dtmfFrequencies: { [key: string]: [number, number] } = {
      '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
      '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
      '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
      '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
    };

    const freqs = dtmfFrequencies[digit] || [700, 1200];
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freqs[0], now);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freqs[1], now);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.15);
    osc2.stop(now + 0.15);
  } catch (e) {
    console.warn('Keypad beep failed:', e);
  }
}

/**
 * Voice announcement via Web Speech API (English or Hindi)
 */
export function announceVoice(text: string, lang: 'en' | 'hi' = 'en') {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    // Find matching Indian English / Hindi voice if available
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => 
      lang === 'hi' 
        ? v.lang.includes('hi') 
        : (v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US'))
    );
    if (voice) {
      utterance.voice = voice;
    }
    
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis failed:', err);
  }
}
