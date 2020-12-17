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

const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();
const Settings = Extension.imports.settings;

let jsEngine;
let AnimationJs = null;
let Animation = null;
if ((new Settings.Prefs()).JS_ENGINE.get()) {
    jsEngine = true;
    AnimationJs = Extension.imports.wobbly;
} else {
    jsEngine = false;    
    Animation = imports.gi.Animation;
}

var WobblyEngine = class WobblyEngine {
    constructor(friction, springK, movementRange, posX, posY, sizeX, sizeY) {
        if (!jsEngine) {
            this.delta = new Animation.Vector();
            this.reverseDelta = new Animation.Vector();
    
            this.position = new Animation.Vector();
            [this.position.x, this.position.y] = [0, 0];
            
            this.size = new Animation.Vector();
            [this.size.x, this.size.y] = [sizeX, sizeY];
    
            this.wobblyModel = new Animation.WobblyModel({
                friction: friction, 
                spring_k: springK,
                movement_range: movementRange,
                position: this.position, 
                size: this.size
            });
    
            this.anchorPosition = new Animation.Vector();
            [this.anchorPosition.x, this.anchorPosition.y] = [posX, posY];
            this.anchor = this.wobblyModel.grab_anchor(this.anchorPosition);

            this.dispose = this.disposeNative;
            this.step = this.stepNative;
            this.resize = this.resizeNative;
            this.move = this.moveNative;
            this.getCoords = this.getCoordsNative;
        } else {
            AnimationJs.Module['SetFriction'](friction);
            AnimationJs.Module['SetSpringConstant'](springK);
            AnimationJs.Module['SetMaximumRange'](movementRange);
            this.wobblyModel = new AnimationJs.Module['WobblyModel'](
                {x: 0, y: 0}, 
                sizeX, 
                sizeY
            );

            this.anchorPosition = {x: posX, y: posY};
            this.anchor = this.wobblyModel.GrabAnchor({x: this.anchorPosition.x, y: this.anchorPosition.y});

            this.dispose = this.disposeJs;
            this.step = this.stepJs;
            this.resize = this.resizeJs;
            this.move = this.moveJs;
            this.getCoords = this.getCoordsJs;
        }
    }

    disposeNative() {
        if (this.anchor) {
            this.anchor.release();
            this.anchor = null;
        }

        if (this.wobblyModel) {
            this.wobblyModel = null;
        }
    }

    disposeJs() {
        if (this.anchor) {
            this.anchor.delete();
            this.anchor = null;
        }

        if (this.wobblyModel) {
            this.wobblyModel = null;
        }
    }

    resizeNative(sizeX, sizeY) {
        [this.size.x, this.size.y] = [sizeX, sizeY];
        this.wobblyModel.resize(this.size);
    }

    resizeJs(sizeX, sizeY) {
        this.wobblyModel.ResizeModel(sizeX, sizeY);
    }

    moveNative(deltaX, deltaY) {
        [this.delta.x, this.delta.y] = [deltaX, deltaY];
        this.anchor.move_by(this.delta);

        [this.reverseDelta.x, this.reverseDelta.y] = [this.delta.x * -1, this.delta.y * -1];
        this.wobblyModel.move_by(this.reverseDelta);
    }

    moveJs(deltaX, deltaY) {
        this.anchor.MoveBy({x: deltaX, y: deltaY});
        this.wobblyModel.MoveModelBy({x: -deltaX, y: -deltaY});
    }

    stepNative(ms) {
        this.wobblyModel.step(ms);
    }

    stepJs(ms) {
        this.wobblyModel.Step(ms);
    }

    getCoordsNative(tx, ty) {
        return this.wobblyModel.deform_texcoords_plain(ty, tx);
    }

    getCoordsJs(tx, ty) {
        this.deformed = this.wobblyModel.DeformTexcoords({x: ty, y: tx});
        return [this.deformed.x, this.deformed.y];
    }
}