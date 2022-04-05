/*
    Arcade Shoot-'em-Up
    By: Tyler Alesse
    
    WASD for Movement
    K to shoot
    M to mute
    
    Gamepad Supported (except for muting)
*/ 

/*
    References and Assets:
      Gamepad API:
        https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
        https://gamepad-tester.com/
      
      Pixeloid Mono Font (Author - GGBotNet):
        https://www.dafont.com/pixeloid-mono.font
        https://www.dafont.com/ggbot.d8252
        
        ## Note of the author ##
        This font family are licensed under the SIL Open Font License, Version 1.1.

        You can use them freely in your products & projects - print or digital, commercial or otherwise. However, you can't sell the fonts on their own.

        For more information about Pixeloid, go to https://ggbot.itch.io/pixeloid-font
      
      Tetris Sounds (Flip, Clear):
        https://www.youtube.com/watch?v=Xm9O2iJLWxY
      
      Tetris Highscore Music:
        https://www.youtube.com/watch?v=HGXo7LExG6o&t=8s
      
      Tetris Design Reference:
        https://www.youtube.com/watch?v=CvUK-YWYcaE&t=9s
      
      Galaga Sounds (Credit Added, Ship Shooting, Ship Explosion):
        https://www.youtube.com/watch?v=ixIed1iHCAg
        
      Galaga Design Reference:
        https://www.youtube.com/watch?v=29VVkfuXkVI
*/

///////////////
// Constants //
///////////////

const tetroBrickSize = 20;  // px
const tetroBorderSize = 6;  // px
const defaultMaxAT = 20;    // count
const maxPews = 6;          // count

/////////////
// Classes //
/////////////

class boundingBox {
  constructor(_ax, _ay, _bx, _by) {
    this.ax = _ax;
    this.ay = _ay;
    this.bx = _bx;
    this.by = _by;
  }
}

class tetromino {
  constructor(_t, _fi, _mfi, _fc, _b) {
    this.type = _t;
    this.flipIndex = _fi;
    this.maxFlipIndex = _mfi;
    this.frameCount = _fc;
    this.bounds = _b;
  }
  
  lFlip() {
    this.flipIndex++;
    if(this.flipIndex > this.maxFlipIndex) {
      this.flipIndex = 0;
    }
    
    let tempTetroData = tetrominos[this.type][this.flipIndex];
    let newEndX = this.bounds.ax + (tetroBrickSize * tempTetroData[0].length);
    let newEndY = this.bounds.ay + (tetroBrickSize * tempTetroData.length);
    this.bounds = new boundingBox(this.bounds.ax, this.bounds.ay, newEndX, newEndY);
    
    if(!mute) { flipSound.play(); }
  }
  
  rFlip() {
    this.flipIndex--;
    if(this.flipIndex < 0) {
      this.flipIndex = this.maxFlipIndex;
    }
    
    let tempTetroData = tetrominos[this.type][this.flipIndex];
    let newEndX = this.bounds.ax + (tetroBrickSize * tempTetroData[0].length);
    let newEndY = this.bounds.ay + (tetroBrickSize * tempTetroData.length);
    this.bounds = new boundingBox(this.bounds.ax, this.bounds.ay, newEndX, newEndY);
    
    this.bounds = new boundingBox(this.bounds.ax, this.bounds.ay, newEndX, newEndY);
    
    if(!mute) { flipSound.play(); }
  }
}

class pew {
  constructor(_x, _y, _vy) {
    this.x = _x;
    this.y = _y;
    this.vy = _vy;
  }
}

///////////////
// Variables //
///////////////

let gameFont;

// Score Variables

let easyHS = 40000;
let medHS = 30000;
let hardHS = 20000;
let highscoreSaved = false;
let score = 0, shots = 0, hits = 0;

let easyPoints = 100, easyScaling = 2000;
let easyDropRate = 90, easyMinDropRate = 30;
let easySpawnFreq = 60, easyMinSpawnFreq = 20;

let mediumPoints = 150, mediumScaling = 1000;
let mediumDropRate = 60, mediumMinDropRate = 10;
let mediumSpawnFreq = 60, mediumMinSpawnFreq = 15;

let hardPoints = 200, hardScaling = 1000;
let hardDropRate = 30, hardMinDropRate = 5;
let hardSpawnFreq = 40, hardMinSpawnFreq = 5;

let selPoints, selScaling;
let selDropRate, selMinDropRate;
let selSpawnFreq, selMinSpawnFreq;

// Player Variables

let playerBounds;
let allShipJSON;
let shipNormal, shipDamage;
let shipPixelDim = 3;

let pews = [];

let onStartScreen = true;
let onGameSelectScreen = false;
let gameSelect = 0;

let explodeFrameCount = 0;
let playerLost = false;
let showEndScreen = false;

let keysDisabledTimer = 0;
let keysDisabled = false;

// Tetromino Variables

let tetrominos;
let tetrominosKeys;
let activeTetros = [];

let spawnTimer = 0;   // Current number of frames since the last spawn
let spawnFrequency;   // Number of frames before another one appears
let dropRate;         // Number of frames it takes for a tetromino to move

// Sound and Music Variables

let mute = false;
let pewSound;
let flipSound;
let clearSound;
let shipExplode;
let creditAdded;
let highscoreLoop;

// Gamepad Stuff
let gamepadNav;

let gamepadFirePressed = false;
let gamepadFireHeld = false;

let gamepadUpPressed = false;
let gamepadUpHeld = false;

let gamepadDownPressed = false;
let gamepadDownHeld = false;

////////////////////
// Core Functions //
////////////////////

// Called before setup
function preload() {
  // Load sound data
  soundFormats('mp3', 'ogg');
  pewSound = loadSound('pew.mp3');
  pewSound.setVolume(0.5);
  
  flipSound = loadSound('tetromino_flip.mp3');
  clearSound = loadSound('tetromino_clear.mp3');
  shipExplode = loadSound('ship_explode.mp3');
  creditAdded = loadSound('credit_added.mp3');
  
  highscoreLoop = loadSound('highscore_loop.mp3');
  highscoreLoop.setLoop(true);
  
  // Load JSON data
  allShipJSON = loadJSON("ship.json");
  
  tetrominos = loadJSON("tetrominos.json");
  
  // Load font data
  gameFont = loadFont("PixeloidMono.ttf");
  
  // Load highscores
  let tempHS = getItem("easyHS");
  if(tempHS !== null && tempHS !== undefined) { easyHS = tempHS; }
  
  tempHS = getItem("medHS");
  if(tempHS !== null && tempHS !== undefined) { medHS = tempHS; }
  
  tempHS = getItem("hardHS");
  if(tempHS !== null && tempHS !== undefined) { hardHS = tempHS; }
}

// Called before draw()
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);
  rectMode(CORNERS);
  noSmooth();
  
  textFont(gameFont);
  
  // Get the Ship drawing data
  shipNormal = allShipJSON.normal;
  shipDamage = allShipJSON.damage;
  
  let tempPX = windowWidth/2;
  let tempPY = windowHeight-50;
  playerBounds = new boundingBox(
    tempPX,
    tempPY,
    tempPX + (shipNormal.length * shipPixelDim),
    tempPY + (shipNormal.length * shipPixelDim)
  );
  
  tetrominosKeys = Object.keys(tetrominos);
}

// Main drawing function
function draw() {
  background(0);
  
  // Check gamepad each frame for info
  checkGamepad();
  
  // At the start of each draw frame,
    // check for tetromino-player collision
  checkPlayerTetroCollision();
  
  if(onStartScreen) {
    // Start Screen
    drawStartScreen();
  }
  else if(onGameSelectScreen) {
    // Difficulty Selection Screen
    drawGameSelectScreen();
  }
  else if(showEndScreen) {
    if(!highscoreSaved) {
      // Attempt to save the highscore
      if(doSaveHighscore()) {
        saveHighscore();
        if(!mute) { highscoreLoop.play(); }
        highscoreSaved = true;
      }
    }
    
    // Player Lost, Showing Stats
    showPlayerStats();
  }
  else if(playerLost) {
    // Player Lost
    drawDamageShip();
    if(explodeFrameCount > 150) {
      showEndScreen = true;
      explodeFrameCount = 0;
    }
  }
  else {
    // Normal Gameplay
    updateDifficulty();

    if(spawnTimer >= spawnFrequency) {
      spawnTimer = 0;
      spawnTetromino();
    }

    // Update Positions
    playerMovementCheck();
    updatePews();
    updateActiveTetros();

    // Draw New Positions
    drawShip();
    drawScore();
    drawTetrominos();
    drawPews();
    
    // Spawn Line
    stroke(255);
    strokeWeight(1);
    line(0, 80, width, 80);

    // Increment Tetromino Spawner Timer
    ++spawnTimer;
  }
  
  drawSoundSetting();
  
  if(playerLost) {
    ++explodeFrameCount;
  }
  
  if(keysDisabled) {
    ++keysDisabledTimer;
    if(keysDisabledTimer >= 120) {
      keysDisabledTimer = 0;
      keysDisabled = false;
    }
  }
}


////////////////////
// Menu Functions //
////////////////////

function updateGameStatus() {
  // If keys are disabled, do nothing
  if(keysDisabled) { return; }
  
  let gamepadFireValid = gamepadFirePressed && !gamepadFireHeld;
  let gamepadUpValid = gamepadUpPressed && !gamepadUpHeld;
  let gamepadDownValid = gamepadDownPressed && !gamepadDownHeld;
  
  if(keyCode === 77) {
    mute = !mute;
    if(mute && highscoreLoop.isPlaying()) {
      highscoreLoop.stop();
    }
  }
  else if(onStartScreen) {
    if(!mute) { creditAdded.play(); }
    onStartScreen = false;
    onGameSelectScreen = true;
  }
  else if(onGameSelectScreen) {
    if(gamepadDownValid || (keyIsPressed && keyCode === 83)) {
      gameSelect = gameSelect >= 2 ? 0 : gameSelect+1;
    } else if(gamepadUpValid || (keyIsPressed && keyCode === 87)) {
      gameSelect = gameSelect <= 0 ? 2 : gameSelect-1;
    } else if(gamepadFireValid || (keyIsPressed && keyCode === 75)) {
      onGameSelectScreen = false;
      setGameData();
    }
  }
  else if(showEndScreen) {
    if(highscoreLoop.isPlaying()) {
      highscoreLoop.stop();
    }
    
    onStartScreen = true;
    onGameSelectScreen = false;
    gameSelect = 0;
    playerLost = false;
    showEndScreen = false;
    resetGameStats();
  }
  else if(!playerLost && ((keyIsPressed && keyCode === 75) || gamepadFireValid) && pews.length < maxPews) {
    pews.push(new pew(playerBounds.ax+20, playerBounds.ay - 3, -10));
    if(!mute) { pewSound.play(); }
    
    shots++;
  }
}

function drawStartScreen() {
  strokeWeight(0);
  fill(255);
  textSize(25);
  textAlign(CENTER);
  
  // Draw Title
  fill(255);
  textSize(45);
  textAlign(CENTER);
  text("Arcade Shoot-'em-Up", width/2, height/4);
  
  // Draw "Insert Credits" Text
  if(frameCount > 80) {
    textSize(30);
    textAlign(CENTER);
    text("Please insert          to play", width/2, height/2);
    
    fill(255, 255, 0);
    text("              1 credit        ", width/2, height/2);
  }
}

function drawGameSelectScreen() {
  strokeWeight(0);
  
  // Draw Title
  fill(255);
  textSize(45);
  textAlign(CENTER);
  text("Arcade Shoot-'em-Up", width/2, height/4);
  
  drawHighscore();
  
  fill(255);
  textSize(25);
  textAlign(CENTER);
  
  let easyText = "Easy Difficulty";
  let medText = "Medium Difficulty";
  let hardText = "Hard Difficulty";
  
  textSize(35);
  switch(gameSelect) {
    case 0:
      easyText = `> ${easyText}`;
      break;
    case 1:
      medText = `> ${medText}`;
      break;
    case 2:
      hardText = `> ${hardText}`;
      break;
    default:
       // Not supposed to happen, crash I guess?
      noLoop();
      console.error("Game Selection Error! Invalid Game Mode: ${gameSelect}");
      return;
  }
  
  text(easyText, width/2, height/2);
  text(medText, width/2, 50 + height/2);
  text(hardText, width/2, 100 + height/2);
}

/////////////////////////
// Game Draw Functions //
/////////////////////////

function drawShip() {
  strokeWeight(0);
  for(let y = 0; y < shipNormal.length; ++y) {
    for(let x = 0; x < shipNormal[y].length; ++x) {
      switch(shipNormal[y][x]) {
        case 1:
          fill(255);
          break;
        case 2:
          fill(255, 0, 0);
          break;
        case 3:
          fill(0, 0, 255);
          break;
        default:
          continue;
      }
      
      rect(playerBounds.ax + (shipPixelDim * x),
           playerBounds.ay + (shipPixelDim * y),
           playerBounds.ax + (shipPixelDim * (x+1)),
           playerBounds.ay + (shipPixelDim * (y+1)));
    }
  }
}

function drawDamageShip() {
  stroke(0);
  strokeWeight(0);
  
  for(let y = 0; y < shipDamage.length; ++y) {
    for(let x = 0; x < shipDamage[y].length; ++x) {
      if(shipDamage[y][x] === 0) { continue; }
      
      if(frameCount % 6 === 0) { fill(200, 0, 0) }
      else { fill(120, 0, 0); }
      
      rect(playerBounds.ax + (shipPixelDim * x),
           playerBounds.ay + (shipPixelDim * y),
           playerBounds.ax + (shipPixelDim * (x+1)),
           playerBounds.ay + (shipPixelDim * (y+1)));
    }
  }
}

function drawScore() {
  fill(255);
  textSize(25);
  textAlign(RIGHT);
  
  let txtOut = `${score}`;
  while(txtOut.length < 7) { txtOut = `0${txtOut}`; }
  text(txtOut, width-40, 30);
  
  drawHighscore();
}

function drawHighscore() {
  textAlign(CENTER);
  textSize(25);
  
  switch(gameSelect) {
    case 0:
      txtOut = `${easyHS}`;
      break;
    case 1:
      txtOut = `${medHS}`;
      break;
    case 2:
      txtOut = `${hardHS}`;
      break;
    default:
      txtOut = `INVALID`;
  }
  
  while(txtOut.length < 7) { txtOut = `0${txtOut}`; }
  text(txtOut, width/2, 60);
  
  fill(255, 0, 0);
  text(`Highscore`, width/2, 30);
}

function drawTetrominos() {
  for(let i = 0; i < activeTetros.length; ++i) {
    _drawTetromino(tetrominos[activeTetros[i].type][activeTetros[i].flipIndex],
                  activeTetros[i].bounds.ax, activeTetros[i].bounds.ay,
                  tetroBrickSize, tetroBorderSize,
                  color("#DDD"), color("#252a8d"));
  }
}

function drawPews() {
  fill(255);
  strokeWeight(0);
  for(let i = 0; i < pews.length; ++i) {
    rect(pews[i].x, pews[i].y, pews[i].x + 5, pews[i].y + 5);
  }
}

function drawSoundSetting() {
  if(mute) {
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

function _drawTetromino(tm, ax, ay, squareDim, borderSize, colorMain, colorAlt) {
  stroke(colorAlt);
  strokeWeight(borderSize);
  fill(colorMain);
  
  for(let y = 0; y < tm.length; ++y) {
    for(let x = 0; x < tm[y].length; ++x) {
      if(tm[y][x] === 1) {
        rect(ax + (x * squareDim), ay + (y * squareDim),
             ax + ((x+1) * squareDim), ay + ((y+1) * squareDim));
      }
    }
  }
}


//////////////////////////
// Game Setup Functions //
//////////////////////////

function setGameData() {
  switch(gameSelect) {
    case 0: // Easy Mode
      selPoints = easyPoints; 
      selScaling = easyScaling; 
      selDropRate = easyDropRate; 
      selMinDropRate = easyMinDropRate; 
      selSpawnFreq = easySpawnFreq; 
      selMinSpawnFreq = easyMinSpawnFreq;
      break;
    case 1: // Medium Mode
      selPoints = mediumPoints; 
      selScaling = mediumScaling; 
      selDropRate = mediumDropRate; 
      selMinDropRate = mediumMinDropRate; 
      selSpawnFreq = mediumSpawnFreq; 
      selMinSpawnFreq = mediumMinSpawnFreq;
      break;
    case 2: // Hard Mode
      selPoints = hardPoints; 
      selScaling = hardScaling; 
      selDropRate = hardDropRate; 
      selMinDropRate = hardMinDropRate; 
      selSpawnFreq = hardSpawnFreq; 
      selMinSpawnFreq = hardMinSpawnFreq;
      break;
    default:
      // Not supposed to happen, crash I guess?
      noLoop();
      console.error("Game Selection Error! Invalid Game Mode: ${gameSelect}");
      return;
  }
}


//////////////////////////////////
// Tetromino Spawning Functions //
//////////////////////////////////

function spawnTetromino() {
  let index = floor(random(0, tetrominosKeys.length));
  let name = tetrominosKeys[index];
  let tetrominoData = tetrominos[name];
  let flipIndex = floor(random(0, tetrominoData.length));
  let maxFlipIndex = tetrominoData.length - 1;
  
  let rng = random(1, (width/tetroBrickSize) - 1);
  let startX = tetroBrickSize * floor(rng);
  
  let startY = 80; // static, as they should start at the top
  
  let endX = startX + (tetroBrickSize * tetrominoData[flipIndex][0].length);
  let endY = startY + (tetroBrickSize * tetrominoData[flipIndex].length);
  
  activeTetros.push(
    new tetromino(
      name, flipIndex, maxFlipIndex, 0,
      new boundingBox(startX, startY, endX, endY)
    )
  );
}

function updateDifficulty() {
  let tempFreq = selSpawnFreq - (score / selScaling);
  spawnFrequency = (tempFreq < selMinSpawnFreq ? selMinSpawnFreq : tempFreq);
  
  let tempDropRate = selDropRate - (score / selScaling);
  dropRate = (tempDropRate < selMinDropRate ? selMinDropRate : tempDropRate);
}


///////////////////////////////
// Movement Update Functions //
///////////////////////////////

function playerMovementCheck() {
  
  gamepadAxis = 0;
  if(gamepadNav !== null && gamepadNav !== undefined) {
    gamepadAxis = gamepadNav.axes[0];
  }
  
  if(keyIsDown(65) || gamepadAxis === -1) {
    let tempPX = playerBounds.ax - floor(width/100);
    if(tempPX <= 0) { tempPX = 0; }
    
    let tempBounds = new boundingBox(
      tempPX,
      playerBounds.ay,
      tempPX + (shipNormal.length * shipPixelDim),
      playerBounds.by
    );
    playerBounds = tempBounds;
  } else if(keyIsDown(68) || gamepadAxis === 1) {
    let tempPX = playerBounds.ax + floor(width/100);
    if(tempPX >= width-50) { tempPX = width-50; }
    
    let tempBounds = new boundingBox(
      tempPX,
      playerBounds.ay,
      tempPX + (shipNormal.length * shipPixelDim),
      playerBounds.by
    );
    playerBounds = tempBounds;
  }
}

function updatePews() {
  let removedPew;
  
  for(let i = 0; i < pews.length; ++i) {
    removedPew = false;
    pews[i].y += pews[i].vy;  // Update Y coordinate
    
    for(let k = 0; k < activeTetros.length; ++k) {
      if(checkPewCollision(pews[i], activeTetros[k].bounds)) {
        
        // Remove tetromino from array
        activeTetros.splice(k, 1);
        
        score += selPoints;  // Increase score
        ++hits;              // Increment hit count
        
        // Remove the pew from the array
        pews.splice(i, 1);
        
        // keep the current pews index,
          // as it has been removed
        --i;
        removedPew = true;
        
        // If sound is not muted,
          // play tetromino clear sound
        if(!mute) { clearSound.play(); }
        
        // Break from for loop
        break;
      }
    }
    
    // If a pew was removed, skip final check
    if(removedPew) { continue; }
    
    // If pew has reached the top of the screen
      // remove it from the array
    if(pews[i].y <= 80) {
      pews.splice(i, 1);
    }
  }
}

function updateActiveTetros() {
  for(let i = 0; i < activeTetros.length; ++i) {
    // Increase current activeTetromino frameCount
    activeTetros[i].frameCount++;
    
    // Roll RNG if tetromino should flip
    let rng = floor(random(0, 500));
    if(rng === 0) {
      // Left Flip current Tetromino
      activeTetros[i].lFlip();
    } else if(rng === 1) {
      // Right Flip current Tetromino
      activeTetros[i].rFlip();
    }
    
    // Does the tetromino need to move down?
    if(activeTetros[i].frameCount >= dropRate) {
      // Reset frameCount
      activeTetros[i].frameCount = 0;
      
      // Move tetromino down by size
      activeTetros[i].bounds.ay += tetroBrickSize;
      activeTetros[i].bounds.by += tetroBrickSize;
    }
    
    // Has the tetromino reached the bottom of the screen?
    if(activeTetros[i].bounds.by >= height) {
      // Remove the tetromino from the array
      activeTetros.splice(i, 1);
    }
  }
}

function checkPlayerTetroCollision() {
  for(let i = 0; i < activeTetros.length; ++i) {
    // Check if tetromino-ship collision is possible
    if(activeTetros[i].bounds.by >= (height - 100)) {
      // Check if tetromino-ship collision has occurred
      if(checkCollision(playerBounds, activeTetros[i].bounds)) {
        playerLose();
        return;
      }
    }
  }
}


///////////////////////////////////
// Collision Detection Functions //
///////////////////////////////////

function checkPewCollision(pew, objA) {
  return (objA.ax <= pew.x && pew.x <= objA.bx) &&
         (objA.ay <= pew.y && pew.y <= objA.by);
}

function checkCollision(objA, objB) {
  return !(
    objA.ax >= objB.bx ||  // Left Side A > Right Side B
    objA.ay >= objB.by ||  // Top Side A > Bottom Side B
    objA.bx <= objB.ax ||  // Right Side A < Left Side B
    objA.by <= objB.ax     // Bottom Side A < Top Side B
  );
}

////////////////////////
// End Game Functions //
////////////////////////

function playerLose() {
  // Remove all tetrominos
  activeTetros = [];
  
  // Play explode sound
  if(!mute) { shipExplode.play(); }
  
  // Set lose flag
  playerLost = true;
  
  // Disable player interaction
  keysDisabled = true;
}

function showPlayerStats() {
  strokeWeight(0);
  fill(255);
  textSize(25);
  textAlign(CENTER);
  
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

function resetGameStats() {
  pews = [];
  activeTetros = [];
  
  score = 0;
  shots = 0;
  hits = 0;
  highscoreSaved = false;
}

/////////////////////////
// Highscore Functions //
/////////////////////////

function doSaveHighscore() {
  switch(gameSelect) {
    case 0:
      return score > easyHS;
    case 1:
      return score > medHS;
    case 2:
      return score > hardHS;
    default:
      return false;
  }
}

function saveHighscore() {
  switch(gameSelect) {
    case 0:
      storeItem("easyHS", score);
      break;
    case 1:
      storeItem("medHS", score);
      break;
    case 2:
      storeItem("hardHS", score);
      break;
    default:
      // do nothing
  }
}


////////////////////////////////////////
// Key Pressing and Gamepad Functions //
////////////////////////////////////////

function keyPressed() {
  updateGameStatus();
}

function checkGamepad() {
  // If interactivity is disabled, do nothing
  if(keysDisabled) { return; }
  
  // If gamepad is connected
  if(gamepadNav !== null && gamepadNav !== undefined) {
    // Was the (A) button pressed, and is no longer pressed?
    gamepadFireHeld = gamepadNav.buttons[1].pressed && gamepadFirePressed;
    
    // Was the [Up] direction pressed, and is no longer pressed?
    gamepadUpHeld = (gamepadNav.axes[1] === -1) && gamepadUpPressed;
    
    // Was the [Down] direction pressed, and is no longer pressed?
    gamepadDownHeld = (gamepadNav.axes[1] === 1) && gamepadDownPressed;
    
    // Have these update each time the function is called
    gamepadFirePressed = gamepadNav.buttons[1].pressed;
    gamepadUpPressed = (gamepadNav.axes[1] === -1);
    gamepadDownPressed = (gamepadNav.axes[1] === 1);
  }
  
  if((gamepadFirePressed && !gamepadFireHeld) ||
     (gamepadUpPressed   && !gamepadUpHeld  ) ||
     (gamepadDownPressed && !gamepadDownHeld))   {
    updateGameStatus();
  }
}

window.addEventListener("gamepadconnected", function(e) {
  gamepadNav = navigator.getGamepads()[e.gamepad.index];
});