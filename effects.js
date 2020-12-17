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

const Main = imports.ui.main;
const { GObject, Clutter } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();
const Settings = Extension.imports.settings;
const Me = ExtensionUtils.getCurrentExtension();
const MonitorUtils = Me.imports.monitorUtils;
const Utils = Me.imports.commonUtils;

const WobblyEngine = Extension.imports.libAnimationWrapper.WobblyEngine;

const CLUTTER_TIMELINE_DURATION = 1000 * 1000;

var WobblyEffect = GObject.registerClass({},
    class WobblyEffect extends Clutter.DeformEffect {

        _init(params = {}) {
            super._init();
            this.operationType = params.op;

            this.allocationChangedEvent = null;
            this.newFrameEvent = null;

            this.timerId = null;
            this.initOldValues = true;
            this.width = 0;
            this.height = 0;
            this.xMouse = 0;
            this.yMouse = 0;
            this.msecOld = 0;
            this.pv = {width:0, height:0};

            this.wobblyEngine = null;

            this.monitorConfiguration = new MonitorUtils.MonitorConfiguration();
            this.scale = 1;
            this.monitorsWithSameScale = false;

            let prefs = (new Settings.Prefs());
            this.JS_ENGINE = prefs.JS_ENGINE.get();            
            this.FRICTION = prefs.FRICTION.get();
            this.SPRING_K = prefs.SPRING_K.get();            
            this.SPEEDUP_FACTOR = prefs.SPEEDUP_FACTOR.get();
            this.OBJECT_MOVEMENT_RANGE = prefs.OBJECT_MOVEMENT_RANGE.get();
            this.X_TILES = prefs.X_TILES.get();
            this.Y_TILES = prefs.Y_TILES.get();

            this.set_n_tiles(this.X_TILES, this.Y_TILES);
            
            this.initialized = false;
            // this.i = 0;
        }

        vfunc_set_actor(actor) {
            super.vfunc_set_actor(actor);

            if (actor) {
                this.allocationChangedEvent = actor.connect('notify::allocation', this.on_actor_event.bind(this));
                this.start_timer(this.on_tick_elapsed.bind(this), actor);
            }
        }

        vfunc_post_paint(paintNode, paintContext) {
            super.vfunc_post_paint(paintNode, paintContext);

            let [success, pv_width, pv_height] = this.get_target_size();
            if (success) {
                if (!this.initialized) {
                    this.initialized = true;
                    [this.pv.width, this.pv.height] = [pv_width, pv_height];
                    
                    this.monitorsWithSameScale = this.monitorConfiguration.monitorsWithSameScale();
                    this.scale = this.monitorConfiguration.getScale(this.actor);

                    [this.width, this.height] = [this.pv.width, this.pv.height];
                    [this.xNew, this.yNew, this.xOld, this.yOld] = [this.actor.get_x(), this.actor.get_y(), this.actor.get_x(), this.actor.get_y()];
                    [this.xMouse, this.yMouse] = global.get_pointer();

                    this.wobblyEngine = new WobblyEngine(
                        this.FRICTION, 
                        this.SPRING_K, 
                        this.OBJECT_MOVEMENT_RANGE, 
                        this.xMouse - this.xNew, this.yMouse - this.yNew, 
                        this.width, this.height
                    );

                } else if (this.pv.width !== pv_width || this.pv.height !== pv_height) {
                    [this.pv.width, this.pv.height] = [pv_width, pv_height];

                    if (!this.monitorsWithSameScale) {
                        this.scale = this.monitorConfiguration.getScale(this.actor);
                    }

                    [this.width, this.height] = [this.pv.width * this.scale, this.pv.height * this.scale];
                    this.wobblyEngine.resize(this.width, this.height);
                }
            }
        }

        vfunc_modify_paint_volume (pv) {
        //     if (++this.i > 5) {
        //         this.i = 0;
        //     }
        //     return this.i;
            return false;
        }

        start_timer(timerFunction, actor) {
            this.stop_timer();
            this.timerId = new Clutter.Timeline({ actor: actor });
            this.timerId.set_duration(CLUTTER_TIMELINE_DURATION);

            this.newFrameEvent = this.timerId.connect('new-frame', timerFunction);
            this.timerId.start();      
        }

        stop_timer() {
            if (this.timerId) {
                if (this.newFrameEvent) {
                    this.timerId.disconnect(this.newFrameEvent);
                    this.newFrameEvent = null;
                }
                this.timerId.stop();
                this.timerId = null;
            }
        }

        destroy() {
            this.stop_timer();

            if (this.wobblyEngine) {
                this.wobblyEngine.dispose();
                this.wobblyEngine = null;
            }
            
            let actor = this.get_actor();
            if (actor) {
                if (this.allocationChangedEvent) {
                    actor.disconnect(this.allocationChangedEvent);
                    this.allocationChangedEvent = null;
                }

                actor.remove_effect(this);
            }
        }

        on_actor_event(actor, allocation, flags) {
            if (this.initialized) {
                if (!this.monitorsWithSameScale) {
                    this.scale = this.monitorConfiguration.getScale(actor);
                }
                
                [this.xOld, this.yOld, this.xNew, this.yNew] = [this.xNew, this.yNew, actor.get_x(), actor.get_y()];
                this.wobblyEngine.move(this.xNew - this.xOld, this.yNew - this.yOld);
            }
        }

        on_tick_elapsed(timer, msec) {
            if (Main.overview.visible) {
                this.destroy();
                return;
            }
            if (this.initialized) {
                this.wobblyEngine.step(1 + (msec - this.msecOld) / this.SPEEDUP_FACTOR);
                this.msecOld = msec;
                this.invalidate();
            }
        }
        
        vfunc_deform_vertex(w, h, v) {
            if (this.initialized) {
                [v.x, v.y] = this.wobblyEngine.getCoords(v.tx, v.ty).map(el => el * this.scale);
            }
        }
    }
);