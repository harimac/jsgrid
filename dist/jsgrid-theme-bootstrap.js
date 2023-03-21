(function(jsGrid, $) {

    jsGrid.fieldsClasses.button = "btn";
    jsGrid.fieldsClasses.checkbox = "";
    jsGrid.fieldsClasses.input = "form-control form-control-sm";
    jsGrid.fieldsClasses.select = "form-control form-control-sm";
    jsGrid.fieldsClasses.text = "form-control form-control-sm";
    jsGrid.fieldsClasses.textarea = "form-control form-control-sm";
    jsGrid.fieldsClasses.summarySelect = "jsgrid-summary-select";
    jsGrid.ControlField.prototype.buttonClass =  "btn btn-sm oi";
    jsGrid.ControlField.prototype.modeButtonClass = "btn btn-sm oi btn-success";
    jsGrid.ControlField.prototype.searchModeButtonClass = "oi-magnifying-glass";
    jsGrid.ControlField.prototype.insertModeButtonClass = "oi-plus";
    jsGrid.ControlField.prototype.editButtonClass = "btn-info oi-pencil";
    jsGrid.ControlField.prototype.deleteButtonClass = "btn-warning oi-trash";
    jsGrid.ControlField.prototype.searchButtonClass = "btn-primary oi-magnifying-glass";
    jsGrid.ControlField.prototype.clearFilterButtonClass = "btn-danger oi-x";
    jsGrid.ControlField.prototype.insertButtonClass = "btn-primary oi-check";
    jsGrid.ControlField.prototype.updateButtonClass = "btn-primary oi-check";
    jsGrid.ControlField.prototype.cancelEditButtonClass = "btn-danger oi-x";
    jsGrid.Grid.prototype.tableClass = "jsgrid-table table table-sm";
    jsGrid.Grid.prototype.headerRowClass = "jsgrid-header-row thead-light";
    jsGrid.Grid.prototype.summaryRowClass = "jsgrid-summary-row thead-light";

}(jsGrid, jQuery));
