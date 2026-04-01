// ***************** 939PRO ARCHITECT: INTEGRATED 8-WAY ENGINE ***************** //

var v9_sprites = []; // Persistent 8-way sprite array

/**
 * PHASE 3: Perspective Generator
 * severity: 0 (Straight/Rear), 1 (Shallow), 2 (Mid), 3 (Profile)
 * flip: 0 (Left), 1 (Right)
 */
function generate939PROAngle(severity, flip) {
  m3();
  cntx = j9.x;
  
  var steerOffset = severity * 22; // Horizontal shift for 3D feel
  var hOffset = severity * 8;      // Vertical rake shift
  
  // --- UNDERGLOW LAYER (Baked into Sprite for Performance) ---
  g1(0.4);
  var neon = a6(40, 190, 200, 190);
  neon.addColorStop(0, "rgba(0, 150, 255, 0)");
  neon.addColorStop(0.5, "#0096ff");
  neon.addColorStop(1, "rgba(0, 150, 255, 0)");
  k4(neon);
  m0(30 + steerOffset, 192, 180 - (steerOffset*2), 8);
  g1(1);

  // --- DYNAMIC CHASSIS GEOMETRY (Phases 1 & 3) ---
  var bodyPoints = [
    10 + steerOffset, 185 - hOffset,    // Rear Bottom Left
    230 - steerOffset, 185 - hOffset,   // Rear Bottom Right
    240 - (steerOffset * 0.4), 145,      // Front Bumper
    235 - (steerOffset * 0.7), 90,       // Hood/Windshield
    180 - steerOffset, 40,               // Roof Peak Front
    65 + steerOffset, 42,                // Roof Peak Rear
    15 + (steerOffset * 0.3), 110        // Rear Deck
  ];
  
  // Base Body (Midnight Blue)
  o7(bodyPoints, severity == 0 ? '#1a1a2e' : '#16213e');
  
  // Accent Detail (Phase 1)
  o7([65+steerOffset,42, 180-steerOffset,40, 170-steerOffset,65, 75+steerOffset,65], '#0f3460');

  // --- LIGHTING SIGNATURES (Phase 2) ---
  if(severity < 2) { 
    // Taillights (Rear-facing)
    var brakeGrad = a6(20, 110, 20, 140);
    brakeGrad.addColorStop(0, "#ff0000");
    brakeGrad.addColorStop(1, "#660000");
    k4(brakeGrad);
    m0(25 + steerOffset, 115, 35 - steerOffset, 15); // Left
    m0(180 - steerOffset, 115, 35 - steerOffset, 15); // Right
  }
  
  if(severity > 1) {
    // Headlight Cones (Forward-facing Profile)
    g1(0.3);
    k3();
    p0(230 - steerOffset, 155);
    o8(290, 130); 
    o8(300, 195);
    o8(235, 175);
    k4('#ffffff');
    s9();
    g1(1);
    // Headlight Lens
    o7([225-steerOffset,160, 238-steerOffset,160, 238-steerOffset,168, 225-steerOffset,168], '#ffffff');
  }

  // --- TIRES ---
  k4('#111111');
  t4(40 + steerOffset, 185, 12, 0, PI*2);
  t4(200 - steerOffset, 185, 12, 0, PI*2);
  s9();

  return q3(flip); 
}

/**
 * REPLACING o6: The Main Generator Loop
 */
function o6() {
  v9_sprites = [];
  // 0-3: Left-facing angles | 4-7: Right-facing (mirrored)
  for(var i = 0; i < 4; i++) {
    v9_sprites[i] = generate939PROAngle(i, 0); 
    v9_sprites[i+4] = generate939PROAngle(i, 1);
  }
  // Assign legacy variables for backwards compatibility with engine
  f1 = v9_sprites[3]; // Full Left
  d3 = v9_sprites[7]; // Full Right
  b7 = v9_sprites[0]; // Straight Rear
}

/**
 * REPLACING m2: The High-Performance 8-Way Renderer
 */
function m2(scale, destX, destY, steer, updown, u1ShadowY) {
    // 1. Adaptive Perspective Selection
    var angleIdx = 0; 
    var absSteer = M.abs(steer);
    
    if (absSteer > 0.1) angleIdx = 1;
    if (absSteer > 0.4) angleIdx = 2;
    if (absSteer > 0.7) angleIdx = 3; 
    
    // Switch to mirrored sprites for right-hand steering
    if (steer > 0) angleIdx += 4; 

    var sprite = v9_sprites[angleIdx];
    var spriteScale = u1.width * scale / sprite.w;
    var finalY = destY + u1.u8;

    // 2. Grounding Shadow (Phase 2)
    g1(0.3);
    k4('#000000');
    k3();
    t4(destX + (sprite.w * spriteScale)/2, finalY + (sprite.h * spriteScale), (sprite.w * spriteScale)/1.5, 0, PI, false);
    s9();
    g1(1);

    // 3. Dynamic FX: Turbo Exhaust (Phase 2)
    if(u1.v5 && angleIdx % 4 === 0) { // Only show exhaust when facing straight-ish
        g1(0.7);
        var fSize = (10 + r9() * 15) * scale;
        e6(destX + (45 * spriteScale), finalY + (160 * scale), fSize, '#44aaff');
        e6(destX + (195 * spriteScale), finalY + (160 * scale), fSize, '#44aaff');
        g1(1);
    }

    // 4. Main Body Render (Phase 3 Fast-Path)
    t6.drawImage(j8, 
        sprite.x, sprite.y, sprite.w, sprite.h, 
        destX, finalY, 
        sprite.w * spriteScale, sprite.h * spriteScale
    );

    // 5. Dynamic FX: Brake Bloom (Phase 2)
    if(u1.brake && angleIdx % 4 === 0) {
        g1(0.5);
        k4('#ff0000');
        // tailling bloom overlay
        m0(destX + (25 * spriteScale), finalY + (100 * scale), 40 * spriteScale, 25 * scale);
        m0(destX + (175 * spriteScale), finalY + (100 * scale), 40 * spriteScale, 25 * scale);
        g1(1);
    }
}
