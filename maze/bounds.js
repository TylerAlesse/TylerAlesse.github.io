/********************************************************************
 ********************************************************************
 **                                                                **
 **                           bounds.js                            **
 **                   Created By: Tyler Alesse                     **
 **                                                                **
 **            To be used in conjunction with sketch.js            **
 **                                                                **
 ********************************************************************
 ********************************************************************/

 /**
 * The `Bounds` class is used to facilitate consistency
 * of storage of two important "points". `a` and `b`,
 * and their (`x`, `y`) coordinates.
 **/
 class Bounds {
    #_ax;
    #_ay;
    #_bx;
    #_by;

    /**
     * @constructor
     * 
     * @param {number} ax `a`'s  `x` position
     * @param {number} ay `a`'s  `y` position
     * @param {number} bx `b`'s  `x` position
     * @param {number} by `b`'s  `y` position
     **/
    constructor(ax, ay, bx, by) {
        this.#_ax = ax;
        this.#_ay = ay;
        this.#_bx = bx;
        this.#_by = by;
    }

    get ax() {
        return this.#_ax;
    }

    get ay() {
        return this.#_ay;
    }

    get bx() {
        return this.#_bx;
    }

    get by() {
        return this.#_by;
    }
}