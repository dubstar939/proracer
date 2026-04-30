/**
 * Input Handler - Keyboard and Touch Controls
 * Handles all player input with support for keyboard and mobile touch controls
 */

import { game } from '../config/gameConfig.js';

export class InputHandler {
  constructor() {
    this.keys = {};
    this.touchControls = {
      accelerate: false,
      brake: false,
      left: false,
      right: false,
      turbo: false,
      drift: false,
    };
    
    this.listeners = [];
    this.touchEnabled = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    this.bindEvents();
  }

  bindEvents() {
    // Keyboard events
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // Prevent default behavior for game keys
    const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyZ', 'KeyX'];
    document.addEventListener('keydown', (e) => {
      if (gameKeys.includes(e.code)) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  handleKeyDown(e) {
    this.keys[e.code] = true;
    this.notifyListeners();
  }

  handleKeyUp(e) {
    this.keys[e.code] = false;
    this.notifyListeners();
  }

  // Touch control methods
  setTouchControl(control, isActive) {
    if (this.touchControls.hasOwnProperty(control)) {
      this.touchControls[control] = isActive;
      this.notifyListeners();
    }
  }

  // State query methods
  isAccelerating() {
    return this.keys['ArrowUp'] || this.keys['KeyW'] || this.touchControls.accelerate;
  }

  isBraking() {
    return this.keys['ArrowDown'] || this.keys['KeyS'] || this.touchControls.brake;
  }

  isTurningLeft() {
    return this.keys['ArrowLeft'] || this.keys['KeyA'] || this.touchControls.left;
  }

  isTurningRight() {
    return this.keys['ArrowRight'] || this.keys['KeyD'] || this.touchControls.right;
  }

  isTurboPressed() {
    return this.keys['KeyX'] || this.touchControls.turbo;
  }

  isDriftPressed() {
    return this.keys['KeyZ'] || this.keys['Space'] || this.touchControls.drift;
  }

  isPausePressed() {
    return this.keys['Escape'] || this.keys['KeyP'];
  }

  isEnterPressed() {
    return this.keys['Enter'] || this.keys['Space'];
  }

  // Listener system for reactive updates
  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.getState()));
  }

  getState() {
    return {
      accelerating: this.isAccelerating(),
      braking: this.isBraking(),
      turningLeft: this.isTurningLeft(),
      turningRight: this.isTurningRight(),
      turbo: this.isTurboPressed(),
      drift: this.isDriftPressed(),
      pause: this.isPausePressed(),
      enter: this.isEnterPressed(),
    };
  }

  reset() {
    this.keys = {};
    this.touchControls = {
      accelerate: false,
      brake: false,
      left: false,
      right: false,
      turbo: false,
      drift: false,
    };
  }

  isTouchEnabled() {
    return this.touchEnabled;
  }
}

export default InputHandler;
