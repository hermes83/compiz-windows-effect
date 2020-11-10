const Gtk = imports.gi.Gtk;

let Extension = imports.misc.extensionUtils.getCurrentExtension();
let Settings = Extension.imports.settings;

let frictionSlider = null;
let springKSlider = null;
let speedupFactor = null;
let objectMovementRange = null;
let xTilesSlider = null;
let yTilesSlider = null;
let jsEngineSwitch = null;

function init() { }

function buildPrefsWidget() {
    let config = new Settings.Prefs();

    let frame = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        border_width: 20, 
        spacing: 20
    });

    frictionSlider = addSlider(frame, "Friction", config.FRICTION, 2.0, 10.0, 1);
    springKSlider = addSlider(frame, "Spring", config.SPRING_K, 2.0, 10.0, 1);
    speedupFactor = addSlider(frame, "Speedup Factor", config.SPEEDUP_FACTOR, 1.0, 40.0, 1);
    objectMovementRange = addSlider(frame, "Object Movement Range", config.OBJECT_MOVEMENT_RANGE, 10.0, 500.0, 0);
    xTilesSlider = addSlider(frame, "X Tiles", config.X_TILES, 3.0, 20.0, 0);
    yTilesSlider = addSlider(frame, "Y Tiles", config.Y_TILES, 3.0, 20.0, 0);
    jsEngineSwitch = addBooleanSwitch(frame, "JS Engine", config.JS_ENGINE);

    addDefaultButton(frame, config);

    frame.show_all();
    
    return frame;
}

function addDefaultButton(frame, config) {
    let button = new Gtk.Button({label: "Reset to default"});
    button.connect('clicked', function () {
        config.FRICTION.set(2.5);
        config.SPRING_K.set(8.5);
        config.SPEEDUP_FACTOR.set(1.5);
        config.OBJECT_MOVEMENT_RANGE.set(250.0);
        config.X_TILES.set(7.0);
        config.Y_TILES.set(6.0);
        config.JS_ENGINE.set(true);

        frictionSlider.set_value(config.FRICTION.get());
        springKSlider.set_value(config.SPRING_K.get());
        speedupFactor.set_value(config.SPEEDUP_FACTOR.get());
        objectMovementRange.set_value(config.OBJECT_MOVEMENT_RANGE.get());
        xTilesSlider.set_value(config.X_TILES.get());
        yTilesSlider.set_value(config.Y_TILES.get());
        jsEngineSwitch.set_active(config.JS_ENGINE.get());
    });

    frame.pack_end(button, false, false, 0);
    
    return button;
}

function addSlider(frame, labelText, prefConfig, lower, upper, decimalDigits) {
    let scale = new Gtk.HScale({
        digits: decimalDigits,
        adjustment: new Gtk.Adjustment({lower: lower, upper: upper}),
        value_pos: Gtk.PositionType.RIGHT,
        hexpand: true, 
        halign: Gtk.Align.END
    });
    scale.set_value(prefConfig.get());
    scale.connect('value-changed', function (sw) {
        var newval = sw.get_value();
        if (newval != prefConfig.get()) {
            prefConfig.set(newval);
        }
    });
    scale.set_size_request(400, 15);

    let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, spacing: 20});
    hbox.add(new Gtk.Label({label: labelText, use_markup: true}));
    hbox.add(scale);
    
    frame.add(hbox);
    
    return scale;
}

function addBooleanSwitch(frame, labelText, prefConfig) {
    let gtkSwitch = new Gtk.Switch({hexpand: true, halign: Gtk.Align.END});
    gtkSwitch.set_active(prefConfig.get());
    gtkSwitch.connect('state-set', function (sw) {
        var newval = sw.get_active();
        if (newval != prefConfig.get()) {
            prefConfig.set(newval);
        }
    });

    let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, spacing: 20});
    hbox.add(new Gtk.Label({label: labelText, use_markup: true}));
    hbox.add(gtkSwitch);
    
    frame.add(hbox);
    
    return gtkSwitch;
}