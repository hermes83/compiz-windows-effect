'use strict';

const { GObject, Clutter, Meta, Animation } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();
const Settings = Extension.imports.settings;

const CLUTTER_TIMELINE_DURATION = 1000 * 1000;

var WobblyEffect = GObject.registerClass({},
    class WobblyEffect extends Clutter.DeformEffect {

        _init(params = {}) {
            super._init();
            this.operationType = params.op;

            this.allocationChangedEvent = null;
            this.paintEvent = null;
            this.newFrameEvent = null;
            this.resizeWidthEvent = null;
            this.resizeHeightEvent = null;
            
            this.timerId = null;
            this.initOldValues = true;
            this.xPickedUp = 0;
            this.yPickedUp = 0;
            this.width = 0;
            this.height = 0;
            this.xMouse = 0;
            this.yMouse = 0;
            this.msecOld = 0;

            this.wobblyModel = null;
            this.anchor = null;
            this.position = new Animation.Vector();
            this.size = new Animation.Vector();
            this.anchorPosition = new Animation.Vector();
            this.delta = new Animation.Vector();
            this.reverseDelta = new Animation.Vector();
            this.uv = new Animation.Vector();  
            this.deformed = null;

            let prefs = (new Settings.Prefs());
            this.FRICTION = prefs.FRICTION.get();
            this.SPRING_K = prefs.SPRING_K.get();
            this.SPEEDUP_FACTOR = prefs.SPEEDUP_FACTOR.get();
            this.OBJECT_MOVEMENT_RANGE = prefs.OBJECT_MOVEMENT_RANGE.get();
        }

        vfunc_set_actor(actor) {
            super.vfunc_set_actor(actor);

            this.set_n_tiles(8, 6);

            if (actor) {
                [this.width, this.height] = actor.get_size();
                [this.position.x, this.position.y] = [0.0, 0.0];
                [this.size.x, this.size.y] = [this.width + 4, this.height + 4];

                this.wobblyModel = new Animation.WobblyModel({
                    friction: this.FRICTION, 
                    spring_k: this.SPRING_K,
                    movement_range: this.OBJECT_MOVEMENT_RANGE,
                    position: this.position, 
                    size: this.size
                });

                this.allocationChangedEvent = actor.connect('allocation-changed', this.on_actor_event.bind(this));
                this.paintEvent = actor.connect('paint', () => null);
                this.resizeWidthEvent = actor.connect('notify::width', this.resized.bind(this));
                this.resizeHeightEvent = actor.connect('notify::height', this.resized.bind(this));
                this.start_timer(this.on_tick_elapsed.bind(this));
            }
        }

        start_timer(timerFunction) {
            this.stop_timer();
            this.timerId = new Clutter.Timeline({ duration: CLUTTER_TIMELINE_DURATION });
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
            [this.width, this.height] = actor.get_size();

            [this.size.x, this.size.y] = [this.width + 4, this.height + 4];
            this.wobblyModel.resize(this.size);
        }

        destroy() {
            this.stop_timer();

            if (this.anchor) {
                this.anchor.release();
                this.anchor = null;
            }

            if (this.model) {
                this.model = null;
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

                if (this.resizeWidthEvent) {
                    actor.disconnect(this.resizeWidthEvent);
                    this.resizeWidthEvent = null;
                }

                if (this.resizeHeightEvent) {
                    actor.disconnect(this.resizeHeightEvent);
                    this.resizeHeightEvent = null;
                }

                actor.remove_effect(this);
            }
        }

        on_actor_event(actor, allocation, flags) {
            [this.xNew, this.yNew] = allocation.get_origin();
            [this.width, this.height] = actor.get_size();
            
            if (this.initOldValues) {
                [this.xOld, this.yOld] = [this.xNew, this.yNew];
                [this.xMouse, this.yMouse] = global.get_pointer();

                [this.anchorPosition.x, this.anchorPosition.y] = [this.xMouse - this.xNew, this.yMouse - this.yNew];
                this.anchor = this.wobblyModel.grab_anchor(this.anchorPosition);

                this.initOldValues = false;
            }
            
            [this.delta.x, this.delta.y] = [this.xNew - this.xOld, this.yNew - this.yOld];
            this.anchor.move_by(this.delta);

            [this.reverseDelta.x, this.reverseDelta.y] = [this.delta.x * -1, this.delta.y * -1];
            this.wobblyModel.move_by(this.reverseDelta);

            [this.xOld, this.yOld] = [this.xNew, this.yNew];
        }

        on_tick_elapsed(timer, msec) {
            if (this.wobblyModel) {
                this.wobblyModel.step(this.SPEEDUP_FACTOR);

                this.invalidate();
            }

            this.msecOld = msec;
        }

        vfunc_deform_vertex(w, h, v) {
            [this.uv.x, this.uv.y] = [v.ty, v.tx];
            this.deformed = this.wobblyModel.deform_texcoords(this.uv);

            [v.x, v.y] = [this.deformed.x, this.deformed.y];
        }

    }
);