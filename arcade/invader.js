/**************************************************
**                                               **
**                   invader.js                  **
**           Created By: Tyler Alesse            **
**                                               **
***************************************************/


/**
 * 
 **/
class InvaderProjectile {
    #_animationFrames;
    #_currentAnimationFrame;
    #_bounds;
    #_vy;

    constructor(af, caf, b, svy) {
        this.#_animationFrames = af;
        this.#_currentAnimationFrame = caf;
        this.#_bounds = b;
        this.#_vy = svy;
    }


    /////////////
    // Getters //
    /////////////

    get animationFrames() {
        return this.#_animationFrames;
    }

    get currentAnimationFrame() {
        return this.#_currentAnimationFrame;
    }

    get bounds() {
        return this.#_bounds;
    }


    /////////////
    // Methods //
    /////////////

    updatePosition() {
        this.#_bounds.ay += this.#_vy;
        this.#_bounds.by += this.#_vy;
    }

    updateAnimation() {
        this.#_currentAnimationFrame++;
        if(this.#_currentAnimationFrame >= this.#_animationFrames.length) {
            this.#_currentAnimationFrame = 0;
        }
    }
}

class Invader {
    #_bounds;
    #_animationFrames;
    #_currentAnimationFrame;

    constructor(b, af, caf) {
        this.#_bounds = b;
        this.#_animationFrames = af;
        this.#_currentAnimationFrame = caf;
    }


    /////////////
    // Getters //
    /////////////

    get bounds() {
        return this.#_bounds;
    }

    get animationFrames() {
        return this.#_animationFrames;
    }

    get currentAnimationFrame() {
        return this.#_currentAnimationFrame;
    }


    /////////////
    // Setters //
    /////////////

    set bounds(b) {
        this.#_bounds = b;
    }

    set currentAnimationFrame(caf) {
        this.#_currentAnimationFrame = caf;
    }
}