/**
 * AI Car Entity
 * Handles opponent car behavior and racing logic
 */

import { aiCar, playerCar as playerCarConfig } from '../config/gameConfig.js';

export class AICar {
  constructor(x, z, difficulty = 1) {
    // Position and dimensions
    this.x = x || 0;
    this.y = 0;
    this.z = z || 0;
    this.width = playerCarConfig.width;
    this.height = playerCarConfig.height;
    
    // Physics - scaled by difficulty
    this.maxSpeed = aiCar.baseMaxSpeed * (0.85 + difficulty * 0.15);
    this.speed = 0;
    this.speedPercent = 0;
    this.accel = this.maxSpeed / 4;
    this.decel = -this.maxSpeed / 5;
    
    // AI personality
    this.aggression = aiCar.aggression + (difficulty - 1) * 0.1;
    this.reactionTime = aiCar.reactionTime * (1.5 - difficulty * 0.3);
    this.takeCornerOnInside = Math.random() > 0.4;
    this.slowOnCorners = Math.random() > 0.6;
    
    // State
    this.index = 0;
    this.percent = 0;
    this.drift = false;
    
    // Visual
    this.bounce = 0;
  }

  update(dt, currentSegment, trackLength, player) {
    const speedPercent = this.speed / this.maxSpeed;
    const dx = dt * 2500 * speedPercent;
    
    // AI steering behavior
    this.updateSteering(currentSegment, dx, player);
    
    // Speed control
    let targetSpeed = this.maxSpeed;
    
    // Slow on corners if this AI does that
    if (this.slowOnCorners && Math.abs(currentSegment.curve) > 1) {
      targetSpeed *= 0.7;
    }
    
    // Avoid player collision
    if (player && this.isCloseToPlayer(player)) {
      targetSpeed *= 0.9;
      this.avoidPlayer(player);
    }
    
    // Accelerate/decelerate
    if (this.speed < targetSpeed) {
      this.speed += this.accel * dt;
      if (this.speed > targetSpeed) {
        this.speed = targetSpeed;
      }
    } else {
      this.speed += this.decel * dt;
      if (this.speed < targetSpeed) {
        this.speed = targetSpeed;
      }
    }
    
    // Update position
    this.z = (this.z + dt * this.speed) % trackLength;
    if (this.z < 0) this.z += trackLength;
    
    // Update segment percentage
    this.percent = (this.z % 300) / 300;
    
    // Visual bounce
    this.bounce = 2 * Math.random() * speedPercent;
    
    // Update speed percentage
    this.speedPercent = this.speed / this.maxSpeed;
  }

  updateSteering(segment, dx, player) {
    // Base steering on curve
    if (segment.curve < -0.5) {
      this.x -= dx;
    } else if (segment.curve > 0.5) {
      this.x += dx;
    }
    
    // Stay on track
    const trackLeft = segment.p1.world.x;
    const trackRight = segment.p2.world.x;
    const trackWidth = trackRight - trackLeft;
    
    // Preferred position based on AI personality
    let preferredX;
    if (this.takeCornerOnInside && segment.curve !== 0) {
      // Take inside line on corners
      if (segment.curve < 0) {
        preferredX = trackLeft + trackWidth * 0.2;
      } else {
        preferredX = trackRight - trackWidth * 0.2 - this.width;
      }
    } else {
      // Middle of track
      preferredX = trackLeft + (trackRight - trackLeft - this.width) / 2;
    }
    
    // Steer towards preferred position
    const centerCar = this.x + this.width / 2;
    const centerPreferred = preferredX + this.width / 2;
    
    if (centerCar < centerPreferred - 50) {
      this.x += dx * 0.5;
    } else if (centerCar > centerPreferred + 50) {
      this.x -= dx * 0.5;
    }
    
    // Keep within track bounds with some margin
    const margin = this.width * 0.15;
    if (this.x < trackLeft + margin) {
      this.x = trackLeft + margin;
    }
    if (this.x > trackRight - this.width - margin) {
      this.x = trackRight - this.width - margin;
    }
  }

  isCloseToPlayer(player) {
    const dz = Math.abs(this.z - player.z);
    return dz < 1000 && dz > 0;
  }

  avoidPlayer(player) {
    const dz = player.z - this.z;
    
    if (dz > 0 && dz < 1000) {
      // Player is behind, move away
      if (player.x > this.x) {
        this.x -= 50;
      } else {
        this.x += 50;
      }
    } else if (dz < 0 && dz > -1000) {
      // Player is ahead, try to overtake
      if (player.x < this.x) {
        this.x += 100;
      } else {
        this.x -= 100;
      }
    }
  }

  reset(x, z, index) {
    this.x = x;
    this.z = z;
    this.index = index;
    this.speed = 0;
    this.speedPercent = 0;
  }
}

export default AICar;
