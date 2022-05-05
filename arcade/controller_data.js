/*******************************************************
**                                                    **
**                  controller_data.js                **
**              Created By: Tyler Alesse              **
**                                                    **
**  This file contains all of the necessary classes   **
**    that are used for the program to function.      **
**                                                    **
********************************************************/

/**
 * The ButtonStatus Class is used for consistency of
 * checking button status where applicable.
 **/
 class ButtonStatus {

    /**
     * Button is inactive
     **/
    static #_INACTIVE = 0;
    
    /**
     * Button was pressed
     **/
    static #_PRESSED = 1;
    
    /**
     * Button si being held
     **/
    static #_HELD = 2;

    /////////////
    // Getters //
    /////////////

    static get inactive() {
        return this.#_INACTIVE;
    }

    static get pressed() {
        return this.#_PRESSED;
    }

    static get held() {
        return this.#_HELD;
    }
}


/**
 * The ControllerButton class is used for determining
 * the status of a gamepad's buttons.
 **/
 class ControllerButton {
    /**
     * The gamepad api's id for the button
     **/
    #_id;

    /**
     * The name of the button
     **/
    #_name;

    /**
     * The button's status
     * 
     * `Inactive: 0`
     * `Pressed: 1`
     * `Held: 2`
     **/
    #_status;

    /**
     * Parameterized constructor for ControllerButton class
     * 
     * @param {number} _id The gamepad api's id for the button
     * @param {string} _name The name of the button
     */
    constructor(_id, _name) {
        this.#_id = _id;
        this.#_name = _name;
        this.#_status = ButtonStatus.inactive;
    }

    /////////////
    // Getters //
    /////////////

    /**
     * Getter method for button id
     **/
    get id() {
        return this.#_id;
    }

    /**
     * Getter method for button name
     **/
    get name() {
        return this.#_name;
    }

    /**
     * Getter method for button status.
     **/
    get status() {
        return this.#_status;
    }

    /////////////
    // Setters //
    /////////////

    /**
     * Setter method for button status.
     * 
     * Must use the `ButtonStatus` values
     **/
    set status(newStatus) {
        // If invalid status type
        if(newStatus === null || newStatus === undefined) { return; }
        if(typeof newStatus !== typeof 0) { return; }

        this.#_status = newStatus;
    }

    /////////////
    // Methods //
    /////////////

    /**
     * Is the button inactive?
     * 
     * @returns {boolean} `True` if inactive, `False` otherwise 
     **/
    isInactive() {
        return this.#_status === ButtonStatus.inactive;
    }

    /**
     * Is the button being pressed?
     * 
     * @returns {boolean} `True` if pressed, `False` otherwise
     **/
    isPressed() {
        return this.#_status === ButtonStatus.pressed;
    }

    /**
     * Is the button being held?
     * 
     * @returns {boolean} `True` if held, `False` otherwise
     **/
    isHeld() {
        return this.#_status === ButtonStatus.held;
    }
}


/**
 * 
 **/
 class Controller {

    #_GamepadNav = null;
    
    #_XButton;
    #_AButton;
    #_BButton;
    #_YButton;
    #_UpDPad;
    #_DownDPad;
    #_LeftDPad;
    #_RightDPad;

    #_SelectButton;
    #_StartButton;

    #_updateStatus;

    /**
     * 
     **/
    constructor(gamepadIndex) {
        this.#_GamepadNav = navigator.getGamepads()[gamepadIndex];

        this.#_XButton = new ControllerButton(0, "X");
        this.#_AButton = new ControllerButton(1, "A");
        this.#_BButton = new ControllerButton(2, "B");
        this.#_YButton = new ControllerButton(3, "Y");
        this.#_UpDPad = new ControllerButton(1, "UP");
        this.#_DownDPad = new ControllerButton(1, "DOWN");
        this.#_LeftDPad = new ControllerButton(0, "LEFT");
        this.#_RightDPad = new ControllerButton(0, "RIGHT");

        this.#_SelectButton = new ControllerButton(8, "SELECT");
        this.#_StartButton = new ControllerButton(9, "START");

        this.#_updateStatus = false;
    }

    /////////////
    // Getters //
    /////////////

    get XButton() {
        return this.#_XButton;
    }

    get AButton() {
        return this.#_AButton;
    }

    get BButton() {
        return this.#_BButton;
    }

    get YButton() {
        return this.#_YButton;
    }

    get UpDPad() {
        return this.#_UpDPad;
    }

    get DownDPad() {
        return this.#_DownDPad;
    }

    get LeftDPad() {
        return this.#_LeftDPad;
    }

    get RightDPad() {
        return this.#_RightDPad;
    }

    get updateStatus() {
        return this.#_updateStatus;
    }

    get SelectButton() {
        return this.#_SelectButton;
    }

    get StartButton() {
        return this.#_StartButton;
    }

    /////////////
    // Methods //
    /////////////

    gamepadConnected() {
        return (this.#_GamepadNav !== null && this.#_GamepadNav !== undefined);
    }

    /**
     * Set all of the buttons to an inactive state
     **/
    resetAllButtonStatus() {
        this.#_XButton.status = ButtonStatus.inactive;
        this.#_AButton.status = ButtonStatus.inactive;
        this.#_BButton.status = ButtonStatus.inactive;
        this.#_YButton.status = ButtonStatus.inactive;
        
        this.#_UpDPad.status = ButtonStatus.inactive;
        this.#_DownDPad.status = ButtonStatus.inactive;
        this.#_LeftDPad.status = ButtonStatus.inactive;
        this.#_RightDPad.status = ButtonStatus.inactive;

        this.#_SelectButton.status = ButtonStatus.inactive;
        this.#_StartButton.status = ButtonStatus.inactive;

        this.#_updateStatus = false;
    }

    /**
     * 
     * @param {*} buttonInfo 
     * @returns 
     **/
    #_getNewButtonStatus(buttonInfo) {
        if(buttonInfo.isPressed() && this.#_GamepadNav.buttons[buttonInfo.id].pressed) {
            return ButtonStatus.held;
        } else if(buttonInfo.isInactive() && this.#_GamepadNav.buttons[buttonInfo.id].pressed) {
            return ButtonStatus.pressed;
        } else if(!(this.#_GamepadNav.buttons[buttonInfo.id].pressed)) {
            return ButtonStatus.inactive;
        }

        return buttonInfo.status;
    }

    /**
     * 
     * @param {*} dpadInfo 
     * @param {*} dir 
     * @returns 
     **/
    #_getNewDirectionStatus(dpadInfo, dir) {
        if(dpadInfo.isPressed() && this.#_GamepadNav.axes[dpadInfo.id] === dir) {
            return ButtonStatus.held;
        } else if(dpadInfo.isInactive() && this.#_GamepadNav.axes[dpadInfo.id] === dir) {
            return ButtonStatus.pressed;
        } else if(!(this.#_GamepadNav.axes[dpadInfo.id] === dir)) {
            return ButtonStatus.inactive;
        }

        return dpadInfo.status;
    }

    /**
     * 
     **/
    updateGamepad() {
        this.#_updateStatus = false;

        // Need to request this again, cause chrome is dumb
        this.#_GamepadNav = navigator.getGamepads()[this.#_GamepadNav.index];

        // Check that a gamepad is connected
        if(this.#_GamepadNav === null || this.#_GamepadNav === undefined) {
            // if not, stop check
            return;

            //! may need to throw an error
            // throw new Error("updateGamepad() Error: navigator.getGamepads() is empty.");
        }

        this.#_XButton.status = this.#_getNewButtonStatus(this.#_XButton);
        this.#_AButton.status = this.#_getNewButtonStatus(this.#_AButton);
        this.#_BButton.status = this.#_getNewButtonStatus(this.#_BButton);
        this.#_YButton.status = this.#_getNewButtonStatus(this.#_YButton);

        this.#_UpDPad.status = this.#_getNewDirectionStatus(this.#_UpDPad, -1);
        this.#_DownDPad.status = this.#_getNewDirectionStatus(this.#_DownDPad, 1);
        this.#_LeftDPad.status = this.#_getNewDirectionStatus(this.#_LeftDPad, -1);
        this.#_RightDPad.status = this.#_getNewDirectionStatus(this.#_RightDPad, 1);

        this.#_SelectButton.status = this.#_getNewButtonStatus(this.#_SelectButton);
        this.#_StartButton.status = this.#_getNewButtonStatus(this.#_StartButton);
        
        if(!(this.#_XButton.isInactive())) { this.#_updateStatus = true; }
        else if(!(this.#_AButton.isInactive())) { this.#_updateStatus = true; }
        else if(!(this.#_BButton.isInactive())) { this.#_updateStatus = true; }
        else if(!(this.#_YButton.isInactive())) { this.#_updateStatus = true; }
        else if(!(this.#_UpDPad.isInactive())) { this.#_updateStatus = true; }
        else if(!(this.#_DownDPad.isInactive())) { this.#_updateStatus = true; }
        else if(!(this.#_SelectButton.isInactive())) { this.#_updateStatus = true; }
        else if(!(this.#_StartButton.isInactive())) { this.#_updateStatus = true; }
    }
}