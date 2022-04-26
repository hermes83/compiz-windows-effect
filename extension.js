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

const Meta = imports.gi.Meta;
const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();
const Utils = Extension.imports.commonUtils;

let grabOpBeginId;
let grabOpEndId;
let resizeOpId;
let minimizeId;
let unminimizeId;
let destroyId;

function init() {}

function enable() {
    if (Utils.is_3_xx_shell_version()) {
        grabOpBeginId = global.display.connect('grab-op-begin', (display, screen, window, op) => {
            grabStart(window, op);
        });
    } else {
        grabOpBeginId = global.display.connect('grab-op-begin', (display, window, op) => {
            grabStart(window, op);
        });
    }

    if (Utils.is_3_xx_shell_version()) {
        grabOpEndId = global.display.connect('grab-op-end', (display, screen, window, op) => {  
            grabEnd(window, op);
        });
    } else {
        grabOpEndId = global.display.connect('grab-op-end', (display, window, op) => {  
            grabEnd(window, op);
        });
    }

    resizeOpId = global.window_manager.connect('size-change', (e, actor, op) => {
        if (op == 0) {
            if (!actor.meta_window.get_tile_match()) {
                maximizeStart(actor, op);
            }
        } else {
            unmaximizeStart(actor, op);
        }
    });
    
    minimizeId = global.window_manager.connect("minimize", (e, actor) => {
        Utils.destroy_actor_effect(actor);
    });
    
    unminimizeId = global.window_manager.connect("unminimize", (e, actor) => {
        Utils.destroy_actor_effect(actor);
    });

    destroyId = global.window_manager.connect("destroy", (e, actor) => {
        Utils.destroy_actor_effect(actor);
    });
}

function disable() {    
    global.display.disconnect(grabOpBeginId);
    global.display.disconnect(grabOpEndId);
    global.window_manager.disconnect(resizeOpId);
    global.window_manager.disconnect(minimizeId);
    global.window_manager.disconnect(unminimizeId);    
    global.window_manager.disconnect(destroyId);
    
    global.get_window_actors().forEach((actor) => {
        Utils.destroy_actor_effect(actor);
    });
}

function maximizeStart(actor, op) {
    Utils.destroy_actor_effect(actor);

    if (Utils.is_managed_op(op)) {
        Utils.add_actor_effect(actor, 'maximized');
    }
}

function unmaximizeStart(actor, op) {
    if (Utils.is_managed_op(op)) {
        let effect = Utils.get_effect(actor);
        if (!effect || 'move' != effect.operationType) {
            Utils.destroy_actor_effect(actor);

            Utils.add_actor_effect(actor, 'unmaximized');   
        } 
    }
}

function grabStart(window, op) {
    let actor = Utils.get_actor(window);
    if (actor) {
        Utils.destroy_actor_effect(actor);

        if (!Utils.is_managed_op(op)) {
            return;
        }

        if (Meta.GrabOp.MOVING == op) {
            Utils.add_actor_effect(actor, 'move');
        } else {
            Utils.add_actor_effect(actor, op);
        }
    }
}

function grabEnd(window, op) {
    if (!Utils.is_managed_op(op)) {
        return;
    }
    
    let actor = Utils.get_actor(window);
    if (actor) {
        var effect = Utils.get_effect(actor);
        if (effect) {
            effect.on_end_event(actor);
        }
    } 
}