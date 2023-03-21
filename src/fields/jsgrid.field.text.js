(function(jsGrid, $, undefined) {

    var Field = jsGrid.Field;

    function TextField(config) {
        Field.call(this, config);
    }

    TextField.prototype = new Field({
        extendedFilter: true,
        autosearch: true,
        readOnly: false,
        filter_placeholder: "Input a string to filter...",
        insert_placeholder: "Input a string to insert...",
        edit_placeholder: "Input a string to edit...",

        filterTemplate: function() {
            if(!this.filtering)
                return "";

            var grid = this._grid,
                $result = this.filterControl = this._createTextBox();
            $result.attr("placeholder", this.filter_placeholder);
            $result.attr("title", this.filter_placeholder);
            var eventArgs = {
              columnName: this.name,
              field: this
            };
            grid._callEventHandler(grid.onInitFilter, eventArgs);
            if(this.autosearch) {
                $result.on("input", function(e) {
                  var eventArgs2 = {
                    columnName: this.name,
                    value: this.filterControl.val()
                  }
                  grid._callEventHandler(grid.onFilterChanged, eventArgs2);

                    //if(e.which === 13) {
                        grid.search();
                        //e.preventDefault();
                    //}
                }.bind(this));
            }

            return $result;
        },

        insertTemplate: function() {
            if(!this.inserting)
                return "";

            var $result = this.insertControl = this._createTextBox();
            $result.attr("placeholder", this.insert_placeholder);
            $result.attr("title", this.insert_placeholder);
            if (this.editable ===false) {
                $result.attr("readonly", true);
            }
            if (this.defaultValue !== undefined) {
                $result.val(this.defaultValue);
            }
            return $result;
        },

        editTemplate: function(value, item) {
            if(!this.editing)
                return this.itemTemplate.apply(this, arguments);

            var $result = this.editControl = this._createTextBox();
            $result.attr("placeholder", this.edit_placeholder);
            $result.attr("title", this.edit_placeholder);
            if (this.editable ===false || (this.editableFlagField && !item[this.editableFlagField])) {
                $result.attr("readonly", true);
            }
            $result.val(value);
            return $result;
        },

        filterValue: function() {
            if (this.extendedFilter) {
                var filterValue = this.filterControl.val();
                if (!filterValue)
                  return null;
                filterValue = filterValue.replace(/^\s+|\s+$/g,'');
                filterValue = filterValue.split(/\s/).join('|');
                if (filterValue.indexOf("*") > -1) {
                  filterValue = "^(" + filterValue.replace(/\*/g, ".*") + ")$";
                }
                return new RegExp(filterValue, "i");
            }
            return this.filterControl.val();
        },
        setFilterValue: function(newValue) {
          if (this.filterControl !== null && this.filterControl !== undefined) {
            var curValue = this.filterControl.val() ? this.filterControl.val() : undefined;
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
            return this.insertControl.val();
        },

        editValue: function() {
            return this.editControl.val();
        },

        _createTextBox: function() {
            var $result = $("<input>").attr("type", "text");
            if (jsGrid.fieldsClasses.text) {
                $result.attr("class", jsGrid.fieldsClasses.text);
            }
            return $result;
        }
    });

    jsGrid.fields.text = jsGrid.TextField = TextField;
    jsGrid.filterExtendedString = function(value, filter) {
        if (!filter)
            return true;
        if (value === null || value === undefined)
            return false;
        if ((typeof filter) === "string" )
            return value.toLowerCase().indexOf(filter.toLowerCase()) > -1;
        return filter.test(value);
    };

}(jsGrid, jQuery));
