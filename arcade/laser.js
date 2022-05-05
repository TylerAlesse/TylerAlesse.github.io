/************************************************
**                                             **
**                   laser.js                  **
**           Created By: Tyler Alesse          **
**                                             **
*************************************************/

/**
 * 
 **/
class Laser extends Projectile {
    
    /**
     * The number of frames the laser has been on screen
     **/
    #_frameCount;

    /**
     * The number of frames the laser can be on screen
     **/
    #_maxFrameCount;

    /**
     * Parameterized Constructor
     * 
     * @param {BoundingBox} sb The starting bounding box of the laser
     * @param {Number} sp The starting pierce value of the laser
     * @param {Number} maxfc The number of frames the laser stays on screen
     **/
    constructor(sb, maxfc) {
        super(sb, 0, 0, 0, 0);
        this._id = 1;
        this.#_frameCount = 0;
        this.#_maxFrameCount = maxfc;
    }

    /////////////
    // Getters //
    /////////////

    /**
     * Getter method for the frame count attribute
     **/
    get frameCount() {
        return this.#_frameCount;
    }

    /**
     * Getter method for the max frame count attributek
     **/
    get maxFrameCount() {
        return this.#_maxFrameCount;
    }

    /////////////
    // Setters //
    /////////////

    /**
     * Setter method for the frame count attribute
     **/
    set frameCount(newFC) {
        this.#_frameCount = newFC;
    }
}