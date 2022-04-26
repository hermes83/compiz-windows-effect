/*
 * Compiz-windows-effect for GNOME Shell
 *
 * Copyright (C) 2020
 *     Mauro Pepe <https://github.com/hermes83/compiz-windows-effect>
 *
 * This file is part of the gnome-shell extension Compiz-windows-effect.
 *
 * gnome-shell extension Compiz-windows-effect is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * gnome-shell extension Compiz-windows-effect is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with gnome-shell extension Compiz-windows-effect.  If not, see
 * <http://www.gnu.org/licenses/>.
 */
'use strict';

const { GObject, Clutter } = imports.gi;
const Main = imports.ui.main;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Settings = Extension.imports.settings;
const Utils = Extension.imports.commonUtils;
const CompizPlugin = Extension.imports.compizPlugin;

const CLUTTER_TIMELINE_DURATION = 1000 * 1000;

var WobblyEffect = GObject.registerClass({},
    class WobblyEffect extends Clutter.DeformEffect {

        _init(params = {}) {
            super._init();
            this.operationType = params.op;

            this.moveEvent = null;
            this.newFrameEvent = null;
            this.completedEvent = null;
            this.overviewShowingEvent = null;
            
            this.timerId = null;
            this.deltaX = 0;
            this.deltaY = 0;
            this.width = 0;
            this.height = 0;
            this.mouseX = 0;
            this.mouseY = 0;
            this.msecOld = 0;

            this.wobblyModel = null;
            this.coeff = null;
            this.deformedObjects = null;
            this.tilesX = 0;
            this.tilesY = 0;
            
            let prefs = (new Settings.Prefs());
            this.FRICTION = prefs.FRICTION.get();
            this.SPRING_K = prefs.SPRING_K.get();            
            this.SPEEDUP_FACTOR = prefs.SPEEDUP_FACTOR.get();
            this.MASS = prefs.MASS.get();
            this.X_TILES = 'maximized' == this.operationType ? 10 : prefs.X_TILES.get();
            this.Y_TILES = 'maximized' == this.operationType ? 10 : prefs.Y_TILES.get();

            this.set_n_tiles(this.X_TILES, this.Y_TILES);
            
            this.initialized = false;
            this.ended = false;
        }

        init(actor) {
            if (actor && !this.initialized) {
                this.initialized = true;

                [this.width, this.height] = actor.get_size();
                [this.newX, this.newY] = [actor.get_x(), actor.get_y()];
                [this.oldX, this.oldY] = [this.newX, this.newY];
                [this.mouseX, this.mouseY] = global.get_pointer();

                this.wobblyModel = new CompizPlugin.WobblyModel({
                    friction: this.FRICTION, 
                    springK: this.SPRING_K,
                    mass: this.MASS,
                    positionX: this.newX, 
                    positionY: this.newY, 
                    sizeX: this.width, 
                    sizeY: this.height
                });

                this.tilesX = this.X_TILES + 0.1;
                this.tilesY = this.Y_TILES + 0.1;

                this.coeff = new Array(this.Y_TILES + 1);
                this.deformedObjects = new Array(this.Y_TILES + 1);
            
                var x, y, tx, ty;
                for (y = 0; y <= this.Y_TILES; y++) {
                    ty = y / this.Y_TILES;

                    this.coeff[y] = new Array(this.X_TILES + 1);
                    this.deformedObjects[y] = new Array(this.X_TILES + 1);
            
                    for (x = 0; x <= this.X_TILES; x++) {
                        tx = x / this.X_TILES;
        
                        this.coeff[y][x] = new Array(16);    
                        this.coeff[y][x][0] = (1 - tx) * (1 - tx) * (1 - tx) * (1 - ty) * (1 - ty) * (1 - ty);
                        this.coeff[y][x][1] = 3 * tx * (1 - tx) * (1 - tx) * (1 - ty) * (1 - ty) * (1 - ty);
                        this.coeff[y][x][2] = 3 * tx * tx * (1 - tx) * (1 - ty) * (1 - ty) * (1 - ty);
                        this.coeff[y][x][3] = tx * tx * tx * (1 - ty) * (1 - ty) * (1 - ty);
                        this.coeff[y][x][4] = 3 * (1 - tx) * (1 - tx) * (1 - tx) * ty * (1 - ty) * (1 - ty);
                        this.coeff[y][x][5] = 9 * tx * (1 - tx) * (1 - tx) * ty * (1 - ty) * (1 - ty);
                        this.coeff[y][x][6] = 9 * tx * tx * (1 - tx) * ty * (1 - ty) * (1 - ty);
                        this.coeff[y][x][7] = 3 * tx * tx * tx * ty * (1 - ty) * (1 - ty);
                        this.coeff[y][x][8] = 3 * (1 - tx) * (1 - tx) * (1 - tx) * ty * ty * (1 - ty);
                        this.coeff[y][x][9] = 3 * tx * (1 - tx) * (1 - tx) * 3 * ty * ty * (1 - ty);
                        this.coeff[y][x][10] = 9 * tx * tx * (1 - tx) * ty * ty * (1 - ty);
                        this.coeff[y][x][11] = 3 * tx * tx * tx * ty * ty * (1 - ty);
                        this.coeff[y][x][12] = (1 - tx) * (1 - tx) * (1 - tx) * ty * ty * ty;
                        this.coeff[y][x][13] = 3 * tx * (1 - tx) * (1 - tx) * ty * ty * ty;
                        this.coeff[y][x][14] = 3 * tx * tx * (1 - tx) * ty * ty * ty;
                        this.coeff[y][x][15] = tx * tx * tx * ty * ty * ty;

                        this.deformedObjects[y][x] = [tx * this.width, ty * this.height];
                    }
                }
                
                if ('unmaximized' == this.operationType) {
                    this.moveEvent = actor.connect('notify::allocation', this.on_maximize_event.bind(this));
                    this.wobblyModel.unmaximize();
                    this.ended = true;
                } else if ('maximized' == this.operationType) {
                    this.moveEvent = actor.connect('notify::allocation', this.on_maximize_event.bind(this));
                    this.wobblyModel.maximize();
                    this.ended = true;
                } else {
                    this.wobblyModel.grab(this.mouseX - this.newX, this.mouseY - this.newY);
                    this.moveEvent = actor.connect('notify::allocation', this.on_move_event.bind(this));
                    this.resizedEvent = actor.connect('notify::size', this.on_resized_event.bind(this));
                }

                this.overviewShowingEvent = Main.overview.connect('showing', this.destroy.bind(this));

                this.timerId = new Clutter.Timeline({actor: actor, duration: CLUTTER_TIMELINE_DURATION});
                this.newFrameEvent = this.timerId.connect('new-frame', this.on_new_frame_event.bind(this));
                this.completedEvent = this.timerId.connect('completed', this.destroy.bind(this));
                this.timerId.start();      
            }
        }

        destroy() {
            if (this.overviewShowingEvent) {
                Main.overview.disconnect(this.overviewShowingEvent);
            }

            if (this.timerId) {
                if (this.completedEvent) {
                    this.timerId.disconnect(this.completedEvent);
                    this.completedEvent = null;
                }
                if (this.newFrameEvent) {
                    this.timerId.disconnect(this.newFrameEvent);
                    this.newFrameEvent = null;
                }
                this.timerId.run_dispose();
                this.timerId = null;
            }

            if (this.wobblyModel) {
                this.wobblyModel.dispose();
                this.wobblyModel = null;
            }
            
            let actor = this.get_actor();
            if (actor) {
                if (this.moveEvent) {
                    actor.disconnect(this.moveEvent);
                    this.moveEvent = null;
                }

                if (this.resizedEvent) {
                    actor.disconnect(this.resizedEvent);
                    this.resizedEvent = null;
                }

                actor.remove_effect(this);
            }
        }

        on_end_event(actor) {
            this.ended = true;
        }   

        on_move_event(actor, allocation, flags) {
            [this.oldX, this.oldY, this.newX, this.newY] = [this.newX, this.newY, actor.get_x(), actor.get_y()];
            this.wobblyModel.move(this.newX - this.oldX, this.newY - this.oldY);
            this.deltaX -= this.newX - this.oldX;
            this.deltaY -= this.newY - this.oldY;
        }

        on_maximize_event(actor, allocation, flags) {
            [this.oldX, this.oldY, this.newX, this.newY] = [this.newX, this.newY, actor.get_x(), actor.get_y()];
            this.wobblyModel.maximizeTransaction(this.newX - this.oldX, this.newY - this.oldY);
            this.deltaX -= this.newX - this.oldX;
            this.deltaY -= this.newY - this.oldY;
        }

        on_resized_event(actor, params) {
            var [width, height] = actor.get_size();
            if (this.width != width || this.height != height) {
                [this.width, this.height] = [width, height];
                this.wobblyModel.resize(this.width, this.height);
                this.deltaX = 0;
                this.deltaY = 0;
            }
        }

        on_new_frame_event(timer, msec) {
            if (this.ended) {
                if (!this.timerId) {
                    this.destroy();
                    return;
                }
                if (!this.wobblyModel) {
                    this.destroy();
                    return;
                }
                if (this.wobblyModel.velocitySum < 10 && this.wobblyModel.forceSum < 10) {
                    this.destroy();
                    return;
                }
            }

            this.wobblyModel.step((msec - this.msecOld) / this.SPEEDUP_FACTOR);
            this.msecOld = msec;

            var x, y;
            for (y = 0; y <= this.Y_TILES; y++) {
                for (x = 0; x <= this.X_TILES; x++) {
                    this.deformedObjects[y][x][0] = 
                        this.coeff[y][x][0] * this.wobblyModel.objects[0].x
                        + this.coeff[y][x][1] * this.wobblyModel.objects[1].x
                        + this.coeff[y][x][2] * this.wobblyModel.objects[2].x
                        + this.coeff[y][x][3] * this.wobblyModel.objects[3].x
                        + this.coeff[y][x][4] * this.wobblyModel.objects[4].x
                        + this.coeff[y][x][5] * this.wobblyModel.objects[5].x
                        + this.coeff[y][x][6] * this.wobblyModel.objects[6].x
                        + this.coeff[y][x][7] * this.wobblyModel.objects[7].x
                        + this.coeff[y][x][8] * this.wobblyModel.objects[8].x
                        + this.coeff[y][x][9] * this.wobblyModel.objects[9].x
                        + this.coeff[y][x][10] * this.wobblyModel.objects[10].x
                        + this.coeff[y][x][11] * this.wobblyModel.objects[11].x
                        + this.coeff[y][x][12] * this.wobblyModel.objects[12].x
                        + this.coeff[y][x][13] * this.wobblyModel.objects[13].x
                        + this.coeff[y][x][14] * this.wobblyModel.objects[14].x
                        + this.coeff[y][x][15] * this.wobblyModel.objects[15].x;
                    this.deformedObjects[y][x][1] = 
                        this.coeff[y][x][0] * this.wobblyModel.objects[0].y
                        + this.coeff[y][x][1] * this.wobblyModel.objects[1].y
                        + this.coeff[y][x][2] * this.wobblyModel.objects[2].y
                        + this.coeff[y][x][3] * this.wobblyModel.objects[3].y
                        + this.coeff[y][x][4] * this.wobblyModel.objects[4].y
                        + this.coeff[y][x][5] * this.wobblyModel.objects[5].y
                        + this.coeff[y][x][6] * this.wobblyModel.objects[6].y
                        + this.coeff[y][x][7] * this.wobblyModel.objects[7].y
                        + this.coeff[y][x][8] * this.wobblyModel.objects[8].y
                        + this.coeff[y][x][9] * this.wobblyModel.objects[9].y
                        + this.coeff[y][x][10] * this.wobblyModel.objects[10].y
                        + this.coeff[y][x][11] * this.wobblyModel.objects[11].y
                        + this.coeff[y][x][12] * this.wobblyModel.objects[12].y
                        + this.coeff[y][x][13] * this.wobblyModel.objects[13].y
                        + this.coeff[y][x][14] * this.wobblyModel.objects[14].y
                        + this.coeff[y][x][15] * this.wobblyModel.objects[15].y;
                }
            }

            this.invalidate();
        }

        vfunc_set_actor(actor) {
            super.vfunc_set_actor(actor);
            this.init(actor);
        }
        
        vfunc_modify_paint_volume(pv) {
            return false;
        }

        vfunc_deform_vertex(w, h, v) {
            [v.x, v.y] = this.deformedObjects[v.ty * this.tilesY >> 0][v.tx * this.tilesX >> 0];
            v.x = (v.x + this.deltaX) * w / this.width;
            v.y = (v.y + this.deltaY) * h / this.height;
        }
    }
);