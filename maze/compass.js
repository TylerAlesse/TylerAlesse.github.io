/********************************************************************
 ********************************************************************
 **                                                                **
 **                          compass.js                            **
 **                   Created By: Tyler Alesse                     **
 **                                                                **
 **            To be used in conjunction with sketch.js            **
 **                                                                **
 ********************************************************************
 ********************************************************************/

/**
 * The `Compass` class contains the valid compass directions and
 * their values.
 * 
 * Class methods are `static` such that it can be used anywhere,
 * consistently.
 **/
class Compass {
    /**
     * All compass direction deltas
     **/
    static #_ALLDELTA = [
        {x: -1, y:  0},
        {x:  0, y:  1},
        {x:  1, y:  0},
        {x:  0, y: -1}
    ]
    

    /**
     * All Compass direction chars as an array
     **/
    static #_ALLCHAR = ["N", "E", "S", "W"];

    /////////////
    // Getters //
    /////////////

    /**
     * All compass direction deltas getter
     **/
    static get ALLDELTA() {
        return this.#_ALLDELTA;
    }

    /**
     * All Compass direction chars getter
     **/
    static get ALLCHAR() {
        return this.#_ALLCHAR;
    }
}