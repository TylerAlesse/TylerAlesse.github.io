/********************************************************************
 ********************************************************************
 **                                                                **
 **                          keyinfo.js                            **
 **                   Created By: Tyler Alesse                     **
 **                                                                **
 **            To be used in conjunction with sketch.js            **
 **                                                                **
 ********************************************************************
 ********************************************************************/

/**
 * The `KeyInfo` class contains the valid mappings of keys
 * and methods to convert between `keyID`s, `keyCode`s, and `keyChar`s.
 * 
 * Class methods are static such that it can be used anywhere.
 **/
class KeyInfo {
    /**
     * @constructor
     * Empty constructor for the pseudo-static class KeyInfo
     **/
    constructor() {}

    /**
     * A dictionary with `keyCode`-`keyChar` (`string`-`string`) pairings [private]
     * 
     * @type {{string: string}, ... }
     * @constant @readonly
     **/
    static #KEY_CHAR = {
        Digit1: "1", Digit2: "2", Digit3: "3", Digit4: "4", Digit5: "5", Digit6: "6", Digit7: "7", Digit8: "8", Digit9: "9", Digit0: "0",
        KeyQ: "Q", KeyW: "W", KeyE: "E", KeyR: "R", KeyT: "T", KeyY: "Y", KeyU: "U", KeyI: "I", KeyO: "O", KeyP: "P",
        KeyA: "A", KeyS: "S", KeyD: "D", KeyF: "F", KeyG: "G", KeyH: "H", KeyJ: "J", KeyK: "K", KeyL: "L",
        KeyZ: "Z", KeyX: "X", KeyC: "C", KeyV: "V", KeyB: "B", KeyN: "N", KeyM: "M",
        Space: "Space", ArrowUp: "↑", ArrowLeft: "←", ArrowDown: "↓", ArrowRight: "→", NULL: ""
    };
    
    /**
     * A dictionary with `keyCode`-`keyID` (`string`-`number`) pairings
     * 
     * @type {{string: number}, ... }
     * @constant @readonly
     **/
    static #KEY_ID = {
        Digit1: 49, Digit2: 50, Digit3: 51, Digit4: 52, Digit5: 53, Digit6: 54, Digit7: 55, Digit8: 56, Digit9: 57, Digit0: 48,
        KeyQ: 81, KeyW: 87, KeyE: 69, KeyR: 82, KeyT: 84, KeyY: 89, KeyU: 85, KeyI: 73, KeyO: 79, KeyP: 80,
        KeyA: 65, KeyS: 83, KeyD: 68, KeyF: 70, KeyG: 71, KeyH: 72, KeyJ: 74, KeyK: 75, KeyL: 76,
        KeyZ: 90, KeyX: 88, KeyC: 67, KeyV: 86, KeyB: 66, KeyN: 78, KeyM: 77,
        Space: 32, ArrowUp: 38, ArrowLeft: 37, ArrowDown: 40, ArrowRight: 39, NULL: 0
    };
    
    /**
     * An array of the valid `keyCode`s
     *
     * @type {string[]}
     * @constant @readonly
     **/
    static #_KEY_CODE = Object.keys(this.#KEY_ID);

    /////////////
    // Getters //
    /////////////

    /**
     * @returns {string[]} `string[]`
     **/
    static get KEY_CODE() {
        return this.#_KEY_CODE;
    }

    /////////////
    // Methods //
    /////////////

    /**
     * Get the `keyChar` associated with a `keyCode`
     * 
     * @param {string} keyCode The wanted `keyCode` value from the `#KEY_CHAR` dictionary
     * 
     * @example let foo = KeyInfo.getCharFromKeyCode("KeyA"); // "A"
     * 
     * @returns {string|undefined} Found: `string` - Otherwise: `undefined`
     **/
    static getCharFromKeyCode(keyCode) {
        return this.#KEY_CHAR[keyCode];
    }

   /**
     * Get the `keyID` from the associates `keyCode`
     * 
     * @param {string} keyCode The wanted `keyCode` value from the `#KEY_CHAR` dictionary
     * 
     * @example let foo = KeyInfo.getIDFromKeyCode("KeyA"); // 65
     * 
     * @returns {number|undefined} Found: `number` - Otherwise: `undefined`
     **/
    static getIDFromKeyCode(keyCode) {
        return this.#KEY_ID[keyCode];
    }
   
   /**
     * Get the associated `keyChar` from a given `keyID`
     * 
     * @param {number} keyID The `keyID` of some `keyCode` in the `#KEY_CHAR` dictionary
     * 
     * @example let foo = KeyInfo.getKeyCharByKeyID(65); // "A"
     * 
     * @returns {string|undefined} Found: `string` - Otherwise: `undefined`
     **/
    static getKeyCharByKeyID(keyID) {
        let keyCode = this.getKeyCodeByKeyID(keyID);
        if(keyCode === undefined) { return undefined; }

        return this.#KEY_CHAR[keyCode];
    }

   /**
     * Get the associated `keyCode` from a given `keyID`
     * 
     * @param {number} keyID The `keyID` of some `keyCode` in the `#KEY_CHAR` dictionary
     * 
     * @example let foo = KeyInfo.getKeyCharByKeyID(65); // "KeyA"
     * 
     * @returns {string|undefined} Found: `string` - Otherwise: `undefined`
     **/
    static getKeyCodeByKeyID(keyID) {
        for(let i = 0; i < this.#_KEY_CODE.length; ++i) {
            if(this.#KEY_ID[this.#_KEY_CODE[i]] === keyID) {
                return this.#_KEY_CODE[i];
            }
        }

        return undefined;
    }
}