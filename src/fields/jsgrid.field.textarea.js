(function(jsGrid, $, undefined) {

    var TextField = jsGrid.TextField;

    function TextAreaField(config) {
        TextField.call(this, config);
    }

    TextAreaField.prototype = new TextField({
        rows: undefined,

        insertTemplate: function() {
            if(!this.inserting)
                return "";

            var $result = this.insertControl = this._createTextArea();
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

            var $result = this.editControl = this._createTextArea();
            if (this.editable ===false || (this.editableFlagField && !item[this.editableFlagField])) {
                $result.attr("readonly", true);
            }
            $result.val(value);
            return $result;
        },

        _createTextArea: function() {
            var classes = jsGrid.fieldsClasses.textarea ? " class='" + jsGrid.fieldsClasses.textarea + "'" : "";
            $result = $("<textarea" + classes + ">");
            if (this.rows !== undefined) {
                $result.attr("rows", this.rows);
            }
            return $result;
        }
    });

    jsGrid.fields.textarea = jsGrid.TextAreaField = TextAreaField;

}(jsGrid, jQuery));
