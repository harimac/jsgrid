(function(jsGrid, $, undefined) {

    var NumberField = jsGrid.NumberField;
    var numberValueType = "number";
    var stringValueType = "string";

    function SelectField(config) {
        this.items = [];
        this.selectedIndex = -1;
        this.valueField = "";
        this.textField = "";

        if(config.valueField && config.items.length) {
            var firstItemValue = config.items[0][config.valueField];
            this.valueType = (typeof firstItemValue) === numberValueType ? numberValueType : stringValueType;
        }

        this.sortCollator = new Intl.Collator(window.navigator.userLanguage || window.navigator.language, {
                numeric: true,
                sensitivity: 'base'
            });
        //this.sorter = this.valueType;

        NumberField.call(this, config);
    }

    SelectField.prototype = new NumberField({

        align: "center",
        valueType: numberValueType,
        allowEmpty: true,
        filter_placeholder: "Select options to filter...",
        insert_placeholder: "Select an option to insert...",
        edit_placeholder: "Select an option to edit...",
        summaryLabel: "Summary",

        sorter: function(value1, value2) {
            var text1 = this.itemTemplate(value1);
            var text2 = this.itemTemplate(value2);
            return this.sortCollator.compare(text1, text2);
        },
        itemTemplate: function(value) {
            var items = this.items,
                valueField = this.valueField,
                textField = this.textField,
                resultItem;

            if(valueField) {
                resultItem = $.grep(items, function(item, index) {
                    return item[valueField] === value;
                })[0] || {};
            }
            else {
                resultItem = items[value];
            }

            var result = (textField ? resultItem[textField] : resultItem);

            return (result === undefined || result === null) ? "" : result;
        },

        filterTemplate: function() {
            if(!this.filtering)
                return "";

            var grid = this._grid,
                $result = this.filterControl = this._createSelect("filter");
            $result.attr("title", this.filter_placeholder);
            var eventArgs = {
                columnName: this.name,
                field: this
            }
            grid._callEventHandler(grid.onInitFilter, eventArgs);
            if(this.autosearch) {
                $result.on("change", function(e) {
                    var eventArgs2 = {
                        columnName: this.name,
                        value: this.filterValue()
                    }
                    grid._callEventHandler(grid.onFilterChanged, eventArgs2);
                    grid.search();
                }.bind(this));
            }

            return $result;
        },

        insertTemplate: function() {
            if(!this.inserting)
                return "";

            var $result = this.insertControl = this._createSelect("insert");
            $result.attr("title", this.insert_placeholder);
            if (this.editable ===false) {
                $result.attr("disabled", "disabled");
            }
            if (this.defaultValue !== undefined) {
                $result.val(value);
            }
            return $result;
        },

        editTemplate: function(value, item) {
            if(!this.editing)
                return this.itemTemplate.apply(this, arguments);

            var $result = this.editControl = this._createSelect("edit");
            $result.attr("title", this.edit_placeholder);
            if (this.editable ===false || (this.editableFlagField && !item[this.editableFlagField])) {
                $result.attr("disabled", "disabled");
            }
            (value !== undefined) && $result.val(value);
            return $result;
        },

        summaryTemplate: function() {
            var classes = jsGrid.fieldsClasses.summarySelect ? " class='" + jsGrid.fieldsClasses.summarySelect + "'" : "";
            this.summaryControl = $("<select" + classes + ">");
            return this.summaryControl;
        },

        filterValue: function() {
            var val = this.filterControl.val();
            if (val == undefined || val == null || val == "")
                return null;
            return this.valueType === numberValueType ? parseInt(val || -1, 10) : val;
        },

        setFilterValue: function(newValue) {
            if (this.filterControl !== null && this.filterControl !== undefined) {
                var curValue = this.filterValue();
                if (curValue !== newValue) {
                this.filterControl.val(newValue);
                var eventArgs2 = {
                    columnName: this.name,
                    value: newValue
                }
                var grid = this._grid;
                grid._callEventHandler(grid.onFilterChanged, eventArgs2);
                }
            }
        },

        insertValue: function() {
            var val = this.insertControl.val();
            if (val == undefined || val == null || val == "")
                return null;
            return this.valueType === numberValueType ? parseInt(val || -1, 10) : val;
        },

        editValue: function() {
            var val = this.editControl.val();
            if (val == undefined || val == null || val == "")
                return null;
            return this.valueType === numberValueType ? parseInt(val || -1, 10) : val;
        },

        summaryValue: function(values) {
            var empties = values.filter((val) => val === undefined || val === null || val === "");
            var counts = new Array(this.items.length).fill(0);//this.items.slice(0, this.items.length);
            values.forEach(function(val) {
                for (var i = 0; i < this.items.length; i++) {
                    if (this.items[i][this.valueField] === val) {
                    counts[i]++;
                    }
                }
            }.bind(this));
            this.summaryControl.children('option').remove();
            $("<option>").text(this.summaryLabel).css("display", "none").appendTo(this.summaryControl);
            var tooltip = this.emptyLabel + " (" + empties.length + ")";
            $("<option>").text(tooltip).attr("disabled", "disabled").appendTo(this.summaryControl);
            $.each(this.items, function(index, item) {
                var value = this.valueField ? item[this.valueField] : index,
                    text = this.textField ? item[this.textField] : item;
                if (text !== undefined && text !== null && text !== "") {
                    $("<option>")
                        .attr("value", value)
                        .attr("disabled", "disabled")
                        .text(text + " (" + counts[index] + ")")
                        .appendTo(this.summaryControl);
                    if (tooltip != "")
                        tooltip += "\r\n";
                    tooltip += text + " (" + counts[index] + ")";
                }
            }.bind(this));
            this.summaryControl.attr("title", tooltip);
        },

        _createSelect: function(mode) {
            var classes = jsGrid.fieldsClasses.select ? " class='" + jsGrid.fieldsClasses.select + "'" : "";
            var $result = $("<select" + classes + ">"),
                valueField = this.valueField,
                textField = this.textField,
                selectedIndex = this.selectedIndex;
            if (mode !== "filter" && this.allowEmpty) {
                var $option = $("<option>")
                    .attr("value", "")
                    .text("")
                    .appendTo($result);
            }
            $.each(this.items, function(index, item) {
                var value = valueField ? item[valueField] : index,
                    text = textField ? item[textField] : item;

                var $option = $("<option>")
                    .attr("value", value)
                    .text(text)
                    .appendTo($result);

            });

            $result.prop("selectedIndex", selectedIndex);

            return $result;
        }
    });

    jsGrid.fields.select = jsGrid.SelectField = SelectField;

}(jsGrid, jQuery));
