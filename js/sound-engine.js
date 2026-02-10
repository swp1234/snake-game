/**
 * Sound Engine - Web Audio API based sound effects
 * Lightweight, no external dependencies
 */

class SoundEngine {
    constructor() {
        this.audioContext = null;
        this.enabled = localStorage.getItem('sfx_enabled') !== 'false';
        this.volume = parseFloat(localStorage.getItem('sfx_volume')) || 0.5;
    }

    init() {
        if (!this.audioContext) {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext();
            } catch (e) {
                console.warn('Web Audio API not supported');
                return false;
            }
        }
        return true;
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('sfx_enabled', this.enabled);
        return this.enabled;
    }

    playTone(frequency, duration, type = 'sine') {
        if (!this.enabled || !this.init()) return;

        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = frequency;
        osc.type = type;
        gain.gain.setValueAtTime(this.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    }

    eat() {
        // Positive sound for eating food
        this.playTone(880, 0.1); // High pitch
        setTimeout(() => this.playTone(1100, 0.1), 50);
    }

    collision() {
        // Negative sound for collision
        this.playTone(200, 0.2);
        setTimeout(() => this.playTone(150, 0.2), 100);
    }

    gameOver() {
        // Game over sound (descending tones)
        this.playTone(400, 0.2);
        setTimeout(() => this.playTone(300, 0.2), 150);
        setTimeout(() => this.playTone(200, 0.3), 300);
    }

    levelUp() {
        // Level up sound
        this.playTone(523, 0.1);
        setTimeout(() => this.playTone(659, 0.1), 100);
        setTimeout(() => this.playTone(784, 0.15), 200);
    }

    click() {
        // UI click sound
        this.playTone(600, 0.08);
    }

    bonus() {
        // Bonus food sound
        this.playTone(1200, 0.1);
        setTimeout(() => this.playTone(1400, 0.1), 60);
        setTimeout(() => this.playTone(1600, 0.1), 120);
    }
}

// Global instance
window.sfx = new SoundEngine();
