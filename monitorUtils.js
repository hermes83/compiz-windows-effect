'use strict';

const Meta = imports.gi.Meta;
const Gio = imports.gi.Gio;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.commonUtils;

var DisplaySetting = class DisplaySetting {
    static getMonitorGeometry(monitorIndex) {
        if (Utils.has_global_display()) {
            return global.display.get_monitor_geometry(monitorIndex);
        } else {
            return global.screen.get_monitor_geometry(monitorIndex);
        }
    }

    static getMonitorScale(monitorIndex) {
        if (Utils.has_global_display() && global.display && global.display.get_monitor_scale) {
            return global.display.get_monitor_scale(monitorIndex);
        } else {
            return 1;
        }
    }

    static getMonitors() {
        if (Utils.has_global_display()) {
            return global.display.get_n_monitors();
        } else {
            return global.screen.get_n_monitors();
        }
    }

    static getCurrentMonitorGeometry() {
        if (Utils.has_global_display()) {
            let currentMonitorIndex = global.display.get_current_monitor();
            return global.display.get_monitor_geometry(currentMonitorIndex);
        } else {
            let currentMonitorIndex = global.screen.get_current_monitor();
            return global.screen.get_monitor_geometry(currentMonitorIndex);
        }
    }
}

var MonitorGeometry = class MonitorGeometry {
    constructor(monitorIndex) {
        this.geometry = DisplaySetting.getMonitorGeometry(monitorIndex);
        this.scale =  DisplaySetting.getMonitorScale(monitorIndex);

        this.x1 = this.geometry.x;
        this.y1 = this.geometry.y;
        this.x2 = this.x1 + this.geometry.width;
        this.y2 = this.y1 + this.geometry.height;
    }
    
    contains(x1, y1, x2, y2) {
        return !(this.x1 > x2 || this.x2 < x1 || this.y1 > y2 || this.y2 < y1);
    }
}

var MonitorConfiguration = class MonitorConfiguration {
    constructor() {
        let experimentalFeatures = new Gio.Settings({ schema: 'org.gnome.mutter' }).get_strv( 'experimental-features')
        this.isWaylandFactionalScaleEnabled = Meta.is_wayland_compositor() && experimentalFeatures && experimentalFeatures.indexOf('scale-monitor-framebuffer') >= 0;

        this.monitorGeometryArray = [];
        for (let i = 0; i < DisplaySetting.getMonitors(); i++) {
            this.monitorGeometryArray.push(new MonitorGeometry(i));
        }
    }
    
    monitorsWithSameScale() {
        if (!this.isWaylandFactionalScaleEnabled) {
            return true;
        }

        let scale = this.monitorGeometryArray[0].scale;        
        for (let i = 1; i < this.monitorGeometryArray.length; i++) {    
            if (this.monitorGeometryArray[i].scale !== scale) {
                return false;
            }
        }
    
        return true;
    }

    getScale(actor) {
        if (!this.isWaylandFactionalScaleEnabled) {
            return 1;
        }

        let maxScale = 1;
        this.monitorGeometryArray.forEach((monitorGeometry, index) => {
            if (monitorGeometry.contains(actor.get_x(), actor.get_y(), actor.get_x() + actor.get_width(), actor.get_y() + actor.get_height())) {
                maxScale = Math.max(monitorGeometry.scale, maxScale);
            }
        });

        return Math.ceil(maxScale);
    }

    getCurrentMonitorGeometry() {
        return DisplaySetting.getCurrentMonitorGeometry();
    }
}