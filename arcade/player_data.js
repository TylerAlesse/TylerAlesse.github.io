/**************************************************
**                                               **
**                 player_data.js                **
**           Created By: Tyler Alesse            **
**                                               **
***************************************************/

class PlayerData {
    #_rankPoints;
    #_remainingRankPoints;

    #_pewDamageRank;
    #_maxPewDamageRank = 6;

    #_pewPierceRank;
    #_maxPewPierceRank = 3;

    #_laserChargeRank;
    #_maxLaserChargeRank = 5;

    #_laserCapRank;
    #_maxLaserCapRank = 2;

    #_stageNumber;

    constructor() {
        this.#_rankPoints = 0;
        this.#_remainingRankPoints = 0;
        this.#_pewDamageRank = 0;
        this.#_pewPierceRank = 0;
        this.#_laserChargeRank = 0;
        this.#_laserCapRank = 0;
        this.#_stageNumber = 1;
    }


    /////////////
    // Getters //
    /////////////

    /**
     * 
     **/
    get rankPoints() {
        return this.#_rankPoints;
    }

    /**
     * 
     **/
    get remainingRankPoints() {
        return this.#_remainingRankPoints;
    }

    /**
     * 
     **/
    get pewDamageRank() {
        return this.#_pewDamageRank;
    }

    /**
     * 
     **/
    get pewPierceRank() {
        return this.#_pewPierceRank;
    }

    /**
     * 
     **/
    get laserChargeRank() {
        return this.#_laserChargeRank;
    }

    /**
     * 
     **/
    get laserCapRank() {
        return this.#_laserCapRank;
    }

    /**
     * 
     **/
    get stageNumber() {
        return this.#_stageNumber;
    }


    /////////////
    // Setters //
    /////////////

    set stageNumber(sn) {
        this.#_stageNumber = sn;
    }


    /////////////
    // Methods //
    /////////////

    resetPlayerData() {
        this.#_rankPoints = 0;
        this.#_remainingRankPoints = 0;
        this.#_pewDamageRank = 0;
        this.#_pewPierceRank = 0;
        this.#_laserChargeRank = 0;
        this.#_laserCapRank = 0;
        this.#_stageNumber = 1;
    }

    resetAllocatedRankPoints() {
        this.#_remainingRankPoints = this.#_rankPoints;
        this.#_pewDamageRank = 0;
        this.#_pewPierceRank = 0;
        this.#_laserChargeRank = 0;
        this.#_laserCapRank = 0;
    }

    increasePlayerRank() {
        this.#_rankPoints++;
        this.#_remainingRankPoints++;
    }

    increasePewDamageRank() {
        if(this.#_remainingRankPoints <= 0 || this.#_pewDamageRank >= this.#_maxPewDamageRank) {
            return false;
        }

        this.#_remainingRankPoints--;
        this.#_pewDamageRank++;
        return true;
    }

    increasePewPierceRank() {
        if(this.#_remainingRankPoints <= 0 || this.#_pewPierceRank >= this.#_maxPewPierceRank) {
            return false;
        }

        this.#_remainingRankPoints--;
        this.#_pewPierceRank++;
        return true;
    }

    increaseLaserChargeRank() {
        if(this.#_remainingRankPoints <= 0 || this.#_laserChargeRank >= this.#_maxLaserChargeRank) {
            return false;
        }

        this.#_remainingRankPoints--;
        this.#_laserChargeRank++;
        return true;
    }

    increaseLaserCapRank() {
        if(this.#_remainingRankPoints <= 0 || this.#_laserCapRank >= this.#_maxLaserCapRank) {
            return false;
        }

        this.#_remainingRankPoints--;
        this.#_laserCapRank++;
        return true;
    }

    savePlayerData() {
        let saveObject = {
            "rankPoints": this.#_rankPoints,
            "remainingRankPoints": this.#_remainingRankPoints,
            "pewDamageRank": this.#_pewDamageRank,
            "pewPierceRank": this.#_pewPierceRank,
            "laserChargeRank": this.#_laserChargeRank,
            "laserCapRank": this.#_laserCapRank,
            "stageNumber": this.#_stageNumber
        };

        localStorage.setItem("playerSaveData", JSON.stringify(saveObject));
    }

    loadPlayerData() {
        // Attempt to load the data from local storage
        let tempLoad = localStorage.getItem("playerSaveData");

        // Check if the data could not be loaded
        if(tempLoad === null || tempLoad === undefined) {
            return false; // load failed
        }

        // Parse the loaded string
        let loadObject = JSON.parse(tempLoad);

        // Check if the loaded object does not have exactly 7 keys
        if(Object.keys(loadObject).length !== 7) {
            return false; // load failed
        }

        // Prepare "checksum"
        let check_sum = (
            loadObject.pewDamageRank +
            loadObject.pewPierceRank + 
            loadObject.laserChargeRank +
            loadObject.laserCapRank
        );

        // Does the "checksum" pass
        if(loadObject.rankPoints != check_sum) {
            return false; // load failed
        }

        this.#_rankPoints = loadObject.rankPoints;
        this.#_remainingRankPoints = loadObject.remainingRankPoints;
        this.#_pewDamageRank = loadObject.pewDamageRank;
        this.#_pewPierceRank = loadObject.pewPierceRank;
        this.#_laserChargeRank = loadObject.laserChargeRank;
        this.#_laserCapRank = loadObject.laserCapRank;
        this.#_stageNumber = loadObject.stageNumber;

        return true;
    }
}