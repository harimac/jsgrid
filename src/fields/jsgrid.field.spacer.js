(function(jsGrid, $, undefined) {

    var Field = jsGrid.Field;

    function SpacerField(config) {
        Field.call(this, config);
    }

    SpacerField.prototype = new Field({
        name: "",
        title: null,
        css: "jsgrid-spacer-field",
        align: "",
        width: "auto",

        filtering: false,
        inserting: false,
        editing: false,
        sorting: false,
        resizing: false,
        editable: false,

        includeInDataExport: false,

        headerTemplate: function() {
            return "";
        },

        editTemplate: function(value, item) {
            return $("<div>");
        },

        summaryTemplate: function() {
            return "";
        },

        editValue: function() {
            return "&nbsp;";
        },

        summaryValue: function(values) {
            return "";
        }
    });

    jsGrid.fields.spacer = jsGrid.SpacerField = SpacerField;

}(jsGrid, jQuery));
