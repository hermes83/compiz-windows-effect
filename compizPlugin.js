/*
 * Copyright © 2005 Novell, Inc.
 * Copyright © 2022 Mauro Pepe
 *
 * Permission to use, copy, modify, distribute, and sell this software
 * and its documentation for any purpose is hereby granted without
 * fee, provided that the above copyright notice appear in all copies
 * and that both that copyright notice and this permission notice
 * appear in supporting documentation, and that the name of
 * Novell, Inc. not be used in advertising or publicity pertaining to
 * distribution of the software without specific, written prior permission.
 * Novell, Inc. makes no representations about the suitability of this
 * software for any purpose. It is provided "as is" without express or
 * implied warranty.
 *
 * NOVELL, INC. DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE,
 * INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS, IN
 * NO EVENT SHALL NOVELL, INC. BE LIABLE FOR ANY SPECIAL, INDIRECT OR
 * CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
 * OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT,
 * NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION
 * WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * Author: David Reveman <davidr@novell.com>
 *         Scott Moreau <oreaus@gmail.com>
 *         Mauro Pepe <https://github.com/hermes83/compiz-windows-effect>
 */

/*
 * Spring model implemented by Kristian Hogsberg.
 */
'use strict';

const GRID_WIDTH = 4;
const GRID_HEIGHT = 4;
class Obj {
    constructor(forceX, forceY, positionX, positionY, velocityX, velocityY, immobile) {
        this.forceX = forceX;
        this.forceY = forceY;
        this.x = positionX;
        this.y = positionY;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.immobile = immobile;
    }    
}

class Spring {
    constructor(a, b, offsetX, offsetY) {
        this.a = a;
        this.b = b;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }
}

var WobblyModel = class WobblyModel {
    constructor(config) {
        this.objects = new Array(GRID_WIDTH * GRID_HEIGHT);
        this.numObjects = GRID_WIDTH * GRID_HEIGHT;
        this.springs = new Array(GRID_WIDTH * GRID_HEIGHT);
        this.numSprings = 0;
        this.velocitySum = 0;
        this.forceSum = 0;
        this.steps = 0;
        this.vertex_count = 0;
        this.immobileObjects = [];
    
        this.x = config.positionX;
        this.y = config.positionY;
        this.width = config.sizeX;
        this.height = config.sizeY;
        this.friction = config.friction;
        this.springK = config.springK * 0.5;
        this.mass = 100 - config.mass;
        
        this.initObjects();
        this.initSprings();
    }

    dispose() {
        this.objects = null;
        this.springs = null;
    }

    initObjects() {
        var gridY, gridX;
        var i = 0;    
        var gw = GRID_WIDTH - 1;
        var gh = GRID_HEIGHT - 1;
    
        for (gridY = 0; gridY < GRID_HEIGHT; gridY++) {
            for (gridX = 0; gridX < GRID_WIDTH; gridX++) {
                this.objects[i] = new Obj(0, 0, (gridX * this.width) / gw, (gridY * this.height) / gh, 0, 0, false);
                i++;
            }
        }
    }

    initSprings() {
        var gridY, gridX;
        var i = 0;    
        var hpad = this.width / (GRID_WIDTH - 1);
        var vpad = this.height / (GRID_HEIGHT - 1);
        
        this.numSprings = 0;
    
        for (gridY = 0; gridY < GRID_HEIGHT; gridY++) {
            for (gridX = 0; gridX < GRID_WIDTH; gridX++) {
                if (gridX > 0) {
                    this.springs[this.numSprings] = new Spring(this.objects[i - 1], this.objects[i], hpad, 0);
                    this.numSprings++;
                }
    
                if (gridY > 0) {
                    this.springs[this.numSprings] = new Spring(this.objects[i - GRID_WIDTH], this.objects[i], 0, vpad);
                    this.numSprings++;
                }
    
                i++;
            }
        }
    }

    updateObjects() {
        var gridY, gridX;
        var i = 0;    
        var gw = GRID_WIDTH - 1;
        var gh = GRID_HEIGHT - 1;
    
        for (gridY = 0; gridY < GRID_HEIGHT; gridY++) {
            for (gridX = 0; gridX < GRID_WIDTH; gridX++) {
                this.objects[i].x = (gridX * this.width) / gw;
                this.objects[i].y = (gridY * this.height) / gh;

                this.objects[i].velocityX = 0.0;
                this.objects[i].velocityY = 0.0;

                this.objects[i].forceX = 0.0;
                this.objects[i].forceY = 0.0;

                i++;
            }
        }
    }

    nearestObject(x, y) {
        var dx = 0;
        var dy = 0;
        var distance = 0;
        var minDistance = 0;
        var result = null;

        for (const object of this.objects) {
            dx = object.x - x;
            dy = object.y - y;
            distance = Math.sqrt(dx * dx + dy * dy);
    
            if (!result || distance < minDistance) {
                minDistance = distance;
                result = object;
            }
        }

        return result;
    }

    grab(x, y) {
        var immobileObject = this.nearestObject(x, y);
        immobileObject.immobile = true;
        this.immobileObjects = [immobileObject];
    }

    maximize() {
        var intensity = 0.05;
        this.friction *= 2;
        if (this.friction > 10) {
            this.friction = 10;
        }

        var topLeft = this.nearestObject(0, 0);
        topLeft.immobile = true;

        var topRight = this.nearestObject(this.width, 0);
        topRight.immobile = true;

        var bottomLeft = this.nearestObject(0, this.height);
        bottomLeft.immobile = true;
        
        var bottomRight = this.nearestObject(this.width, this.height);
        bottomRight.immobile = true;

        this.immobileObjects = [topLeft,topRight,bottomLeft,bottomRight];

        for (const spring of this.springs) {
            if (spring.a == topLeft) {
                spring.b.velocityX -= spring.offsetX * intensity;
                spring.b.velocityY -= spring.offsetY * intensity;
            } else if (spring.b == topLeft) {
                spring.a.velocityX -= spring.offsetX * intensity;
                spring.a.velocityY -= spring.offsetY * intensity;
            } else if (spring.a == topRight) {
                spring.b.velocityX -= spring.offsetX * intensity;
                spring.b.velocityY -= spring.offsetY * intensity;
            } else if (spring.b == topRight) {
                spring.a.velocityX -= spring.offsetX * intensity;
                spring.a.velocityY -= spring.offsetY * intensity;
            } else if (spring.a == bottomLeft) {
                spring.b.velocityX -= spring.offsetX * intensity;
                spring.b.velocityY -= spring.offsetY * intensity;
            } else if (spring.b == bottomLeft) {
                spring.a.velocityX -= spring.offsetX * intensity;
                spring.a.velocityY -= spring.offsetY * intensity;
            } else if (spring.a == bottomRight) {
                spring.b.velocityX -= spring.offsetX * intensity;
                spring.b.velocityY -= spring.offsetY * intensity;
            } else if (spring.b == bottomRight) {
                spring.a.velocityX -= spring.offsetX * intensity;
                spring.a.velocityY -= spring.offsetY * intensity;
            }
        }
        
        this.step(0);
    }

    unmaximize() {
        var intensity = 0.05;
        this.friction *= 2;
        if (this.friction > 10) {
            this.friction = 10;
        }

        var immobileObject = this.nearestObject(this.width / 2, this.height / 2);
        immobileObject.immobile = true;
        this.immobileObjects = [immobileObject];

        for (const spring of this.springs) {
            if (spring.a == immobileObject) {
                spring.b.velocityX -= spring.offsetX * intensity;
                spring.b.velocityY -= spring.offsetY * intensity;
            } else if (spring.b == immobileObject) {
                spring.a.velocityX -= spring.offsetX * intensity;
                spring.a.velocityY -= spring.offsetY * intensity;
            }
        }
        
        this.step(0);
    }

    step(steps) {
        var velocitySum = 0.0;
        var forceSum = 0.0;

        if (steps >= 0) {
            for (var j = 0; j <= steps; j++) {
                for (const spring of this.springs) {
                    spring.a.forceX += this.springK * (spring.b.x - spring.a.x - spring.offsetX);
                    spring.a.forceY += this.springK * (spring.b.y - spring.a.y - spring.offsetY);
                    
                    spring.b.forceX -= this.springK * (spring.b.x - spring.a.x - spring.offsetX);
                    spring.b.forceY -= this.springK * (spring.b.y - spring.a.y - spring.offsetY);
                }
        
                for (const object of this.objects) {
                    if (object.immobile) {
                        object.velocityX = 0.0;
                        object.velocityY = 0.0;
        
                        object.forceX = 0.0;
                        object.forceY = 0.0;
    
                    } else {
                        object.forceX -= this.friction * object.velocityX;
                        object.forceY -= this.friction * object.velocityY;
        
                        object.velocityX += object.forceX / this.mass;
                        object.velocityY += object.forceY / this.mass;
        
                        object.x += object.velocityX; 
                        object.y += object.velocityY; 
    
                        velocitySum += Math.abs(object.velocityX) + Math.abs(object.velocityY);
                        forceSum += Math.abs(object.forceX) + Math.abs(object.forceY);
        
                        object.forceX = 0.0;
                        object.forceY = 0.0;
                    }
                }
            }
        }

        this.velocitySum = velocitySum;
        this.forceSum = forceSum;
    }

    move(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;

        this.immobileObjects[0].x += deltaX;
        this.immobileObjects[0].y += deltaY;
    }

    maximizeTransaction(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;

        for (const object of this.immobileObjects) {
            object.x += deltaX;
            object.y += deltaY;
        }
    }

    resize(sizeX, sizeY) {
        this.width = sizeX;
        this.height = sizeY;

        this.updateObjects();
        this.initSprings();
    }
}