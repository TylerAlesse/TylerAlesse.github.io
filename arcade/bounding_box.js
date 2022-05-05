/***************************************************
**                                                **
**                bounding_box.js                 **
**           Created By: Tyler Alesse             **
**                                                **
****************************************************/

/**
 * The BoundingBox Class is used for comparisons
 * of object bounds.
 **/
class BoundingBox {

    /**
     * Parameterized Constructor
     * 
     * @param {Number} _ax Beginning X coordinate
     * @param {Number} _ay Beginning Y coordinate
     * @param {Number} _bx Ending X coordinate
     * @param {Number} _by Ending Y coordinate
     */
    constructor(_ax, _ay, _bx, _by) {
        this.ax = _ax;
        this.ay = _ay;
        this.bx = _bx;
        this.by = _by;
    }

    /**
     * Check if the two given bounding boxes overlap/collide
     * 
     * @param {BoundingBox} objA First object's bounding box
     * @param {BoundingBox} objB Second object's bounding box
     * @returns {boolean} `True` if bounds overlap, `False` otherwise
     */
    static checkCollision(objA, objB) {
      return !(
        objA.ax >= objB.bx ||  // Left Side A > Right Side B
        objA.ay >= objB.by ||  // Top Side A > Bottom Side B
        objA.bx <= objB.ax ||  // Right Side A < Left Side B
        objA.by <= objB.ay     // Bottom Side A < Top Side B
      );
    }
}