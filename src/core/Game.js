/**
 * Main Game Class
 * Orchestrates all game systems and runs the game loop
 */

import { CONFIG, game, difficulty } from '../config/gameConfig.js';
import { InputHandler } from '../input/InputHandler.js';
import { TouchControls } from '../ui/TouchControls.js';
import { PlayerCar } from '../entities/PlayerCar.js';
import { AICar } from '../entities/AICar.js';
import { AudioManager } from '../audio/AudioManager.js';
import { StateManager, GameState } from '../core/StateManager.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Set canvas size
    this.resize();
    
    // Initialize systems
    this.input = new InputHandler();
    this.audio = new AudioManager();
    this.stateManager = new StateManager();
    
    // Touch controls (mobile only)
    this.touchControls = null;
    if (this.input.isTouchEnabled()) {
      this.touchControls = new TouchControls(this.input, canvas);
    }
    
    // Game entities
    this.player = null;
    this.aiCars = [];
    
    // Track and camera
    this.track = null;
    this.cameraZ = 0;
    this.cameraX = 0;
    
    // Game progression
    this.score = 0;
    this.distance = 0;
    this.level = 1;
    this.bestScore = parseInt(localStorage.getItem('racerun_best_score') || '0');
    
    // Timing
    this.lastTime = 0;
    this.accumulator = 0;
    this.step = game.step;
    
    // Bind methods
    this.loop = this.loop.bind(this);
    
    // State change handler
    this.stateManager.addListener((newState, oldState) => {
      this.onStateChange(newState, oldState);
    });
    
    // Window resize
    window.addEventListener('resize', () => this.resize());
    
    console.log('Game initialized');
  }

  resize() {
    if (game.responsive) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    } else {
      this.canvas.width = game.canvasWidth;
      this.canvas.height = game.canvasHeight;
    }
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  init() {
    this.audio.init();
    this.createTrack();
    this.resetGame();
    
    // Start game loop
    requestAnimationFrame(this.loop);
  }

  createTrack() {
    // Simple procedural track for now
    // Will be expanded with full track system
    this.track = {
      length: 30000, // 30km track
      segments: [],
      currentCurve: 0,
    };
    
    // Generate track segments
    this.generateTrack();
  }

  generateTrack() {
    const segmentLength = 300;
    const numSegments = Math.ceil(this.track.length / segmentLength);
    
    for (let i = 0; i < numSegments; i++) {
      const progress = i / numSegments;
      
      // Procedural curve generation
      let curve = 0;
      
      // Add some curves based on position
      if (i > 50 && i < 100) {
        curve = Math.sin(i * 0.1) * 3;
      } else if (i > 150 && i < 200) {
        curve = Math.cos(i * 0.08) * 4;
      } else if (i > 250) {
        curve = Math.sin(i * 0.05) * 2;
      }
      
      this.track.segments.push({
        index: i,
        z: i * segmentLength,
        curve: curve,
        p1: { world: { x: -600, y: 0, z: i * segmentLength } },
        p2: { world: { x: 600, y: 0, z: i * segmentLength } },
        p3: { world: { x: -600, y: 0, z: (i + 1) * segmentLength } },
        p4: { world: { x: 600, y: 0, z: (i + 1) * segmentLength } },
        kerbWidth: 500,
      });
    }
  }

  resetGame() {
    // Create player car
    const startX = 0;
    const startZ = 1000;
    this.player = new PlayerCar(startX, startZ, 'red');
    
    // Create AI cars
    this.aiCars = [];
    const aiCount = difficulty.initialTraffic;
    
    for (let i = 0; i < aiCount; i++) {
      const aiX = (i % 2 === 0 ? -300 : 300) - 250;
      const aiZ = startZ + 2000 + i * 800;
      const ai = new AICar(aiX, aiZ, 1);
      ai.index = i + 1;
      this.aiCars.push(ai);
    }
    
    // Reset camera
    this.cameraZ = startZ - 700;
    this.cameraX = startX + 250;
    
    // Reset score
    this.score = 0;
    this.distance = 0;
  }

  startGame() {
    this.resetGame();
    this.stateManager.setState(GameState.COUNTDOWN);
    this.startCountdown();
  }

  startCountdown() {
    let count = 3;
    const countdownInterval = setInterval(() => {
      this.audio.sounds.countdown();
      count--;
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        this.audio.sounds.raceStart();
        this.stateManager.setState(GameState.PLAYING);
        this.audio.startEngine();
      }
    }, 800);
  }

  pauseGame() {
    if (this.stateManager.isPlaying()) {
      this.stateManager.setState(GameState.PAUSED);
      this.audio.stopEngine();
    }
  }

  resumeGame() {
    if (this.stateManager.isPaused()) {
      this.stateManager.resume();
      this.audio.startEngine();
    }
  }

  gameOver() {
    this.stateManager.setState(GameState.GAMEOVER);
    this.audio.stopEngine();
    
    // Save best score
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('racerun_best_score', this.bestScore.toString());
    }
  }

  onStateChange(newState, oldState) {
    console.log('State changed:', oldState, '->', newState);
    
    switch (newState) {
      case GameState.MENU:
        this.input.reset();
        break;
      case GameState.PLAYING:
        break;
      case GameState.PAUSED:
        break;
      case GameState.GAMEOVER:
        break;
    }
  }

  update(dt) {
    if (!this.stateManager.isPlaying()) return;
    
    // Get input state
    const inputState = this.input.getState();
    
    // Update player controls
    this.player.setAccelerate(inputState.accelerating);
    this.player.setBrake(inputState.braking);
    this.player.setTurnLeft(inputState.turningLeft);
    this.player.setTurnRight(inputState.turningRight);
    this.player.setTurbo(inputState.turbo);
    this.player.setDrift(inputState.drift);
    
    // Find current segment
    const segmentIndex = Math.floor(this.player.z / 300) % this.track.segments.length;
    const currentSegment = this.track.segments[segmentIndex];
    
    // Update player
    this.player.update(dt, this.input, currentSegment, this.track.length);
    
    // Update AI cars
    this.aiCars.forEach(ai => {
      const aiSegmentIndex = Math.floor(ai.z / 300) % this.track.segments.length;
      const aiSegment = this.track.segments[aiSegmentIndex];
      ai.update(dt, aiSegment, this.track.length, this.player);
    });
    
    // Update camera to follow player
    this.cameraZ = this.player.z - 700;
    this.cameraX = this.player.x + this.player.width / 2;
    
    // Update score and distance
    this.distance = this.player.z / 100; // Convert to meters
    this.score = Math.floor(this.distance);
    
    // Update audio
    this.audio.updateEngine(this.player.speedPercent, this.player.turbo);
    
    // Check for pause
    if (inputState.pause) {
      this.pauseGame();
    }
    
    // Difficulty progression
    this.updateDifficulty();
  }

  updateDifficulty() {
    // Increase difficulty based on distance
    const progress = this.distance / 10000; // Every 10km
    
    if (progress > this.level) {
      this.level++;
      // Could add more traffic, increase speeds, etc.
    }
  }

  render() {
    const ctx = this.ctx;
    
    // Clear screen
    ctx.fillStyle = '#4576aa'; // Sky color
    ctx.fillRect(0, 0, this.width, this.height);
    
    if (this.stateManager.isInMenu()) {
      this.renderMenu();
    } else if (this.stateManager.isPaused()) {
      this.renderGame();
      this.renderPauseOverlay();
    } else if (this.stateManager.isGameOver()) {
      this.renderGame();
      this.renderGameOver();
    } else if (this.stateManager.isInMenu() === false) {
      this.renderGame();
      
      if (this.stateManager.getState() === GameState.COUNTDOWN) {
        this.renderCountdown();
      }
      
      this.renderHUD();
    }
  }

  renderMenu() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    // Title
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 80px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RACERUN', w / 2, h / 3);
    
    // Subtitle
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText('ARCADE RACING', w / 2, h / 3 + 50);
    
    // Menu options
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    
    const menuY = h / 2;
    const spacing = 70;
    
    ctx.fillText('PRESS ENTER TO START', w / 2, menuY);
    ctx.font = '20px Arial, sans-serif';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('Arrow Keys / WASD to Drive', w / 2, menuY + 50);
    ctx.fillText('X - Turbo | Z - Drift | ESC - Pause', w / 2, menuY + 80);
    
    // Best score
    ctx.fillStyle = '#ffd700';
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText(`BEST SCORE: ${this.bestScore}`, w / 2, h - 100);
  }

  renderGame() {
    const ctx = this.ctx;
    
    // Draw road
    this.drawRoad();
    
    // Draw cars
    this.drawCars();
  }

  drawRoad() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    
    // Simple perspective road
    const horizonY = h * 0.4;
    const roadTopWidth = w * 0.1;
    const roadBottomWidth = w * 0.8;
    
    // Grass
    ctx.fillStyle = '#047804';
    ctx.fillRect(0, horizonY, w, h - horizonY);
    
    // Road
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.moveTo(w / 2 - roadTopWidth / 2, horizonY);
    ctx.lineTo(w / 2 + roadTopWidth / 2, horizonY);
    ctx.lineTo(w / 2 + roadBottomWidth / 2, h);
    ctx.lineTo(w / 2 - roadBottomWidth / 2, h);
    ctx.closePath();
    ctx.fill();
    
    // Lane marker
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 4;
    ctx.setLineDash([40, 40]);
    ctx.beginPath();
    ctx.moveTo(w / 2, horizonY);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Kerbs
    ctx.fillStyle = '#a02222';
    const kerbWidth = 20;
    ctx.fillRect(w / 2 - roadBottomWidth / 2 - kerbWidth, horizonY, kerbWidth, h - horizonY);
    ctx.fillRect(w / 2 + roadBottomWidth / 2, horizonY, kerbWidth, h - horizonY);
  }

  drawCars() {
    const ctx = this.ctx;
    
    // Draw player car (bottom center)
    this.drawCar(this.player, this.width / 2 - 100, this.height - 200, true);
    
    // Draw AI cars (based on relative Z position)
    this.aiCars.forEach(ai => {
      const dz = ai.z - this.player.z;
      if (dz > 0 && dz < 5000) {
        const scale = 1 - dz / 5000;
        const x = this.width / 2 - 100 + (ai.x - this.player.x) * scale * 0.5;
        const y = this.height - 200 - dz * scale * 0.1;
        this.drawCar(ai, x, y, false, scale);
      }
    });
  }

  drawCar(car, x, y, isPlayer, scale = 1) {
    const ctx = this.ctx;
    const w = 200 * scale;
    const h = 100 * scale;
    
    // Car body
    ctx.fillStyle = isPlayer ? '#cc2211' : '#4444ff';
    ctx.fillRect(x, y, w, h);
    
    // Car top
    ctx.fillStyle = isPlayer ? '#881100' : '#2222aa';
    ctx.fillRect(x + w * 0.2, y - h * 0.5, w * 0.6, h * 0.5);
    
    // Wheels
    ctx.fillStyle = '#222222';
    ctx.fillRect(x - w * 0.1, y + h * 0.3, w * 0.2, h * 0.4);
    ctx.fillRect(x + w * 0.9, y + h * 0.3, w * 0.2, h * 0.4);
    
    // Lights
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(x + w * 0.1, y + h * 0.1, w * 0.2, h * 0.2);
    ctx.fillRect(x + w * 0.7, y + h * 0.1, w * 0.2, h * 0.2);
    
    // Turbo effect
    if (isPlayer && car.turbo) {
      ctx.fillStyle = '#4488ff';
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.moveTo(x, y + h * 0.3);
      ctx.lineTo(x - 30 * scale, y + h * 0.5);
      ctx.lineTo(x, y + h * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  renderHUD() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(20, 20, 200, 120);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'left';
    
    // Speed
    ctx.fillText(`SPEED: ${this.player.getSpeedKmH()} km/h`, 40, 55);
    
    // Score
    ctx.fillText(`SCORE: ${this.score}`, 40, 85);
    
    // Distance
    ctx.fillText(`DIST: ${(this.distance / 1000).toFixed(1)} km`, 40, 115);
    
    // Turbo meter
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(w - 220, 20, 200, 40);
    
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(w - 210, 30, 180 * (this.player.turboAmount / 100), 20);
    
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(w - 210, 30, 180, 20);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TURBO', w - 110, 55);
    
    // Position
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(this.player.getPosition(), w - 40, 80);
  }

  renderCountdown() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, w, h);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 200px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GO!', w / 2, h / 2);
  }

  renderPauseOverlay() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, w, h);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSED', w / 2, h / 2 - 50);
    
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText('Press ESC to Resume', w / 2, h / 2 + 30);
    ctx.fillText('Press M for Menu', w / 2, h / 2 + 70);
  }

  renderGameOver() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, w, h);
    
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 80px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', w / 2, h / 2 - 100);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '40px Arial, sans-serif';
    ctx.fillText(`FINAL SCORE: ${this.score}`, w / 2, h / 2);
    
    if (this.score >= this.bestScore && this.score > 0) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 32px Arial, sans-serif';
      ctx.fillText('NEW BEST SCORE!', w / 2, h / 2 + 60);
    }
    
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText('Press ENTER to Restart', w / 2, h / 2 + 120);
    ctx.fillText('Press M for Menu', w / 2, h / 2 + 160);
  }

  handleInput() {
    const inputState = this.input.getState();
    
    // Menu input
    if (this.stateManager.isInMenu()) {
      if (inputState.enter) {
        this.startGame();
      }
      return;
    }
    
    // Game over input
    if (this.stateManager.isGameOver()) {
      if (inputState.enter) {
        this.startGame();
      }
      return;
    }
    
    // Pause toggle
    if (inputState.pause && !this.pauseKeyLocked) {
      if (this.stateManager.isPaused()) {
        this.resumeGame();
      } else if (this.stateManager.isPlaying()) {
        this.pauseGame();
      }
      this.pauseKeyLocked = true;
    }
    
    if (!inputState.pause) {
      this.pauseKeyLocked = false;
    }
  }

  loop(timestamp) {
    // Calculate delta time
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;
    
    // Handle input
    this.handleInput();
    
    // Fixed timestep update
    this.accumulator += dt;
    while (this.accumulator >= this.step) {
      this.update(this.step);
      this.accumulator -= this.step;
    }
    
    // Render
    this.render();
    
    // Continue loop
    requestAnimationFrame(this.loop);
  }

  destroy() {
    this.audio.destroy();
    if (this.touchControls) {
      this.touchControls.destroy();
    }
  }
}

export default Game;
