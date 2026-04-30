/**
 * Audio Manager
 * Handles all game audio: music, SFX, and engine sounds
 */

import { audio } from '../config/gameConfig.js';

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = audio.enabled;
    this.musicVolume = audio.musicVolume;
    this.sfxVolume = audio.sfxVolume;
    this.engineVolume = audio.engineVolume;
    
    // Audio buffers
    this.engineBuffer = null;
    this.turboBuffer = null;
    this.noiseBuffer = null;
    
    // Nodes
    this.engineNode = null;
    this.engineGain = null;
    this.musicNode = null;
    this.musicGain = null;
    
    // State
    this.engineSpeed = 1;
    this.turboSpeed = 1;
    this.isMuted = false;
    
    // Predefined SFX
    this.sounds = {};
  }

  init() {
    if (!this.enabled) return;
    
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      
      this.createEngineSound();
      this.createTurboSound();
      this.createNoiseBuffer();
      this.createSFX();
      
      console.log('Audio initialized');
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      this.enabled = false;
    }
  }

  createEngineSound() {
    if (!this.ctx) return;
    
    const bufferSize = 1024;
    const data = [];
    
    // Generate engine sound waveform
    for (let i = 0; i < bufferSize; i++) {
      // Base rumble
      let sample = Math.sin(i * 0.1) * 0.3;
      // Add harmonics
      sample += Math.sin(i * 0.2) * 0.2;
      sample += Math.sin(i * 0.05) * 0.15;
      // Add noise
      sample += (Math.random() - 0.5) * 0.1;
      data.push(sample);
    }
    
    this.engineBuffer = this.createBuffer(data);
  }

  createTurboSound() {
    if (!this.ctx) return;
    
    const bufferSize = 1024;
    const data = [];
    
    // Generate turbo whoosh sound
    for (let i = 0; i < bufferSize; i++) {
      // High frequency noise
      let sample = (Math.random() - 0.5) * 0.4;
      // Add some tone
      sample += Math.sin(i * 0.3) * 0.1;
      data.push(sample);
    }
    
    this.turboBuffer = this.createBuffer(data);
  }

  createNoiseBuffer() {
    if (!this.ctx) return;
    
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
    const data = new Float32Array(bufferSize);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    this.noiseBuffer = this.createBuffer(Array.from(data));
  }

  createBuffer(data) {
    const buffer = this.ctx.createBuffer(1, data.length, this.ctx.sampleRate);
    buffer.getChannelData(0).set(data);
    return buffer;
  }

  createSFX() {
    if (!this.ctx) return;
    
    // Crash sound
    this.sounds.crash = () => this.playCrash();
    
    // Start countdown beeps
    this.sounds.countdown = () => this.playCountdown();
    
    // Lap complete
    this.sounds.lapComplete = () => this.playLapComplete();
    
    // Race start
    this.sounds.raceStart = () => this.playRaceStart();
    
    // Near miss
    this.sounds.nearMiss = () => this.playNearMiss();
  }

  playCrash() {
    if (!this.ctx || this.isMuted) return;
    
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(100, this.ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    
    oscillator.connect(gain);
    gain.connect(this.ctx.destination);
    
    oscillator.start();
    oscillator.stop(this.ctx.currentTime + 0.3);
  }

  playCountdown() {
    if (!this.ctx || this.isMuted) return;
    
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(this.sfxVolume * 0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    
    oscillator.connect(gain);
    gain.connect(this.ctx.destination);
    
    oscillator.start();
    oscillator.stop(this.ctx.currentTime + 0.2);
  }

  playLapComplete() {
    if (!this.ctx || this.isMuted) return;
    
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, this.ctx.currentTime);
    oscillator.frequency.setValueAtTime(1100, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(this.sfxVolume * 0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    
    oscillator.connect(gain);
    gain.connect(this.ctx.destination);
    
    oscillator.start();
    oscillator.stop(this.ctx.currentTime + 0.3);
  }

  playRaceStart() {
    if (!this.ctx || this.isMuted) return;
    
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(880, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    
    oscillator.connect(gain);
    gain.connect(this.ctx.destination);
    
    oscillator.start();
    oscillator.stop(this.ctx.currentTime + 0.5);
  }

  playNearMiss() {
    if (!this.ctx || this.isMuted) return;
    
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, this.ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(this.sfxVolume * 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    
    oscillator.connect(gain);
    gain.connect(this.ctx.destination);
    
    oscillator.start();
    oscillator.stop(this.ctx.currentTime + 0.15);
  }

  startEngine() {
    if (!this.ctx || !this.engineBuffer) return;
    
    this.engineNode = this.ctx.createBufferSource();
    this.engineNode.buffer = this.engineBuffer;
    this.engineNode.loop = true;
    
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = this.isMuted ? 0 : this.engineVolume;
    
    this.engineNode.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);
    this.engineNode.start();
  }

  stopEngine() {
    if (this.engineNode) {
      this.engineNode.stop();
      this.engineNode = null;
    }
  }

  updateEngine(speedPercent, turboActive) {
    if (!this.engineNode || !this.ctx) return;
    
    // Pitch based on speed
    const basePitch = 0.5;
    const turboBoost = turboActive ? 0.5 : 0;
    this.engineNode.playbackRate.value = basePitch + speedPercent * 1.5 + turboBoost;
    
    // Volume modulation for engine load
    if (this.engineGain) {
      const targetVolume = this.isMuted ? 0 : this.engineVolume * (0.5 + speedPercent * 0.5);
      this.engineGain.gain.setTargetAtTime(targetVolume, this.ctx.currentTime, 0.1);
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    
    if (this.engineGain) {
      this.engineGain.gain.value = muted ? 0 : this.engineVolume;
    }
    if (this.musicGain) {
      this.musicGain.gain.value = muted ? 0 : this.musicVolume;
    }
  }

  setMusicVolume(volume) {
    this.musicVolume = volume;
    if (this.musicGain && !this.isMuted) {
      this.musicGain.gain.value = volume;
    }
  }

  setSFXVolume(volume) {
    this.sfxVolume = volume;
  }

  setEngineVolume(volume) {
    this.engineVolume = volume;
    if (this.engineGain && !this.isMuted) {
      this.engineGain.gain.value = volume;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  destroy() {
    this.stopEngine();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export default AudioManager;
