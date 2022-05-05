/*************************************************
**                                              **
**                   sketch.js                  **
**           Created By: Tyler Alesse           **
**                                              **
**************************************************/

///////////////
// Constants //
///////////////

const TOP_GAME_BAR = 80;   // px

const maxPews = 4;         // count
const maxLasers = 1;       // count

const defaultInvaderMovementSpeed = 60; // frames
const invaderHeightMod = 56;            // px
const invaderSpacing = 60;              // px

const pointValue = 100;       // count
const scalingValue = 1000;    // count?

const minDropRate = 5;        // frames
const minSpawnFreq = 10;      // frames

const defaultDropRate = 60;   // frames
const defaultSpawnFreq = 90;  // frames

///////////////
// Variables //
///////////////

// The canvas itself
let cvs;

// The font storage variable
let gameFont;

// Score & Game Setting Variables

let score = 0, shots = 0, hits = 0;
let dropRate = defaultDropRate;
let spawnFreq = defaultSpawnFreq;

// Player Variables

/**
 * The main player data variable
 * 
 * @type {PlayerData}
 **/
let playerData = new PlayerData();

let playerBounds = null;

let pews = [];
let lasers = [];

let gameState = null;
let tempFrameData = null;
let gameSelect = 0;

let keysDisabled = false;
let movementDisabled = false;

// Tetromino Variables

/**
 * The list of current tetrominos in the game
 * 
 * @type {Tetromino[]}
 **/
let activeTetros = [];
let spawnTimer = 0;          // Current number of frames since the last spawn
let spawnFrequency;          // Number of frames before another one appears

/**
 * The list of current invaders in the game
 * 
 * @type {Invader[]}
 **/
let activeInvaders = [];
let invaderMovementFrameCount = 0;
let invaderMovementSpeed = 60;
let invaderMovementDirection = 1;

let boopNumber = 1;
let maxBoops = 4;

/**
 * The list of current invader projectiles in the game
 * 
 * @type {InvaderProjectile[]}
 **/
let invaderProjectiles = [];

/**
 * Contains all the sound data
 * 
 * @type {Sounds}
 **/
let sounds = new Sounds();

/**
 * Contains all the sprite and sprite logic
 *
 * @type {Sprites}
 **/
let sprites = new Sprites();

/**
 * Contains all the controller data and logic
 * 
 * Is initialized when a controller is connected
 * 
 * @type {Controller}
 **/
let controller = null;


//////////////////
// p5 Functions //
//////////////////

/**
 * Called by p5 before setup
 **/
function preload() {
  preloadSounds();
  preloadSprites();
  
  // Load font data
  gameFont = loadFont("fonts/PixeloidMono.ttf");
}

/**
 * Called by p5 before draw()
 **/
function setup() {
  cvs = createCanvas(windowHeight - 200, windowHeight);

  frameRate(60);
  rectMode(CORNERS);
  ellipseMode(CORNER);
  noSmooth();
  
  textFont(gameFont);

  if(playerData.loadPlayerData()) {
    console.log("Successfully loaded existing player data.");
  } else {
    console.log("Failed to load existing player data.");
  }
  
  let tempPX = Math.round(width / 2);
  let tempPY = Math.round(height - 50);
  playerBounds = new BoundingBox(
    tempPX,
    tempPY,
    tempPX + sprites.player_normal.width,
    tempPY + sprites.player_normal.height
  );

  keysDisabled = true;
  movementDisabled = true;

  let tempFrameData = new GameStateFrameData(60);
  gameState = new GameState(GameStateIDs.blank, tempFrameData);
}

/**
 * The main drawing function used by p5
 * 
 * Called every "frame" by p5
 **/
function draw() {
  background(0); // Reset background

  // Blank Screen
  if(gameState.stateID === GameStateIDs.blank) {
    gameState.update();

    if(gameState.hasEnded()) {
      keysDisabled = false;
      movementDisabled = false;
      tempFrameData = new GameStateFrameData(120);
      gameState = new GameState(GameStateIDs.title, tempFrameData);
    }

    return; // End current iteration of the drawing loop
  }

  // Title Screen
  if(gameState.stateID === GameStateIDs.title) {
    gameState.update();
    drawTitle();

    if(gameState.hasEnded()) {
      tempFrameData = new GameStateFrameData(300);
      gameState = new GameState(GameStateIDs.controlScreen, tempFrameData);
    }

    return; // End current iteration of the drawing loop
  }

  // Title & Keyboard Controls Screen
  if(gameState.stateID === GameStateIDs.controlScreen) {
    gameState.update();
    drawTitle();
    drawKeyboardControls();

    if(gameState.hasEnded()) {
      tempFrameData = new GameStateFrameData(300);
      gameState = new GameState(GameStateIDs.controlScreenAlt, tempFrameData);
    }

    return; // End current iteration of the drawing loop
  }

  // Title & Gamepad Controls Screen
  if(gameState.stateID === GameStateIDs.controlScreenAlt) {
    gameState.update();
    drawTitle();
    drawGamepadControls();

    if(gameState.hasEnded()) {
      tempFrameData = new GameStateFrameData();
      gameState = new GameState(GameStateIDs.startScreen, tempFrameData);
    }

    return; // End current iteration of the drawing loop
  }

  //* END OF OPENING SCENES

  // If control is not disabled and a gamepad/controller is connected
  if(!keysDisabled && controller !== null && controller !== undefined) {
    // Update the controller data
    controller.updateGamepad();

    // If the controller has new important data
    if(controller.updateStatus) {
      // begin interaction functionality
      updateGameStatus();
    }
  }

  // Always draw the current sound setting
  drawSoundSetting();

  // Start Screen
  if(gameState.stateID === GameStateIDs.startScreen) {
    drawTitle();
    drawStartScreen();

    return; // End current iteration of the drawing loop
  }

  // Game Select Screen
  // TODO: Replace with different game select system
  if(gameState.stateID === GameStateIDs.menuScreen) {
    drawTitle();
    // drawHighscore();
    drawGameSelectScreen();

    return; // End current iteration of the drawing loop
  }

  // Game Over/Player Lost
  if(gameState.stateID === GameStateIDs.gameOver) {
    gameState.update();
    drawDamageShip();

    if(gameState.hasEnded()) {
      // Attempt to save the highscore
      // if(isNewHighscore()) {
      //   saveHighscore();
      //   if(!sounds.mute) { sounds.highscoreMusic.play(); }
      // }

      keysDisabled = false;
      tempFrameData = new GameStateFrameData();
      gameState = new GameState(GameStateIDs.gameStats, tempFrameData);
    }

    return; // End current iteration of the drawing loop
  }

  // Player Stats Screen
  if(gameState.stateID === GameStateIDs.gameStats) {
    showPlayerStats();

    return; // End current iteration of the drawing loop
  }

  // Main Gameplay Loop
  if(gameState.stateID === GameStateIDs.gameplay) {
    // Should be checked every frame of gameplay
    if(checkPlayerTetroCollision()) { return; }
    if(checkPlayerInvaderCollision()) { return; }
    if(checkPlayerInvaderProjectileCollision()) { return; }

    // drawHighscore(); // TODO: Replace with different system
    normalGameplayLoop();

    return; // End current iteration of the drawing loop
  }

  // This part of the code shouldn't be reached if I did my job properly
  console.error(`Invalid Game State ID: ${gameState.stateID}.`);
  HALT_AND_CATCH_FIRE();
}


/////////////////////
// Setup Functions //
/////////////////////

/**
 * Preloads the necessary sound files and
 * stores them in the Sounds class object
 **/
function preloadSounds() {
  soundFormats('mp3', 'ogg');

  // Sound Effects
  sounds.pew = loadSound('SE/pew_lowQ.mp3');
  sounds.laser = loadSound('SE/laser_lowQ.mp3');
  sounds.tetroFlip = loadSound('SE/tetromino_flip_lowQ.mp3');
  sounds.tetroClear = loadSound('SE/tetromino_clear_lowQ.mp3');
  sounds.explode = loadSound('SE/ship_explode_lowQ.mp3');
  sounds.creditAdded = loadSound('SE/credit_added_lowQ.mp3');
  sounds.invaderDeath = loadSound('SE/invader_death.mp3');

  sounds.boop1 = loadSound('SE/boop_1.mp3');
  sounds.boop1.setVolume(2);
  sounds.boop2 = loadSound('SE/boop_2.mp3');
  sounds.boop2.setVolume(2);
  sounds.boop3 = loadSound('SE/boop_3.mp3');
  sounds.boop3.setVolume(2);
  sounds.boop4 = loadSound('SE/boop_4.mp3');
  sounds.boop4.setVolume(2);
}

/**
 * Preloads the necessary sprite files and
 * stores them in the Sprites class object
 **/
function preloadSprites() {
  sprites.player_normal = loadImage("images/player_normal.png");
  sprites.player_damageA = loadImage("images/player_damageA.png");
  sprites.player_damageB = loadImage("images/player_damageB.png");

  sprites.enemy_normal = loadImage("images/enemy_normal.png");
  sprites.enemy_damageA = loadImage("images/enemy_damageA.png");
  sprites.enemy_damageB = loadImage("images/enemy_damageB.png");

  sprites.invader_steveA = loadImage("images/invader_A1.png");
  sprites.invader_steveB = loadImage("images/invader_A2.png");
  sprites.invader_gregA = loadImage("images/invader_B1.png");
  sprites.invader_gregB = loadImage("images/invader_B2.png");
  sprites.invader_billA = loadImage("images/invader_C1.png");
  sprites.invader_billB = loadImage("images/invader_C2.png");

  sprites.invader_projectileA = loadImage("images/invader_projectile_A.png");
  sprites.invader_projectileB = loadImage("images/invader_projectile_B.png");
  sprites.invader_projectileC = loadImage("images/invader_projectile_C.png");
  sprites.invader_projectileD = loadImage("images/invader_projectile_D.png");
}

/**
 * Setup the appropriate game data
 **/
function setupGameData() {
  switch(gameSelect) {
    case 0: // Tetris Mode
      // Nothing to set anymore
      break;
    case 1: // Space Invaders Mode
    case 2: // Hybrid Mode
      spawnInvaders();
      break;
    default:
      // Not supposed to happen, crash I guess?
      noLoop();
      console.error("Game Selection Error! Invalid Game Mode: ${gameSelect}");

    return;
  }
}

/////////////////////////////
// Gameplay Loop Functions //
/////////////////////////////

/**
 * Gameplay Loop Logic
 **/
function normalGameplayLoop() {
  updateDifficulty();

  // Update Positions
  playerMovementCheck();
  updatePews();
  updateLasers();

  // Draw New Positions
  drawShip();
  drawScore();

  if(gameSelect === 0) {
    if(spawnTimer >= spawnFrequency) {
      spawnTimer = 0;
      spawnTetromino();
    }

    updateActiveTetros();
    drawTetrominos();

    // Increment Tetromino Spawner Timer
    ++spawnTimer;
  } else if(gameSelect === 1) {
    updateActiveInvaders();
    updateInvaderProjectiles();
    drawInvaders();
    drawInvaderProjectiles();
  } else if(gameSelect === 2) {
    if(spawnTimer >= spawnFrequency) {
      spawnTimer = 0;
      spawnTetromino();
    }

    updateActiveTetros();
    updateActiveInvaders();
    updateInvaderProjectiles();
    drawInvaders();
    drawInvaderProjectiles();
    drawTetrominos();

    // Increment Tetromino Spawner Timer
    ++spawnTimer;
  } else {
    console.error(`Invalid Game Mode: ${gameSelect}`);
    HALT_AND_CATCH_FIRE();
  }

  drawProjectiles(pews, color(255));
  drawProjectiles(lasers, color(200));
  
  // Spawn Line
  stroke(255);
  strokeWeight(1);
  line(0, TOP_GAME_BAR, width, TOP_GAME_BAR);
}

/**
 * Main game state logic
 **/
function updateGameStatus() {
  let controllerConnected = (controller !== null && controller !== undefined);
  
  // always allow player to mute the game
  if((keyIsPressed && keyCode === 77) ||
     (controllerConnected && controller.SelectButton.isPressed())) {
    sounds.mute = !sounds.mute;
  }

  // If keys are disabled, do nothing
  if(keysDisabled) { return; }

  if(gameState === null || gameState === undefined) {
    return;
  }
  else if(gameState.stateID === GameStateIDs.title) {
    tempFrameData = new GameStateFrameData(300);
    gameState = new GameState(GameStateIDs.controlScreen, tempFrameData);
  }
  else if(gameState.stateID === GameStateIDs.controlScreen) {
    tempFrameData = new GameStateFrameData(300);
    gameState = new GameState(GameStateIDs.controlScreenAlt, tempFrameData);
  }
  else if(gameState.stateID === GameStateIDs.controlScreenAlt) {
    tempFrameData = new GameStateFrameData();
    gameState = new GameState(GameStateIDs.startScreen, tempFrameData);
  }
  else if(gameState.stateID === GameStateIDs.startScreen) {
    if((keyIsPressed && keyCode === 75) || (controllerConnected && controller.AButton.isPressed())) {
      if(!sounds.mute) { sounds.creditAdded.play(); }
      tempFrameData = new GameStateFrameData();
      gameState = new GameState(GameStateIDs.menuScreen, tempFrameData);
    }
  }
  else if(gameState.stateID === GameStateIDs.menuScreen) {
    if((keyIsPressed && keyCode === 83) || (controllerConnected && controller.DownDPad.isPressed())) {
      gameSelect = gameSelect >= 2 ? 0 : gameSelect+1;
    } else if((keyIsPressed && keyCode === 87) || (controllerConnected && controller.UpDPad.isPressed())) {
      gameSelect = gameSelect <= 0 ? 2 : gameSelect-1;
    } else if((keyIsPressed && keyCode === 75) || (controllerConnected && controller.AButton.isPressed())) {
      setupGameData();
      tempFrameData = new GameStateFrameData();
      gameState = new GameState(GameStateIDs.gameplay, tempFrameData);
    }
  }
  // If the player has pressed something during the gameStats scene
  else if(gameState.stateID === GameStateIDs.gameStats) {
    if((keyIsPressed && keyCode === 75) || (controllerConnected && controller.AButton.isPressed())) {
      gameSelect = 0;
      resetGameInfo();
      tempFrameData = new GameStateFrameData();
      gameState = new GameState(GameStateIDs.startScreen);
    }
  }
  else if(gameState.stateID === GameStateIDs.gameplay && pews.length < maxPews &&
         ((keyIsPressed && keyCode === 75) || (controllerConnected && controller.AButton.isPressed()))) {
    let newPewBB = new BoundingBox(playerBounds.ax + 20, playerBounds.ay - 3,
                                (playerBounds.ax + 20) + Pew.pewDim, (playerBounds.ay - 3) + Pew.pewDim);
    pews.push(new Pew(newPewBB, 0, -1 * Pew.pewSpeed, 1, 0));
    if(!sounds.mute) { sounds.pew.play(); }
    ++shots;
  }
  else if(gameState.stateID === GameStateIDs.gameplay &&
         ((keyIsPressed && keyCode === 73) || (controllerConnected && controller.XButton.isPressed()) )) {
    
    if(gameSelect !== 1 && lasers.length < maxLasers) {
      let newLaserBB = new BoundingBox(playerBounds.ax + 20, TOP_GAME_BAR, playerBounds.ax + 25, playerBounds.ay - 3);
      lasers.push(new Laser(newLaserBB, 30));
      if(!sounds.mute) { sounds.laser.play(); }
      ++shots;
      movementDisabled = true; // disable movement when laser is active
    }
  }
}


/////////////////////////
// Game Draw Functions //
/////////////////////////

/**
 * Draw the keyboard contrpl scheme
 * 
 * Relies on p5
 **/
function drawKeyboardControls() {
  noFill();
  stroke(255);
  strokeWeight(4);

  let boxDim = 60;
  let boxSpacing = 10;
  
  let tempX = (width / 5);
  let tempX_alt = (3 * width / 5);
  let tempY = (2 * height / 3);

  rect(tempX, tempY - (boxDim + boxSpacing), tempX + boxDim, tempY - boxSpacing);
  rect(tempX - (boxDim + boxSpacing), tempY, tempX - boxSpacing, tempY + boxDim);
  rect(tempX, tempY, tempX + boxDim, tempY + boxDim);
  rect(tempX + boxDim + boxSpacing, tempY, tempX + (2*boxDim) + boxSpacing, tempY + boxDim);

  rect(tempX_alt, tempY, tempX_alt + boxDim, tempY + boxDim);
  rect(tempX_alt, tempY - (boxDim + boxSpacing), tempX_alt + boxDim, tempY - boxSpacing);

  fill(255);
  textSize(50);
  strokeWeight(0);
  textAlign(CENTER, CENTER);
  text("W", tempX + 33, tempY - (boxDim + boxSpacing) + 25);
  text("A", tempX - (boxDim + boxSpacing) + 33, tempY + 25);
  text("S", tempX + 33, tempY + 25);
  text("D", tempX + (boxDim + boxSpacing) + 33, tempY + 25);

  text("I", tempX_alt + 33, tempY - (boxDim + boxSpacing) + 25);
  text("K", tempX_alt + 33, tempY + 25);

  textSize(26);

  textAlign(LEFT, CENTER);
  text("Laser", tempX_alt + 75, tempY - 42);
  text("Select/Fire", tempX_alt + 75, tempY + 28);

  textAlign(CENTER, TOP);
  text("Menu Navigation\nShip Movement", tempX + 33, tempY + 80);
}

/**
 * Draw the gamepad control scheme
 * 
 * Relies on p5
 **/
function drawGamepadControls() {
  noFill();
  stroke(255);
  strokeWeight(4);

  let dpadArea = 180;
  let section = dpadArea / 3;
  
  let tempX = (width / 7);
  let tempX_alt = (9 * width / 17);
  let tempY = (6 * height / 11);

  // D-Pad

  noFill();
  beginShape();
    vertex(tempX + (1*section), tempY              );
    vertex(tempX + (2*section), tempY              );
    vertex(tempX + (2*section), tempY + (1*section));
    vertex(tempX + (3*section), tempY + (1*section));
    vertex(tempX + (3*section), tempY + (2*section));
    vertex(tempX + (2*section), tempY + (2*section));
    vertex(tempX + (2*section), tempY + (3*section));
    vertex(tempX + (1*section), tempY + (3*section));
    vertex(tempX + (1*section), tempY + (2*section));
    vertex(tempX              , tempY + (2*section));
    vertex(tempX              , tempY + (1*section));
    vertex(tempX + (1*section), tempY + (1*section));
  endShape(CLOSE);

  // Up Arrow
  triangle(tempX + section + 10, tempY + section - 10,
           tempX + (2*section) - 10, tempY + section - 10,
           tempX + (1.5*section), tempY + 10);

  // Down Arrow
  triangle(tempX + section + 10, tempY + (2*section) + 10,
           tempX + (2*section) - 10, tempY + (2*section) + 10,
           tempX + (1.5*section), tempY + (3*section) - 10);

  // Left Arrow
  triangle(tempX + section - 10, tempY + section + 10,
           tempX + section - 10, tempY + (2*section) - 10,
           tempX + 10, tempY + (1.5*section));

  // Right Arrow
  triangle(tempX + (2*section) + 10, tempY + section + 10,
           tempX + (2*section) + 10, tempY + (2*section) - 10,
           tempX + (3*section) - 10, tempY + (1.5*section));

  // Circle Buttons

  arc(tempX_alt + section, tempY, 60, 60, 0, TWO_PI);               // X: Top
  arc(tempX_alt, tempY + section, 60, 60, 0, TWO_PI);               // Y: Left
  arc(tempX_alt + (2*section), tempY + section, 60, 60, 0, TWO_PI); // A: Right
  arc(tempX_alt + section, tempY + (2*section), 60, 60, 0, TWO_PI); // B: Bottom

  fill(255);
  textSize(36);
  strokeWeight(0);
  textAlign(LEFT, TOP);

  text("X", tempX_alt + section + 20, tempY + 8);
  text("Y", tempX_alt + 20, tempY + section + 8);
  text("A", tempX_alt + (2*section) + 20, tempY + section + 8);
  text("B", tempX_alt + section + 20, tempY + (2*section) + 8);

  textSize(26);
  textAlign(LEFT, CENTER);
  text("Laser", tempX_alt + 50, tempY - 35);
  text("Select\nFire", tempX_alt + (2*section) + 75, tempY + section + 28);

  textAlign(CENTER, TOP);
  text("Menu Navigation\nShip Movement", tempX + 95, tempY + 220);
}

/**
 * Draw the start screen
 * 
 * Relies on p5
 **/
function drawStartScreen() {
  strokeWeight(0);
  fill(255);
  textSize(25);
  textAlign(CENTER, TOP);
  
  // Draw "Insert Credits" Text
  if(frameCount > 80) {
    textSize(30);
    textAlign(CENTER);
    text("Please press      to begin", width/2, height/2);
    
    fill(0, 255, 255);
    text("             Fire         ", width/2, height/2);
  }
}

/**
 * Draw the game selection screen
 * 
 * Relies on p5
 **/
function drawGameSelectScreen() {
  strokeWeight(0);
  
  fill(255);
  textSize(25);
  textAlign(CENTER, TOP);
  
  let tetroText = "Tetromino Mode";
  let invadeText = "Invaders Mode";
  let hybridText = "Hybrid Mode";
  
  textSize(35);
  switch(gameSelect) {
    case 0:
      tetroText = `> ${tetroText}`;
      break;
    case 1:
      invadeText = `> ${invadeText}`;
      break;
    case 2:
      hybridText = `> ${hybridText}`;
      break;
    default:
       // Not supposed to happen, crash I guess?
      noLoop();
      console.error(`Game Selection Error! Invalid Game Mode: ${gameSelect}`);
      return;
  }
  
  text(tetroText, width/2, height/2);
  text(invadeText, width/2, 60 + height/2);
  text(hybridText, width/2, 120 + height/2);
}

/**
 * Draw the title screen
 * 
 * Relies on p5
 **/
function drawTitle() {
  strokeWeight(0);

  textSize(45);
  textAlign(CENTER, TOP);

  fill(255);
  text("Retro Shoot-'em-up", width/2, height/4);

  fill(0, 0, 255);
  text("\nRemastered", width/2, height/4);
}

/**
 * Draw the player ship (normal)
 * 
 * Relies on p5
 **/
function drawShip() {
  strokeWeight(0);
  image(sprites.player_normal, playerBounds.ax, playerBounds.ay);
}

/**
 * Draw the player ship (damaged/destroyed)
 * 
 * Relies on p5
 **/
function drawDamageShip() {
  strokeWeight(0);
  if(frameCount % 10 <= 4) {
    image(sprites.player_damageA, playerBounds.ax, playerBounds.ay);
  } else {
    image(sprites.player_damageB, playerBounds.ax, playerBounds.ay);
  }
}

/**
 * Draw the player's score in the top right corner
 * 
 * Relies on p5
 **/
function drawScore() {
  strokeWeight(0);
  fill(255);
  textSize(25);
  textAlign(RIGHT, TOP);
  
  let txtOut = `${score}`;
  while(txtOut.length < 7) { txtOut = `0${txtOut}`; }
  text(txtOut, width-40, 30);
}

/**
 * Draw the player stats on screen
 * 
 * Relies on p5
 **/
function showPlayerStats() {
  strokeWeight(0);
  fill(255);
  textSize(25);
  textAlign(CENTER, BOTTOM);
  
  // Score
  let txtOut = `${score}`;
  while(txtOut.length < 7) { txtOut = `0${txtOut}`; }
  txtOut = `Final Score:\n${txtOut}`;
  text(txtOut, width/2, height/3);
  
  // Total Pews Fired
  text(`Shots Fired: ${shots}`, width/2, 90 + height/3);
  
  // Total Hits
  text(`Number of Hits: ${hits}`, width/2, 130 + height/3);
  
  // Hit %
  let hitPercent = (100 * hits/shots).toFixed(1);
  text(`Hit-Miss Ratio: ${hitPercent}%`, width/2, 170 + height/3);
}

/**
 * Tetromino Drawing Function
 * 
 * Relies on p5
 **/
function drawTetrominos() {

  /*
    I'm not going to lie, I hate this function. A lot.
    It's certainly not the worst function I've ever written,
    I mean, it works, but it very easily is in my Top 10.

    It's ugly, took forever to debug, and uses
    5 NESTED FOR LOOPS!!!

    Should I have just used images instead of drawing them
    with the rect function?

    Probably.

    Why didn't I?

    That remains to be understood.

    It's not a hard change to make.
    I just don't want to right now.
  */

  stroke(0);
  strokeWeight(0);

  let shapeData = null;
  for(let i = 0; i < activeTetros.length; ++i) {
    shapeData = TetrominoShapeData[activeTetros[i].type][activeTetros[i].flipIndex];

    for(let y = 0; y < shapeData.length; ++y) {
      for(let x = 0; x < shapeData[y].length; ++x) {
        if(shapeData[y][x] === 1) {
          for(let a = 0; a < 4; ++a) {
            for(let b = 0; b < 4; ++b) {
              if((a === 1 || a === 2) && (b === 1 || b === 2)) {
                fill(color(activeTetros[i].mainColor));
              } else {
                fill(color(activeTetros[i].subColor));
              }

              rect(
                activeTetros[i].bounds.ax + (x * tetroPixelSize * 4) + (b * tetroPixelSize),
                activeTetros[i].bounds.ay + (y * tetroPixelSize * 4) + (a * tetroPixelSize),
                activeTetros[i].bounds.ax + (x * tetroPixelSize * 4) + ((b+1) * tetroPixelSize),
                activeTetros[i].bounds.ay + (y * tetroPixelSize * 4) + ((a+1) * tetroPixelSize)
              );
            }
          }
        }
      }
    }
  }
}

/**
 * Invader Drawing Function
 * 
 * Relies on p5
 **/
function drawInvaders() {
  for(let i = 0; i < activeInvaders.length; ++i) {
    for(let j = 0; j < activeInvaders[i].length; ++j) {
      image(
        activeInvaders[i][j].animationFrames[activeInvaders[i][j].currentAnimationFrame],
        activeInvaders[i][j].bounds.ax, activeInvaders[i][j].bounds.ay
      );
    }
  }
}

/**
 * Invader Projectile Drawing Function
 * 
 * Relies on p5
 **/
function drawInvaderProjectiles() {
  for(let i = 0; i < invaderProjectiles.length; ++i) {
    image(
      invaderProjectiles[i].animationFrames[invaderProjectiles[i].currentAnimationFrame],
      invaderProjectiles[i].bounds.ax, invaderProjectiles[i].bounds.ay
    );
  }
}

/**
 * Player Projectile Drawing Function
 * 
 * Relies on p5
 **/
function drawProjectiles(arr, color, alt_color = null) {
  fill(color);
  strokeWeight(0);

  let tempBB = null;
  for(let i = 0; i < arr.length; ++i) {
    tempBB = arr[i].bounds;
    rect(tempBB.ax, tempBB.ay, tempBB.bx, tempBB.by);
  }
}

/**
 * Draws the sound setting in the top left corner
 * 
 * Relies on p5
 **/
function drawSoundSetting() {
  if(sounds.mute) {
    fill(255);
    triangle(5, 20, 25, 5, 25, 35);
    stroke(255, 0, 0);
    strokeWeight(4);
    line(5, 5, 35, 35);
    strokeWeight(0);
  } else {
    fill(255);
    triangle(5, 20, 25, 5, 25, 35);
    stroke(255);
    strokeWeight(3);
    line(30, 15, 30, 25);
    line(33, 12, 33, 28);
    line(36, 9, 36, 31);
  }
}


//////////////////////////////
// Enemy Spawning Functions //
//////////////////////////////

/**
 * Generate a new random Tetromino
 **/
function spawnTetromino() {
  let index = Math.floor(random(0, TetrominoShapeData.keys.length));
  let tetroName = TetrominoShapeData.keys[index];
  let flipIndex = Math.floor(random(0, TetrominoShapeData[tetroName].length));
  let maxFlipIndex = TetrominoShapeData[tetroName].length - 1;
  
  // Determine a random starting position for the tetromino
  let rng = random(1, (width/tetroBrickSize) - 2);

  // The Tetromino;s Bounding Box's Starting Coordinates
  let startX = tetroBrickSize * Math.floor(rng);
  let startY = 80; // static, as they should start at the top
  
  // The Tetromino's Bounding Box's End Coordinates
  let endX = startX + (tetroBrickSize * TetrominoShapeData[tetroName][flipIndex][0].length);
  let endY = startY + (tetroBrickSize * TetrominoShapeData[tetroName][flipIndex].length);

  // Set the color of the tetromino
  let colorIndex = Math.floor(score / 10000);
  let tetroMainColor = TetrominoColorData.mainList[colorIndex % TetrominoColorData.mainList.length];
  let tetroSubColor = TetrominoColorData.subList[colorIndex % TetrominoColorData.mainList.length];

  // Add tetromino to array
  activeTetros.push(
    new Tetromino(
      tetroName, tetroMainColor, tetroSubColor,
      flipIndex, maxFlipIndex, dropRate, 1 + colorIndex,
      new BoundingBox(startX, startY, endX, endY)
    )
  );
}

/**
 * Generate the Invader grid
 **/
function spawnInvaders() {
  // Get the max number of invaders able to be drawn
  let invaderCount = Math.floor(width/60) - 4;
  let baseHeight = 120;
  let invaderSpriteListA = [
    sprites.invader_billA, sprites.invader_steveA, sprites.invader_gregA
  ];
  let invaderSpriteListB = [
    sprites.invader_billB, sprites.invader_steveB, sprites.invader_gregB
  ];

  for(let i = 0; i < invaderSpriteListA.length; ++i) {
    for(let j = 0; j < 2; j++) {
      activeInvaders.push([]);

      for(let k = 0; k < invaderCount; ++k) {
        activeInvaders[activeInvaders.length - 1].push(
          new Invader(
            new BoundingBox(
              30 + (k * invaderSpacing),
              baseHeight,
              30 + (k * invaderSpacing) + invaderSpriteListA[i].width,
              baseHeight + invaderSpriteListA[i].height
            ),
            [invaderSpriteListA[i], invaderSpriteListB[i]], 0
          )
        );
      }

      baseHeight += invaderHeightMod;
    }
  }
}

/**
 * Difficulty Scaling Logic
 **/
function updateDifficulty() {
  if(gameSelect === 0) {
    let tempFreq = defaultSpawnFreq - (score / scalingValue);
    spawnFrequency = (tempFreq < minSpawnFreq ? minSpawnFreq : tempFreq);
    
    let tempDropRate = defaultDropRate - (score / scalingValue);
    dropRate = (tempDropRate < minDropRate ? minDropRate : tempDropRate);
  } else if(gameSelect === 1) {
    invaderMovementSpeed = defaultInvaderMovementSpeed - (score / 100);
    if(invaderMovementSpeed <= 4) { invaderMovementSpeed = 4; }

    // If there are no more invaders, add more
    let isEmpty = true;
    for(let i = 0; i < activeInvaders.length; ++i) {
      if(activeInvaders[i].length !== 0) {
        isEmpty = false; break;
      }
    }

    if(isEmpty) { spawnInvaders(); }
  } else if(gameSelect === 2) {
    let tempFreq = defaultSpawnFreq - (score / scalingValue);
    spawnFrequency = (tempFreq < minSpawnFreq ? minSpawnFreq : tempFreq);
    let tempDropRate = defaultDropRate - (score / scalingValue);
    dropRate = (tempDropRate < minDropRate ? minDropRate : tempDropRate);

    invaderMovementSpeed = defaultInvaderMovementSpeed - (score / 100);
    if(invaderMovementSpeed <= 4) { invaderMovementSpeed = 4; }

    // If there are no more invaders, add more
    let isEmpty = true;
    for(let i = 0; i < activeInvaders.length; ++i) {
      if(activeInvaders[i].length !== 0) {
        isEmpty = false; break;
      }
    }

    if(isEmpty) { spawnInvaders(); }
  } else {
    console.error(`Invalid Game Mode: ${gameSelect}`);
    HALT_AND_CATCH_FIRE();
  }
}


///////////////////////////////
// Movement Update Functions //
///////////////////////////////

/**
 * Check if the player's ship should move,
 * and do so as necessary
 **/
function playerMovementCheck() {
  // If movement is disabled, stop check
  if(movementDisabled) { return; }

  let controllerConnected = false;

  // check if controller was initialized
  if(controller !== null && controller !== undefined) {
    controllerConnected = controller.gamepadConnected();
  }
  
  // A, or Left on the D-Pad is being pressed
  if(keyIsDown(65) || (controllerConnected && (controller.LeftDPad.isPressed() || controller.LeftDPad.isHeld()))) {
    let tempPX = playerBounds.ax - Math.floor(width/125);
    if(tempPX <= 0) { tempPX = 0; }
    tempPX = Math.round(tempPX);
    
    // Set new player bounding box
    let tempBounds = new BoundingBox(
      tempPX,
      playerBounds.ay,
      tempPX + sprites.player_normal.width,
      playerBounds.by
    );

    playerBounds = tempBounds;
  }
  // D, or Right on the D-Pad is being pressed
  else if(keyIsDown(68) || (controllerConnected && (controller.RightDPad.isPressed() || controller.RightDPad.isHeld()))) {
    let tempPX = playerBounds.ax + Math.floor(width/125);
    if(tempPX >= width-50) { tempPX = width-50; }
    tempPX = Math.round(tempPX);
    
    // Set new player bounding box
    let tempBounds = new BoundingBox(
      tempPX,
      playerBounds.ay,
      tempPX + sprites.player_normal.width,
      playerBounds.by
    );

    playerBounds = tempBounds;
  }
}

/**
 * Update the position of each pew in game
 * and check for pew-enemy tetromino collision
 **/
function updatePews() {
  let removedPew = false;
  
  for(let i = 0; i < pews.length; ++i) {
    removedPew = false;
    pews[i].updatePosition();
    
    if(gameSelect === 0) {
      removedPew = _pewTetroLogic(i);
    } else if(gameSelect === 1) {
      removedPew = _pewInvadeLogic(i);
    } else if (gameSelect === 2) {
      removedPew = _pewTetroLogic(i);
      if(removedPew) { i--; continue; }
      removedPew = _pewInvadeLogic(i);
    } else {
      console.error(`Invalid Game Mode: ${gameSelect}`);
      HALT_AND_CATCH_FIRE();
    }
    
    // If a pew was removed, skip final check
    if(removedPew) { i--; continue; }
    
    // If pew has reached the top of the screen
    if(pews[i].bounds.ay < TOP_GAME_BAR) {
      pews.splice(i, 1); // Remove it from the array
    }
  }
}

/**
 * Pew-Tetromino Collision Logic
 * 
 * @param {Number} pewIndex The index of the pew to check
 * @returns {Boolean} True if pew was removed from the array, False otherwise
 */
function _pewTetroLogic(pewIndex) {
  for(let k = 0; k < activeTetros.length; ++k) {
    // If the current pew and the current tetromino have collided
    if(BoundingBox.checkCollision(pews[pewIndex].bounds, activeTetros[k].bounds)) {
      activeTetros[k].damage(pews[pewIndex].damage); // Give damage to the tetromino
      
      score += pointValue; // Increase score
      ++hits;             // Increment hit count

      // If the tetromino has no more health
      if(activeTetros[k].health <= 0) {
        activeTetros.splice(k, 1);  // Remove tetromino from array
        k--;                        // Maintain the current inner index position
        
        // If sound is not muted, play tetromino clear sound
        if(!sounds.mute) { sounds.tetroClear.play(); }
        
        // Check pew pierce value
        if(pews[pewIndex].pierce === 0) {
          pews.splice(pewIndex, 1);  // Remove the pew from the array
          return true;               // Set removed flag to true
        } else {
          // Decrement pierce value
          pews[pewIndex].pierce -= 1;
        }
      } else {
        pews.splice(pewIndex, 1);  // Remove the pew from the array
        return true;               // Set removed flag to true
      }
    }
  }

  return false;
}

/**
 * Pew-Invader Collision Logic
 * 
 * @param {Number} pewIndex The index of the pew to check
 * @returns {Boolean} True if pew was removed from the array, False otherwise
 */
function _pewInvadeLogic(pewIndex) {
  for(let i = 0; i < activeInvaders.length; ++i) {
    for(let j = 0; j < activeInvaders[i].length; ++j) {
      // If the current pew and the current tetromino have collided
      if(BoundingBox.checkCollision(pews[pewIndex].bounds, activeInvaders[i][j].bounds)) {
        activeInvaders[i].splice(j, 1); // Remove invader from array
        j--;                            // Maintain the current inner index position

        // If sound is not muted, play tetromino clear sound
        if(!sounds.mute) { sounds.invaderDeath.play(); }

        score += pointValue; // Increase score
        ++hits;             // Increment hit count

        pews.splice(pewIndex, 1);  // Remove the pew from the array
        return true;               // Pew collided
      }
    }
  }

  return false;
}

/**
 * Updates the laser frame count and checks
 * laser-tetromino interaction
 **/
function updateLasers() {
  // Skip checking lasers if none exist
  if(lasers.length <= 0) { return; }

  // Tetromino Removed flag used for playing sounds
  let enemyRemoved = false;

  // Update laser frame count
  lasers[0].frameCount++;

  if(lasers[0].frameCount >= lasers[0].maxFrameCount) {
    lasers = [];              // Empty laser array
    movementDisabled = false; // Re-enable player movement
  } else {
    if(gameSelect === 0 || gameSelect === 2) {
      for(let i = 0; i < activeTetros.length; ++i) {
        if(BoundingBox.checkCollision(lasers[0].bounds, activeTetros[i].bounds)) {
          activeTetros.splice(i, 1); // Remove tetromino from array
          --i;                       // Next iteration will use the current index
          enemyRemoved = true;       // Set tetromino removed flag to true
          
          score += pointValue; // Increase score
          ++hits;             // Increment hit count
        }
      }
  
      // We only want to play the sound once, instead of for every tetromino
      // If sound is not muted, play tetromino clear sound
      if(enemyRemoved && !sounds.mute) { sounds.tetroClear.play(); }
    }
    
    if(gameSelect === 1 || gameSelect === 2) {
      for(let i = 0; i < activeInvaders.length; ++i) {
        for(let j = 0; j < activeInvaders[i].length; ++j) {
          if(BoundingBox.checkCollision(lasers[0].bounds, activeInvaders[i][j].bounds)) {
            activeInvaders[i].splice(j, 1); // Remove tetromino from array
            --j;                            // Next iteration will use the current index
            enemyRemoved = true;            // Set tetromino removed flag to true
            
            score += pointValue; // Increase score
            ++hits;             // Increment hit count
          }
        }
      }
  
      // We only want to play the sound once, instead of for every invader
      // If sound is not muted, play invader death sound
      if(enemyRemoved && !sounds.mute) { sounds.invaderDeath.play(); }
    }
  }
}

/**
 * Updates the active tetromino's position frame counter
 * and flip frame counter;
 **/
function updateActiveTetros() {
  // For every active tetromino in the game
  for(let i = 0; i < activeTetros.length; ++i) {
    // Update the active tetromino's position frame count
      // If the position has changed
    if(activeTetros[i].updatePosition()) {
      // Has the tetromino reached the bottom of the screen?
      if(activeTetros[i].bounds.by >= height) {
        activeTetros.splice(i, 1);         // Remove the tetromino from the array
        i--;                               // Maintain the tetromino update index
        score -= Math.floor(pointValue/3); // Reduce the player's score
        if(score <= 0) { score = 0; }      // Do not allow score to go below 0 (zero)
        continue;                          // Move onto next iteration
      }
    }
    
    // Update the active tetromino's flip frame count
      // If a flip should be initiated
    if(activeTetros[i].updateFlip()) {
      // If a flip was made, try to play a sound
      if(!sounds.mute) { sounds.tetroFlip.play(); }
    }
  }
}

/**
 * Update the position and frame data
 * of all active invaders
 **/
function updateActiveInvaders() {
  invaderMovementFrameCount++;
  if(invaderMovementFrameCount >= invaderMovementSpeed) {
    invaderMovementFrameCount = 0;

    let farRight = 0, farLeft = width;
    let iterRight, iterLeft;
    for(let i = 0; i < activeInvaders.length; ++i) {
      // Skip iteration if list is empty
      if(activeInvaders[i].length <= 0) { continue; }
      iterRight = activeInvaders[i][activeInvaders[i].length - 1];
      iterLeft = activeInvaders[i][0];

      farRight = (iterRight.bounds.bx > farRight ? iterRight.bounds.bx : farRight);
      farLeft = (iterLeft.bounds.ax < farLeft ? iterLeft.bounds.ax : farLeft);
    }

    if(invaderMovementDirection > 0 && farRight > width - invaderSpacing) {
      for(let i = 0; i < activeInvaders.length; ++i) {
        for(let j = 0; j < activeInvaders[i].length; ++j) {
          activeInvaders[i][j].bounds.ay += (invaderHeightMod)/2;
          activeInvaders[i][j].bounds.by += (invaderHeightMod)/2;
          activeInvaders[i][j].currentAnimationFrame = (
            activeInvaders[i][j].currentAnimationFrame === 0 ? 1 : 0);
        }
      }

      invaderMovementDirection = -1;
    } else if(invaderMovementDirection < 0 && farLeft < invaderSpacing) {
      for(let i = 0; i < activeInvaders.length; ++i) {
        for(let j = 0; j < activeInvaders[i].length; ++j) {
          activeInvaders[i][j].bounds.ay += (invaderHeightMod/2);
          activeInvaders[i][j].bounds.by += (invaderHeightMod/2);
          activeInvaders[i][j].currentAnimationFrame = (
            activeInvaders[i][j].currentAnimationFrame === 0 ? 1 : 0);
        }
      }

      invaderMovementDirection = 1;
    } else {
      for(let i = 0; i < activeInvaders.length; ++i) {
        for(let j = 0; j < activeInvaders[i].length; ++j) {
          activeInvaders[i][j].bounds.ax += (invaderMovementDirection * invaderSpacing)/2;
          activeInvaders[i][j].bounds.bx += (invaderMovementDirection * invaderSpacing)/2;
          activeInvaders[i][j].currentAnimationFrame = (
            activeInvaders[i][j].currentAnimationFrame === 0 ? 1 : 0);
        }
      }
    }

    switch(boopNumber) {
      case 1:
        sounds.boop1.play();
        break;
      case 2:
        sounds.boop2.play();
        break;
      case 3:
        sounds.boop3.play();
        break;
      case 4:
        sounds.boop4.play();
        break;
      default:
        console.error(`Invalid Boop Index: ${boopNumber}`);
    }

    boopNumber++;
    if(boopNumber > maxBoops) { boopNumber = 1; }
  }
}

/**
 * Update the position and frame data
 * of all active invader projectiles
 **/
function updateInvaderProjectiles() {
  for(let i = 0; i < invaderProjectiles.length; ++i) {
    invaderProjectiles[i].updatePosition();
    invaderProjectiles[i].updateAnimation();
    if(invaderProjectiles[i].bounds.by >= height) {
      invaderProjectiles.splice(i, 1);  // Remove the invader projectile from the array
      i--;                              // Maintain the projectile update index
      continue;                         // Move onto next iteration
    }
  }
}

/**
 * Check if the player has collided with any tetrominos
 * 
 * @returns {Boolean} True if collision detected, False otherwise
 **/
function checkPlayerTetroCollision() {
  for(let i = 0; i < activeTetros.length; ++i) {
    // Check if tetromino-ship collision is possible
    if(activeTetros[i].bounds.by >= (height - 50)) {
      // Check if tetromino-ship collision has occurred
      if(BoundingBox.checkCollision(playerBounds, activeTetros[i].bounds)) {
        // Remove all tetrominos
        activeTetros = [];
        
        // Play explode sound
        if(!sounds.mute) { sounds.explode.play(); }

        // Set gameState to gameOver scene
        tempFrameData = new GameStateFrameData(180);
        gameState = new GameState(GameStateIDs.gameOver, tempFrameData);
        return true;
      }
    }
  }
}

/**
 * Check if the player has collided with an invader
 * 
 * @returns {Boolean} True if collision detected, False otherwise
 **/
function checkPlayerInvaderCollision() {
  for(let i = 0; i < activeInvaders.length; ++i) {
    for(let j = 0; j < activeInvaders[i].length; ++j) {
      if(BoundingBox.checkCollision(playerBounds, activeInvaders[i][j].bounds) ||
         activeInvaders[i][j].bounds.ay >= height-50) {
        // Remove all invaders and invader projectiles
        activeInvaders = [];
        invaderProjectiles = [];

        // Play explode sound
        if(!sounds.mute) { sounds.explode.play(); }

        // Set gameState to gameOver scene
        tempFrameData = new GameStateFrameData(180);
        gameState = new GameState(GameStateIDs.gameOver, tempFrameData);
        return true;
      }
    }
  }
}

/**
 * Check if the player has collided with an invader projectile
 * 
 * @returns {Boolean} True if collision detected, False otherwise
 **/
function checkPlayerInvaderProjectileCollision() {
  for(let i = 0; i < invaderProjectiles.length; ++i) {
    if(BoundingBox.checkCollision(playerBounds, invaderProjectiles[i].bounds)) {
      // Remove all invaders
      activeInvaders = [];
      invaderProjectiles = [];

      // Play explode sound
      if(!sounds.mute) { sounds.explode.play(); }

      // Set gameState to gameOver scene
      tempFrameData = new GameStateFrameData(180);
      gameState = new GameState(GameStateIDs.gameOver, tempFrameData);
      return true;
    }
  }
}


////////////////////////
// End Game Functions //
////////////////////////

/**
 * Reset the game stats, player projectiles,
 * enemies, and enemy projectiles
 **/
function resetGameInfo() {
  score = 0;
  shots = 0;
  hits = 0;

  pews = [];
  lasers = [];

  activeTetros = [];
  activeInvaders = [];
  invaderProjectiles = [];
}


////////////////////////////////////////
// Key Pressing and Gamepad Functions //
////////////////////////////////////////

/**
 * Called when a keyboard key is pressed
 **/
function keyPressed() {
  updateGameStatus();
}

/**
 * Adds an event listener for when a gamepad is connected
 **/
window.addEventListener("gamepadconnected", function(e) {
  if(controller === null || controller === undefined) {
    controller = new Controller(e.gamepad.index);
  }
});


/////////////////////
// Debug Functions //
/////////////////////

/**
 * Draws a thin red border around the given bounding box
 * 
 * @param {BoundingBox} bb The bounding box to draw
 */
function debugBoundingBox(bb) {
  stroke(255, 0, 0);
  strokeWeight(1);
  noFill();
  rect(bb.ax, bb.ay, bb.bx, bb.by);
}


/////////////////////////
// Emergency Functions //
/////////////////////////

/**
 * Stop all game functionality,
 * may cause unhandeled crashing
 **/
function HALT_AND_CATCH_FIRE() {
  sounds.mute = true;
  keysDisabled = true;
  movementDisabled = true;
  gameState = new GameState(GameStateIDs.invalid, new GameStateFrameData());
  
  background(0);
  fill(255, 0, 0);
  strokeWeight(0);
  textSize(20);
  textAlign(LEFT, TOP);
  text("ERROR: An error has ocurred. Please contact the developer.", 0, 0);
  noLoop();

  console.error("Halting Program...");
}