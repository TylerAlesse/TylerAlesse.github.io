/********************************************************************
 ********************************************************************
 **                                                                **
 **                        controldata.js                          **
 **                   Created By: Tyler Alesse                     **
 **                                                                **
 **            To be used in conjunction with sketch.js            **
 **                                                                **
 ********************************************************************
 ********************************************************************/

/**
 * The `ctrl_base` class is used for consistency of similarly
 * structured variables within the `ControlData` class
 **/
class ctrl_base {

    /**
     * @constructor
     * 
     * @param {any} _up (ctrl_base).up
     * @param {any} _left (ctrl_base).left
     * @param {any} _right (ctrl_base).right
     * @param {any} _inter (ctrl_base).inter
     * @param {any} _settings (ctrl_base).settings
     **/
    constructor(_up, _left, _right, _inter, _settings, _minimap) {
        this.up = _up;
        this.left = _left;
        this.right = _right;
        this.inter = _inter;
        this.settings = _settings;
        this.minimap = _minimap;
    }

    /**
     * The keys of the `ctrl_base` object-class
     **/
    static #_KEYS = Object.keys(new ctrl_base());

    /**
     * @returns {string[]} `string[]`
     **/
    static get KEYS() {
        return this.#_KEYS;
    }
}

/**
 * The `ControlData` class contains all of the control data and methods.
 **/
class ControlData {
    /**
     * A `ctrl_base` object of the `keyID`s used for the controls
     **/
    #_controlMap = new ctrl_base(
        KeyInfo.getIDFromKeyCode("KeyW"),
        KeyInfo.getIDFromKeyCode("KeyA"),
        KeyInfo.getIDFromKeyCode("KeyD"),
        KeyInfo.getIDFromKeyCode("Space"),
        KeyInfo.getIDFromKeyCode("NULL"),
        KeyInfo.getIDFromKeyCode("KeyM")
    );

    /**
     * A `ctrl_base` object of the `keyChar`s used for the controls
     **/
    #_controlChar = new ctrl_base (
        KeyInfo.getCharFromKeyCode("KeyW"),
        KeyInfo.getCharFromKeyCode("KeyA"),
        KeyInfo.getCharFromKeyCode("KeyD"),
        KeyInfo.getCharFromKeyCode("Space"),
        KeyInfo.getCharFromKeyCode("NULL"),
        KeyInfo.getCharFromKeyCode("KeyM")
    );

    /**
     * A `ctrl_base` object used to determine if a button is being pressed
     **/
    #_controlMousePress = new ctrl_base(false, false, false, false, false, false);

    /**
     * Is the settings pane open
     * 
     * @type {boolean}
     **/
    #_isSettingsOpen = false;

    /**
     * Is the "fullscreen" map open
     **/
    #_isMapOpen = false;

    /**
     * Is the remapping functionality active
     * 
     * @type {boolean}
     **/
    #_isRemapMode = false;

    /**
     * The selected key to be remapped
     * 
     * @type {string}
     **/
    #_selectedKey = null;

    /**
     * Is the key the user wanted to remap to invalid?
     **/
    #_isInvalidKey = false;

    /**
     * Is the key the user wanted to remap to already in use?
     **/
    #_isKeyTaken = false;

    /**
     * Are the controls disabled
     * 
     * @type {Boolean}
     **/
    #_controlsDisabled = false;

    /**
     * @constructor
     **/
    constructor() {
        if(!(this.#loadControlData())) {
            let out = "No control data in local storage.\n ";
            out = out + "Using default control settings...";

            console.warn(out);
        }
    }

    /////////////
    // Getters //
    /////////////

    /**
     * Get method for `controlMap` property
     **/
    get controlMap() {
        return this.#_controlMap;
    }

    /**
     * Get method for `controlChar` property
     **/
    get controlChar() {
        return this.#_controlChar;
    }

    /**
     * Get method for `controlMousePress` property
     **/
    get controlMousePress() {
        return this.#_controlMousePress;
    }

    /**
     * Get method for `isSettingsOpen` property
     **/
    get isSettingsOpen() {
        return this.#_isSettingsOpen;
    }

    /**
     * Get method for `isMapOpen` property
     **/
    get isMapOpen() {
        return this.#_isMapOpen;
    }

    /**
     * Get method for `controlsDisabled` property
     **/
    get controlsDisabled() {
        return this.#_controlsDisabled;
    }

    /**
     * Get method for `isRemapMode` property
     **/
    get isRemapMode() {
        return this.#_isRemapMode;
    }

    /**
     * Get method for `isInvalidKey` property
     **/
    get isInvalidKey() {
        return this.#_isInvalidKey;
    }

    /**
     * Get method for `isKeyTaken` property
     **/
    get isKeyTaken() {
        return this.#_isKeyTaken;
    }

    /////////////
    // Setters //
    /////////////

    /**
     * Set method for the `isSettingsOpen` property
     **/
    set isSettingsOpen(iso) {
        this.#_isSettingsOpen = iso;
    }

    /**
     * Set method for the `isMapOpen` property
     **/
    set isMapOpen(imo) {
        this.#_isMapOpen = imo;
    }

    /**
     * Set method for the `isInvalidKey` property
     **/
    set isInvalidKey(iik) {
        this.#_isInvalidKey = iik;
    }

    /**
     * Set method for the `isKeyTaken` property
     **/
    set isKeyTaken(ikt) {
        this.#_isKeyTaken = ikt;
    }

    /**
     * Set method for the `controlsDisabled` property
     * 
     * @throws `Error`
     **/
    set controlsDisabled(isDisabled) {
        // Check if cd is valid
        if(isDisabled === null) {
            throw new Error(`ControlData::controlsDisabled():\n isDisabled is null.`);
        } else if(typeof isDisabled !== "boolean") {
            throw new Error(`ControlData::controlsDisabled():\n Invalid isDisabled data type ${isDisabled}: ${typeof isDisabled}`);
        }

        this.#_controlsDisabled = isDisabled;
    }

    ////////////////////
    // Pseudo-setters //
    ////////////////////

    /**
     * Sets the given `controlMap` name to the given value
     * 
     * @param {string} key The name of the `controlMap` to modify
     * @param {number} value The new value for the `controlMap[key]`
     * 
     * @throws `Error`
     **/
    setControlMap(key, value) {
        // Check if key is valid
        if(key === null) {
            throw new Error(`ControlData::setControlMap():\n key is null.`);
        } else if(typeof key !== "string") {
            throw new Error(`ControlData::setControlMap():\n Invalid key data type ${key}: ${typeof key}`);
        } else if(ctrl_base.KEYS.indexOf(key) === -1) {
            throw new Error(`ControlData::setControlMap():\n Key does not exist: ${key}`);
        }

        // Check if new value is valid
        if(value === null) {
            throw new Error(`ControlData::setControlMap():\n new key value is null.`);
        } else if(typeof value !== "number") {
            throw new Error(`ControlData::setControlMap():\n Invalid new key value data type ${value}: ${typeof value}`);
        }

        this.#_controlMap[key] = value;
        return true;
    }

    /**
     * Sets the given `controlChar` name to the given value
     * 
     * @param {string} key The name of the `controlChar` to modify
     * @param {string} value The new value for `controlChar[key]`
     * 
     * @throws `Error`
     **/
    setControlChar(key, value) {
        // Check if key is valid
        if(key === null) {
            throw new Error(`ControlData::setcontrolChar():\n key is null.`);
        } else if(typeof key !== "string") {
            throw new Error(`ControlData::setcontrolChar():\n Invalid key data type ${key}: ${typeof key}`);
        } else if(ctrl_base.KEYS.indexOf(key) === -1) {
            throw new Error(`ControlData::setcontrolChar():\n Key does not exist: ${key}`);
        }

        // Check if new value is valid
        if(value === null) {
            throw new Error(`ControlData::setcontrolChar():\n new key value is null.`);
        } else if(typeof value !== "string") {
            throw new Error(`ControlData::setcontrolChar():\n Invalid new key value data type ${value}: ${typeof value}`);
        }

        this.#_controlChar[key] = value;
    }

    /**
     * Sets the given `controlMousePress` key to the given value
     * 
     * @param {string} key The name of the `controlMousePress` to modify
     * @param {boolean} value The new value for `controlMousePress[key]`
     * 
     * @throws `Error`
     * */
    setControlMousePress(key, value) {
        // Check if key is valid
        if(key === null) {
            throw new Error(`ControlData::setControlMap():\n key is null.`);
        } else if(typeof key !== "string") {
            throw new Error(`ControlData::setControlMap():\n Invalid key data type ${key}: ${typeof key}`);
        } else if(ctrl_base.KEYS.indexOf(key) === -1) {
            throw new Error(`ControlData::setControlMap():\n Key does not exist: ${key}`);
        }

        // Check if new value is valid
        if(value === null) {
            throw new Error(`ControlData::setcontrolChar():\n new key value is null.`);
        } else if(typeof value !== "boolean") {
            throw new Error(`ControlData::setcontrolChar():\n Invalid new key value data type ${value}: ${typeof value}`);
        }

        this.#_controlMousePress[key] = value;
    }


    ///////////////////
    // Logic Methods //
    ///////////////////

    /**
     * Begins the key-button remapping functionality.
     * 
     * @throws `Error`
     **/
    beginRemapping(keyToRemap) {
        // Check if keyToRemap is valid
        if(keyToRemap === null) {
            throw new Error(`ControlData::beginRemapping():\n keyToRemap is null.`);
        } else if(typeof keyToRemap !== "string") {
            throw new Error(`ControlData::beginRemapping():\n Invalid keyToRemap data type ${keyToRemap}: ${typeof keyToRemap}`);
        } else if(ctrl_base.KEYS.indexOf(keyToRemap) === -1) {
            throw new Error(`ControlData::beginRemapping():\n keyToRemap does not exist: ${keyToRemap}`);
        }
    
        this.#_selectedKey = keyToRemap;
        this.#_isRemapMode = true;
    }
    
    /**
     * Ends the key-button remapping functionality.
     * 
     * @param {number} newKey The new keyID for the 
     * 
     * @throws `Error`
     **/
    remapKey(newKey) {
        // If new key is invalid
        if(newKey === null) {
            this.#_selectedKey = null;
            this.#_isRemapMode = false;

            throw new Error(`ControlData::remapKey():\n newKey is null.`);
        } else if(typeof newKey !== "number" || newKey <= 0) {
            this.#_selectedKey = null;
            this.#_isRemapMode = false;

            throw new Error(`ControlData::remapKey():\n newKey has an invalid value ${newKey} of type ${typeof newKey}.`);
        }

        let newCode = KeyInfo.getKeyCodeByKeyID(newKey);
    
        // If new code is invalid
        if(newCode === null || newCode === undefined) {
            this.#_selectedKey = null;
            this.#_isRemapMode = false;
            
            // Provide user feedback that newCode was bad
            this.#_isInvalidKey = true;
            return; // end function

            //? Instead of throwing an error, we provide user feedback 
            // throw new Error(`ControlData::remapKey():\n Invalid newCode: ${newCode}`);
        }

        // If newKey is taken by an existing control
        for(let i = 0; i < ctrl_base.KEYS.length; ++i) {
            if(this.#_controlMap[ctrl_base.KEYS[i]] == newKey) {
                this.#_selectedKey = null;
                this.#_isRemapMode = false;
                this.#_isKeyTaken = true;
                return; // end function
            }
        }
    
        this.#_controlMap[this.#_selectedKey] = KeyInfo.getIDFromKeyCode(newCode);
        this.#_controlChar[this.#_selectedKey] = KeyInfo.getCharFromKeyCode(newCode);
        this.saveControlData();

        this.#_selectedKey = null;
        this.#_isRemapMode = false;
    }
    
    /**
     * Stops all mouse-button interaction functionality
     **/
    releaseAllButtons() {
        let CKL = ctrl_base.KEYS.length;

        for(let i = 0; i < CKL; ++i) {
            this.setControlMousePress(ctrl_base.KEYS[i], false);
        }
    }

    /**
     * Stop all remapping functionality
     **/
    forceStopRemapping() {
        this.#_selectedKey = null;
        this.#_isRemapMode = false;
        this.#_isKeyTaken = false;
        this.#_isInvalidKey = false;
    }
    
    /**
     * Save the controlMap and controlChar objects in local storage
     **/
    saveControlData() {
        localStorage.setItem('controlMap', JSON.stringify(this.controlMap));
        localStorage.setItem('controlChar', JSON.stringify(this.controlChar));
    }
    
    /**
     * Load controlMap and controlChar objects from local storage
     * 
     * @returns {boolean} Success: `true` - Failure: `false`
     **/
    #loadControlData() {
        try {
            let tCM = localStorage.getItem('controlMap');
            let tCC = localStorage.getItem('controlChar');

            let parseCM = JSON.parse(tCM);
            let parseCC = JSON.parse(tCC);

            // If saved map exists, load it
                // otherwise continue with default
            if(parseCM !== null && typeof parseCM === "object" &&
               parseCC !== null && typeof parseCC === "object"    ) {

                this.#_controlMap = parseCM;
                this.#_controlChar = parseCC;

                return true; // load success
            }
        } catch(err) {
            localStorage.clear(); // clear localStorage
            return false;         // load failed
        }
        
        return false; // load failed
    }

    /**
     * Reset controlMap and controlChar to their
     * default values
     */
    resetControls() {
        this.#_controlMap = new ctrl_base(
            KeyInfo.getIDFromKeyCode("KeyW"),
            KeyInfo.getIDFromKeyCode("KeyA"),
            KeyInfo.getIDFromKeyCode("KeyD"),
            KeyInfo.getIDFromKeyCode("Space"),
            KeyInfo.getIDFromKeyCode("NULL"),
            KeyInfo.getIDFromKeyCode("KeyM")
        );

        this.#_controlChar = new ctrl_base (
            KeyInfo.getCharFromKeyCode("KeyW"),
            KeyInfo.getCharFromKeyCode("KeyA"),
            KeyInfo.getCharFromKeyCode("KeyD"),
            KeyInfo.getCharFromKeyCode("Space"),
            KeyInfo.getCharFromKeyCode("NULL"),
            KeyInfo.getCharFromKeyCode("KeyM")
        );

        this.saveControlData();
    }
}