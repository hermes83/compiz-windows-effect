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

const { GLib, Meta } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.commonUtils;

const TIMEOUT_DELAY = 2000;

let grabOpBeginId;
let grabOpEndId;
let resizeMinMaxOpId;
let minimizeId;
let unminimizeId;
let timeoutWobblyId;
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

    resizeMinMaxOpId = global.window_manager.connect('size-change', (e, actor, op) => {
        if (op == 0) {
            stopEffect(actor);
        }
    });
    
    minimizeId = global.window_manager.connect("minimize", (e, actor) => {
        stopEffect(actor);
    });
    
    unminimizeId = global.window_manager.connect("unminimize", (e, actor) => {
        stopEffect(actor);
    });

    destroyId = global.window_manager.connect("destroy", (e, actor) => {
        stopEffect(actor);
    });
}

function disable() {    
    global.display.disconnect(grabOpBeginId);
    global.display.disconnect(grabOpEndId);
    global.display.disconnect(resizeMinMaxOpId);
    global.display.disconnect(minimizeId);
    global.display.disconnect(unminimizeId);    
    global.window_manager.disconnect(destroyId);
    
    stop_wobbly_timer();
    
    global.get_window_actors().forEach((actor) => {
        Utils.destroy_actor_wobbly_effect(actor);
    });
}

function stop_wobbly_timer() {
    if (timeoutWobblyId) {
        GLib.source_remove(timeoutWobblyId);
        timeoutWobblyId = 0;
    }
}

function stopEffect(actor) {
    if (Utils.has_wobbly_effect(actor)) {
        stop_wobbly_timer();

        if (actor) {
            Utils.destroy_actor_wobbly_effect(actor);
        }
    }
}

function grabStart(window, op) {
    let actor = Utils.get_actor(window);
    if (actor) {            
        stop_wobbly_timer();

        Utils.destroy_actor_wobbly_effect(actor);

        if (Utils.is_managed_op(op)) {
            Utils.add_actor_wobbly_effect(actor, op);   
        }
    }
}

function grabEnd(window, op) {
    if (!Utils.is_managed_op(op)) {
        return;
    }
    
    let actor = Utils.get_actor(window);
    if (actor) {
        timeoutWobblyId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, TIMEOUT_DELAY, () => {
            stop_wobbly_timer();

            let actor = Utils.get_actor(window);
            if (actor) {
                Utils.destroy_actor_wobbly_effect(actor);
            }

            return false;
        });
    }
}