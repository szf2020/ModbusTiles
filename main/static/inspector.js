import { serverCache, refreshData, postServer } from "./global.js";
/** @import { InspectorFieldDefinition, ChoiceObject, DataType, TagListObject, ChannelType } from "./types.js" */
/** @import { Widget } from "./widgets.js" */
/** @import { Dashboard } from "./dashboard.js" */

/**
 * Manages a form to edit widgets and dashboards, or create tags and alarms
 */
export class Inspector {
    /**
     * @param {HTMLElement} container 
     */
    constructor(container) {
        /**@type {HTMLElement} The element used to display the form */
        this.container = container;
    }

    /**
     * @param {DataType} dataType 
     * @returns The relevant form type from a Tag's datatype
     */
    static getFieldType(dataType) {
        if(dataType === "bool") 
            return "bool";
        else if(["int16", "uint16", "int32", "uint32", "int64"].includes(dataType)) 
            return "int";
        else if(["float32", "float64"].includes(dataType)) 
            return "number";
        else
            return "text";
    }

    /**
     * @param {TagListObject} tag
     * @returns The string used for this tag in a dropdown
     */
    static getTagLabel(tag) {
        const bit = tag.bit_index !== null ? ":" + tag.bit_index : "";
        return `${tag.alias} (${tag.channel} ${tag.address}${bit})`;
    }

    clear() {
        this.container.innerHTML = '';
    }

    /**
     * @param {string} text 
     */
    addTitle(text) {
        const title = document.createElement('p');
        title.innerText = text;
        title.className = "form-title";
        this.container.appendChild(title);
        return title;
    }

    /**
     * @param {string} title 
     */
    addSection(title) {
        const box = document.createElement('div');
        box.className = "form-box";
        box.innerText = title ? title : "";
        this.container.appendChild(box);
        return box;
    }

    /**
     * @param {string} title 
     * @param {()} callback 
     * @param {*} section 
     */
    addButton(title, callback, section) {
        const btn = document.createElement('button');
        btn.innerText = title ? title : "";
        btn.classList.add("form-button");
        btn.onclick = callback;
        if(!section)
            section = this.container;
        section.appendChild(btn);
        return btn;
    }

    /**
     * @param {InspectorFieldDefinition} def 
     * @param {*} currentValue 
     * @param {(val: *)} onChange 
     * @param {HTMLElement} section 
     */
    addField(def, currentValue, onChange, section) { // TODO add uint, restrict float input for int fields?
        const wrapper = document.createElement('div');
        wrapper.className = "input-group";

        const label = document.createElement('label');
        label.innerText = def.label || def.name;
        label.className = "form-label";
        if(def.description)
            label.title = def.description;

        let input = null;

        if(def.type === "select")
            input = document.createElement("select");
        else {
            input = document.createElement("input");
            input.value = currentValue; //TODO check type compatibility?
        }
        input.classList.add("form-input");

        /**
         * Get the latest value from the field input
         * @returns {*}
         */
        let getValue = () => {return null};

        // Add input based on value type
        switch (def.type) {
            case "bool":
                input.type = 'checkbox';
                input.checked = currentValue;
                input.classList.add("bool");
                label.classList.add("bool");
                getValue = () => { return input.checked };
                break;
            
            case "select":
                const defaultOpt = document.createElement('option');
                defaultOpt.text = "Select";
                defaultOpt.value = "";
                input.appendChild(defaultOpt);

                if (def.options) {
                    def.options.forEach(opt => {
                        const el = document.createElement('option');
                        el.value = opt.value;
                        el.text = opt.label;
                        if(opt.value === currentValue)
                            el.selected = true;
                        input.appendChild(el);
                    });
                }
                getValue = () => { return input.value };
                break;

            case "enum":
                input = document.createElement('div');
                const rows = document.createElement('div');

                // Get choices from the form
                getValue = () => {
                    const real_kvs = [];
                    Array.from(rows.children).forEach(row => {
                        real_kvs.push({
                            label: row.key_input.value,
                            value: row.value_input.value
                        });
                    });
                    return real_kvs;
                }

                /**
                 * Create a row for label, value, and minus button
                 * @param {string} k 
                 * @param {*} v 
                 */
                const createKv = (k, v) => { //TODO fix spacing/styles
                    const row = document.createElement('div');
                    row.style.display = "flex";
                    
                    // Label input
                    const key_input = document.createElement("input");
                    key_input.type = "text";
                    key_input.value = k;
                    key_input.placeholder = "Name";
                    key_input.classList.add("form-input");
                    key_input.addEventListener("change", () => { onChange(getValue()) })
                    row.appendChild(key_input);

                    // Value input
                    const value_input = document.createElement("input");
                    value_input.type = "number";
                    value_input.value = v;
                    value_input.placeholder = "Value";
                    value_input.classList.add("form-input");
                    value_input.addEventListener("change", () => { onChange(getValue()) })
                    row.appendChild(value_input);

                    // Save inputs with the row
                    row.value_input = value_input;
                    row.key_input = key_input;

                    const sub_button = document.createElement("button");
                    sub_button.innerText = "-";
                    sub_button.classList.add("form-input");
                    sub_button.addEventListener("click", () => {
                        row.remove();
                        onChange(getValue());
                    })
                    row.appendChild(sub_button);

                    rows.appendChild(row);
                }

                // Add saved choices
                currentValue.forEach(real_kv => {
                    createKv(real_kv.label, real_kv.value);
                });

                input.appendChild(rows);

                // Add plus button
                const add_button = document.createElement("button");
                add_button.innerText = "+";
                add_button.classList.add("form-input");
                add_button.addEventListener("click", () => {
                    createKv("", "");
                    onChange(getValue());
                });
                input.appendChild(add_button);

                break;

            case "color":
                getValue = () => {return input.value};
                input.type = "color";
                break;

            case "int":
                getValue = () => { return parseInt(input.value) };
                input.type = "number";
                break;
            
            case "float":
                getValue = () => { return parseFloat(input.value) };
                input.type = "number";
                break;

            case "number":
                getValue = () => { return input.value === "" ? 0 : Number(input.value) };
                input.type = "number";
                break;

            default:
                getValue = () => { return input.value };
                input.type = 'text';
                break;
        }
        
        // On value change callback
        if (onChange) {
            input.addEventListener('change', (e) => {
                onChange(getValue());
            });
        }

        // Add to document
        label.appendChild(input);
        wrapper.appendChild(label);

        if(!section)
            section = this.container;
        section.appendChild(wrapper);

        return { wrapper, getValue };
    }

    /**
     * Populate the form with properties of a given widget
     * @param {Widget} widget 
     */
    inspectWidget(widget) {
        /** @type {typeof Widget} */
        const widgetClass = widget.constructor;

        this.clear();
        this.addTitle(widget.gridElem.title);

        /**
         * Helper to add widget config related fields
         * @param {InspectorFieldDefinition} field 
         * @param {HTMLElement} section 
         */
        const createConfigField = (field, section) => {
            this.addField(field, widget.config[field.name], (newVal) => {
                widget.config[field.name] = newVal;
                widget.applyConfig(); // Visual update
            }, section);
        }

        if(widgetClass.allowedChannels.length > 0) {
            const tagSection = this.addSection();
            const tagTypedFieldsContainer = document.createElement('div');

            /**
             * Helper to create tag-dependent fields
             * @param {TagListObject} tag 
             */
            const createTagTypedFields = (tag) => {
                tagTypedFieldsContainer.innerHTML = "";

                if(!tag || widgetClass.tagTypedFields.length === 0)
                    return;
                
                // Add new inputs
                const newFieldType = Inspector.getFieldType(tag.data_type);
                
                widgetClass.tagTypedFields.forEach(field => {
                    createConfigField({ ...field, "type": newFieldType }, tagTypedFieldsContainer);
                });
            }

            // Create dropdown with tags that are compatible with this widget
            const compatibleTags = serverCache.tags.filter(tag => {
                return widgetClass.allowedTypes.includes(tag.data_type) 
                    && widgetClass.allowedChannels.includes(tag.channel);
            });
            const tagOptions = compatibleTags.map(tag => ({ value: tag.external_id, label: Inspector.getTagLabel(tag) }));

            this.addField({ label: "Control Tag", type: "select", options: tagOptions }, widget.tag?.external_id, (newVal) => {
                widget.tag = compatibleTags.find(tag => tag.external_id === newVal);
                widget.applyConfig();
                createTagTypedFields(newVal); // Update the tag based fields
            }, tagSection);
            
            // Add tag-dependent fields
            createTagTypedFields(widget.tag);
            tagSection.appendChild(tagTypedFieldsContainer);
        }

        // Add rest of fields
        const customFieldsSection = this.addSection();
        widgetClass.customFields.forEach(field => { createConfigField(field, customFieldsSection) });

        const defaultFieldsSection = this.addSection();
        widgetClass.defaultFields.forEach(field => { createConfigField(field, defaultFieldsSection) });
    }

    /**
     * Populate the form with properties of a given dashboard
     * @param {Dashboard} dashboard 
     */
    inspectDashboard(dashboard) { 
        this.clear();
        const title = this.addTitle(dashboard.alias);
        const dashboardSection = this.addSection();

        this.addField({ label: "Dashboard Name", type: "text" }, dashboard.newAlias, (value) => {dashboard.newAlias = value}, dashboardSection);
        this.addField({ label: "Description", type: "text" }, dashboard.description, (value) => {dashboard.description = value}, dashboardSection);

        const dashboardPropertiesSection = this.addSection();

        this.addField({ label: "Columns", type: "int" }, dashboard.canvasGridStack.getColumn(), (value) => {
            dashboard.setColumnCount(value);
        }, dashboardPropertiesSection);

        const saveSection = this.addSection();

        this.addButton("Save Dashboard", () => {
            dashboard.save();
        }, saveSection);

        const ioSection = this.addSection();

        this.addButton("Import", () => {
            dashboard.fileInput.click();
        }, ioSection);

        this.addButton("Export", () => {
            dashboard.exportFile();
        }, ioSection);
    }

    /**
     * Populate with globally reaching form
     */
    inspectGlobal() {
        this.clear();
        this._formCreateTag();
        this._formCreateAlarm();
    }

    _formCreateTag() {
        this.addTitle("New Tag");

        const tagSection = this.addSection();
        const alias = this.addField({ label: "Tag Name", type: "text" }, "", null, tagSection);
        const description = this.addField({ label: "Description (optional)", type: "text" }, "", null, tagSection)

        const locationSection = this.addSection();
        const deviceOptions = serverCache.devices.map(d => ({ value: d.alias, label: d.alias }));
        const device = this.addField({ label: "Device", type: "select", options: deviceOptions }, "", null, locationSection);
        const bitIndex = this.addField({ label: "Bit Index (0-15)", type: "int" }, 0, null, locationSection);

        // Dynamic data type field - update according to channel type
        const dataTypeContainer = document.createElement('div');
        let getDataTypeValue = () => { return null };

        /**
         * Update the data types and bit index field if channel changes
         * @param {ChannelType} channelValue 
         */
        const onChannelChanged = (channelValue) => {
            dataTypeContainer.innerHTML = '';
            let dataTypeOptions = serverCache.tagOptions.data_types;
            let dataTypeValue = getDataTypeValue();

            // Only show data types that are compatible with the selected channel
            if(!channelValue)
                dataTypeOptions = [];
            else if(["coil", "di"].includes(channelValue)) {
                dataTypeOptions = dataTypeOptions.filter(t => {return t.value === 'bool'});
                dataTypeValue = "bool";
            }

            /**
             * Include the bit index field if it's a boolean value on holding/input registers
             *  @param {DataType} dataTypeValue
             */ 
            const onDataTypeChanged = (dataTypeValue) => {
                if (dataTypeValue === "bool" && ["hr", "ir"].includes(channelValue))
                    bitIndex.wrapper.classList.remove("hidden");
                else
                    bitIndex.wrapper.classList.add("hidden");
            }
            onDataTypeChanged(dataTypeValue);

            const newField = this.addField({ label: "Data Type", type: "select", options: dataTypeOptions }, dataTypeValue, onDataTypeChanged, dataTypeContainer);
            getDataTypeValue = newField.getValue;
        }
        
        const channelOptions = serverCache.tagOptions.channels.map(o => ({ value: o.value, label: o.label }));
        const channel = this.addField({ label: "Channel", type: "select", options: channelOptions }, "", onChannelChanged, locationSection);
        onChannelChanged() // Add data type field
        locationSection.appendChild(dataTypeContainer);
        const address = this.addField({ label: "Address", type: "int", 
                description: "The starting address of the value to read or write. 0-indexed." }, 
            0, null, locationSection);

        locationSection.appendChild(bitIndex.wrapper); // Move bit index field

        //const readAmount = this.addField({label: "Read Amount", type: "int"}, 1, null, tagSection)
        const historySection = this.addSection();
        const historyRetention = this.addField({ label: "History Retention (Seconds)", type: "int", 
                description: "The maximum age of this tag's history entries. Use 0 for no history" },
            0, null, historySection
        );
        const historyInterval = this.addField({ label: "History Write Interval (Seconds)", type: "int", 
                description: "How long the server should wait before creating a new history entry. Use 0 for highest detail"}, 
            1, null, historySection
        );
        
        /**
         * Post tag configuration to the server
         */
        const tagSubmit = async () => {
            const payload = {
                alias: alias.getValue(),
                description: description.getValue(),
                device: device.getValue(),
                address: address.getValue(),
                channel: channel.getValue(),
                bit_index: bitIndex.wrapper.classList.contains("hidden") ? null : bitIndex.getValue(),
                data_type: getDataTypeValue(),
                unit_id: 1,
                //read_amount: readAmount.getValue(),
                read_amount: 1,
                history_retention: historyRetention.getValue(),
                history_interval: historyInterval.getValue(),
                is_active: true
            };

            const ok = await postServer('/api/tags/', payload, (data) => {
                alert("Tag Created!");
                refreshData();
            });
        };
        const createSection = this.addSection();
        this.addButton("Create Tag", tagSubmit, createSection);
    }

    _formCreateAlarm() {
        this.addTitle("New Alarm");
        const alarmSection = this.addSection();
        const alias = this.addField({ label: "Alarm Name", type: "text" }, "", null, alarmSection);

        const triggerContainer = document.createElement('div'); 
        const operatorContainer = document.createElement('div');
        let getTriggerValue = () => null;
        let getOperatorValue = () => null;

        /**
         * Update trigger value and operator field according to selected tag datatype
         * @param {string} tagID 
         */
        const onTagChanged = (tagID) => {
            triggerContainer.innerHTML = ''; 
            operatorContainer.innerHTML = '';
            
            const tag = serverCache.tags.find(tag => tag.external_id === tagID);

            if(!tag)
                return;

            // Show choices for trigger operator
            let operatorChoices = serverCache.alarmOptions.operator_choices;
            if(tag.data_type === "bool") 
                operatorChoices = operatorChoices.filter(t => { return t.value === "equals" });

            // Create an input with the same value type as the selected tag
            const fieldType = Inspector.getFieldType(tag.data_type);

            const newOperatorField = this.addField({ label: "Operator", type: "select", options: operatorChoices}, "equals", null, operatorContainer);
            const newTriggerField = this.addField({ label: "Trigger Value", type: fieldType, 
                    description: "The value to compare with for triggering the alarm" }, 
                "", null, triggerContainer
            );
            
            getOperatorValue = newOperatorField.getValue;
            getTriggerValue = newTriggerField.getValue;
        }

        const tagOptions = serverCache.tags.map(tag => ({ value: tag.external_id, label: Inspector.getTagLabel(tag)}));
        const tag = this.addField({ label: "Control Tag", type: "select", options: tagOptions }, "", onTagChanged, alarmSection);

        alarmSection.appendChild(operatorContainer);
        alarmSection.appendChild(triggerContainer);

        const threatLevelOptions = serverCache.alarmOptions.threat_levels.map(a => ({ value: a.value, label: a.label }));
        const threatLevel = this.addField({ label: "Threat Level", type: "select", options: threatLevelOptions }, "", null, alarmSection);

        const message = this.addField({ label: "Message", type: "text", 
                description: "The message to send to subscribers when the alarm activates" }, 
            "", null, alarmSection
        );

        /**
         * Post alarm configuration to the server
         */
        const alarmSubmit = async () => {
            const payload = {
                alias: alias.getValue(),
                tag: tag.getValue(),
                threat_level: threatLevel.getValue(),
                operator: getOperatorValue(), // Use latest getValue
                trigger_value: getTriggerValue(), // Use latest getValue
                message: message.getValue(),
            }
            
            console.log("Submitting:", payload);
            const ok = await postServer('/api/alarms/', payload, (data) => {
                alert("Alarm Created!");
            });
        }

        const createSection = this.addSection();
        this.addButton("Create Alarm", alarmSubmit, createSection);
    }
}