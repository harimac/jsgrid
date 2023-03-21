(function(jsGrid, $, undefined) {

    var Field = jsGrid.Field;

    function CheckboxField(config) {
        Field.call(this, config);
    }

    CheckboxField.prototype = new Field({

        sorter: "number",
        align: "center",
        autosearch: true,
        filter_placeholder: "Select state to filter...",
        insert_placeholder: "Check on/off to insert...",
        edit_placeholder: "Check on/off to edit...",
        summaryLabel: "Summary",
        checked_summary: "Checked",
        unchecked_summary: "Unchecked",

        itemTemplate: function(value) {
            return this._createCheckbox().prop({
                checked: value,
                disabled: true
            });
        },

        filterTemplate: function() {
            if(!this.filtering)
                return "";

            var grid = this._grid,
                $result = this.filterControl = this._createCheckbox();
            $result.attr("title", this.filter_placeholder);

            $result.prop({
                readOnly: true,
                indeterminate: true
            });

            var eventArgs = {
              columnName: this.name,
              field: this
            }
            grid._callEventHandler(grid.onInitFilter, eventArgs);

            $result.on("click", function() {
                var $cb = $(this);

                if($cb.prop("readOnly")) {
                    $cb.prop({
                        checked: false,
                        readOnly: false
                    });
                }
                else if(!$cb.prop("checked")) {
                    $cb.prop({
                        readOnly: true,
                        indeterminate: true
                    });
                }
            });

            if(this.autosearch) {
                $result.on("click", function() {
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

            var $result = this.insertControl = this._createCheckbox();
            $result.attr("title", this.insert_placeholder);
            if (this.editable ===false) {
                $result.attr("disabled", "disabled");
            }
            if (this.defaultValue !== undefined) {
                $result.prop("checked", this.defaultValue);
            }
            return $result;
        },

        editTemplate: function(value, item) {
            if(!this.editing)
                return this.itemTemplate.apply(this, arguments);

            var $result = this.editControl = this._createCheckbox();
            $result.attr("title", this.edit_placeholder);
            if (this.editable === false || (this.editableFlagField && !item[this.editableFlagField])) {
                $result.attr("disabled", "disabled");
            }
            $result.prop("checked", value);
            return $result;
        },

        summaryTemplate: function() {
            var classes = jsGrid.fieldsClasses.summarySelect ? " class='" + jsGrid.fieldsClasses.summarySelect + "'" : "";
            this.summaryControl = $("<select" + classes + ">");
            return this.summaryControl;
        },

        filterValue: function() {
            return this.filterControl.get(0).indeterminate
                ? undefined
                : this.filterControl.is(":checked");
        },
        setFilterValue: function(newValue) {
          if (this.filterControl === null || this.filterControl === undefined)
            return;
          var curValue = this.filterValue();
          if (curValue !== newValue) {
            if (newValue === null) {
              this.filterControl.prop({
                  readOnly: true,
                  indeterminate: true
              });
            }
            else {
              this.filterControl.prop({
                  checked: newValue,
                  readOnly: false,
                  indeterminate: false
              });
            }
            var eventArgs2 = {
              columnName: this.name,
              value: newValue
            }
            var grid = this._grid;
            grid._callEventHandler(grid.onFilterChanged, eventArgs2);
          }
        },

        insertValue: function() {
            return this.insertControl.is(":checked");
        },

        editValue: function() {
            return this.editControl.is(":checked");
        },

        summaryValue: function(values) {
            var empties = values.filter((val) => val === undefined || val === null || val === "");
            var counts = new Array(2).fill(0);//this.items.slice(0, this.items.length);
            values.forEach(function(val) {
              if (val === true) {
                counts[0]++;
              }
              else {
                counts[1]++;
              }
            }.bind(this));
            this.summaryControl.children('option').remove();
            $("<option>").text(this.summaryLabel).css("display", "none").appendTo(this.summaryControl);
            $("<option>").text(this.emptyLabel + " (" + empties.length + ")").attr("disabled", "disabled").appendTo(this.summaryControl);
            $("<option>")
                .attr("value", 1)
                .attr("disabled", "disabled")
                .text(this.checked_summary + " (" + counts[0] + ")")
                .appendTo(this.summaryControl);
            $("<option>")
                .attr("value", 0)
                .attr("disabled", "disabled")
                .text(this.unchecked_summary + " (" + counts[1] + ")")
                .appendTo(this.summaryControl);
            var tooltip = this.emptyLabel + " (" + empties.length + ")\r\n" + this.checked_summary + " (" + counts[0] + ")\r\n" + this.unchecked_summary + " (" + counts[1] + ")";
            this.summaryControl.attr("title", tooltip);
        },

        _createCheckbox: function() {
            var classes = jsGrid.fieldsClasses.checkbox ? " class='" + jsGrid.fieldsClasses.checkbox + "'" : "";
            return $("<input" + classes + ">").attr("type", "checkbox");
        }
    });

    jsGrid.fields.checkbox = jsGrid.CheckboxField = CheckboxField;

}(jsGrid, jQuery));
