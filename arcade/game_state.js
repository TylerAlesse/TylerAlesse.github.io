/*************************************************
**                                              **
**                 game_state.js                **
**           Created By: Tyler Alesse           **
**                                              **
**************************************************/

/**
 * 
 **/
class GameStateIDs {
    static #_invalid            = -1;

    static #_blank              =  0;
    static #_title              =  1;
    static #_controlScreen      =  2;
    static #_controlScreenAlt   =  3;
    static #_startScreen        =  4;
    static #_menuScreen         =  5;
    static #_playerMenu         =  6;
    static #_gameplay           =  7;

    static #_gameOver           = 20;
    static #_gameStats          = 21;

    /////////////
    // Getters //
    /////////////

    static get invalid()            { return this.#_invalid;            }

    static get blank()              { return this.#_blank;              }
    static get title()              { return this.#_title;              }
    static get controlScreen()      { return this.#_controlScreen;      }
    static get controlScreenAlt()   { return this.#_controlScreenAlt;   }
    static get startScreen()        { return this.#_startScreen;        }
    static get menuScreen()         { return this.#_menuScreen;         }
    static get playerMenu()         { return this.#_playerMenu;         }
    static get gameplay()           { return this.#_gameplay;           }

    static get gameOver()           { return this.#_gameOver;           }
    static get gameStats()          { return this.#_gameStats;          }
}

/**
 * 
 **/
class GameStateFrameData {
    /**
     * 
     **/
    #_frameCount;

    /**
     * 
     **/
    #_maxFrameCount;

    /**
     * 
     **/
    constructor(_mfc = -1) {
        this.#_frameCount = 0;
        this.#_maxFrameCount = _mfc;
    }

    /////////////
    // Methods //
    /////////////

    /**
     * 
     **/
    update() {
        this.#_frameCount += 1;
    }

    /**
     * Compares the frameCount and maxFrameCount attributes
     * 
     * @returns {boolean} `True` if `FC > MFC`, `False` otherwise
     */
    compareFrameCounts() {
        return this.#_frameCount >= this.#_maxFrameCount;
    }
}

/**
 * 
 **/
class GameState {
    /**
     * 
     **/
    #_stateID;

    /**
     * 
     **/
    #_stateFrameData;

    /**
     * 
     **/
    #_ended;

    /**
     * 
     **/
    constructor(_sid, _sfd) {
        this.#_stateID = _sid;
        this.#_stateFrameData = _sfd;
        this.#_ended = false;
    }

    /////////////
    // Getters //
    /////////////

    /**
     * 
     **/
    get stateID() {
        return this.#_stateID;
    }

    /////////////
    // Methods //
    /////////////

    /**
     * Has the GameState ended?
     * 
     * @returns {boolean} `True` if the GameState is complete, `False` otherwise
     **/
    hasEnded() {
        return this.#_ended;
    }

    /**
     * Updates the GameState's FrameData,
     * and sets the ended flag to `true` if it has ended
     **/
    update() {
        this.#_stateFrameData.update();
        if(this.#_stateFrameData.compareFrameCounts()) {
            this.#_ended = true;
        }
    }
}