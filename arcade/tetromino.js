/**************************************************
**                                               **
**                  tetromino.js                 **
**           Created By: Tyler Alesse            **
**                                               **
***************************************************/

///////////////
// CONSTANTS //
///////////////

const tetroPixelSize = 6;                   // px
const tetroBrickSize = tetroPixelSize * 4;  // px


/////////////
// CLASSES //
/////////////

/**
 * 
 **/
class TetrominoColorData {
    static mainList = ["#DDD", "#FFE", "#FDF", "#FFF", "#FEC", "#FCF", "#FFF"];
    static subList = ["#239", "#090", "#C1B", "#F15", "#F30", "#91F", "#777"];
}

/**
 * The TetrominoShapeData Class is used as static storage
 * of the valid Tetromino designs and orientations
 **/
class TetrominoShapeData {
    /**
     * The Line Piece
     **/
    /*
        ▓▓▓▓

        ▓
        ▓
        ▓
        ▓
     */
    static #_line = [[[1, 1, 1, 1]], [[1],[1],[1],[1]]];


    /**
     * The Square Piece
     **/
    /*
        ▓▓
        ▓▓
     */
    static #_square = [[[1, 1], [1, 1]]];


    /**
     * The Tee (T) Piece
     **/
    /*
        ▓▓▓  ▓    ▓    ▓
         ▓   ▓▓  ▓▓▓  ▓▓
             ▓         ▓
     */
    static #_tee = [[[1, 1, 1],[0, 1, 0]], [[1, 0],[1, 1],[1, 0]], [[0, 1, 0],[1, 1, 1]], [[0, 1],[1, 1],[0, 1]]];
    

    /**
     * The Ell (L) Piece
     **/ 
    /*
        ▓▓▓  ▓▓  ▓     ▓
          ▓  ▓   ▓▓▓   ▓
             ▓        ▓▓
     */
    static #_ell = [[[1, 1, 1],[0, 0, 1]], [[1, 1],[1, 0],[1, 0]], [[1, 0, 0],[1, 1, 1]], [[0, 1],[0, 1],[1, 1]]];
    

    /**
     * The Reverse/Mirror Ell (L) Piece
     **/
    /*
        ▓▓▓  ▓     ▓  ▓▓
        ▓    ▓   ▓▓▓   ▓
             ▓▓        ▓
     */
    static #_r_ell = [[[1, 1, 1],[1, 0, 0]], [[1, 0],[1, 0],[1, 1]], [[0, 0, 1],[1, 1, 1]], [[1, 1],[0, 1],[0, 1]]];


    /**
     * The Ess (S) Piece
     **/
    /*

        ▓▓    ▓
         ▓▓  ▓▓
             ▓
    */
    static #_ess = [[[1, 1, 0],[0, 1, 1]], [[0, 1],[1, 1],[1, 0]]];


    /**
     * The Reverse/Mirror Ess (S) Piece
     **/
    /* 
         ▓▓  ▓ 
        ▓▓   ▓▓
              ▓
     */
    static #_r_ess = [[[0, 1, 1],[1, 1, 0]], [[1, 0],[1, 1],[0, 1]]];


    /**
     * The names/types/keys of all the tetrominos
     **/
    static #_keys = ["line", "square", "tee", "ell", "r_ell", "ess", "r_ess"];

    
    /////////////
    // Getters //
    /////////////

    /**
     * Get Line Piece data
     **/
    static get line() {
        return this.#_line;
    }

    /**
     * Get Square Piece data
     **/
    static get square() {
        return this.#_square;
    }

    /**
     * Get Tee (T) Piece data
     **/
    static get tee() {
        return this.#_tee;
    }

    /**
     * Get Ell (L) Piece data
     **/
    static get ell() {
        return this.#_ell;
    }

    /**
     * Get Reverse/Mirror Ell (L) Piece data
     **/
    static get r_ell() {
        return this.#_r_ell;
    }

    /**
     * Get Ess (S) Piece data
     **/
    static get ess() {
        return this.#_ess;
    }

    /**
     * Get Reverse/Mirror Ess (S) Piece data
     **/
    static get r_ess() {
        return this.#_r_ess;
    }
    
    /**
     * Get tetromino names/types/keys array
     **/
    static get keys() {
        return this.#_keys;
    }
}

/**
 * The Tetromino Class contains all the necessary information
 * for each tetromino to be used in the game
 **/
class Tetromino {

    #_type;

    #_mainColor;

    #_subColor;
    
    #_flipIndex;

    #_maxFlipIndex;

    #_movementFrames;

    #_movementSpeed;

    #_health;

    #_bounds;

    /**
     * Parameterized Constructor for Tetromino Object Class
     * 
     * @param {String} _t The type/name of the tetromino
     * @param {p5.Color} _mc The interior colour of the tetromino
     * @param {p5.Color} _sc The exterior colour of the tetromino
     * @param {Number} _fi The index of the tetromino's orientation (flip index)
     * @param {Number} _mfi The max index of the tetromino's orientation (flip index)
     * @param {Number} _ms The number of frames it takes for the tetromino to move
     * @param {Number} _h The amount of hitpoints the Tetromino has
     * @param {BoundingBox} _b The bounding box of the tetromino
     **/
    constructor(_t, _mc, _sc, _fi, _mfi, _ms, _h, _b) {
        this.#_type = _t;
        this.#_mainColor = _mc;
        this.#_subColor = _sc;
        this.#_flipIndex = _fi;
        this.#_maxFlipIndex = _mfi;
        this.#_movementFrames = 0;
        this.#_movementSpeed = _ms;
        this.#_health = _h;
        this.#_bounds = _b;
    }


    /////////////
    // Getters //
    /////////////

    get type() {
        return this.#_type;
    }

    get mainColor() {
        return this.#_mainColor;
    }

    get subColor() {
        return this.#_subColor;
    }

    get flipIndex() {
        return this.#_flipIndex;
    }

    get maxFlipIndex() {
        return this.#_maxFlipIndex;
    }

    get movementFrames() {
        return this.#_movementFrames;
    }

    get movementSpeed() {
        return this.#_movementSpeed;
    }

    get health() {
        return this.#_health;
    }

    get bounds() {
        return this.#_bounds;
    }


    /////////////
    // Setters //
    /////////////

    


    /////////////
    // Methods //
    /////////////

    damage(damageTaken) {
        this.#_health = this.#_health - damageTaken;
    }

    /**
     * Flip the orientation of the tetromino to the left
     **/
    lFlip() {
        // Increment the flip index
        this.#_flipIndex++;

        // If the flip index is larger than the max flip index
        if(this.#_flipIndex > this.#_maxFlipIndex)
            this.#_flipIndex = 0; // reset to 0 (zero)
        
        // Temporary storage of the tetromino's structure
        let tempTetroData = TetrominoShapeData[this.#_type][this.#_flipIndex];

        // New bounding box end coordinates
        let newEndX = this.#_bounds.ax + (tetroBrickSize * tempTetroData[0].length);
        let newEndY = this.#_bounds.ay + (tetroBrickSize * tempTetroData.length);

        // Set tetromino's bound to new bounding box
        this.#_bounds = new BoundingBox(this.#_bounds.ax, this.#_bounds.ay, newEndX, newEndY);
    }

    /**
     * Flip the orientation of the tetromino to the right
     **/
    rFlip() {
        // Decrement the flip index
        this.#_flipIndex--;

        // If the flip index is below zero
        if(this.#_flipIndex < 0)
            this.#_flipIndex = this.#_maxFlipIndex; // reset to max flip index
        
        // Temporary storage of the tetromino's structure
        let tempTetroData = TetrominoShapeData[this.#_type][this.#_flipIndex];

        // New bounding box end coordinates
        let newEndX = this.#_bounds.ax + (tetroBrickSize * tempTetroData[0].length);
        let newEndY = this.#_bounds.ay + (tetroBrickSize * tempTetroData.length);
        
        // Set tetromino's bound to new bounding box
        this.#_bounds = new BoundingBox(this.#_bounds.ax, this.#_bounds.ay, newEndX, newEndY);
    }

    updatePosition() {
        this.#_movementFrames++;
        if(this.#_movementFrames >= this.#_movementSpeed) {
            // Reset movement frame count
            this.#_movementFrames = 0;
            
            // Move tetromino down by size
            this.#_bounds.ay += tetroBrickSize;
            this.#_bounds.by += tetroBrickSize;
            return true;
        }

        return false;
    }

    updateFlip() {
        let rng = Math.floor(Math.random() * 800);
        if(rng === 1) {
            // For simplicities sake, we only flip to the right
            this.rFlip();
            return true;
        }

        return false;
    }
}