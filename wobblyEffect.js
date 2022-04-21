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
            this.width = 0;
            this.height = 0;
            this.xMouse = 0;
            this.yMouse = 0;
            this.msecOld = 0;

            this.wobblyModel = null;
            
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
                [this.xNew, this.yNew] = [actor.get_x(), actor.get_y()];
                [this.xOld, this.yOld] = [this.xNew, this.yNew];
                [this.xMouse, this.yMouse] = global.get_pointer();

                this.wobblyModel = new CompizPlugin.WobblyModel({
                    friction: this.FRICTION, 
                    springK: this.SPRING_K,
                    mass: this.MASS,
                    positionX: this.xNew, 
                    positionY: this.yNew, 
                    sizeX: this.width, 
                    sizeY: this.height,
                    tilesX: this.X_TILES, 
                    tilesY: this.Y_TILES
                });

                if ('unmaximized' == this.operationType) {
                    this.moveEvent = actor.connect('notify::allocation', this.on_maximize_event.bind(this));
                    this.wobblyModel.unmaximize();
                    this.ended = true;
                } else if ('maximized' == this.operationType) {
                    this.moveEvent = actor.connect('notify::allocation', this.on_maximize_event.bind(this));
                    this.wobblyModel.maximize();
                    this.ended = true;
                } else {
                    this.wobblyModel.grab(this.xMouse - this.xNew, this.yMouse - this.yNew);
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
            [this.xOld, this.yOld, this.xNew, this.yNew] = [this.xNew, this.yNew, actor.get_x(), actor.get_y()];
            this.wobblyModel.move(this.xNew - this.xOld, this.yNew - this.yOld);
        }

        on_maximize_event(actor, allocation, flags) {
            [this.xOld, this.yOld, this.xNew, this.yNew] = [this.xNew, this.yNew, actor.get_x(), actor.get_y()];
            this.wobblyModel.maximizeTransaction(this.xNew - this.xOld, this.yNew - this.yOld);
        }

        on_resized_event(actor, params) {
            var [width, height] = actor.get_size();
            if (this.width != width || this.height != height) {
                [this.width, this.height] = [width, height];
                this.wobblyModel.resize(this.width, this.height);
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
            v.x = (this.wobblyModel.deformedObjects[~~((v.ty + 0.01) * this.Y_TILES)][~~((v.tx + 0.01) * this.X_TILES)].x + this.wobblyModel.deltaX) * w / this.width;
            v.y = (this.wobblyModel.deformedObjects[~~((v.ty + 0.01) * this.Y_TILES)][~~((v.tx + 0.01) * this.X_TILES)].y + this.wobblyModel.deltaY) * h / this.height;
        }
    }
);