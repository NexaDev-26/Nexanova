/**
 * Sound Effects Utility
 * Provides haptic feedback and sound effects for user interactions
 */

class SoundEffects {
  constructor() {
    this.enabled = localStorage.getItem('soundEffects') !== 'false';
    this.volume = parseFloat(localStorage.getItem('soundVolume') || '0.3');
    this.audioContext = null;
    this.sounds = {};
  }

  init() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn('AudioContext not supported');
      }
    }
  }

  playTone(frequency, duration, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Achievement unlocked
  achievement() {
    this.playTone(523.25, 0.1, 'sine'); // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'sine'), 100); // E5
    setTimeout(() => this.playTone(783.99, 0.2, 'sine'), 200); // G5
    this.haptic('success');
  }

  // Success action
  success() {
    this.playTone(523.25, 0.15, 'sine');
    this.haptic('success');
  }

  // Error
  error() {
    this.playTone(200, 0.3, 'sawtooth');
    this.haptic('error');
  }

  // Click/tap
  click() {
    this.playTone(800, 0.05, 'square');
    this.haptic('light');
  }

  // Complete action
  complete() {
    this.playTone(440, 0.1, 'sine');
    setTimeout(() => this.playTone(554.37, 0.1, 'sine'), 80);
    this.haptic('medium');
  }

  // Haptic feedback
  haptic(type = 'light') {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 20, 30],
        success: [20, 10, 20],
        error: [50, 30, 50]
      };
      navigator.vibrate(patterns[type] || patterns.light);
    }
  }

  // Toggle sound effects
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('soundEffects', this.enabled);
    return this.enabled;
  }

  // Set volume
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('soundVolume', this.volume);
  }
}

// Export singleton instance
export const soundEffects = new SoundEffects();

// Initialize on import
if (typeof window !== 'undefined') {
  soundEffects.init();
}

