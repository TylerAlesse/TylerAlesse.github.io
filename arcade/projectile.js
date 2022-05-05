/**********************************************
**                                           **
**               projectile.js               **
**           Created By: Tyler Alesse        **
**                                           **
***********************************************/

/**
 * 
 **/
class Projectile {

    /**
     * The identifier for the projectile
     * 
     * @type {Number}
     **/
    _id = -1;

    /**
     * The bounding box of the projectile
     * 
     * @type {BoundingBox}
     **/
    _bounds;
    
    /**
     * The x velocity of the projectile
     **/
    _vx;

    /**
     * The y velocity of the projectile
     **/
    _vy;

    /**
     * The amount of damage to hitpoints the projectile has
     **/
    _damage;
    
    /**
     * The number of enemies the projectile can move
     **/
    _pierce;

    /**
     * Parameterized Constructor
     * 
     * @param {BoundingBox} sb The starting bounding box of the projectile
     * @param {Number} sxy The starting x velocity of the projectile
     * @param {Number} svy The starting y velocity of the projectile
     * @param {Number} d The damage value of the projectile
     * @param {Number} sp The starting pierce value of the projectile
     **/
    constructor(sb, svx, svy, d, sp) {
        this._bounds = sb;
        this._vx = svx;
        this._vy = svy;
        this._damage = d;
        this._pierce = sp;
    }

    /////////////
    // Getters //
    /////////////

    /**
     * 
     **/
    get id() {
        return this._id;
    }

    /**
     * 
     **/
    get bounds() {
        return this._bounds;
    }

    /**
     * 
     **/
    get pierce() {
        return this._pierce;
    }
    
    /**
     * 
     **/
    get damage() {
        return this._damage;
    }

    /////////////
    // Setters //
    /////////////

    /**
     * Set the pierce attribute of the given instance of the class
     **/
    set pierce(np) {
        this._pierce = np;
    }

    /////////////
    // Methods //
    /////////////

    /**
     * Update the position of the projectile
     **/
    updatePosition() {
        this._bounds.ax += this._vx;
        this._bounds.bx += this._vx;

        this._bounds.ay += this._vy;
        this._bounds.by += this._vy;
    }
}