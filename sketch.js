/********************************************************************
 ********************************************************************
 **                                                                **
 **                           sketch.js                            **
 **                   Created By: Tyler Alesse                     **
 **                                                                **
 **         The core of the canvas display functionality           **
 **                                                                **
 ********************************************************************
 ********************************************************************/


///////////////
// Constants //
///////////////

/**
 * The height of the feedback section
 **/
 const FEED_HEIGHT = 120;

/**
 * The primary angle
 * 
 * Used for drawing the corridors
 **/
const _ALPHA = 45;

/**
 * The secondary angle
 * 
 * Used for drawing the corridors
 **/
const _BETA = 90 - _ALPHA;

/**
 * The local path of the settings image
 **/
const SETTINGS_IMAGE_PATH = "cog.png";

//////////////////////
// Pseudo-Constants //
//////////////////////

/**
 * The canvas' X Dimension length
 **/
let CVS_X_DIM = 800;

/**
 * The canvas' Y Dimension length
 **/
let CVS_Y_DIM = 920;

/**
 * The bounding box of the game display
 * 
 * @type {Bounds}
 **/
let gameDisplayBounds;

/**
 * The `x` coordinate of the compass display
 * 
 * @type {Number}
 **/
let COMPASS_X

/**
 * The `y` coordinate of the compass display
 * 
 * @type {Number}
 **/
let COMPASS_Y;

/**
 * Length of each cell for game drawing
 * 
 * @type {Number}
 **/
let _CELL_LENGTH;

/**
 * The maximum view depth of a corridor
 * 
 * @type {Number}
 **/
let _MAX_DEPTH;

///////////////
// Variables //
///////////////

/**
 * The canvas itself
 **/
let cvs;

/**
 * Holds all of the necessary control information
 * and functions
 **/
let controlData = new ControlData();

/**
 * Holds all of the necessary maze information
 * and functions
 */
let mazeData = new MazeData();

/**
 * The minimap data for drawing
 **/
let miniMapData = null;

/**
 * Holds the bounding box for all of the
 * interactive buttons on the interface
 * 
 * up, left, right, inter, settings
 * 
 * @type {ctrl_base}
 **/
let btnBounds;

/**
 * Holds the loaded settings button image
 **/
let settingsButtonImage = null;

/**
 * Used to determine if the game frame should be updated
 **/
let frameUpdate = true;


//////////////////
// Main Program //
//////////////////

function preload() {
    // Setup the necessary drawing information
    setDrawData();

    try {
        let antiCache = new Date().getMilliseconds();

        // We need to verify the file exists at all
            //? The antiCache is used to prevent being receiving a cached version
            //?     in case of updates not recognized by the server
        let request = new XMLHttpRequest();
        request.open('HEAD', `${SETTINGS_IMAGE_PATH}?${antiCache}`, false);  // `false` makes the request synchronous
        request.send();

        // If the file exists
        if (request.status === 200) {
            // Load the file using p5.js
            settingsButtonImage = loadImage(request.responseURL);
            return;
        }
    } catch(err) {
        console.error(e);
    }
}

function setup() {
    cvs = createCanvas(CVS_X_DIM, CVS_Y_DIM);
    cvs.center("horizontal");
    cvs.mouseOut(mouseMovedOut);

    angleMode(DEGREES); // DEGREES to make math for me a little easier
    frameRate(24);      // Lower framerate to help reduce unnecessary drawing
    noSmooth();         // Disables smoothing

    noLoop(); //! DEBUG: REMOVE THIS WHEN DONE
}

function draw() {
    // If the main game frame needs to be updated
    if(frameUpdate) {
        // Used for determining where drawings aren't perfect
        background(255, 0, 255);

        // Get necessary drawing information from mazeData
        let lcr = mazeData.getCorridorInfo(_MAX_DEPTH - 1);

        // Draw 3D Maze
        drawMainCorridor(lcr.c);
        determineSideCorridors(lcr.c.length, lcr.l, lcr.r);

        // Update the minimap as necessary
        miniMapData = mazeData.getMiniMapData();

        // If the full map is open
        if(controlData.isMapOpen) {
            drawFullMap();
        }

        // Do not update game frame anymore
        frameUpdate = false;
    }

    // Always draw these
    drawFeedbackBase();
    drawButtonFeedback();
    drawButtonHelpText();
    drawCompass();
    drawSettingsButton();
    drawMiniMap(miniMapData);

    if(mazeData.didWin) {
        // If the player won
        drawPlayerWinPane();
    } else if(controlData.isSettingsOpen) {
        // If the settings is open
        drawSettingsPane();
    }
}


/////////////////////
// Event Functions //
/////////////////////

/**
 * If movement is possible, begin movement functionality
 * 
 * @param {Event} e The event data
 **/
function keyPressed(e) {
    try {
        if(!mazeData.didWin && !controlData.controlsDisabled) {
            //? Note: e.keyCode is what we reference as the keyID.
                //? This is the only place it is called keyCode
            interactionLogic(e.keyCode);
            frameUpdate = true;
        }
    } catch(err) {
        console.error(err);
    }
}

/**
 * Begins mouse-button interaction functionality
 * 
 * mousePressed() is called when the canvas registers a mouse press
 * 
 * @param {Event} e The event data
 **/
function mousePressed(e) {
    try {
        if(!mazeData.didWin && !controlData.controlsDisabled) {
            for(let i = 0; i < ctrl_base.KEYS.length; ++i) {
                // If the mouse is within the bounds of a button
                if(_mouseInBounds(btnBounds[ctrl_base.KEYS[i]])) {
                    // Set that button's pressing status to true
                    controlData.setControlMousePress(ctrl_base.KEYS[i], true);
                    return; // stop checking if true
                }
            }
        }
    } catch(err) {
        console.error(err);
    }
}

/**
 * Finishes mouse-button interaction functionality
 * 
 * mouseReleased() is called when the canvas registers a mouse release
 * 
 * @param {Event} e The event data
 **/
function mouseReleased(e) {
    let btnReleased, isReleased, isInBounds;
    let tempCMP = controlData.controlMousePress;

    try {
        if(!mazeData.didWin && !controlData.controlsDisabled) {
            for(let i = 0; i < ctrl_base.KEYS.length; ++i) {
                isReleased = tempCMP[ctrl_base.KEYS[i]];
                isInBounds = _mouseInBounds(btnBounds[ctrl_base.KEYS[i]]);
        
                // Was the button released and the mouse still within its bounds
                if(isReleased && isInBounds) {
                    btnReleased = ctrl_base.KEYS[i];
        
                    // Set the button pressing status to false
                    controlData.setControlMousePress(ctrl_base.KEYS[i], false)

                    // Begin interaction logic
                    interactionLogic(controlData.controlMap[btnReleased])
                    
                    // Most likely will need to update the game frame
                    frameUpdate = true;
                    break; // exit for loop
                }
            }
        
            // Regardless of if function worked, release all button status
            controlData.releaseAllButtons();
        }
    } catch(err) {
        controlData.releaseAllButtons();
        console.error(err);
    }
}

/**
 * Stops mouse-button interaction functionality
 * 
 * mouseMovedOut() is called if canvas registers mouse left canvas area
 *  
 * @param {Event} e The event data
 **/
function mouseMovedOut(e) {
    // Stop all button pressing
    controlData.releaseAllButtons();
}


////////////////////
// Draw Functions //
////////////////////

/**
 * Draw the main backing for the user
 * feedback area
 **/
function drawFeedbackBase() {
    // Control Background
    rectMode(CORNERS);
    stroke(0);
    strokeWeight(0);
    fill(200);
    rect(0, height - FEED_HEIGHT, width, height);
}

/**
 * Draw the compass according to the player's
 * current facing direction.
 **/
function drawCompass() {
    rectMode(CORNERS);
    strokeWeight(0);
    fill(0);

    // The center square of the compass
    rect(COMPASS_X + 10, COMPASS_Y + 25, COMPASS_X + 30, COMPASS_Y + 45);

    stroke(0);
    strokeWeight(2);

    // NORTH
    if(mazeData.compassDir === 0) { fill(0, 0, 255); } else { fill(255); }
    triangle(COMPASS_X + 20, COMPASS_Y + 10, COMPASS_X + 10, COMPASS_Y + 26, COMPASS_X + 30, COMPASS_Y + 26);

    // EAST
    if(mazeData.compassDir === 1) { fill(0, 0, 255); } else { fill(255); }
    triangle(COMPASS_X + 30, COMPASS_Y + 25, COMPASS_X + 45, COMPASS_Y + 35, COMPASS_X + 30, COMPASS_Y + 45);

    // SOUTH
    if(mazeData.compassDir === 2) { fill(0, 0, 255); } else { fill(255); }
    triangle(COMPASS_X + 20, COMPASS_Y + 60, COMPASS_X + 10, COMPASS_Y + 45, COMPASS_X + 30, COMPASS_Y + 45);

    // WEST
    if(mazeData.compassDir === 3) { fill(0, 0, 255); } else { fill(255); }
    triangle(COMPASS_X + 10, COMPASS_Y + 25, COMPASS_X - 5, COMPASS_Y + 35, COMPASS_X + 10, COMPASS_Y + 45);

    _prepCompassText();
    _drawCompassText(COMPASS_X, COMPASS_Y);
}

/**
 * Draw what the buttons do above each button
 **/
function drawButtonHelpText() {
    _prepKeyHelpText();
    
    let lBtn = btnBounds.left;
    text(KeyInfo.getCharFromKeyCode("ArrowLeft"), lBtn.ax + 20, lBtn.ay - 10);

    let uBtn = btnBounds.up;
    text(KeyInfo.getCharFromKeyCode("ArrowUp"), uBtn.ax + 20, uBtn.ay - 10);
    
    let rBtn = btnBounds.right;
    text(KeyInfo.getCharFromKeyCode("ArrowRight"), rBtn.ax + 20, rBtn.ay - 10);
}

/**
 * Draw main button interface according
 * to current interaction events
 **/
function drawButtonFeedback() {
    let tempCM = controlData.controlMap;
    let tempCC = controlData.controlChar;

    // Left Display
    let lBtn = btnBounds.left;
    _setKeyDisplayColor(tempCM.left, "left", lBtn);
    rect(lBtn.ax, lBtn.ay, lBtn.bx, lBtn.by);

    // Up Display
    let uBtn = btnBounds.up;
    _setKeyDisplayColor(tempCM.up, "up", uBtn);
    rect(uBtn.ax, uBtn.ay, uBtn.bx, uBtn.by);

    // Right Display
    let rBtn = btnBounds.right;
    _setKeyDisplayColor(tempCM.right, "right", rBtn);
    rect(rBtn.ax, rBtn.ay, rBtn.bx, rBtn.by);

    // Interact Display // TODO: Create a need for interaction
    let iBtn = btnBounds.inter;
    // _setKeyDisplayColor(tempCM.inter, "inter", iBtn);
    // rect(iBtn.ax, iBtn.ay, iBtn.bx, iBtn.by);

    // Display Mapped Button
    _prepKeyDisplayText();
    text(tempCC.left, lBtn.ax + 20, lBtn.ay + 25);
    text(tempCC.up, uBtn.ax + 20, uBtn.ay + 25);
    text(tempCC.right, rBtn.ax + 20, rBtn.ay + 25);
    // text(tempCC.inter, iBtn.ax + 45, iBtn.ay + 25);
}

/**
 * Draw the settings button according to current
 * interaction events
 **/
function drawSettingsButton() {
    let tempCM = controlData.controlMap;

    rectMode(CORNERS);
    stroke(0);
    strokeWeight(1);
    fill(240);

    let sBtn = btnBounds.settings;
    _setKeyDisplayColor(tempCM.settings, "settings", sBtn);
    rect(sBtn.ax, sBtn.ay, sBtn.bx, sBtn.by);

    if(settingsButtonImage !== null && settingsButtonImage !== undefined) {
        image(settingsButtonImage, sBtn.ax, sBtn.ay, sBtn.bx - sBtn.ax, sBtn.by - sBtn.ay, 0, 0);
    } else {
        stroke(0);
        strokeWeight(0);
        fill(0);
        textSize(16);
        text("Settings", sBtn.ax + 50, sBtn.ay + 54);
    }
}

/**
 * Draw the settings button according to current
 * interaction events
 **/
function drawMiniMap(mmData) {
    let tempCM = controlData.controlMap;
    let mBtn = btnBounds.minimap;

    // The dimensions of the minimap cells
    let dimX = ((mBtn.bx - mBtn.ax) / mmData.length);
    let dimY = ((mBtn.by - mBtn.ay) / mmData.length);

    // Extra redundancy, just in case
    rectMode(CORNERS);

    _setKeyDisplayColor(tempCM.minimap, "minimap", mBtn);
    fill(0);
    rect(mBtn.ax - 1, mBtn.ay - 1, mBtn.bx + 1, mBtn.by + 1);

    // Mini-map drawing
    strokeWeight(0);

    for(let x = 0; x < mmData.length; ++x) {
        for(let y = 0; y < mmData.length; ++y) {
            if(x === 2 && y === 2) {
                fill(0, 0, 255);
            } else if(mmData[y][x] === " ") {
                fill(255);
            } else if(mmData[y][x] === "S") {
                fill(255, 0, 0);
            } else if(mmData[y][x] === "E") {
                fill(0, 255, 255);
            } else if(mmData[y][x] === "#") {
                fill(100);
            } else if(mmData[y][x] === "X") {
                fill(0);
            } else {
                fill(255, 0, 255); // Unrecognized maze symbol
            }
        
            // Draw necessary box
            rect(mBtn.ax + (x * dimX), mBtn.ay + (y * dimY), mBtn.ax + ((x+1) * dimX), mBtn.ay + ((y+1) * dimY));
        }
    }
}

/**
 * Draw the discovered part of the map
 **/
function drawFullMap() {
    rectMode(CORNERS);
    fill(255);
    stroke(0);
    strokeWeight(0.5);
    rect(50, 40, gameDisplayBounds.bx - 50, gameDisplayBounds.by - 40);

    let disc = mazeData.discovered;
    let fullMap = mazeData.layout;

    let dimX = (gameDisplayBounds.bx - 100) / fullMap.length;
    let dimY = (gameDisplayBounds.by - 80) / fullMap.length;

    for(let x = 0; x < fullMap.length; ++x) {
        for(let y = 0; y < fullMap.length; ++y) {
            if(disc[y][x] === false) {
                fill(0);
            } else if(x === mazeData.playerY && y === mazeData.playerX) {
                fill(0, 0, 255);
            } else if(fullMap[y][x] === " ") {
                fill(255);
            } else if(fullMap[y][x] === "S") {
                fill(255, 0, 0);
            } else if(fullMap[y][x] === "E") {
                fill(0, 255, 255);
            } else if(fullMap[y][x] === "#") {
                fill(100);
            } else {
                // Error?
                fill(255, 0, 255);
            }
        
            // Draw necessary box
            rect(50 + (x * dimX), 40 + (y * dimY), 50 + ((x+1) * dimX), 40 + ((y+1) * dimY));
        }
    }
}

/**
 * Draw the main corridor with a given depth
 * 
 * @param {number} depth The depth of the hallway
 **/
function drawMainCorridor(center) {
    let a, b;
    let hasFalseDepth = false;
    let depth = center.length;

    stroke(0);
    strokeWeight(0);
    rectMode(CORNERS);
    noSmooth();

    // Cannot have a negative depth
    if(depth < 0) {
        console.error(`drawMainCorridor():\n Invalid Depth: ${depth}`);
        return;
    } else if(depth >= _MAX_DEPTH) {
        depth = _MAX_DEPTH - 1;
        hasFalseDepth = true;
    }

    a = _CELL_LENGTH + (depth * _CELL_LENGTH);
    b = round(a * sin(_BETA) / sin(_ALPHA));

    stroke(0);
    strokeWeight(0);

    // FLOOR
    fill(60); // O.BL, I.BL, I.BR, O.BR
    quad(0, gameDisplayBounds.by, a, gameDisplayBounds.by - b, gameDisplayBounds.bx - a, gameDisplayBounds.by - b, gameDisplayBounds.bx, gameDisplayBounds.by);

    // CEILING
    fill(120); // O.TL, I.TL, I.TR, O.TR
    quad(0, 0, a, b, gameDisplayBounds.bx - a, b, gameDisplayBounds.bx, 0);

    // LEFT WALL
    fill(80); // O.BL, I.BL, I.TL, O.TL
    quad(0, gameDisplayBounds.by, a, gameDisplayBounds.by - b, a, b, 0, 0);
    
    // RIGHT WALL
    fill(80); // O.BR, I.BR, I.TR, O.TR
    quad(gameDisplayBounds.bx, gameDisplayBounds.by, gameDisplayBounds.bx - a, gameDisplayBounds.by - b, gameDisplayBounds.bx - a, b, gameDisplayBounds.bx, 0);

    // Add lines
    stroke(0);
    strokeWeight(1);

    // Top Left and Bottom Left
    line(0, 0, a, b);
    line(0, gameDisplayBounds.by, a, gameDisplayBounds.by - b);

    // Top Right and Bottom Right
    line(gameDisplayBounds.bx, gameDisplayBounds.by, gameDisplayBounds.bx - a, gameDisplayBounds.by - b);
    line(gameDisplayBounds.bx - a, b, gameDisplayBounds.bx, 0);

    if(!hasFalseDepth) {
        // BACK WALL
        if(center.indexOf("2") !== -1) { fill(0, 255, 255); } // Wins!
        else { fill(80); }

        strokeWeight(0);
        // I.BL, I.TL, I.TR, I.BR
        quad(
            a,                        gameDisplayBounds.by - b,
            a,                        b,
            gameDisplayBounds.bx - a, b,
            gameDisplayBounds.bx - a, gameDisplayBounds.by - b
        );
    } else {
        drawFalseDepth(70,
                    a - 1, (gameDisplayBounds.bx / 2) - 40,
                    b - 1, (gameDisplayBounds.by / 2) - 40,
            gameDisplayBounds.bx - a + 1, (gameDisplayBounds.bx / 2) + 40,
            gameDisplayBounds.by - b + 1, (gameDisplayBounds.by / 2) + 40
        );
    }

    //!!!!!!!!!!
    //! DEBUG !!
    //!!!!!!!!!!
    
    // strokeWeight(7);

    // stroke(0, 255, 0);
    // point(a, b);
    // point(a, gameDisplayBounds.by - b);
    // stroke(255, 0, 0); point(gameDisplayBounds.bx - a, b);
    // stroke(0, 255, 0); point(gameDisplayBounds.bx - a, gameDisplayBounds.by - b);
    
    // stroke(0, 0, 255);
    // point((gameDisplayBounds.bx / 2) - 40, (gameDisplayBounds.by / 2) - 40);
    // point((gameDisplayBounds.bx / 2) + 40, (gameDisplayBounds.by / 2) + 40);
    
    // stroke(255, 0, 255);
    // point(gameDisplayBounds.bx / 2, b);
    // point(a, gameDisplayBounds.by / 2);
    // point(gameDisplayBounds.bx / 2, gameDisplayBounds.by / 2);

    // a = _CELL_LENGTH + ((depth+1) * _CELL_LENGTH);
    // b = round(a * sin(_BETA) / sin(_ALPHA));

    // stroke(255, 255, 255);
    // point(a, b);
}

/**
 * Draws the settings pane and necessary feedback
 **/
function drawSettingsPane() {
    // Settings Background Pane
    stroke(0);
    strokeWeight(0);
    fill(200, 200, 255);
    rect(80, 100, gameDisplayBounds.bx - 80, gameDisplayBounds.by - 350);

    fill(0);        // Text Color
    textLeading(24); // Text Spacing

    if(controlData.isRemapMode) {
        // Conditional Next Step Instructions
        textSize(20);
        textStyle(ITALIC); // Set text to italic
        text("Press the key you want to remap to", gameDisplayBounds.bx / 2, 300);
        textStyle(NORMAL); // Reset to normal
    } else if(controlData.isInvalidKey) {
        textSize(20);
        textStyle(ITALIC); // Set text to italic
        text("Invalid key remapping.\nPlease use an alpha-numeric, spacebar, or arrow key", gameDisplayBounds.bx / 2, 280);
        textStyle(NORMAL); // Reset to normal
    } else if(controlData.isKeyTaken) {
        textSize(20);
        textStyle(ITALIC); // Set text to italic
        text("Key already in use.", gameDisplayBounds.bx / 2, 300);
        textStyle(NORMAL); // Reset to normal
    }

    // Display Settings title
    textSize(40);
    text("Settings", gameDisplayBounds.bx / 2, 150);

    // Display Instructions
    textSize(24);
    text("Press the key or\nclick the buttons to remap them", gameDisplayBounds.bx / 2, 200);
}

/**
 * Determine where side corridors must be drawn
 * 
 * @param {number} depth The depth of the corridor
 * @param {string} leftBin The binary string of cells with corridors on the left
 * @param {string} rightBin The binary string of cells with corridors on the right
 */
function determineSideCorridors(depth, leftBin, rightBin) {
    let hasFalseDepth = false;

    // Cannot have a negative depth
    if(depth < 0) {
        console.error(`drawSideCorridors():\n Invalid Depth: ${depth}`);
        return;
    } else if(depth >= _MAX_DEPTH) {
        depth = _MAX_DEPTH - 1;
        hasFalseDepth = true;
    }

    a = _CELL_LENGTH + depth * _CELL_LENGTH;
    b = round(a * sin(_BETA) / sin(_ALPHA));

    let lbInt = intFromBin(leftBin);
    let rbInt = intFromBin(rightBin);

    stroke(0);
    strokeWeight(0);

    for(let i = 0; i < depth; ++i) {
        if(lbInt % 2 == 1) {
            drawSideCorridor(i, depth, a, b, 0, 1, hasFalseDepth);
        }

        lbInt = lbInt >> 1;
    }

    for(let i = 0; i < depth; ++i) {
        if(rbInt % 2 == 1) {
            drawSideCorridor(i, depth, a, b, gameDisplayBounds.bx, -1, hasFalseDepth);
        }

        rbInt = rbInt >> 1;
    }
}

/**
 * Side corridor drawing function
 * 
 * @param {number} cd Current corridor depth
 * @param {number} md Maximum corridor depth
 * @param {number} a Point A
 * @param {number} b Point B
 * @param {number} xOff The offset of the points
 * @param {number} adj Adjust the points positively or negatively
 * @param {boolean} hasFalseDepth Does the corridor have a false depth perception
 */
function drawSideCorridor(cd, md, a, b, xOff, adj, hasFalseDepth) {
    let pn    = (adj >= 0 ? 1 : -1);
    let relA  = (cd * a) / md;
    let relB  = (cd * b) / md;
    let relAN = (cd + 1) * a / md;
    let relBN = (cd + 1) * b / md;

    //! DEBUG
    // console.log(`C.Depth: ${cd}, M.Depth: ${md}`);
    // console.log(`a: ${a}, b: ${b}`);
    // console.log(`relA: ${relA}, relB: ${relB}`);
    // console.log(`relAN: ${relAN}, relBN: ${relBN}`);
    // console.log(`Hypotenuse: ${Math.sqrt(((relAN - relA) * (relAN - relA)) + ((relBN - relB) * (relBN - relB)))}`);
    // console.log();

    stroke(0);
    strokeWeight(0);

    // Ceiling Triangle
    fill(120);
    triangle(xOff + pn*relA, relB - 2, xOff + pn*(relAN + 2), relBN, xOff + pn*relA, relBN);

    // Floor Triangle
    fill(60);
    triangle(xOff + pn*relA, gameDisplayBounds.by - relB + 2, xOff + pn*(relAN + 2), gameDisplayBounds.by - relBN, xOff + pn*relA, gameDisplayBounds.by - relBN);

    // Line Fixes
    strokeWeight(1);

    line(xOff + pn*relA, relB, xOff + pn*relA, gameDisplayBounds.by - relB);
    if((cd + 1) < md || hasFalseDepth) {
        line(xOff + pn*relAN, relBN, xOff + pn*relAN, gameDisplayBounds.by - relBN);
    }
    
    strokeWeight(0);
}

/**
 * Draws a false sense of depth using a gradient that darkens to black
 * 
 *! Note: This function is very slow at large gradient levels
 * 
 * @param {number} gradientLevel How many shadows should be drawn
 * @param {number} _axs The starting x coordinate for the top left
 * @param {number} _axe The ending x coordinate for the top left
 * @param {number} _ays The starting y coordinate for the top left
 * @param {number} _aye The ending y coordinate for the top left
 * @param {number} _bxs The starting x coordinate for the bottom right
 * @param {number} _bxe The ending x coordinate for the bottom right
 * @param {number} _bys The starting y coordinate for the bottom right
 * @param {number} _bye The ending y coordinate for the bottom right
 */
 function drawFalseDepth(gradientLevel, _axs, _axe, _ays, _aye, _bxs, _bxe, _bys, _bye) {
    let ax, ay, bx, by;

    strokeWeight(0);
    rectMode(CORNERS);
    for(let i = 0; i < gradientLevel; ++i) {
        ax = lerp(_axs, _axe, i/gradientLevel);
        ay = lerp(_ays, _aye, i/gradientLevel);
        bx = lerp(_bxs, _bxe, i/gradientLevel);
        by = lerp(_bys, _bye, i/gradientLevel);

        // Ceiling Triangle
        fill(120 - i * (120/gradientLevel));
        quad(ax, ay, bx, ay, _bxe, _aye, _axe, _aye);

        // Wall Triangles
        fill(80 - i * (80/gradientLevel));
        quad(ax, ay, ax, by, _axe, _bye, _axe, _aye); // Left Triangle
        quad(bx, ay, bx, by, _bxe, _bye, _bxe, _aye); // Right Triangle

        // Floor Triangle
        fill(lerpColor(color(60), color(0), i/gradientLevel));
        quad(ax, by, _axe, _bye, _bxe, _bye, bx, by);
    }

    // Back Wall
    fill(0);
    rect(_axe, _aye, _bxe, _bye);

    // Add lines
    stroke(0);
    strokeWeight(1);
    line(_axs, _ays, _axe, _aye);
    line(_bxs, _bys, _bxe, _bye);
    line(_axs, _bys, _axe, _bye);
    line(_bxs, _ays, _bxe, _aye);
}

/**
 * Draw the "You Win" Pane
 **/
function drawPlayerWinPane() {
    // Settings Background Pane
    stroke(0);
    strokeWeight(0);
    fill(0, 0, 150);
    rect(70, 90, gameDisplayBounds.bx - 70, gameDisplayBounds.by - 390);
    fill(0, 150, 200);
    rect(80, 100, gameDisplayBounds.bx - 80, gameDisplayBounds.by - 400);

    fill(0);         // Text Color
    textLeading(24); // Text Spacing
    textSize(50);
    text("You Win!", gameDisplayBounds.bx / 2, 200);
}


///////////////////////////
// Draw Helper Functions //
///////////////////////////

/**
 * Sets the necessary data to draw the canvas properly
 * 
 * Based on the available window height
 **/
function setDrawData() {
    if(windowHeight < windowWidth) {
        CVS_Y_DIM = (windowHeight < CVS_Y_DIM ? CVS_Y_DIM : windowHeight - 20);
        CVS_X_DIM = CVS_Y_DIM - 120;
    } else {
        CVS_Y_DIM = (windowWidth < CVS_Y_DIM ? CVS_Y_DIM : windowWidth - 20);
        CVS_X_DIM = CVS_Y_DIM - 120;
    }

    // Game Display Bounds
    gameDisplayBounds = new Bounds(0, 0, CVS_X_DIM, CVS_Y_DIM - FEED_HEIGHT);
    
    // Compass TL Coordinates
    COMPASS_X = (CVS_X_DIM / 2) - 20;
    COMPASS_Y = CVS_Y_DIM - 95;

    // Corridor Drawing Specs
    _CELL_LENGTH = 70;

    // Default max corridor depth: 5
    _MAX_DEPTH = 5;

    // Interaction Buttons Bounds
    btnBounds = new ctrl_base(
        new Bounds(70, CVS_Y_DIM - 60, 110, CVS_Y_DIM - 20),
        new Bounds(20, CVS_Y_DIM - 60, 60, CVS_Y_DIM - 20),
        new Bounds(120, CVS_Y_DIM - 60, 160, CVS_Y_DIM - 20),
        new Bounds(170, CVS_Y_DIM - 60, 260, CVS_Y_DIM - 20), // TODO: Create need for interaction
        new Bounds(
            CVS_X_DIM - FEED_HEIGHT + 10,
            CVS_Y_DIM - FEED_HEIGHT + 10,
            CVS_X_DIM - 10,
            CVS_Y_DIM - 10
        ),
        new Bounds(
            CVS_X_DIM - FEED_HEIGHT - 170,
            CVS_Y_DIM - FEED_HEIGHT + 10,
            CVS_X_DIM - 180,
            CVS_Y_DIM - 10
        )
    );
}

/**
 * Draw the compass points
 * 
 * @param {number} x The base `x` coordinate of the compass
 * @param {number} y The base `y` coordinate of the compass
 **/
function _drawCompassText(x, y) {
    let i = 0;

    // TOP
    text(Compass.ALLCHAR[i], x + 19, y + 5); ++i;

    // RIGHT
    text(Compass.ALLCHAR[i], x + 59, y + 43); ++i;

    // BOTTOM
    text(Compass.ALLCHAR[i], x + 19, y + 83); ++i;

    // LEFT
    text(Compass.ALLCHAR[i], x - 20, y + 43);
}

/**
 * Set the button display parameters based on
 * the interaction status of the given button
 * 
 * @param {string} keyCode The `keyCode` of the button to check
 * @param {string} btn The name of the button to check
 * @param {Bounds} boundingBox The bounding box of the button to check
 */
function _setKeyDisplayColor(keyCode, btn, boundingBox) {
    rectMode(CORNERS);

    let isMouseInBounds = _mouseInBounds(boundingBox);
    let isMousePressed = isMouseInBounds && controlData.controlMousePress[btn] && mouseIsPressed;

    if((keyIsDown(keyCode) || isMousePressed) && !controlData.controlsDisabled) {
        stroke(0);
        strokeWeight(2);
        fill(140);
    } else if (isMouseInBounds && !controlData.controlsDisabled) {
        stroke(0, 200, 255);
        strokeWeight(3);
        fill(212, 235, 242);
    } else {
        stroke(0);
        strokeWeight(1);
        fill(220);
    }
}

/**
 * Set the display parameters for the key text
 **/
function _prepKeyDisplayText() {
    rectMode(CENTER);
    stroke(0);
    strokeWeight(0);
    fill(0);
    textSize(20);
    textAlign(CENTER);
    textFont("monospace");
}

/**
 * Set the display parameters for the key help text
 **/
function _prepKeyHelpText() {
    rectMode(CENTER);
    stroke(0);
    strokeWeight(0);
    fill(0);
    textSize(34);
    textAlign(CENTER);
    textFont("monospace");
}

/**
 * Set the display parameters for the compass points
 **/
function _prepCompassText() {
    rectMode(CENTER);
    stroke(0);
    strokeWeight(0);
    fill(0);
    textSize(22);
    textAlign(CENTER);
    textFont("monospace");
}

/**
 * Check if the mouse is within the given bounding box
 * 
 * @param {Bounds} bb The bounds to check
 * 
 * @returns {boolean} Within Bounds: `true` - Otherwise: `false`
 **/
function _mouseInBounds(bb) {
    return (pmouseX >= bb.ax && pmouseX <= bb.bx &&
        pmouseY >= bb.ay && pmouseY <= bb.by);
}

/**
 * Converts a binary string to an integer
 * 
 * @param {string} bin 
 * 
 * @returns {number} The integer the binary represents
 */
function intFromBin(bin) {
    return parseInt(bin, 2);
}


///////////////////////
// Control Functions //
///////////////////////

/**
 * The main logic function for interactions,
 * based on the provided keyID and the current
 * state of the program.
 * 
 * @param {number} keyID The keyID to be used to start or finish the current event
 * 
 * @throws `Error`
 **/
function interactionLogic(keyID) {
    try {
        // Check if keyID is valid
        if(keyID === null) {
            throw new Error(`interactionLogic():\n keyID is null.`);
        } else if(typeof keyID !== "number") {
            throw new Error(`interactionLogic():\n Invalid keyID data type ${keyID}: ${typeof keyID}`);
        }

        if(!controlData.isSettingsOpen && !controlData.isRemapMode && !controlData.isMapOpen) {
            standardLogic(keyID);
        } else if(controlData.isSettingsOpen && !controlData.isRemapMode && !controlData.isMapOpen) {
            settingsLogic(keyID);
        } else if(controlData.isSettingsOpen && controlData.isRemapMode && !controlData.isMapOpen) {
            // If the user clicked settings
                // close pane, stop all functionality
            if(keyID == controlData.controlMap.settings) {
                controlData.isSettingsOpen = false;
                controlData.forceStopRemapping();
            } else {
                controlData.remapKey(keyID);
            }
        } else if(controlData.isMapOpen) {
            // If anything is pressed, close the map
            controlData.isMapOpen = false;
            frameUpdate = true;
        } else {
            let err = `interactionLogic():\n Invalid State`;
            err = `${err}\n isSettingsOpen: ${isSettingsOpen}, isRemapMode: ${isRemapMode}`;
            throw err;
        }
    } catch(err) {
        // Propogate error upstream
        throw err;
    }
}

/**
 * Determines if the player is moving,
 * changing direction, or opening settings
 * 
 * @throws `Error`
 **/
function standardLogic(keyID) {
    // Check if keyID is valid
    if(keyID === null) {
        throw new Error(`standardLogic():\n keyID is null.`);
    } else if(typeof keyID !== "number") {
        throw new Error(`standardLogic():\n Invalid keyID data type ${keyID}: ${typeof keyID}`);
    }

    try {
        if(keyID == controlData.controlMap.up) {
            mazeData.checkPlayerBounds(Compass.ALLDELTA[mazeData.compassDir]);
            if(mazeData.checkWinCondition()) {
                // Disable controls if we won
                controlData.controlsDisabled = true;
            }
        } else if(keyID == controlData.controlMap.left) {
            changeDirection(-1);
        } else if(keyID == controlData.controlMap.right) {
            changeDirection(1);
        } else if(keyID == controlData.controlMap.inter) {
            // TODO: Implement interactions
        } else if(keyID == controlData.controlMap.settings) {
            controlData.isSettingsOpen = true;
        } else if(keyID == controlData.controlMap.minimap) {
            controlData.isMapOpen = true;
            frameUpdate = true;
        }
    } catch(err) {
        // Propogate error upstream
        throw err;
    }
}

/**
 * Determines what to do while the
 * settings pane is open.
 * 
 * @throws `Error`
 **/
function settingsLogic(keyID) {
    // Check if keyID is valid
    if(keyID === null) {
        throw new Error(`settingsLogic():\n keyID is null.`);
    } else if(typeof keyID !== "number") {
        throw new Error(`settingsLogic():\n Invalid keyID data type ${keyID}: ${typeof keyID}`);
    }

    try {
        controlData.isInvalidKey = false;
        controlData.isKeyTaken = false;

        if(keyID == controlData.controlMap.up) {
            controlData.beginRemapping("up");
        } else if(keyID == controlData.controlMap.left) {
            controlData.beginRemapping("left");
        } else if(keyID == controlData.controlMap.right) {
            controlData.beginRemapping("right");
        } else if(keyID == controlData.controlMap.inter) {
            // TODO: Add interaction functionality
        } else if(keyID == controlData.controlMap.settings) {
            controlData.isSettingsOpen = false;
        }
    } catch(err) {
        // Propogate error upstream
        throw err;
    }
}

/**
 * Changes the direction the player is facing
 * 
 * @param {number} shift The direction to shift the compass
 * 
 * @throws `Error`
 **/
function changeDirection(shift) {
    // if parameter was not a number
    if (shift === null || typeof shift !== "number") {
        throw new Error(`changeDirections():\n Bad Arg(s): ${shift} of type ${typeof shift}`);
    }

    tempDir = mazeData.compassDir;

    if (shift < 0) {
        tempDir--;
        if (tempDir < 0) {
            tempDir = Compass.ALLCHAR.length - 1
        }
    } else if (shift > 0) {
        tempDir++;
        if (tempDir >= Compass.ALLCHAR.length) {
            tempDir = 0;
        }
    }

    mazeData.compassDir = tempDir;
    mazeData.playerChar = mazeData.playerCharDir[tempDir];
}

/**
 * Reset the controls to their default settings
 **/
function resetControls() {
    controlData.resetControls();
}