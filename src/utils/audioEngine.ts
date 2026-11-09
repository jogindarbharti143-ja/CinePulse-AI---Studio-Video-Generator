/**
 * Web Audio procedural synthesizer for atmospheric video background music.
 * Synthesizes four moodscapes: Cyber Synthwave, Deep Space Ambient, Cinematic Orchestral, and Lo-Fi Chill.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentTrack = 'Cyber Synthwave';
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private loopInterval: number | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setValueAtTime(clamped * 0.4, this.ctx.currentTime);
    }
  }

  public playTrack(trackName: string) {
    this.init();
    this.stop();
    this.currentTrack = trackName;
    this.isPlaying = true;

    if (trackName === 'Cyber Synthwave') {
      this.startSynthwave();
    } else if (trackName === 'Deep Space Ambient') {
      this.startDeepSpace();
    } else if (trackName === 'Cinematic Orchestral') {
      this.startOrchestral();
    } else {
      this.startLoFi();
    }
  }

  private startSynthwave() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Bass drone
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, ctx.currentTime); // A1 note

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);
    filter.Q.setValueAtTime(4, ctx.currentTime);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    this.activeNodes.push(osc);

    // Pulsing arpeggiated step
    const notes = [110, 130.81, 146.83, 164.81, 196.0]; // A2, C3, D3, E3, G3
    let step = 0;

    const interval = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const noteOsc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const noteFilter = ctx.createBiquadFilter();

      noteOsc.type = 'square';
      noteOsc.frequency.setValueAtTime(notes[step % notes.length], ctx.currentTime);

      noteFilter.type = 'lowpass';
      noteFilter.frequency.setValueAtTime(1200, ctx.currentTime);

      noteGain.gain.setValueAtTime(0.12, ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      noteOsc.connect(noteFilter);
      noteFilter.connect(noteGain);
      noteGain.connect(this.masterGain!);

      noteOsc.start();
      noteOsc.stop(ctx.currentTime + 0.4);

      step++;
    }, 280);

    this.loopInterval = interval;
  }

  private startDeepSpace() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Sub-bass ethereal drone with chorus detune
    const freqs = [43.65, 65.41, 87.31]; // F1, C2, F2
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (idx === 1 ? 0.3 : -0.2), ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);

      gain.gain.setValueAtTime(0.25 / freqs.length, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start();
      this.activeNodes.push(osc);
    });
  }

  private startOrchestral() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Warm strings chord (D minor pad)
    const chord = [146.83, 174.61, 220.0, 293.66]; // D3, F3, A3, D4
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start();
      this.activeNodes.push(osc);
    });
  }

  private startLoFi() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Warm electric piano chord
    const chord = [130.81, 164.81, 196.0, 246.94]; // C3, E3, G3, B3 (Cmaj7)
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start();
      this.activeNodes.push(osc);
    });
  }

  public stop() {
    this.isPlaying = false;
    if (this.loopInterval !== null) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
    this.activeNodes.forEach((node) => {
      try {
        if (typeof node === 'object' && node !== null && 'stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
      } catch {
        // ignore
      }
    });
    this.activeNodes = [];
  }

  public speakText(text: string, onEnd?: () => void) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 0.9;
      if (onEnd) {
        utterance.onend = onEnd;
      }
      window.speechSynthesis.speak(utterance);
    }
  }
}

export const audioEngine = new AudioEngine();
