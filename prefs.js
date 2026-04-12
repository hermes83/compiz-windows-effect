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
        const settingsData = new SettingsData(this.getSettings());
    
        const presets = [
            { code: 'S', label: 'Subtle', friction: 1.5, springK: 1.0, speedupFactor: 6.0, mass: 80.0 },
            { code: 'R', label: 'Realistic', friction: 3.5, springK: 3.8, speedupFactor: 12.0, mass: 70.0 },
            { code: 'E', label: 'Exaggerated', friction: 5.0, springK: 4.2, speedupFactor: 15.0, mass: 50.0 },
            { code: 'X', label: 'Extreme', friction: 7.0, springK: 5.5, speedupFactor: 19.0, mass: 25.0 },
            { code: 'P', label: 'Personalized' }
        ];

        const fields = {
            presetComboBox: this.addPresetComboBox(settingsData, presets),
            frictionSlider: this.newSlider(settingsData.FRICTION, 1.0, 10.0, 1),
            springKSlider: this.newSlider(settingsData.SPRING_K, 1.0, 10.0, 1),
            speedupFactor: this.newSlider(settingsData.SPEEDUP_FACTOR, 2.0, 40.0, 1),
            massSlider: this.newSlider(settingsData.MASS, 20.0, 80.0, 0),
            xTilesSlider: this.newSlider(settingsData.X_TILES, 3.0, 20.0, 0),
            yTilesSlider: this.newSlider(settingsData.Y_TILES, 3.0, 20.0, 0),
            maximizeEffectSwitch: this.newBooleanSwitch(settingsData.MAXIMIZE_EFFECT),
            resizeEffectSwitch: this.newBooleanSwitch(settingsData.RESIZE_EFFECT)
        };

        const group1 = Adw.PreferencesGroup.new();
        group1.add(this.newRow("Preset", fields.presetComboBox));
        group1.add(this.newRow("Friction", fields.frictionSlider));
        group1.add(this.newRow("Spring", fields.springKSlider));
        group1.add(this.newRow("Speedup Factor", fields.speedupFactor));
        group1.add(this.newRow("Mass", fields.massSlider));
        
        const group2 = Adw.PreferencesGroup.new();
        group2.add(this.newRow("X Tiles", fields.xTilesSlider));
        group2.add(this.newRow("Y Tiles", fields.yTilesSlider));
        group2.add(this.newRow("Maximize effect", fields.maximizeEffectSwitch));
        group2.add(this.newRow("Resize effect", fields.resizeEffectSwitch));

        const page = Adw.PreferencesPage.new();
        page.add(group1);
        page.add(group2);

        window.set_default_size(750, 620);
        window.add(page);

        fields.presetComboBox.connect('changed', (sw) => {
            var newval = presets[sw.get_active()].code;
            if (newval != settingsData.PRESET.get()) {
                settingsData.PRESET.set(newval);

                if (newval !== 'P') {
                    const preset = presets.find(v => v.code === newval);
                
                    settingsData.FRICTION.set(preset.friction);
                    settingsData.SPRING_K.set(preset.springK);
                    settingsData.SPEEDUP_FACTOR.set(preset.speedupFactor);
                    settingsData.MASS.set(preset.mass);

                    fields.frictionSlider.set_value(settingsData.FRICTION.get());
                    fields.springKSlider.set_value(settingsData.SPRING_K.get());
                    fields.speedupFactor.set_value(settingsData.SPEEDUP_FACTOR.get());
                    fields.massSlider.set_value(settingsData.MASS.get());
                }

                this.applyVisibleEffect(fields, newval === 'P');
            }
        });

        const header = this.findWidgetByType(window.get_content(), Adw.HeaderBar);
        if (header) {
            const resetButton = this.newResetButton();
            resetButton.connect('clicked', () => {
                const preset = presets.find(v => v.code === 'R');
                const presetIndex = presets.findIndex(v => v.code === 'R');

                settingsData.PRESET.set(preset.code);
                settingsData.FRICTION.set(preset.friction);
                settingsData.SPRING_K.set(preset.springK);
                settingsData.SPEEDUP_FACTOR.set(preset.speedupFactor);
                settingsData.MASS.set(preset.mass);
                settingsData.X_TILES.set(6.0);
                settingsData.Y_TILES.set(6.0);
                settingsData.MAXIMIZE_EFFECT.set(true);
                settingsData.RESIZE_EFFECT.set(false);
        
                fields.presetComboBox.set_active(presetIndex);
                fields.frictionSlider.set_value(settingsData.FRICTION.get());
                fields.springKSlider.set_value(settingsData.SPRING_K.get());
                fields.speedupFactor.set_value(settingsData.SPEEDUP_FACTOR.get());
                fields.massSlider.set_value(settingsData.MASS.get());
                fields.xTilesSlider.set_value(settingsData.X_TILES.get());
                fields.yTilesSlider.set_value(settingsData.Y_TILES.get());
                fields.maximizeEffectSwitch.set_active(settingsData.MAXIMIZE_EFFECT.get());
                fields.resizeEffectSwitch.set_active(settingsData.RESIZE_EFFECT.get());

                this.applyVisibleEffect(fields, false);
            });

            header.pack_start(resetButton);
        }

        this.applyVisibleEffect(fields, settingsData.PRESET.get() === 'P');
    }

    newResetButton() {
        const button = new Gtk.Button({vexpand: true, valign: Gtk.Align.END});
        button.set_icon_name('edit-clear');
        return button;
    }

    addPresetComboBox(settingsData, presets) {
        let gtkComboBoxText = new Gtk.ComboBoxText({hexpand: true, halign: Gtk.Align.END});
        gtkComboBoxText.set_valign(Gtk.Align.CENTER);

        let activeIndex = 0;
        let activeValue = settingsData.PRESET.get();

        for (let i = 0; i < presets.length; i++) {
            gtkComboBoxText.append_text(presets[i].label);
            if (activeValue && activeValue == presets[i].code) {
                activeIndex = i;
            }
        }

        gtkComboBoxText.set_active(activeIndex);
        return gtkComboBoxText;
    }

    newRow(labelText, field) {
        const row = Adw.ActionRow.new();
        row.set_title(labelText);
        row.add_suffix(field);
        return row;
    }
    
    newSlider(settingsData, lower, upper, decimalDigits) {
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

        return scale;
    }
    
    newBooleanSwitch(settingsData) {
        const gtkSwitch = new Gtk.Switch({hexpand: true, halign: Gtk.Align.END});
        gtkSwitch.set_active(settingsData.get());
        gtkSwitch.set_valign(Gtk.Align.CENTER);
        gtkSwitch.connect('state-set', (sw) => {
            var newval = sw.get_active();
            if (newval != settingsData.get()) {
                settingsData.set(newval);
            }
        });
        
        return gtkSwitch;
    }

    applyVisibleEffect(fields, visible) {
        fields.frictionSlider.get_parent().get_parent().get_parent().set_visible(visible);
        fields.springKSlider.get_parent().get_parent().get_parent().set_visible(visible);
        fields.speedupFactor.get_parent().get_parent().get_parent().set_visible(visible);
        fields.massSlider.get_parent().get_parent().get_parent().set_visible(visible);
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
