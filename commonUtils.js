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
const Me = ExtensionUtils.getCurrentExtension();
const Extension = ExtensionUtils.getCurrentExtension();
const Settings = Extension.imports.settings;
const Config = imports.misc.config;

const EFFECT_NAME = 'wobbly-compiz-effect';

const IS_3_XX_SHELL_VERSION = Config.PACKAGE_VERSION.startsWith("3");
const IS_3_38_SHELL_VERSION = Config.PACKAGE_VERSION.startsWith("3.38");
const HAS_GLOBAL_DISPLAY = !Config.PACKAGE_VERSION.startsWith("3.28");

const Effects = IS_3_XX_SHELL_VERSION ? Me.imports.effects3 : Me.imports.effects;
var currentEffect = null;

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
    return Meta.GrabOp.MOVING == op;
}

var get_actor = function(window) {
    return window ? window.get_compositor_private() : null;
}

var has_wobbly_effect = function (actor) {
    return actor && actor.get_effect(EFFECT_NAME);
}

var add_actor_wobbly_effect = function (actor, op) { 
    if (actor && Meta.GrabOp.MOVING == op) {
        actor.add_effect_with_name(EFFECT_NAME, new Effects.WobblyEffect({op: op}));

        currentEffect = actor.get_effect(EFFECT_NAME);
    }
}

var destroy_actor_wobbly_effect = function (actor) {
    if (actor) {
        let effect = actor.get_effect(EFFECT_NAME);
        if (effect) {
            effect.destroy();
        }
    } 

    if (currentEffect) {
        currentEffect.destroy();
    }
    currentEffect = null;
}