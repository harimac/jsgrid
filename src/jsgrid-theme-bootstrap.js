(function(jsGrid, $) {

    jsGrid.fieldsClasses.button = "btn";
    jsGrid.fieldsClasses.checkbox = "";
    jsGrid.fieldsClasses.input = "form-control form-control-sm";
    jsGrid.fieldsClasses.select = "form-control form-control-sm";
    jsGrid.fieldsClasses.text = "form-control form-control-sm";
    jsGrid.fieldsClasses.textarea = "form-control form-control-sm";
    jsGrid.fieldsClasses.summarySelect = "jsgrid-summary-select";
    jsGrid.ControlField.prototype.buttonClass =  "btn btn-sm";
    jsGrid.ControlField.prototype.modeButtonClass = "btn btn-sm btn-success";
    jsGrid.ControlField.prototype.searchModeButtonClass = "bi bi-search";
    jsGrid.ControlField.prototype.insertModeButtonClass = "bi bi-plus-lg";
    jsGrid.ControlField.prototype.editButtonClass = "btn-info bi bi-pencil-fill";
    jsGrid.ControlField.prototype.deleteButtonClass = "btn-warning bi bi-trash-fill";
    jsGrid.ControlField.prototype.searchButtonClass = "btn-primary bi bi-search";
    jsGrid.ControlField.prototype.clearFilterButtonClass = "btn-danger bi bi-x-lg";
    jsGrid.ControlField.prototype.insertButtonClass = "btn-primary bi bi-check-lg";
    jsGrid.ControlField.prototype.updateButtonClass = "btn-primary bi bi-check-lg";
    jsGrid.ControlField.prototype.cancelEditButtonClass = "btn-danger bi bi-x-lg";
    jsGrid.Grid.prototype.tableClass = "jsgrid-table";
    jsGrid.Grid.prototype.headerRowClass = "jsgrid-header-row";
    jsGrid.Grid.prototype.summaryRowClass = "jsgrid-summary-row";

}(jsGrid, jQuery));
