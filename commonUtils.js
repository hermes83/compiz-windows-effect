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
const Settings = Extension.imports.settings;
const Config = imports.misc.config;

const EFFECT_NAME = 'wobbly-compiz-effect';

const IS_3_XX_SHELL_VERSION = Config.PACKAGE_VERSION.startsWith("3");
const IS_3_38_SHELL_VERSION = Config.PACKAGE_VERSION.startsWith("3.38");
const HAS_GLOBAL_DISPLAY = !Config.PACKAGE_VERSION.startsWith("3.28");

const WobblyEffect = IS_3_XX_SHELL_VERSION ? Extension.imports.wobblyEffect3 : Extension.imports.wobblyEffect;
const ResizeEffect = IS_3_XX_SHELL_VERSION ? Extension.imports.resizeEffect3 : Extension.imports.resizeEffect;

var is_3_xx_shell_version = function () {
    return IS_3_XX_SHELL_VERSION;
}

var is_3_38_shell_version = function () {
    return IS_3_38_SHELL_VERSION;
}

var has_global_display = function () {
    return HAS_GLOBAL_DISPLAY;
}

var is_managed_op = function (op) {
    if (Meta.GrabOp.MOVING == op || Meta.GrabOp.NONE == op) {
        return true;   
    }

    let prefs = (new Settings.Prefs());
    if (prefs.RESIZE_EFFECT.get() && (Meta.GrabOp.RESIZING_W == op || Meta.GrabOp.RESIZING_E == op || Meta.GrabOp.RESIZING_S == op || Meta.GrabOp.RESIZING_N == op || Meta.GrabOp.RESIZING_NW == op || Meta.GrabOp.RESIZING_NE == op || Meta.GrabOp.RESIZING_SE == op || Meta.GrabOp.RESIZING_SW == op)) {
        return true;
    }
}

var get_actor = function(window) {
    return window ? window.get_compositor_private() : null;
}

var get_effect = function (actor) {
    return actor.get_effect(EFFECT_NAME);
}

var add_actor_effect = function (actor, op) { 
    if (actor) {
        if ('move' == op) {
            actor.add_effect_with_name(EFFECT_NAME, new WobblyEffect.WobblyEffect({op: op}));
        } else if ('maximized' == op || 'unmaximized' == op ) {
            let prefs = (new Settings.Prefs());
            if (prefs.MAXIMIZE_EFFECT.get()) {
                actor.add_effect_with_name(EFFECT_NAME, new WobblyEffect.WobblyEffect({op: op}));
            }
        } else {
            actor.add_effect_with_name(EFFECT_NAME, new ResizeEffect.ResizeEffect({op: op}));
        }
    }
}

var destroy_actor_effect = function (actor) {
    if (actor) {
        let effect = actor.get_effect(EFFECT_NAME);
        if (effect) {
            effect.destroy();
        }
    }
}