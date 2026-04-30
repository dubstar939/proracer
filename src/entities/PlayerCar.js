/**
 * Player Car Entity
 * Handles player car physics, controls, and state
 */

import { playerCar as playerCarConfig, track } from '../config/gameConfig.js';

export class PlayerCar {
  constructor(x, z, skin = 'red') {
    // Position and dimensions
    this.x = x || 0;
    this.y = 0;
    this.z = z || 0;
    this.width = playerCarConfig.width;
    this.height = playerCarConfig.height;
    
    // Physics
    this.speed = 0;
    this.speedPercent = 0;
    this.maxSpeed = playerCarConfig.maxSpeed;
    this.maxTurboSpeed = playerCarConfig.maxTurboSpeed;
    this.accel = playerCarConfig.accel;
    this.braking = playerCarConfig.braking;
    this.decel = playerCarConfig.decel;
    this.offRoadDecel = playerCarConfig.offRoadDecel;
    this.turnSpeed = playerCarConfig.turnSpeed;
    this.centrifugal = playerCarConfig.centrifugal;
    
    // Turbo system
    this.turbo = false;
    this.turboAmount = 100;
    this.turboDrainRate = playerCarConfig.turboDrainRate;
    this.turboRechargeRate = playerCarConfig.turboRechargeRate;
    
    // Controls state
    this.accelerating = false;
    this.braking = false;
    this.turningLeft = false;
    this.turningRight = false;
    this.driftRequest = false;
    this.drift = false;
    this.driftAmount = 0;
    this.driftDirection = 0;
    
    // Race state
    this.lap = 0;
    this.currentLapTime = 0;
    this.lastLapTime = null;
    this.position = 1;
    this.finishPosition = null;
    
    // Visual effects
    this.slipstream = 0;
    this.slipstreamTime = 0;
    this.bounce = 0;
    this.yOffset = 0;
    
    // Skin/appearance
    this.skin = skin;
    
    // Collision
    this.percent = 0;
  }

  update(dt, input, currentSegment, trackLength) {
    const speedPercent = this.speed / this.maxSpeed;
    const dx = dt * this.turnSpeed * speedPercent;
    
    // Handle turbo
    this.updateTurbo(dt);
    
    // Handle drift
    this.updateDrift(dt);
    
    // Calculate effective max speed based on conditions
    let maxSpeed = this.turbo ? this.maxTurboSpeed : this.maxSpeed;
    let speedMultiplier = 1;
    let accelMultiplier = 1;
    
    // Slipstream boost
    if (this.slipstreamTime > 0) {
      speedMultiplier += 0.4;
    }
    
    // Off-road penalty
    const trackLeft = currentSegment.p1.world.x;
    const trackRight = currentSegment.p2.world.x;
    const trackWidth = trackRight - trackLeft;
    const carLeftSide = this.x;
    const carRightSide = this.x + this.width;
    const distanceToLeft = carLeftSide - trackLeft;
    const distanceToRight = trackRight - carRightSide;
    
    if (distanceToLeft < -this.width * 0.1 || distanceToRight < -this.width * 0.1) {
      const kerbWidth = currentSegment.kerbWidth || 500;
      if (distanceToLeft + this.width * 0.1 < -kerbWidth || 
          distanceToRight + this.width * 0.1 < -kerbWidth) {
        // Deep off-road
        speedMultiplier -= 0.6;
        accelMultiplier -= 0.2;
        this.bounce = 9.5;
      } else {
        // On kerb
        speedMultiplier -= 0.1;
        this.bounce = 6;
      }
    } else {
      this.bounce = 3.4;
    }
    
    // Apply centrifugal force on curves
    if (!this.drift) {
      this.x -= dx * speedPercent * currentSegment.curve * this.centrifugal;
    }
    
    // Apply steering
    let turnMultiplier = 1;
    if (this.drift && this.driftDirection !== 0) {
      turnMultiplier = 0.5;
    }
    
    if (this.turningLeft) {
      this.x -= dx * turnMultiplier;
    }
    if (this.turningRight) {
      this.x += dx * turnMultiplier;
    }
    
    // Apply drift lateral movement
    if (this.driftDirection !== 0) {
      this.x += this.driftDirection * this.speed * 0.00055;
    }
    
    // Update speed based on input
    if (this.accelerating) {
      if (this.turbo && this.speed < maxSpeed * speedMultiplier) {
        this.speed += this.accel * accelMultiplier * dt;
      } else if (this.speed < maxSpeed * speedMultiplier) {
        this.speed += this.accel * accelMultiplier * dt;
      } else {
        // Over-speed deceleration
        this.speed += this.decel * dt;
        if (this.speed < maxSpeed * speedMultiplier) {
          this.speed = maxSpeed * speedMultiplier;
        }
      }
    } else if (this.braking) {
      this.speed += this.braking * dt;
    } else {
      // Natural deceleration
      this.speed += this.decel * dt;
    }
    
    // Clamp speed
    this.speed = Math.max(0, this.speed);
    
    // Update position
    this.z = (this.z + dt * this.speed) % trackLength;
    if (this.z < 0) this.z += trackLength;
    
    // Update segment percentage for interpolation
    this.percent = (this.z % track.segmentLength) / track.segmentLength;
    
    // Update slipstream
    this.updateSlipstream(dt);
    
    // Visual bounce
    this.bounce = this.bounce * Math.random() * speedPercent;
    
    // Update speed percentage
    this.speedPercent = this.speed / this.maxSpeed;
  }

  updateTurbo(dt) {
    if (this.turbo) {
      this.turboAmount -= this.turboDrainRate * dt;
      if (this.turboAmount <= 0) {
        this.turbo = false;
        this.turboAmount = 0;
      }
    } else {
      // Recharge turbo when not in use
      if (this.turboAmount < 100) {
        this.turboAmount += this.turboRechargeRate * dt;
        if (this.turboAmount > 100) {
          this.turboAmount = 100;
        }
      }
    }
  }

  updateDrift(dt) {
    if (this.driftRequest && this.speed > 8000 && !this.accelerating) {
      if (!this.drift) {
        this.driftAmount = 1.2;
        this.drift = true;
      }
    } else {
      this.drift = false;
    }
    
    if (this.drift && this.speed > 8000) {
      this.driftAmount -= dt;
      if (this.driftAmount <= 0) {
        this.drift = false;
        this.driftAmount = 0;
      }
      
      // Determine drift direction
      if (this.driftDirection === 0) {
        if (this.turningLeft) {
          this.driftDirection = -1;
        } else if (this.turningRight) {
          this.driftDirection = 1;
        }
      }
    } else {
      this.driftDirection = 0;
    }
  }

  updateSlipstream(dt) {
    if (this.slipstreamTime > 0) {
      this.slipstreamTime -= dt;
      if (this.slipstreamTime <= 0) {
        this.slipstream = 0;
        this.slipstreamTime = 0;
      }
    }
  }

  setAccelerate(value) {
    this.accelerating = value;
  }

  setBrake(value) {
    this.braking = value;
  }

  setTurnLeft(value) {
    this.turningLeft = value;
  }

  setTurnRight(value) {
    this.turningRight = value;
  }

  setTurbo(value) {
    if (value && this.turboAmount > 0 && this.speed > 8000) {
      this.turbo = true;
    } else if (!value) {
      this.turbo = false;
    }
  }

  setDrift(value) {
    this.driftRequest = value;
  }

  getSpeed() {
    return this.speed;
  }

  getSpeedKmH() {
    return Math.round(this.speed / 100);
  }

  getPosition() {
    const i = this.position;
    const j = i % 10;
    const k = i % 100;
    if (j === 1 && k !== 11) return i + 'st';
    if (j === 2 && k !== 12) return i + 'nd';
    if (j === 3 && k !== 13) return i + 'rd';
    return i + 'th';
  }

  getLap() {
    return Math.max(1, this.lap);
  }

  getCurrentLapTime() {
    return this.currentLapTime;
  }

  reset(startX, startZ) {
    this.x = startX;
    this.z = startZ;
    this.speed = 0;
    this.speedPercent = 0;
    this.turbo = false;
    this.turboAmount = 100;
    this.drift = false;
    this.driftAmount = 0;
    this.driftDirection = 0;
    this.lap = 0;
    this.currentLapTime = 0;
    this.position = 1;
    this.finishPosition = null;
  }
}

export default PlayerCar;
