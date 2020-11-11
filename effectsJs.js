'use strict';

const { GObject, Clutter } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();
const Settings = Extension.imports.settings;
const Wobbly = Extension.imports.wobbly;
const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.commonUtils;
const MonitorUtils = Me.imports.monitorUtils;

const CLUTTER_TIMELINE_DURATION = 1000 * 1000;

var WobblyEffect = GObject.registerClass({},
    class WobblyEffect extends Clutter.DeformEffect {

        _init(params = {}) {
            super._init();
            this.operationType = params.op;

            this.allocationChangedEvent = null;
            this.paintEvent = null;
            this.newFrameEvent = null;
            this.resizeEvent = null;
            
            this.timerId = null;
            this.initOldValues = true;
            this.width = 0;
            this.height = 0;
            this.xMouse = 0;
            this.yMouse = 0;
            this.margin = 3;
            this.msecOld = 0;

            this.wobblyModel = null;
            
            this.monitorConfiguration = new MonitorUtils.MonitorConfiguration();
            this.scale = 1;
            this.monitorsWithSameScale = false;
            
            this.anchor = null;
            this.position = {x: 0, y: 0};
            this.size = {x: 0, y: 0};
            this.anchorPosition = {x: 0, y: 0};
            this.delta = {x: 0, y: 0};
            this.reverseDelta = {x: 0, y: 0};
            this.deformed = {x: 0, y: 0};

            let prefs = (new Settings.Prefs());
            this.FRICTION = prefs.FRICTION.get();
            this.SPRING_K = prefs.SPRING_K.get();            
            
            this.SPEEDUP_FACTOR = prefs.SPEEDUP_FACTOR.get();
            this.OBJECT_MOVEMENT_RANGE = prefs.OBJECT_MOVEMENT_RANGE.get();
            this.X_TILES = prefs.X_TILES.get();
            this.Y_TILES = prefs.Y_TILES.get();

            Wobbly.Module['SetFriction'](this.FRICTION);
            Wobbly.Module['SetSpringConstant'](this.SPRING_K);
            Wobbly.Module['SetMaximumRange'](this.OBJECT_MOVEMENT_RANGE);

            this.set_n_tiles(this.X_TILES, this.Y_TILES);
            this.deformedMatrix = null;
            this.index = 0;
        }

        vfunc_set_actor(actor) {
            super.vfunc_set_actor(actor);

            if (actor && !this.initialized) {
                this.initialized = true;

                this.monitorsWithSameScale = this.monitorConfiguration.monitorsWithSameScale();
                this.scale = this.monitorConfiguration.getScale(actor);
                
                [this.width, this.height] = actor.get_size();
                [this.size.x, this.size.y] = [this.width + this.margin, this.height + this.margin];
                [this.xNew, this.yNew] = [actor.get_x(), actor.get_y()];
                [this.xOld, this.yOld] = [this.xNew, this.yNew];
                [this.xMouse, this.yMouse] = global.get_pointer();

                this.wobblyModel = new Wobbly.Module['WobblyModel']({x: 0, y: 0}, this.size.x, this.size.y);
                
                [this.anchorPosition.x, this.anchorPosition.y] = [this.xMouse - this.xNew, this.yMouse - this.yNew];
                this.anchor = this.wobblyModel.GrabAnchor({x: this.anchorPosition.x, y: this.anchorPosition.y});

                this.allocationChangedEvent = actor.connect(Utils.is_old_shell_versions() ? 'allocation-changed' : 'notify::allocation', this.on_actor_event.bind(this));
                this.paintEvent = actor.connect('paint', () => {});
                this.resizeEvent = actor.connect('notify::size', this.resized.bind(this));
                this.start_timer(this.on_tick_elapsed.bind(this), actor);
            }
        }

        start_timer(timerFunction, actor) {
            this.stop_timer();
            if (Utils.is_old_shell_versions()) {
                this.timerId = new Clutter.Timeline();
            } else {
                this.timerId = new Clutter.Timeline({ actor: actor });
            }
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
                this.timerId.run_dispose();
                this.timerId = null;
            }
        }

        resized(actor, params) {
            if (!this.monitorsWithSameScale) {
                this.scale = this.monitorConfiguration.getScale(actor);
            }

            [this.width, this.height] = actor.get_size();
            [this.size.x, this.size.y] = [this.width + this.margin, this.height + this.margin];
            this.wobblyModel.ResizeModel(this.size.x, this.size.y);
        }

        destroy() {
            this.stop_timer();

            if (this.anchor) {
                this.anchor.delete();
                this.anchor = null;
            }

            if (this.wobblyModel) {
                this.wobblyModel.delete();
                this.wobblyModel = null;
            }
            
            let actor = this.get_actor();
            if (actor) {
                if (this.paintEvent) {
                    actor.disconnect(this.paintEvent);
                    this.paintEvent = null;
                }
            
                if (this.allocationChangedEvent) {
                    actor.disconnect(this.allocationChangedEvent);
                    this.allocationChangedEvent = null;
                }

                if (this.resizeEvent) {
                    actor.disconnect(this.resizeEvent);
                    this.resizeEvent = null;
                }

                actor.remove_effect(this);
            }
        }

        on_actor_event(actor, allocation, flags) {
            if (!this.monitorsWithSameScale) {
                this.scale = this.monitorConfiguration.getScale(actor);
            }
            
            [this.xOld, this.yOld, this.xNew, this.yNew] = [this.xNew, this.yNew, actor.get_x(), actor.get_y()];
            
            this.anchor.MoveBy({x: this.xNew - this.xOld, y: this.yNew - this.yOld});
            this.wobblyModel.MoveModelBy({x: - this.xNew + this.xOld, y: - this.yNew + this.yOld});          
        }

        on_tick_elapsed(timer, msec) {
            this.wobblyModel.Step(1 + (msec - this.msecOld) / this.SPEEDUP_FACTOR);
            this.msecOld = msec;
            this.invalidate();
        }

        vfunc_deform_vertex(w, h, v) {
            this.deformed = this.wobblyModel.DeformTexcoords({x: v.ty, y: v.tx});
            [v.x, v.y] = [this.deformed.x * this.scale, this.deformed.y * this.scale];
        }
    }
);