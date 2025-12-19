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

import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import { SettingsData } from './settings_data.js';

export default class Prefs extends ExtensionPreferences {

    fillPreferencesWindow(window) {        
        this.presets = [
            { code: 'S', label: 'Subtle', friction: 1.5, springK: 1.0, speedupFactor: 6.0, mass: 80.0 },
            { code: 'R', label: 'Realistic', friction: 3.5, springK: 3.8, speedupFactor: 12.0, mass: 70.0 },
            { code: 'E', label: 'Exaggerated', friction: 5.0, springK: 4.2, speedupFactor: 15.0, mass: 50.0 },
            { code: 'X', label: 'Extreme', friction: 7.0, springK: 5.5, speedupFactor: 19.0, mass: 25.0 },
            { code: 'P', label: 'Personalized' }
        ];

        const settingsData = new SettingsData(this.getSettings());
        const width = 750;
        const height = 620;
        window.set_default_size(width, height);

        const page = Adw.PreferencesPage.new();

        const group1 = Adw.PreferencesGroup.new();
        this.presetComboBox = this.addPresetComboBox(group1, "Preset", settingsData);
        this.frictionSlider = this.addSlider(group1, "Friction", settingsData.FRICTION, 1.0, 10.0, 1);
        this.springKSlider = this.addSlider(group1, "Spring", settingsData.SPRING_K, 1.0, 10.0, 1);
        this.speedupFactor = this.addSlider(group1, "Speedup Factor", settingsData.SPEEDUP_FACTOR, 2.0, 40.0, 1);
        this.massSlider = this.addSlider(group1, "Mass", settingsData.MASS, 20.0, 80.0, 0);
        page.add(group1);
        
        const group2 = Adw.PreferencesGroup.new();
        this.xTilesSlider = this.addSlider(group2, "X Tiles", settingsData.X_TILES, 3.0, 20.0, 0);
        this.yTilesSlider = this.addSlider(group2, "Y Tiles", settingsData.Y_TILES, 3.0, 20.0, 0);
        this.maximizeEffectSwitch = this.addBooleanSwitch(group2, "Maximize effect", settingsData.MAXIMIZE_EFFECT);
        this.resizeEffectSwitch = this.addBooleanSwitch(group2, "Resize effect", settingsData.RESIZE_EFFECT);
        page.add(group2);

        this.addResetButton(window, settingsData);

        this.applyVisibleEffect(settingsData.PRESET.get() === 'P');

        window.add(page);
    }

    addResetButton(window, settingsData) {
        const button = new Gtk.Button({vexpand: true, valign: Gtk.Align.END});
        button.set_icon_name('edit-clear');

        button.connect('clicked', () => {
            const preset = this.presets.find(v => v.code === 'R');
            const presetIndex = this.presets.findIndex(v => v.code === 'R');

            settingsData.PRESET.set(preset.code);
            settingsData.FRICTION.set(preset.friction);
            settingsData.SPRING_K.set(preset.springK);
            settingsData.SPEEDUP_FACTOR.set(preset.speedupFactor);
            settingsData.MASS.set(preset.mass);
            settingsData.X_TILES.set(6.0);
            settingsData.Y_TILES.set(6.0);
            settingsData.MAXIMIZE_EFFECT.set(true);
            settingsData.RESIZE_EFFECT.set(false);
    
            this.presetComboBox.set_active(presetIndex);
            this.frictionSlider.set_value(settingsData.FRICTION.get());
            this.springKSlider.set_value(settingsData.SPRING_K.get());
            this.speedupFactor.set_value(settingsData.SPEEDUP_FACTOR.get());
            this.massSlider.set_value(settingsData.MASS.get());
            this.xTilesSlider.set_value(settingsData.X_TILES.get());
            this.yTilesSlider.set_value(settingsData.Y_TILES.get());
            this.maximizeEffectSwitch.set_active(settingsData.MAXIMIZE_EFFECT.get());
            this.resizeEffectSwitch.set_active(settingsData.RESIZE_EFFECT.get());

            this.applyVisibleEffect(false);
        });

        const header = this.findWidgetByType(window.get_content(), Adw.HeaderBar);
        if (header) {
            header.pack_start(button);            
        }
        
        return button;
    }

    addPresetComboBox(group, labelText, settingsData) {
        let gtkComboBoxText = new Gtk.ComboBoxText({hexpand: true, halign: Gtk.Align.END});
        gtkComboBoxText.set_valign(Gtk.Align.CENTER);

        let activeIndex = 0;
        let activeValue = settingsData.PRESET.get();

        for (let i = 0; i < this.presets.length; i++) {
            gtkComboBoxText.append_text(this.presets[i].label);
            if (activeValue && activeValue == this.presets[i].code) {
                activeIndex = i;
            }
        }

        const self = this;
        gtkComboBoxText.set_active(activeIndex);
        gtkComboBoxText.connect('changed', function (sw) {
            var newval = self.presets[sw.get_active()].code;
            if (newval != settingsData.PRESET.get()) {
                settingsData.PRESET.set(newval);

                if (newval !== 'P') {
                    const preset = self.presets.find(v => v.code === newval);
                
                    settingsData.FRICTION.set(preset.friction);
                    settingsData.SPRING_K.set(preset.springK);
                    settingsData.SPEEDUP_FACTOR.set(preset.speedupFactor);
                    settingsData.MASS.set(preset.mass);

                    self.frictionSlider.set_value(settingsData.FRICTION.get());
                    self.springKSlider.set_value(settingsData.SPRING_K.get());
                    self.speedupFactor.set_value(settingsData.SPEEDUP_FACTOR.get());
                    self.massSlider.set_value(settingsData.MASS.get());
                }

                self.applyVisibleEffect(newval=== 'P');
            }
        });

        const row = Adw.ActionRow.new();
        row.set_title(labelText);
        row.add_suffix(gtkComboBoxText);
        group.add(row);
        
        return gtkComboBoxText;
    }
    
    addSlider(group, labelText, settingsData, lower, upper, decimalDigits) {
        const scale = new Gtk.Scale({
            digits: decimalDigits,
            adjustment: new Gtk.Adjustment({lower: lower, upper: upper}),
            value_pos: Gtk.PositionType.RIGHT,
            hexpand: true, 
            halign: Gtk.Align.END
        });
        scale.set_draw_value(true);    
        scale.set_value(settingsData.get());
        scale.connect('value-changed', (sw) => {
            var newval = sw.get_value();
            if (newval != settingsData.get()) {
                settingsData.set(newval);
            }
        });
        scale.set_size_request(400, 15);

        const row = Adw.ActionRow.new();
        row.set_title(labelText);
        row.add_suffix(scale);
        group.add(row);

        return scale;
    }
    
    addBooleanSwitch(group, labelText, settingsData) {
        const gtkSwitch = new Gtk.Switch({hexpand: true, halign: Gtk.Align.END});
        gtkSwitch.set_active(settingsData.get());
        gtkSwitch.set_valign(Gtk.Align.CENTER);
        gtkSwitch.connect('state-set', (sw) => {
            var newval = sw.get_active();
            if (newval != settingsData.get()) {
                settingsData.set(newval);
            }
        });

        const row = Adw.ActionRow.new();
        row.set_title(labelText);
        row.add_suffix(gtkSwitch);
        group.add(row);
        
        return gtkSwitch;
    }

    applyVisibleEffect(visible) {
        this.frictionSlider.get_parent().get_parent().get_parent().set_visible(visible);
        this.springKSlider.get_parent().get_parent().get_parent().set_visible(visible);
        this.speedupFactor.get_parent().get_parent().get_parent().set_visible(visible);
        this.massSlider.get_parent().get_parent().get_parent().set_visible(visible);
    }

    findWidgetByType(parent, type) {
        for (const child of [...parent]) {
            if (child instanceof type) return child;

            const match = this.findWidgetByType(child, type);
            if (match) return match;
        }
        return null;
    }
}
