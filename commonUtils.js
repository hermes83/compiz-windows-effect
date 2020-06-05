'use strict';

const Meta = imports.gi.Meta;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Effects = Me.imports.effects;

const EFFECT_NAME = 'wobbly-compiz-effect';

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
    }
}

var destroy_actor_wobbly_effect = function (actor) {
    if (actor) {
        let effect = actor.get_effect(EFFECT_NAME);
        if (effect) {
            effect.destroy();
        }
    }
}