/*
*  Power BI Visual CLI
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

import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualTooltipDateItem = powerbi.extensibility.VisualTooltipDataItem;
import VisualTooltipService = powerbi.extensibility.ITooltipService;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;
import IVisualHost = powerbi.extensibility.IVisualHost;
import * as d3 from "d3";
import { VisualSettings } from "./settings";
import { FormattingSettingsService, formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { IValueFormatter } from "powerbi-visuals-utils-formattingutils/lib/src/valueFormatter";
import { createTooltipServiceWrapper, ITooltipServiceWrapper, TooltipServiceWrapper, TooltipEnabledDataPoint, TooltipEventArgs } from "powerbi-visuals-utils-tooltiputils";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

export class Visual implements IVisual {
    private host: IVisualHost;
    private element: HTMLElement;
    private svg: Selection<SVGElement>; 
    private container: Selection<SVGElement>;
    private svgShape: Selection<SVGElement>;
    private textValue: Selection<SVGElement>;
    private textLabel: Selection<SVGElement>;
    private padding: number = 20;
    private visualSettings: VisualSettings;
    private valueFormatter: IValueFormatter;
    private formattingSettingsService: FormattingSettingsService;
    private tooltipServiceWrapper: ITooltipServiceWrapper;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.element = options.element;
        this.formattingSettingsService = new FormattingSettingsService();        
        this.svg = d3.select(options.element)
            .append('svg')
            .classed('circleCard', true);
        this.container = this.svg.append("g")
            .classed('container', true);
        this.svgShape = this.container.append("circle")
            .classed('circle', true);
        this.textValue = this.container.append("text")
            .classed("textValue", true);
        this.textLabel = this.container.append("text")
            .classed("textLabel", true);

        // this.tooltipServiceWrapper = createTooltipServiceWrapper(
        //     options.host.tooltipService, options.element);

        // this.tooltipServiceWrapper.addTooltip(this.circle, (tooltipEvent: TooltipEventArgs<TooltipEnabledDataPoint>) =>{
        //     return tooltipEvent.data.tooltipInfo;
        // });
    }

    public update(options: VisualUpdateOptions) {
        let dataView: DataView = options.dataViews[0];
        let width: number = options.viewport.width;
        let height: number = options.viewport.height;
        this.svg.attr("width", width);
        this.svg.attr("height", height);

        this.visualSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualSettings, options.dataViews[0]);
        this.visualSettings.circle.circleThickness.value = Math.max(0, this.visualSettings.circle.circleThickness.value);
        this.visualSettings.circle.circleThickness.value = Math.min(10, this.visualSettings.circle.circleThickness.value);
        
        //Shape format
        //Determine the shape and format accordingly.
        let shape: string = <string>this.visualSettings.circle.shape.value;
        let radius: number = 0;

        switch(shape){
            case "Circle":
                this.svgShape.remove();
                this.svgShape = this.container.append("circle")
                    .classed('cirlce', true);
                radius = Math.min(width, height) / 2.2;
                this.svgShape
                    .style("fill", this.visualSettings.circle.circleColor.value.value)
                    .style("fill-opacity", 0.5)
                    .style("stroke", this.visualSettings.circle.circleBorderColor.value.value)
                    .style("stroke-width", this.visualSettings.circle.circleThickness.value)   
                this.svgShape
                    .attr("r", radius)
                    .attr("cx", width / 2)
                    .attr("cy", height / 2);   
                break;
            case "Ellipse":
                this.svgShape.remove();
                this.svgShape = this.container.append("ellipse")
                    .classed('ellipse', true);
                this.svgShape
                    .style("fill", this.visualSettings.circle.circleColor.value.value)
                    .style("fill-opacity", 0.5)
                    .style("stroke", this.visualSettings.circle.circleBorderColor.value.value)
                    .style("stroke-width", this.visualSettings.circle.circleThickness.value)   
                this.svgShape
                    .attr("rx", width * 0.4)
                    .attr("ry", height * 0.4)
                    .attr("cx", width / 2)
                    .attr("cy", height / 2);               
                break;
            case "Pill":
                this.svgShape.remove();
                this.svgShape = this.container.append("rect")
                    .classed('rect', true);
                this.svgShape
                    .style("fill", this.visualSettings.circle.circleColor.value.value)
                    .style("fill-opacity", 0.5)
                    .style("stroke", this.visualSettings.circle.circleBorderColor.value.value)
                    .style("stroke-width", this.visualSettings.circle.circleThickness.value)   
                this.svgShape
                    .attr("x", width * 0.05)
                    .attr("y", height * 0.05)
                    .attr("width", width * 0.9)
                    .attr("height", height * 0.9)
                    .attr("rx", 100)
                    .attr("ry", 100);               
                break;
            default:
                break;
        };

        //Callout Value format
        let fontSizeValue: number = Math.min(width, height) / 5;
        let dataValue: number = +dataView.single.value;
        const formatter: IValueFormatter = valueFormatter.create({
            value: this.visualSettings.calloutValue.displayUnitsProperty.value !== 0
                ? this.visualSettings.calloutValue.displayUnitsProperty.value
                : dataValue.toFixed(this.visualSettings.calloutValue.decimalPlaces.value) ,
            precision: this.visualSettings.calloutValue.decimalPlaces.value,
            cultureSelector: "en-US"
        });
        let dataValueText: string = formatter.format(dataValue.toFixed(this.visualSettings.calloutValue.decimalPlaces.value));

        //Determine if value is bold, italic and/or underlined
        let boldValue: string = this.visualSettings.calloutValue.fontBold.value == true ? "bold" : "normal";
        let italicValue: string = this.visualSettings.calloutValue.fontItalic.value == true ? "italic" : "normal";
        let underlineValue: string = this.visualSettings.calloutValue.fontUnderline.value == true ? "underline" : "none";

        //Determine value text alignment
        let valueAlign : string = "";
        switch(this.visualSettings.calloutValue.lineAlignment.value){
            case "left":
                valueAlign = "end";
                break;
            case "right":
                valueAlign = "start";
                break;
            default:
                valueAlign = "middle";
                break;
        };

        //Determine if there is special symbol with data value
        let dataValueDisplay: string = "";
        let symbolValue : string = this.visualSettings.calloutValue.specialSymbol.value;
        switch(symbolValue){
            case "%":
                dataValueDisplay = dataValueText + symbolValue;
                break;
            default:
                dataValueDisplay = symbolValue + dataValueText;
                break;
        }

        this.textValue
            .text(<string> dataValueDisplay)
            .attr("x", "50%")
            .attr("y", "50%")
            .attr("dy", "0.35em")
            .attr("text-anchor", valueAlign)
            //.style("font-size", fontSizeValue + "px") //--> Replaced with variable value based on visual settings
            .style("font-size", this.visualSettings.calloutValue.fontSize.value + "px")
            .style("font-family", this.visualSettings.calloutValue.fontFamily.value)
            .style("fill", this.visualSettings.calloutValue.fontColor.value.value)
            .style("font-weight", boldValue)
            .style("font-style", italicValue)
            .style("text-decoration", underlineValue)
            ;
               
        //Callout Label format
        let fontSizeLabel: number = fontSizeValue / 4;
        let dataLabel : string = this.visualSettings.calloutLabel.labelText.value !== ""
            ? this.visualSettings.calloutLabel.labelText.value
            : dataView.metadata.columns[0].displayName;

        //Determine if label is bold, italic and/or underlined
        let boldLabel: string = this.visualSettings.calloutLabel.fontBold.value == true ? "bold" : "normal";
        let italicLabel: string = this.visualSettings.calloutLabel.fontItalic.value == true ? "italic" : "normal";
        let underlineLabel: string = this.visualSettings.calloutLabel.fontUnderline.value == true ? "underline" : "none";

        //Determine label text alignment
        let labellAlign : string = "";
        switch(this.visualSettings.calloutLabel.lineAlignment.value){
            case "left":
                labellAlign = "end";
                break;
            case "right":
                labellAlign = "start";
                break;
            default:
                labellAlign = "middle";
                break;
        };

        this.textLabel
            .text(dataLabel)
            .attr("x", "50%")
            .attr("y", height / 2)
            .attr("dy", fontSizeValue / 1.2)
            .attr("text-anchor", labellAlign)
            // //.style("font-size", fontSizeLabel + "px"); //--> Replaced with variable value based on visual settings
            .style("font-size", this.visualSettings.calloutLabel.fontSize.value + "px")
            .style("font-family", this.visualSettings.calloutLabel.fontFamily.value)
            .style("fill", this.visualSettings.calloutLabel.fontColor.value.value)
            .style("font-weight", boldLabel)
            .style("font-style", italicLabel)
            .style("text-decoration", underlineLabel)
            ;
    }

    //Add composite slice model
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        //Building circle settings card
        let circleSettings: powerbi.visuals.FormattingCard  = {
            description: "Shape Settings",
            displayName: "Shape Settings",
            uid: "circleSettings_uid",
            groups: []           
        }

        let circleControl: powerbi.visuals.FormattingGroup = {
            uid: "circleControl",
            description: "Circle Control",
            displayName: "",
            slices: [
                {
                    displayName: "Shape",
                    uid: "circleControl_Shape_uid",
                    control: {
                        type: powerbi.visuals.FormattingComponent.Dropdown,
                        properties: {
                            descriptor: {
                                objectName: "circle",
                                propertyName: "shape"
                            },
                            value: this.visualSettings.circle.shape.value
                        }
                    }
                },
                {
                    displayName: "Color",
                    uid: "circleControl_Color_uid",
                    control : {
                        type: "ColorPicker",
                        properties: {
                            descriptor:
                            {
                                objectName: "circle",
                                propertyName: "circleColor"
                            },
                            value: { value: this.visualSettings.circle.circleColor.value.value }
                        }                     
                    }
                },
                {
                    displayName: "Border Thickness",
                    uid: "circleControl_thickness_uid",
                    control : {
                        type: "NumUpDown",
                        properties: {
                            descriptor: {
                                objectName: "circle",
                                propertyName:"circleThickness"
                            },
                            value: this.visualSettings.circle.circleThickness.value
                        }                   
                    }
                },
                {
                    displayName: "Border Color",
                    uid: "circleControl_borderColor_uid",
                    control : {
                        type: "ColorPicker",
                        properties: {
                            descriptor: {
                                objectName: "circle",
                                propertyName:"circleBorderColor"
                            },
                            value: { value: this.visualSettings.circle.circleBorderColor.value.value }
                        }                   
                    }
                }                 
            ]
        }

        // Add circle formatting groups to circle settings
        circleSettings.groups.push(circleControl);        
        
        // Building callout card group
        let callout: powerbi.visuals.FormattingCard = {
            description: "Callout Settings",
            displayName: "Callout",
            uid: "callout_uid",
            groups: []
        }

        // Building formatting group "Callout Value"
        let calloutValue: powerbi.visuals.FormattingGroup = {
            displayName: "Callout Value",
            uid: "calloutValue_group_uid",
            slices: [
                // FontControl slice is composite slice, It means it contain multiple properties inside it
                {
                    uid: "calloutValue_font_control_slice_uid",
                    displayName: "Font",
                    control: {
                        type: powerbi.visuals.FormattingComponent.FontControl,
                        properties: {
                            fontFamily: {
                                descriptor: {
                                    objectName: "calloutValue",
                                    propertyName: "fontFamily"
                                },
                                value: this.visualSettings.calloutValue.fontFamily.value
                            },
                            fontSize: {
                                descriptor: {
                                    objectName: "calloutValue",
                                    propertyName: "fontSize"
                                },
                                value: this.visualSettings.calloutValue.fontSize.value
                            },
                            bold: {
                                descriptor: {
                                    objectName: "calloutValue",
                                    propertyName: "fontBold"
                                },
                                value: this.visualSettings.calloutValue.fontBold.value
                            },
                            italic: {
                                descriptor: {
                                    objectName: "calloutValue",
                                    propertyName: "fontItalic"
                                },
                                value: this.visualSettings.calloutValue.fontItalic.value
                            },
                            underline: {
                                descriptor: {
                                    objectName: "calloutValue",
                                    propertyName: "fontUnderline"
                                },
                                value: this.visualSettings.calloutValue.fontUnderline.value
                            }
                        }
                    }
                },
                // Adding ColorPicker simple slice for font color
                {
                    displayName: "Color",
                    uid: "calloutValue_fontColor_slice",
                    control: {
                        type: powerbi.visuals.FormattingComponent.ColorPicker,
                        properties: {
                            descriptor:
                            {
                                objectName: "calloutValue",
                                propertyName: "fontColor"
                            },
                            value: { value: this.visualSettings.calloutValue.fontColor.value.value }
                        }
                    }
                },
                // Adding AlignmentGroup simple slice for line alignment
                {
                    displayName: "Line Alignment",
                    uid: "calloutValue_lineAlignment_slice",
                    control: {
                        type: powerbi.visuals.FormattingComponent.AlignmentGroup,
                        properties: {
                            descriptor:
                            {
                                objectName: "calloutValue",
                                propertyName: "lineAlignment"
                            },
                            mode: powerbi.visuals.AlignmentGroupMode.Horizonal,
                            value: this.visualSettings.calloutValue.lineAlignment.value
                        }
                    }
                },
                {
                    uid: "calloutValue_displayUnits_uid",
                    displayName:"Display Units",
                    control: {
                        type: powerbi.visuals.FormattingComponent.Dropdown,
                        properties: {
                            descriptor: {
                                objectName: "calloutValue",
                                propertyName:"displayUnitsProperty"
                            },
                            value: this.visualSettings.calloutValue.displayUnitsProperty.value
                        }
                    }
                },
                {
                    uid: "calloutValue_decimalPlaces_uid",
                    displayName:"Decimal Places",
                    control: {
                        type: powerbi.visuals.FormattingComponent.NumUpDown,
                        properties: {
                            descriptor: {
                                objectName: "calloutValue",
                                propertyName:"decimalPlaces"
                            },
                            value: this.visualSettings.calloutValue.decimalPlaces.value
                        }
                    }
                },
                {
                    uid: "calloutValue_specialSymbol_uid",
                    displayName: "Special Symbol",
                    control : {
                        type: powerbi.visuals.FormattingComponent.TextInput,
                        properties: {
                            descriptor: {
                                objectName: "calloutValue",
                                propertyName:"specialSymbol"
                            },
                            placeholder: "Enter Symbol",
                            value: this.visualSettings.calloutValue.specialSymbol.value
                        }                   
                    }
                }
            ]
        };

        // Building formatting group "Callout Label"
        let calloutLabel: powerbi.visuals.FormattingGroup = {
            displayName: "Callout Label",
            uid: "calloutLabel_group_uid",
            slices: [
                {
                    uid: "calloutLabel_labelText_uid",
                    displayName: "Text",
                    control : {
                        type: powerbi.visuals.FormattingComponent.TextInput,
                        properties: {
                            descriptor: {
                                objectName: "calloutLabel",
                                propertyName:"labelText"
                            },
                            placeholder: "Enter Text",
                            value: this.visualSettings.calloutLabel.labelText.value
                        }                   
                    }
                },
                // FontControl slice is composite slice, It means it contain multiple properties inside it
                {
                    uid: "calloutLabel_font_control_slice_uid",
                    displayName: "Font",
                    control: {
                        type: powerbi.visuals.FormattingComponent.FontControl,
                        properties: {
                            fontFamily: {
                                descriptor: {
                                    objectName: "calloutLabel",
                                    propertyName: "fontFamily"
                                },
                                value: this.visualSettings.calloutLabel.fontFamily.value
                            },
                            fontSize: {
                                descriptor: {
                                    objectName: "calloutLabel",
                                    propertyName: "fontSize"
                                },
                                value: this.visualSettings.calloutLabel.fontSize.value
                            },
                            bold: {
                                descriptor: {
                                    objectName: "calloutLabel",
                                    propertyName: "fontBold"
                                },
                                value: this.visualSettings.calloutLabel.fontBold.value
                            },
                            italic: {
                                descriptor: {
                                    objectName: "calloutLabel",
                                    propertyName: "fontItalic"
                                },
                                value: this.visualSettings.calloutLabel.fontItalic.value
                            },
                            underline: {
                                descriptor: {
                                    objectName: "calloutLabel",
                                    propertyName: "fontUnderline"
                                },
                                value: this.visualSettings.calloutLabel.fontUnderline.value
                            }
                        }
                    }
                },
                // Adding ColorPicker simple slice for font color
                {
                    displayName: "Color",
                    uid: "calloutLabel_fontColor_slice",
                    control: {
                        type: powerbi.visuals.FormattingComponent.ColorPicker,
                        properties: {
                            descriptor:
                            {
                                objectName: "calloutLabel",
                                propertyName: "fontColor"
                            },
                            value: { value: this.visualSettings.calloutLabel.fontColor.value.value }
                        }
                    }
                },
                // Adding AlignmentGroup simple slice for line alignment
                {
                    displayName: "Line Alignment",
                    uid: "calloutLabel_lineAlignment_slice",
                    control: {
                        type: powerbi.visuals.FormattingComponent.AlignmentGroup,
                        properties: {
                            descriptor:
                            {
                                objectName: "calloutLabel",
                                propertyName: "lineAlignment"
                            },
                            mode: powerbi.visuals.AlignmentGroupMode.Horizonal,
                            value: this.visualSettings.calloutLabel.lineAlignment.value
                        }
                    }
                }
            ],
        };

        // Add formatting groups to data card
        callout.groups.push(calloutValue);
        callout.groups.push(calloutLabel);

        // Build and return formatting model with data card
        const formattingModel: powerbi.visuals.FormattingModel = { cards: [circleSettings, callout] };
        return formattingModel;
    }
}
