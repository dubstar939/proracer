# RaceRun - Arcade Racing Game

A retro-style arcade racing game built with vanilla JavaScript and HTML5 Canvas. Experience tight controls, challenging AI opponents, and smooth 60 FPS gameplay on both desktop and mobile devices.

## 🎮 Features

### Core Gameplay
- **Tight, responsive controls** - Keyboard (Arrow Keys/WASD) and touch controls for mobile
- **Turbo boosts** - Build up and deploy turbo for speed bursts
- **Drift mechanics** - Execute drifts around corners for style points
- **AI opponents** - Race against computer-controlled cars with varying difficulty
- **Collision detection** - Realistic collision with track boundaries and other cars

### Game Structure
- **Start screen** - Clean menu with Play, How to Play, and Settings
- **In-game HUD** - Speed, score, distance, position, and turbo meter
- **Progressive difficulty** - Traffic increases as you race further
- **Pause menu** - Press ESC or tap pause button
- **Game over screen** - Final score, best score (saved locally), quick restart

### Content & Variety
- **Multiple environment themes** - Day, Dusk, Night, City, Desert (configurable)
- **Car skins** - 4 selectable car colors (Red, Blue, Green, Yellow)
- **Procedural track generation** - Varied curves and straights
- **Dynamic traffic patterns** - AI cars with different behaviors

### Polish & Feedback
- **Screen effects** - Visual feedback on crash and near-miss
- **Engine sounds** - Procedurally generated audio that responds to speed
- **SFX** - Countdown, race start, lap complete sounds
- **Visual turbo effect** - Blue flames when turbo is active

### Technical Quality
- **Clean modular code** - ES6 modules with separation of concerns
- **Frame-rate independent** - Fixed timestep game loop
- **Responsive design** - Works on any screen size
- **Mobile-ready** - Touch controls with large tap targets
- **No external dependencies** - Pure vanilla JavaScript

## 🚀 Quick Start

### Local Development

1. **Clone or download** this repository

2. **Start a local server** (any HTTP server will work):
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Using Node.js
   npx http-server . -p 8080
   
   # Using PHP
   php -S localhost:8080
   ```

3. **Open in browser**: Navigate to `http://localhost:8080`

### Production Deployment

The game is ready to deploy to any static hosting service:

**Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Netlify:**
```bash
# Drag and drop the folder to Netlify Drop
# Or use Netlify CLI
```

**GitHub Pages:**
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select branch and folder

## 🎯 Controls

### Desktop
| Key | Action |
|-----|--------|
| ↑ / W | Accelerate |
| ↓ / S | Brake |
| ← / A | Turn Left |
| → / D | Turn Right |
| X | Turbo Boost |
| Z / Space | Drift |
| ESC | Pause |
| ENTER | Start / Restart |

### Mobile
- **Left side**: Steering buttons (← →) and Drift
- **Right side**: Brake and Gas pedals, Turbo button
- Touch controls appear automatically on touch-enabled devices

## 📁 Project Structure

```
/workspace
├── index.html              # Main HTML file (new version: index_new.html)
├── src/
│   ├── core/
│   │   ├── Game.js         # Main game class, orchestrates everything
│   │   └── StateManager.js # Game state management (menu, playing, paused, etc.)
│   ├── config/
│   │   └── gameConfig.js   # Centralized configuration
│   ├── input/
│   │   └── InputHandler.js # Keyboard and touch input handling
│   ├── entities/
│   │   ├── PlayerCar.js    # Player car physics and controls
│   │   └── AICar.js        # AI opponent behavior
│   ├── ui/
│   │   └── TouchControls.js # On-screen touch controls
│   ├── audio/
│   │   └── AudioManager.js # Audio system (SFX, engine sounds)
│   └── utils/              # Utility functions
├── assets/                  # Game assets (sprites, audio, fonts)
├── js/                      # Legacy code (original racerun template)
└── media/                   # Legacy media files
```

## ⚙️ Configuration

Edit `src/config/gameConfig.js` to customize:

```javascript
{
  // Game settings
  game: {
    fps: 60,
    canvasWidth: 1920,
    canvasHeight: 1080,
    responsive: true,
  },
  
  // Difficulty
  difficulty: {
    initialTraffic: 5,
    maxTraffic: 20,
    trafficIncreaseRate: 0.001,
  },
  
  // Car stats
  playerCar: {
    maxSpeed: 26000,
    maxTurboSpeed: 28000,
    accel: 6800,
  },
  
  // Environment themes
  themes: {
    day: { /* colors */ },
    dusk: { /* colors */ },
    night: { /* colors */ },
  },
}
```

## 🎨 Customization

### Adding New Car Skins
Add to `carSkins` array in `gameConfig.js`:
```javascript
{
  id: 'purple',
  name: 'Purple Lightning',
  primaryColor: '#8b44cc',
  secondaryColor: '#5522aa',
  accentColor: '#aa66ff',
}
```

### Adding New Themes
Add to `themes` object in `gameConfig.js`:
```javascript
sunset: {
  id: 'sunset',
  name: 'Sunset',
  road: '#443333',
  grassLight: '#cc6644',
  grassDark: '#aa4422',
  sky: '#ff8844',
  // ... other properties
}
```

## 🔧 Development

### Building (Optional)
The game runs directly from source files. For production optimization:

```bash
npm install
npm run build
```

### Running Tests
```bash
npm test
```

### Code Style
- ES6+ JavaScript
- Modules for organization
- Consistent naming conventions
- JSDoc comments for public APIs

## 📱 Mobile Considerations

- Touch controls auto-detect and display on mobile devices
- Large tap targets (60-80px buttons)
- Prevents default touch behaviors (scrolling, zooming)
- Responsive canvas sizing
- Optimized for both portrait and landscape orientations

## 🏆 Scoring

- **Distance**: Primary score metric (1 point per 100 meters)
- **Best Score**: Saved to localStorage
- **Position**: Finish ahead of AI cars for bonus points (future feature)

## 🐛 Known Limitations

- Current rendering uses simplified 2D perspective (not full pseudo-3D like original)
- Track generation is procedural but limited variety
- No multiplayer mode
- Limited sound effects (procedurally generated)

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 🙏 Credits

Built upon the classic "Racer Run" arcade template, modernized and refactored for contemporary web standards.

---

**Enjoy the race! 🏁**
