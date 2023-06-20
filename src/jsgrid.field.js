(function(jsGrid, $, undefined) {

    function Field(config) {
        $.extend(true, this, config);
        this.sortingFunc = this._getSortingFunc();
    }

    Field.prototype = {
        name: "",
        title: null,
        tooltip: null,
        css: "",
        align: "",
        width: 100,

        visible: true,
        filtering: true,
        inserting: true,
        editing: true,
        sorting: true,
        resizing: true,
        sorter: "string", // name of SortStrategy or function to compare elements
        defaultValue: undefined,
        editable: true,
        editableFlagField: "",
        summaryControl:null,
        totalLabel: "Total",
        rowsLabel: "rows",
        emptyLabel: "Empty",

        includeInDataExport: true,
        headerTemplate: function() {
            return (this.title === undefined || this.title === null) ? this.name : this.title;
        },

        itemTemplate: function(value, item) {
            return value;
        },

        filterTemplate: function() {
            return "";
        },

        insertTemplate: function() {
            return "";
        },

        editTemplate: function(value, item) {
            this._value = value;
            return this.itemTemplate(value, item);
        },

        summaryTemplate: function() {
            this.summaryControl = $("<div>").append((this.title === undefined || this.title === null) ? this.name : this.title);
            return this.summaryControl;
        },

        filterValue: function() {
            return "";
        },
        setFilterValue: function(newValue) {
        },

        insertValue: function() {
            return "";
        },

        editValue: function() {
            return this._value;
        },

        summaryValue: function(values) {
            var empties = values.filter((val) => val === undefined || val === null || val === "");
            var text = this.emptyLabel + ": " + empties.length + " " + this.rowsLabel;
            this.summaryControl.html(text);
            this.summaryControl.attr("title", text);
        },

        _getSortingFunc: function() {
            var sorter = this.sorter;

            if($.isFunction(sorter)) {
                return sorter;
            }

            if(typeof sorter === "string") {
                return jsGrid.sortStrategies[sorter];
            }

            throw Error("wrong sorter for the field \"" + this.name + "\"!");
        }
    };

    jsGrid.Field = Field;
    jsGrid.fields = Field;

}(jsGrid, jQuery));
