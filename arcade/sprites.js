/************************************************
**                                             **
**                  sprites.js                 **
**           Created By: Tyler Alesse          **
**                                             **
*************************************************/

/**
 * The Sprites Class is used for storage of
 * image files loaded using the p5 library
 **/
class Sprites {
    /**
     * The standard player sprite
     **/
    #_player_normal;
    
    /**
     * The player damage sprite (Frame A)
     **/
    #_player_damageA;
    
    /**
     * The player damage sprite (Frame B)
     **/
    #_player_damageB;

    /**
     * The standard enemy sprite
     **/
    #_enemy_normal;
    
    /**
     * The enemy damage sprite (Frame A)
     **/
    #_enemy_damageA;
    
    /**
     * The enemy damage sprite (Frame B)
     **/
    #_enemy_damageB;

    /**
     * Steve, The Invader, Sprite (Frame A)
     **/
    #_invader_steveA;

    /**
     * Steve, The Invader, Sprite (Frame B)
     **/
    #_invader_steveB;

    /**
     * Greg, The Invader, Sprite (Frame A)
     **/
    #_invader_gregA;

    /**
     * Greg, The Invader, Sprite (Frame B)
     **/
    #_invader_gregB;

    /**
     * Bill, The Invader, Sprite (Frame A)
     **/
    #_invader_billA;

    /**
     * Bill, The Invader, Sprite (Frame B)
     **/
    #_invader_billB;

    /**
     * Invader Projectile Sprite (Frame A)
     **/
    #_invader_projectileA;

    /**
     * Invader Projectile Sprite (Frame B)
     **/
    #_invader_projectileB;

    /**
     * Invader Projectile Sprite (Frame C)
     **/
    #_invader_projectileC;

    /**
     * Invader Projectile Sprite (Frame D)
     **/
    #_invader_projectileD;

     
    /////////////
    // Getters //
    /////////////

    get player_normal()         { return this.#_player_normal;          }
    get player_damageA()        { return this.#_player_damageA;         }
    get player_damageB()        { return this.#_player_damageB;         }
    get enemy_normal()          { return this.#_enemy_normal;           }
    get enemy_damageA()         { return this.#_enemy_damageA;          }
    get enemy_damageB()         { return this.#_enemy_damageB;          }
    get invader_steveA()        { return this.#_invader_steveA;         }
    get invader_steveB()        { return this.#_invader_steveB;         }
    get invader_gregA()         { return this.#_invader_gregA;          }
    get invader_gregB()         { return this.#_invader_gregB;          }
    get invader_billA()         { return this.#_invader_billA;          }
    get invader_billB()         { return this.#_invader_billB;          }
    get invader_projectileA()   { return this.#_invader_projectileA;    }
    get invader_projectileB()   { return this.#_invader_projectileB;    }
    get invader_projectileC()   { return this.#_invader_projectileC;    }
    get invader_projectileD()   { return this.#_invader_projectileD;    }


    /////////////
    // Setters //
    /////////////

    set player_normal(imgData)          { this.#_player_normal = imgData;           }
    set player_damageA(imgData)         { this.#_player_damageA = imgData;          }
    set player_damageB(imgData)         { this.#_player_damageB = imgData;          }
    set enemy_normal(imgData)           { this.#_enemy_normal = imgData;            }
    set enemy_damageA(imgData)          { this.#_enemy_damageA = imgData;           }
    set enemy_damageB(imgData)          { this.#_enemy_damageB = imgData;           }
    set invader_steveA(imgData)         { this.#_invader_steveA = imgData;          }
    set invader_steveB(imgData)         { this.#_invader_steveB = imgData;          }
    set invader_gregA(imgData)          { this.#_invader_gregA = imgData;           }
    set invader_gregB(imgData)          { this.#_invader_gregB = imgData;           }
    set invader_billA(imgData)          { this.#_invader_billA = imgData;           }
    set invader_billB(imgData)          { this.#_invader_billB = imgData;           }
    set invader_projectileA(imgData)    { this.#_invader_projectileA = imgData;     }
    set invader_projectileB(imgData)    { this.#_invader_projectileB = imgData;     }
    set invader_projectileC(imgData)    { this.#_invader_projectileC = imgData;     }
    set invader_projectileD(imgData)    { this.#_invader_projectileD = imgData;     }
}