/**
 * Game Configuration
 * Centralized settings for difficulty, car stats, and environment themes
 */

export const CONFIG = {
  // Game settings
  game: {
    fps: 60,
    step: 1 / 60,
    canvasWidth: 1920,
    canvasHeight: 1080,
    responsive: true,
  },

  // Difficulty progression
  difficulty: {
    initialTraffic: 5,
    maxTraffic: 20,
    trafficIncreaseRate: 0.001, // per meter
    initialSpeed: 23000,
    maxSpeed: 35000,
    speedIncreaseRate: 0.0005, // per meter
    curveDifficultyMultiplier: 1.0,
  },

  // Player car stats
  playerCar: {
    width: 500,
    height: 400,
    maxSpeed: 26000,
    maxTurboSpeed: 28000,
    accel: 6800,
    braking: -16000,
    decel: -8000,
    offRoadDecel: -12000,
    turnSpeed: 3000,
    centrifugal: 0.3,
    turboDrainRate: 2.45,
    turboRechargeRate: 0.5,
  },

  // AI car stats
  aiCar: {
    baseMaxSpeed: 23000,
    speedVariation: 0.1,
    reactionTime: 0.2,
    aggression: 0.7,
  },

  // Environment themes
  themes: {
    day: {
      id: 'day',
      name: 'Day',
      road: '#3a3a3a',
      grassLight: '#047804',
      grassDark: '#006A00',
      laneMarker: '#CCCCCC',
      kerbLight: '#a02222',
      kerbDark: '#BBBBBB',
      sky: '#4576aa',
      fog: null,
      fogDensity: 25,
      backgroundTint: 'none',
    },
    dusk: {
      id: 'dusk',
      name: 'Dusk',
      road: '#3a3a3a',
      grassLight: '#0a5a0a',
      grassDark: '#004400',
      laneMarker: '#AAAAAA',
      kerbLight: '#881111',
      kerbDark: '#999999',
      sky: '#aa5522',
      fog: 'rgba(170, 85, 34, 0.3)',
      fogDensity: 30,
      backgroundTint: 'rgba(255, 150, 50, 0.2)',
    },
    night: {
      id: 'night',
      name: 'Night',
      road: '#222222',
      grassLight: '#003300',
      grassDark: '#002200',
      laneMarker: '#888888',
      kerbLight: '#551111',
      kerbDark: '#666666',
      sky: '#001133',
      fog: 'rgba(0, 10, 30, 0.5)',
      fogDensity: 35,
      backgroundTint: 'rgba(0, 0, 50, 0.3)',
    },
    city: {
      id: 'city',
      name: 'City',
      road: '#444444',
      grassLight: '#1a4a1a',
      grassDark: '#0f330f',
      laneMarker: '#DDDDDD',
      kerbLight: '#cc3333',
      kerbDark: '#AAAAAA',
      sky: '#334466',
      fog: 'rgba(50, 60, 80, 0.2)',
      fogDensity: 28,
      backgroundTint: 'rgba(100, 120, 150, 0.15)',
    },
    desert: {
      id: 'desert',
      name: 'Desert',
      road: '#5a4a3a',
      grassLight: '#c4a574',
      grassDark: '#a89060',
      laneMarker: '#EEEEEE',
      kerbLight: '#cc5533',
      kerbDark: '#CCCCCC',
      sky: '#87CEEB',
      fog: 'rgba(200, 180, 150, 0.15)',
      fogDensity: 22,
      backgroundTint: 'rgba(220, 190, 140, 0.1)',
    },
  },

  // Car skins (player selectable)
  carSkins: [
    {
      id: 'red',
      name: 'Red Racer',
      primaryColor: '#cc2211',
      secondaryColor: '#881100',
      accentColor: '#ff4422',
    },
    {
      id: 'blue',
      name: 'Blue Bolt',
      primaryColor: '#2244cc',
      secondaryColor: '#112288',
      accentColor: '#4466ff',
    },
    {
      id: 'green',
      name: 'Green Machine',
      primaryColor: '#22aa44',
      secondaryColor: '#116622',
      accentColor: '#44ff66',
    },
    {
      id: 'yellow',
      name: 'Yellow Flash',
      primaryColor: '#eeaa00',
      secondaryColor: '#aa7700',
      accentColor: '#ffcc00',
    },
  ],

  // Track settings
  track: {
    segmentLength: 300,
    lanes: 2,
    rumbleLength: 3,
    cameraDepth: 0.84,
    drawDistance: 300,
  },

  // Audio settings
  audio: {
    enabled: true,
    musicVolume: 0.3,
    sfxVolume: 0.5,
    engineVolume: 0.14,
  },

  // UI settings
  ui: {
    showFPS: false,
    showDebugInfo: false,
    touchControlsOpacity: 0.6,
  },
};

// Export individual sections for convenience
export const { game, difficulty, playerCar, aiCar, themes, carSkins, track, audio, ui } = CONFIG;

export default CONFIG;
