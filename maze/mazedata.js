/********************************************************************
 ********************************************************************
 **                                                                **
 **                          mazedata.js                           **
 **                   Created By: Tyler Alesse                     **
 **                                                                **
 **            To be used in conjunction with sketch.js            **
 **                                                                **
 ********************************************************************
 ********************************************************************/

/**
 * The MazeData class contains all the maze generation/loading
 * functionality, along with maze information
 **/
class MazeData {

    /**
     * Self explanatory
     **/
    #DEFAULT_MAZE_FILEPATH = "defaultMaze.json";

    /** 
     * The array of valid player chars
     **/
    #_playerCharDir = ["↑", "←", "↓", "→"];

    /**
     * The player's char for 2D maze draw
     **/
    #_playerChar = KeyInfo.getCharFromKeyCode("ArrowDown");

    /**
     * The player's X position in the maze
     **/
    #_playerX = -1;
    
    /**
     * The player's Y position in the maze
     **/
    #_playerY = -1;
    
    /**
     * The compass's pointing direction
     **/
    #_compassDir = Compass.INVALID;

    /**
     * The layout of the maze
     * 
     * @type {string[][]}
     **/
    #_layout = null;

    /**
     * Which tiles of the layout has the player discovered
     * 
     * @type {boolean[][]}
     **/
    #_discovered = null;

    /**
     * The dimensions of the maze
     * 
     * Maze will always be square. The length and width are equal
     **/
    #_dim = -1;

    /**
     * Has the player won?
     **/
    #_didWin = false;

    // Called when a new Maze object is created
    constructor() {
        try {
            this.#createMaze(51);
            // this.#loadDefaultMaze();

            this.#_discovered = new Array(this.#_dim);
            for(let i = 0; i < this.#_dim; ++i) {
                this.#_discovered[i] = new Array(this.#_dim);
                for(let k = 0; k < this.#_dim; ++k) {
                    this.#_discovered[i][k] = false;
                }
            }

        } catch(err) {
            console.error(err);
        }
    }

    /////////////
    // Getters //
    /////////////

    /**
     * The full layout for the maze
     * 
     * @returns {string[][]} `string[][]`
     **/
    get layout() {
        return this.#_layout;
    }

    /**
     * The tiles of the maze that the player has discovered
     * 
     * @returns {boolean[][]} `boolean[][]`
     **/
    get discovered() {
        return this.#_discovered;
    }

    /**
     * The player's X position in the maze
     **/
    get playerX() {
        return this.#_playerX;
    }

    /**
     * The player's Y position in the maze
     **/
    get playerY() {
        return this.#_playerY;
    }

    /**
     * The direction the compass is pointing
     * 
     * @example
     * 0: North
     * 1: East
     * 2: South
     * 3: West
     * 
     **/
    get compassDir() {
        return this.#_compassDir;
    }

    /**
     * Get the player's text character
     **/
    get playerChar() {
        return this.#_playerChar;
    }

    /** 
     * Get the array of valid player chars
     **/
    get playerCharDir() {
        return this.#_playerCharDir;
    }

    /**
     * Has the player won?
     **/
    get didWin() {
        return this.#_didWin;
    }

    /////////////
    // Setters //
    /////////////

    /**
     * Set the layout of the maze
     * 
     * @param {string[][]} newLay The new maze layout
     **/
    set #layout(newLay) {
        this.#_layout = newLay;
    }

    /**
     * Set the new player X position in the maze
     * 
     * @param {number} newPX New player X position in maze
     **/
    set #playerX(newPX) {
        this.#_playerX = newPX;
    }

    /**
     * Set the new player Y position in the maze
     * 
     * @param {number} newPY New player Y position in maze
     **/
    set #playerY(newPY) {
        this.#_playerY = newPY;
    }

    /**
     * Set the new compass pointing direction
     * 
     * @param {number} newDir New compass direction
     **/
    set compassDir(newDir) {
        this.#_compassDir = newDir;
    }

    /**
     * Set the player's text character for the 2D maze drawing
     * 
     * @param {string} newChar The new character
     **/
    set playerChar(newChar) {
        this.#_playerChar = newChar;
    }

    /**
     * Set the flag that the player won
     * 
     * @param {boolean} dw Win: true - Otherwise: false
     **/
    set didWin(dw) {
        this.#_didWin = dw;
    }

    /////////////
    // Methods //
    /////////////

    /**
     * Get the necessary information to display the
     * main corridor and side corridors
     * 
     * @param {Number} maxDepth The maximum depth to check
     **/
    getCorridorInfo(maxDepth) {
        let px = this.playerX;
        let py = this.playerY;
        let pd = Compass.ALLDELTA[this.compassDir];

        let left = "", center = "", right = "";

        if(pd.x != 0) {
            // player facing an x direction
            center = this.#_checkForWallsUD(px + pd.x, py, pd, maxDepth, false);
            left = this.#_checkForWallsUD(px, py + pd.x, pd, center.length, true);
            right = this.#_checkForWallsUD(px, py - pd.x, pd, center.length, true);
        } else {
            // player facing a y direction
            center = this.#_checkForWallsLR(px, py + pd.y, pd, maxDepth, false);
            left = this.#_checkForWallsLR(px - pd.y, py, pd, center.length, true);
            right = this.#_checkForWallsLR(px + pd.y, py, pd, center.length, true);
        }

        return {
            l: left,
            c: center,
            r: right
        };
    }

    /**
     * Get local layout information in an up/down (N/S) orientation
     * 
     * getCorridorInfo() helper function
     * 
     * @param {number} px The `x` position to check
     * @param {number} py The `y` position to check
     * @param {number} pd The delta to move during check
     * @param {number} maxD Maximum delta
     * @param {boolean} ignoreStop Ignore finding walls
     * 
     * @returns {string}
     */
    #_checkForWallsUD(px, py, pd, maxD, ignoreStop) {
        let cd = 0;
        let forceStop = false;
        let out = "";
        while(cd <= maxD && !forceStop) {
            if(px < 0 || px >= this.#_dim ||
                py < 0 || py >= this.#_dim) {
                // Invalid px or py position
                out = "0" + out;
                if(!ignoreStop) { forceStop = true; }
            } else if(this.layout[px][py] == "E") {
                // end of maze
                out = "2" + out;
            } else if(this.layout[px][py] == "#") {
                // Wall at coordinate
                out = "0" + out;
                if(!ignoreStop) { forceStop = true; }
            } else {
                // Wall not there
                out = "1" + out;
            }

            cd++;
            px += pd.x;
        }
        return out;
    }

    /**
     * Get local layout information in an left/right (W/E) orientation
     * 
     * getCorridorInfo() helper function
     * 
     * @param {number} px The `x` position to check
     * @param {number} py The `y` position to check
     * @param {number} pd The delta to move during check
     * @param {number} maxD Maximum delta
     * @param {boolean} ignoreStop Ignore finding walls
     * 
     * @returns {string}
     */
    #_checkForWallsLR(px, py, pd, maxD, ignoreStop) {
        let cd = 0;
        let forceStop = false;
        let out = "";
        while(cd <= maxD && !forceStop) {
            if(px < 0 || px >= this.#_dim ||
                py < 0 || py >= this.#_dim) {
                // Invalid px or py position
                out = "0" + out;
                if(!ignoreStop) { forceStop = true; }
            } else if(this.layout[px][py] == "E") {
                // end of maze
                out = "2" + out;
            } else if(this.layout[px][py] == "#") {
                // Wall at coordinate
                out = "0" + out;
                if(!ignoreStop) { forceStop = true; }
            } else {
                // Wall not there
                out = "1" + out;
            }

            cd++;
            py += pd.y;
        }
        return out;
    }

    /**
     * Get the necessary information to display the minimap
     * and update the `discovered` map
     * 
     * @returns {string[]} String array of the local layout
     */
    getMiniMapData() {
        let rowStr;
        let out = [];
        for(let x = this.playerX - 2; x <= this.playerX + 2; ++x) {
            rowStr = "";
            for(let y = this.playerY - 2; y <= this.playerY + 2; ++y) {
                if(x < 0 || x >= this.#_dim || y < 0 || y >= this.#_dim) {
                    rowStr += "X";
                    continue;
                } else if(x === this.playerX && y === this.playerY) {
                    rowStr += this.playerChar;
                } else {
                    rowStr += this.layout[x][y];
                }

                this.discovered[x][y] = true;
            }
            out.push(rowStr);
        }
        return out;
    }

    /**
     * Check if the player can move to the new location
     * 
     * @param {number} xDelta Amount of movement in the `X` direction
     * @param {number} yDelta Amount of movement in the `Y` direction
     * 
     * @throws `Error`
     */
    checkPlayerBounds(deltaArr) {

        let xDelta = deltaArr.x;
        let yDelta = deltaArr.y;

        // If new key is invalid
        if(xDelta === null || yDelta === null) {
            let foo = new Error();
            throw new Error(`MazeData::checkPlayerBounds():\n xDelta or yDelta is null: (${xDelta}, ${yDelta})`);
        } else if(typeof xDelta !== "number") {
            throw new Error(`MazeData::checkPlayerBounds():\n xDelta has an invalid value ${xDelta} of type ${typeof xDelta}.`);
        } else if(typeof yDelta !== "number") {
            throw new Error(`MazeData::checkPlayerBounds():\n yDelta has an invalid value ${yDelta} of type ${typeof yDelta}.`);
        }

        let newPX = this.playerX + xDelta;
        let newPY = this.playerY + yDelta;

        if (newPX < 0) { newPX = 0; }
        if (newPX > this.#_dim - 1) { newPX = this.#_dim - 1; }

        if (newPY < 0) { newPY = 0; }
        if (newPY > this.#_dim - 1) { newPY = this.#_dim - 1; }

        // If new player location is not a wall
        if (this.layout[newPX][newPY] !== "#") {
            this.#playerX = newPX;
            this.#playerY = newPY;
        }
    }

    /**
     * Loads the maze layout from the defaultMaze.json file
     * 
     * @throws `Error`
     **/
    #loadDefaultMaze() {
        try {
            let antiCache = new Date().getMilliseconds();
    
            // We need to verify the file exists at all
            let request = new XMLHttpRequest();
            
            //? The antiCache is used to prevent being receiving a cached version
                    //?     in case of updates not recognized by the server
            request.open('GET', `${this.#DEFAULT_MAZE_FILEPATH}?${antiCache}`, false);  // `false` makes the request synchronous
            request.send();
    
            // If the file exists
            if(request.status === 200) {
                this.#layout = JSON.parse(request.responseText);

                //? We hard code this because we do not auto-generate the maze, yet
                this.#playerX = 1; this.#playerY = 1; // 0, 2
                this.#_compassDir = 2;
                this.#_dim = 30;
            } else {
                throw new Error(`Could not load file: ${this.#DEFAULT_MAZE_FILEPATH}`);
            }
        } catch(err) {
            throw err;
        }
    }

    /**
     * Generates a new maze
     * 
     * @param {Number} dim The total dimensions of the maze, must be >60
     */
    #createMaze(dim) {
        let tempLayout = new Array();

        for(let i = 0; i < dim; ++i) {
            tempLayout.push(new Array());
            for(let k = 0; k < dim; ++k) {
                tempLayout[i].push("#");
            }
        }

        this.#_dim = dim;
        this.#_generateMaze(tempLayout);
    }

    /**
     * Generate a maze for the given 2D array
     * 
     * Uses a slightly modified "Hunt-and-Kill" Algorithm
     * 
     * @param {String[][]} baseGrid The base 2D array to be turned into a maze
     */
    #_generateMaze(baseGrid) {
        let newMaze = baseGrid;
        let currX = Math.floor(Math.random() * (newMaze.length - 1)) + 1;
        let currY = Math.floor(Math.random() * (newMaze.length - 1)) + 1;
        let dx, dy;
        let newX, newY;
        let tempX, tempY;
        let cellUnvisited = false, neighborVisited = false;
        let foundNewCell = false;
        let rng;

        (currX % 2 === 0 ? currX++ : null);
        (currY % 2 === 0 ? currY++ : null);

        while(currX !== -1 && currY !== -1) {
            // Reset flag
            cellUnvisited = false;

            // Check for unvisited neighbors
            for(let i = 0; i < Compass.ALLDELTA.length; ++i) {
                newX = currX + Compass.ALLDELTA[i].x * 2;  // new x coordinate to check
                newY = currY + Compass.ALLDELTA[i].y * 2;  // new y coordinate to check

                // If neighbor location is invalid, continue
                if(newX <= 0 || newX >= newMaze.length ||
                    newY <= 0 || newY >= newMaze.length) { continue; }
                
                // If neighbor location is unvisited, set unvisited flag to true
                if(newMaze[newY][newX] === "#") { cellUnvisited = true; break; }
            }

            // If current cell has unvisited/valid neighbors
            if(cellUnvisited) {
                // Pick a random valid direction to check
                do {
                    rng = Math.floor(Math.random() * Compass.ALLDELTA.length);
                    dx = Compass.ALLDELTA[rng].x; newX = currX + (dx * 2);
                    dy = Compass.ALLDELTA[rng].y; newY = currY + (dy * 2);
                } while(newX <= 0 || newX >= newMaze.length || newY <= 0 || newY >= newMaze.length || newMaze[newY][newX] === " ");

                newMaze[newY][newX] = " ";               // Visited new cell
                newMaze[currY + dy][currX + dx] = " ";   // Bridge path from previous cell
                currX = newX;
                currY = newY;

            } else {
                // If current cell has no unvisited/valid neighbors

                // Assume no cells available
                currX = -1; currY = -1;
                foundNewCell = false;
                neighborVisited = false;
                
                for(let i = 1; i < newMaze.length; i += 2) {
                    for(let j = 1; j < newMaze[i].length; j += 2) {

                        // If cell has already been used, move to next cell
                        if(newMaze[j][i] !== "#") { continue; }

                        // Check for unvisited neighbors
                        for(let k = 0; k < Compass.ALLDELTA.length; ++k) {
                            tempX = i + (Compass.ALLDELTA[k].x * 2);  // new x coordinate to check
                            tempY = j + (Compass.ALLDELTA[k].y * 2);  // new y coordinate to check

                            // If neighbor location is invalid, continue
                            if(tempX <= 0 || tempX >= newMaze.length ||
                                tempY <= 0 || tempY >= newMaze.length) { continue; }
                            
                            // If neighbor location is visited, set visited flag to true
                            if(newMaze[tempY][tempX] !== "#") {
                                neighborVisited = true;
                            }
                        }

                        // If no visited neighbors, check next cell
                        if(!neighborVisited) { continue; }

                        // Pick a random valid direction to check
                        do {
                            rng = Math.floor(Math.random() * Compass.ALLDELTA.length);
                            dx = Compass.ALLDELTA[rng].x; tempX = i + (dx * 2);
                            dy = Compass.ALLDELTA[rng].y; tempY = j + (dy * 2);
                        } while(tempX <= 0 || tempX >= newMaze.length || tempY <= 0 || tempY >= newMaze.length || newMaze[tempY][tempX] !== " ");

                        foundNewCell = true;            // New starting cell found
                        newMaze[j][i] = " ";            // Open new cell
                        newMaze[j + dy][i + dx] = " ";  // Bridge from found neighbor
                        currX = i; currY = j;           // Set current coordinates
                        break;                          // stop for loop
                    }

                    if(foundNewCell) { break; }
                }
            }
        }

        // Set Entrance Cell
        newMaze[1][1] = "S";

        // Set Exit Cell
        newMaze[newMaze.length - 2][newMaze.length - 2] = "E";

        // Set maze layout to new maze
        this.#_layout = newMaze;

        // Set player starting coordinates
        this.#_playerX = 1; this.#_playerY = 1;

        // Set player facing direction
        this.#_compassDir = 2;
    }

    /**
     * Checks if the player is on the winning tile in the maze
     * 
     * @returns {boolean} true if player on end tile, false otherwise
     **/
    checkWinCondition() {
        if(this.layout[this.playerX][this.playerY] === "E") {
            this.#_didWin = true;
            return true;
        } else {
            return false;
        }
    }
}