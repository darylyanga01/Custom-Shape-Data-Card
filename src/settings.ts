/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

"use strict";

import { FormattingSettingsService, formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
import { forceManyBody } from "d3";

export class CircleSettings extends FormattingSettingsCard {
    public shape = new formattingSettings.AutoDropdown({
        name: "shape",
        displayName: "Shape",
        value: "Circle",
        visible: true
    });

    public circleColor = new formattingSettings.ColorPicker({
        name: "circleColor",
        displayName: "Color",
        value: { value: "#ffffff" },
        visible: true
    });

    public circleThickness = new formattingSettings.NumUpDown({
        name: "circleThickness",
        displayName: "Thickness",
        value: 2,
        visible: true
    });

    public circleBorderColor = new formattingSettings.ColorPicker({
        name: "circleBorderColor",
        displayName: "Border Color",
        value: { value: "#ffffff" },
        visible: true
    });

    public name: string = "circle";
    public displayName: string = "Circle Settings";
    public visible: boolean = true;
    public slices: FormattingSettingsSlice[] = [this.shape, this.circleColor, this.circleThickness, this.circleBorderColor]
}

export class CallOutValueSettings extends FormattingSettingsCard {
    public fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        displayName: "Font",
        value: "wf_standard-font, helvetica, arial, sans-serif",
        visible: true
    });

    public fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Font Size",
        value: 24,
        visible: true
    });

    public fontColor = new formattingSettings.ColorPicker({
        name: "fontColor",
        displayName: "Font Color",
        value: { value: "#000000" },
        visible: true
    });

    public fontBold = new formattingSettings.ToggleSwitch({
        name: "fontBold",
        displayName: "Bold",
        value: false,
        visible: true
    });

    public fontItalic = new formattingSettings.ToggleSwitch({
        name: "fontItalic",
        displayName: "Italic",
        value: false,
        visible: true
    });

    public fontUnderline = new formattingSettings.ToggleSwitch({
        name: "fontUnderline",
        displayName: "Italic",
        value: false,
        visible: true
    });

    public lineAlignment = new formattingSettings.AlignmentGroup({
        name: "lineAlignment",
        displayName: "Line Alignment",
        value: "center",
        visible: true,
        mode: powerbi.visuals.AlignmentGroupMode.Horizonal
    });

    public displayUnitsProperty = new formattingSettings.AutoDropdown({
        name: "displayUnitsProperty",
        displayName: "Display Units",
        value: 0,
        visible: true
    });

    public decimalPlaces = new formattingSettings.NumUpDown({
        name: "decimalPlaces",
        displayName: "Decimal Places",
        value: 0,
        visible: true
    });

    public specialSymbol = new formattingSettings.TextInput({
        name: "specialSymbol",
        displayName: "Special Symbol",
        placeholder: "Enter Symbol",
        value: "",
        visible: true
    });

    public name: string = "calloutValue";
    public displayName: string = "Callout Value";
    public visible: boolean = true;
    public slices: FormattingSettingsSlice[] = [this.fontFamily, this.fontSize, this.fontColor, this.fontBold, this.fontItalic, this.fontUnderline, this.lineAlignment, this.displayUnitsProperty, this.decimalPlaces, this.specialSymbol]
}

export class CallOutLabelSettings extends FormattingSettingsCard {
    public labelText = new formattingSettings.TextInput({
        name: "labelText",
        displayName: "Text",
        placeholder: "Enter Text",
        value: "",
        visible: true
    });

    public fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        displayName: "Font",
        value: "wf_standard-font, helvetica, arial, sans-serif",
        visible: true
    });

    public fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Font Size",
        value: 12,
        visible: true
    });

    public fontColor = new formattingSettings.ColorPicker({
        name: "fontColor",
        displayName: "Font Color",
        value: { value: "#000000" },
        visible: true
    });

    public fontBold = new formattingSettings.ToggleSwitch({
        name: "fontBold",
        displayName: "Bold",
        value: false,
        visible: true
    });

    public fontItalic = new formattingSettings.ToggleSwitch({
        name: "fontItalic",
        displayName: "Italic",
        value: false,
        visible: true
    });

    public fontUnderline = new formattingSettings.ToggleSwitch({
        name: "fontUnderline",
        displayName: "Italic",
        value: false,
        visible: true
    });

    public lineAlignment = new formattingSettings.AlignmentGroup({
        name: "lineAlignment",
        displayName: "Line Alignment",
        value: "center",
        visible: true,
        mode: powerbi.visuals.AlignmentGroupMode.Horizonal
    });

    public name: string = "calloutLabel";
    public displayName: string = "Callout Label";
    public visible: boolean = true;
    public slices: FormattingSettingsSlice[] = [this.labelText, this.fontFamily, this.fontSize, this.fontColor, this.fontBold, this.fontItalic, this.fontUnderline, this.lineAlignment]
}

    
export class VisualSettings extends FormattingSettingsModel {
    public circle: CircleSettings = new CircleSettings();
    public calloutValue: CallOutValueSettings = new CallOutValueSettings();
    public calloutLabel: CallOutLabelSettings = new CallOutLabelSettings();

    public cards: FormattingSettingsCard[] = [this.circle, this.calloutValue, this.calloutLabel];    
}
