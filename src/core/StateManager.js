/**
 * Game State Manager
 * Handles game states: menu, playing, paused, gameover
 */

export const GameState = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAMEOVER: 'gameover',
  COUNTDOWN: 'countdown',
};

export class StateManager {
  constructor() {
    this.currentState = GameState.MENU;
    this.previousState = null;
    this.listeners = [];
  }

  setState(newState) {
    if (this.currentState !== newState) {
      this.previousState = this.currentState;
      this.currentState = newState;
      this.notifyListeners();
    }
  }

  getState() {
    return this.currentState;
  }

  isPlaying() {
    return this.currentState === GameState.PLAYING || 
           this.currentState === GameState.COUNTDOWN;
  }

  isInMenu() {
    return this.currentState === GameState.MENU;
  }

  isPaused() {
    return this.currentState === GameState.PAUSED;
  }

  isGameOver() {
    return this.currentState === GameState.GAMEOVER;
  }

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
    this.listeners.forEach(callback => callback(this.currentState, this.previousState));
  }

  resume() {
    if (this.isPaused()) {
      this.setState(this.previousState || GameState.PLAYING);
    }
  }
}

export default StateManager;
