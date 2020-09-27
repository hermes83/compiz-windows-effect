'use strict';

const Meta = imports.gi.Meta;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Extension = ExtensionUtils.getCurrentExtension();
const Settings = Extension.imports.settings;
const Effects = ((new Settings.Prefs()).JS_ENGINE.get()) ? Me.imports.effectsJs : Me.imports.effectsNative;
const Config = imports.misc.config;

const EFFECT_NAME = 'wobbly-compiz-effect';

const IS_OLD_SHELL_VERSIONS = Config.PACKAGE_VERSION.startsWith("3.36") ||
		Config.PACKAGE_VERSION.startsWith("3.34") ||
		Config.PACKAGE_VERSION.startsWith("3.32") ||
		Config.PACKAGE_VERSION.startsWith("3.30") ||
		Config.PACKAGE_VERSION.startsWith("3.28");

var currentEffect = null;

var is_old_shell_versions = function () {
    return IS_OLD_SHELL_VERSIONS;
}

var is_managed_op = function (op) {
    return Meta.GrabOp.MOVING == op;
}

var get_actor = function(window) {
    if (window) {
        return window.get_compositor_private();
    }
    return null;
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