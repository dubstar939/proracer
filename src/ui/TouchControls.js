/**
 * Touch Controls UI Component
 * Creates on-screen controls for mobile devices
 */

import { ui } from '../config/gameConfig.js';

export class TouchControls {
  constructor(inputHandler, canvas) {
    this.inputHandler = inputHandler;
    this.canvas = canvas;
    this.container = null;
    this.buttons = {};
    this.opacity = ui.touchControlsOpacity;
    
    this.createControls();
    this.bindEvents();
  }

  createControls() {
    // Create container
    this.container = document.createElement('div');
    this.container.id = 'touch-controls';
    this.container.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 200px;
      pointer-events: none;
      z-index: 1000;
      display: flex;
      justify-content: space-between;
      padding: 20px;
      box-sizing: border-box;
      opacity: ${this.opacity};
    `;

    // Left side - steering
    const leftControls = document.createElement('div');
    leftControls.style.cssText = `
      display: flex;
      gap: 15px;
      pointer-events: auto;
    `;

    // Right side - accelerate/brake
    const rightControls = document.createElement('div');
    rightControls.style.cssText = `
      display: flex;
      gap: 15px;
      pointer-events: auto;
    `;

    // Create buttons
    this.buttons.left = this.createButton('←', 'left');
    this.buttons.right = this.createButton('→', 'right');
    this.buttons.brake = this.createButton('BRAKE', 'brake', '#cc4444');
    this.buttons.accelerate = this.createButton('GAS', 'accelerate', '#44cc44');
    this.buttons.turbo = this.createButton('TURBO', 'turbo', '#4488ff');
    this.buttons.drift = this.createButton('DRIFT', 'drift', '#ffaa00');

    // Assemble left controls (steering + drift)
    leftControls.appendChild(this.buttons.left);
    leftControls.appendChild(this.buttons.right);
    const driftContainer = document.createElement('div');
    driftContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
    driftContainer.appendChild(this.buttons.drift);
    leftControls.appendChild(driftContainer);

    // Assemble right controls (pedals + turbo)
    rightControls.appendChild(this.buttons.brake);
    rightControls.appendChild(this.buttons.accelerate);
    const turboContainer = document.createElement('div');
    turboContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
    turboContainer.appendChild(this.buttons.turbo);
    rightControls.appendChild(turboContainer);

    this.container.appendChild(leftControls);
    this.container.appendChild(rightControls);
    document.body.appendChild(this.container);

    // Hide on desktop by default
    this.setVisible(!this.inputHandler.isTouchEnabled());
  }

  createButton(text, action, color = '#ffffff') {
    const button = document.createElement('div');
    button.className = `touch-btn touch-btn-${action}`;
    button.textContent = text;
    button.dataset.action = action;
    
    const size = action === 'accelerate' || action === 'brake' ? '80px' : '60px';
    const fontSize = action === 'accelerate' || action === 'brake' ? '14px' : '12px';
    
    button.style.cssText = `
      width: ${size};
      height: ${size};
      background: ${color};
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${fontSize};
      font-weight: bold;
      font-family: Arial, sans-serif;
      user-select: none;
      touch-action: none;
      pointer-events: auto;
      transition: transform 0.1s, opacity 0.2s;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      border: 3px solid rgba(255,255,255,0.3);
    `;

    return button;
  }

  bindEvents() {
    Object.keys(this.buttons).forEach(action => {
      const button = this.buttons[action];
      
      // Touch events
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleTouchStart(action);
        button.style.transform = 'scale(0.9)';
      });

      button.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.handleTouchEnd(action);
        button.style.transform = 'scale(1)';
      });

      button.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        this.handleTouchEnd(action);
        button.style.transform = 'scale(1)';
      });

      // Mouse events for testing on desktop
      button.addEventListener('mousedown', (e) => {
        this.handleTouchStart(action);
        button.style.transform = 'scale(0.9)';
      });

      button.addEventListener('mouseup', (e) => {
        this.handleTouchEnd(action);
        button.style.transform = 'scale(1)';
      });

      button.addEventListener('mouseleave', (e) => {
        this.handleTouchEnd(action);
        button.style.transform = 'scale(1)';
      });
    });
  }

  handleTouchStart(action) {
    this.inputHandler.setTouchControl(action, true);
  }

  handleTouchEnd(action) {
    this.inputHandler.setTouchControl(action, false);
  }

  setVisible(visible) {
    if (this.container) {
      this.container.style.display = visible ? 'flex' : 'none';
    }
  }

  setOpacity(opacity) {
    this.opacity = opacity;
    if (this.container) {
      this.container.style.opacity = opacity;
    }
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

export default TouchControls;
