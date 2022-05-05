/************************************************
**                                             **
**                    pew.js                   **
**           Created By: Tyler Alesse          **
**                                             **
*************************************************/

/**
 * 
 **/
class Pew extends Projectile {

    static #_pewDim = 5;
    static #_pewSpeed = 10;

    /**
     * Parameterized Constructor
     * 
     * @param {BoundingBox} sb The starting bounding box of the pew
     * @param {Number} sxy The starting x velocity of the pew
     * @param {Number} svy The starting y velocity of the pew
     * @param {Number} d The damage value of the pew
     * @param {Number} sp The starting pierce value of the pew
     **/
    constructor(sb, svx, svy, d, sp) {
        super(sb, svx, svy, d, sp);
        this._id = 0;
    }

    
    /////////////
    // Getters //
    /////////////

    static get pewDim() {
        return this.#_pewDim;
    }

    static get pewSpeed() {
        return this.#_pewSpeed;
    }
    
    /////////////
    // Setters //
    /////////////


}