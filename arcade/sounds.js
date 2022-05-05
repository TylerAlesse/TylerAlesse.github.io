/************************************************
**                                             **
**                   sounds.js                 **
**           Created By: Tyler Alesse          **
**                                             **
*************************************************/

/**
 * The Sounds Class is used for storage of
 * sound files loaded using the p5.Sound library
 **/
class Sounds {
    ////////////////
    // Properties //
    ////////////////

    /**
     * Is the game muted?
     **/
    #_mute = false;

    /**
     * The sound of the pew
     **/
    #_pew;

    /**
     * The sound of the laser
     **/
     #_laser;

    /**
     * The sound of a tetromino flipping to a different orientation
     **/
    #_tetroFlip;

    /**
     * The sound of a tetromino being cleared (the tetris line clear sound)
     **/
    #_tetroClear;

    /**
     * The sound of an invader dying
     **/
    #_invaderDeath;

    /**
     * The sound of the ship exploding
     **/
    #_explode;

    /**
     * The sound of a credit being added to the machine
     **/
    #_creditAdded;

    /**
     * The highscore music loop
     **/
    #_highscoreMusic;

    /**
     * The boop sound of an invader moving (First Boop)
     **/
    #_boop1;

    /**
     * The boop sound of an invader moving (Second Boop)
     **/
    #_boop2;

    /**
     * The boop sound of an invader moving (Third Boop)
     **/
    #_boop3;

    /**
     * The boop sound of an invader moving (Fourth Boop)
     **/
    #_boop4;
    

    /**
     * Empty constructor
     **/
    constructor() {}


    /////////////
    // Getters //
    /////////////

    /**
     * Get the mute property
     * 
     * @returns {boolean} Should sounds be muted?
     **/
    get mute() {
        return this.#_mute;
    }

    /**
     * Get the pew property
     * 
     * @returns {p5.SoundFile} The pew sound file
     **/
    get pew() {
        return this.#_pew;
    }

    /**
     * Get the laser property
     * 
     * @returns {p5.SoundFile} The laser sound file to store
     **/
    get laser() {
        return this.#_laser;
    }

    /**
     * Get the tetroFlip property
     * 
     * @returns {p5.SoundFile} The tetromino flip sound file
     **/
    get tetroFlip() {
        return this.#_tetroFlip;
    }

    /**
     * Get the tetroClear property
     * 
     * @returns {p5.SoundFile} The tetromino clear sound file
     **/
    get tetroClear() {
        return this.#_tetroClear;
    }

    /**
     * Get the invaderDeath property
     * 
     * @returns {p5.SoundFile} The invader death sound file 
     **/
    get invaderDeath() {
        return this.#_invaderDeath;
    }

    /**
     * Get the explode property
     * 
     * @returns {p5.SoundFile} The explode sound file
     **/
    get explode() {
        return this.#_explode;
    }

    /**
     * Get the creditAdded property
     * 
     * @returns {p5.SoundFile} The credit added sound file
     **/
    get creditAdded() {
        return this.#_creditAdded;
    }

    /**
     * Get the highscoreMusic property
     * 
     * @returns {p5.SoundFile} The highscore music sound file
     **/
    get highscoreMusic() {
        return this.#_highscoreMusic;
    }

    /**
     * Get the boop1 property
     **/
    get boop1() {
        return this.#_boop1;
    }

    /**
     * Get the boop2 property
     **/
    get boop2() {
        return this.#_boop2;
    }

    /**
     * Get the boop3 property
     **/
    get boop3() {
        return this.#_boop3;
    }

    /**
     * Get the boop4 property
     **/
    get boop4() {
        return this.#_boop4;
    }

    
    /////////////
    // Setters //
    /////////////

    /**
     * Set the mute property of Sounds object
     * 
     * @param {boolean} _m Is the sound muted?
     **/
    set mute(_m) {
        this.#_mute = _m;
    }

    /**
     * Set the pew property
     * 
     * @param {p5.SoundFile} _p The pew sound file to store
     **/
    set pew(_p) {
        this.#_pew = _p;
    }

    /**
     * Set the laser property
     * 
     * @param {p5.SoundFile} _l The laser sound file to store
     **/
    set laser(_l) {
        this.#_laser = _l;
    }

    /**
     * Set the tetroFlip property
     * 
     * @param {p5.SoundFile} _tf The tetromino flip sound file to store
     **/
    set tetroFlip(_tf) {
        this.#_tetroFlip = _tf;
    }

    /**
     * Set the tetroClear property
     * 
     * @param {p5.SoundFile} _tc The tetromino clear sound file to store
     **/
    set tetroClear(_tc) {
        this.#_tetroClear = _tc;
    }

    /**
     * Get the invaderDeath property
     * 
     * @param {p5.SoundFile} _id The invader death sound file 
     **/
    set invaderDeath(_id) {
        this.#_invaderDeath = _id;
    }

    /**
     * Set the explode property
     * 
     * @param {p5.SoundFile} _e The explosion sound file to store
     **/
    set explode(_e) {
        this.#_explode = _e;
    }

    /**
     * Set the creditAdded property
     * 
     * @param {p5.SoundFile} _ca The credit added sound file to store
     **/
    set creditAdded(_ca) {
        this.#_creditAdded = _ca;
    }

    /**
     * Set the highscoreMusic property
     * 
     * @param {p5.SoundFile} _hsm The highscore music sound file to store
     **/
    set highscoreMusic(_hsm) {
        this.#_highscoreMusic = _hsm;
    }

    /**
     * Set the boop1 property
     * 
     * @param {p5.SoundFile} _b The boop sound file to store
     **/
    set boop1(_b) {
        this.#_boop1 = _b;
    }

    /**
     * Set the boop2 property
     * 
     * @param {p5.SoundFile} _b The boop sound file to store
     **/
    set boop2(_b) {
        this.#_boop2 = _b;
    }

    /**
     * Set the boop3 property
     * 
     * @param {p5.SoundFile} _b The boop sound file to store
     **/
    set boop3(_b) {
        this.#_boop3 = _b;
    }

    /**
     * Set the boop4 property
     * 
     * @param {p5.SoundFile} _b The boop sound file to store
     **/
    set boop4(_b) {
        this.#_boop4 = _b;
    }
}