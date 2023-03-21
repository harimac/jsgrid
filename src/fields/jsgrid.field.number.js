(function(jsGrid, $, undefined) {

    var TextField = jsGrid.TextField;

    function NumberField(config) {
        TextField.call(this, config);
    }

    NumberField.prototype = new TextField({

        sorter: "number",
        align: "right",
        readOnly: false,
        valueType: "integer", // or float
        minValue: undefined,
        maxValue: undefined,
        valueStep: undefined,
        summaryLabel : "Sum",
        maximumLabel : "Max",
        minimumLabel : "Min",
        meanLabel : "Mean",
        stdDevLabel : "Std.Dev.",

        summaryTemplate: function() {
            this.summaryControl = $("<div>").append((this.title === undefined || this.title === null) ? this.name : this.title);
            return this.summaryControl;
        },

        filterValue: function() {
            return this.filterControl.val()
                ? (this.valueType ==="integer" ? parseInt(this.filterControl.val() || 0, 10) : parseFloat(this.filterControl.val() || 0))
                : undefined;
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
            return this.insertControl.val()
                ? (this.valueType ==="integer" ? parseInt(this.insertControl.val() || 0, 10) : parseFloat(this.insertControl.val() || 0))
                : undefined;
        },

        editValue: function() {
            return this.editControl.val()
                ? (this.valueType ==="integer" ? parseInt(this.editControl.val() || 0, 10) : parseFloat(this.editControl.val() || 0))
                : undefined;
        },

        _computeSummaryValues(values) {
          var sum = 0;
          var validCount = 0;
          var max = values.reduce((previous, current) => (current !== undefined && current !== null ? Math.max(previous, current) : previous));
          var min = max;
          values.forEach(function(val) {
            if (val !== undefined && val !== null) {
              sum += val;
              validCount++;
              if (val < min)
                min = val;
            }
          });
          var mean = null;
          var stdDev = null;
          if (validCount > 0) {
            mean = sum / validCount;
            var variance = 0;
            values.forEach(function(val) {
              if (val !== undefined && val !== null) {
                variance += (val - mean) * (val - mean);
              }
            });
            variance = variance / validCount;
            stdDev = Math.sqrt(variance);
          }
          return {
            count : validCount,
            sum : sum,
            max : max,
            min : min,
            mean : mean,
            stdDev : stdDev
          }
        },
        _number2string(num) {
          var str = this.itemTemplate(num);
          if (typeof(str) === "number")
            str = str.toFixed(2);
          return str;
        },
        summaryValue: function(values) {
          var computed = this._computeSummaryValues(values);
          var sumText = this.summaryLabel + ": " + this._number2string(computed.sum);
          var meanText = this.meanLabel + ": " + this._number2string(computed.mean);
          var minText = this.minimumLabel + ": " + this._number2string(computed.min);
          var maxText = this.maximumLabel + ": " + this._number2string(computed.max);
          var stdDevText = this.stdDevLabel + ": " + this._number2string(computed.stdDev);
          this.summaryControl.html(this.summaryText(sumText, meanText, maxText, minText, stdDevText));
          this.summaryControl.attr("title", this.summaryTooltipText(sumText, meanText, maxText, minText, stdDevText));
        },
        summaryText(sumText, meanText, maxText, minText, stdDevText) {
            return sumText;
        },
        summaryTooltipText(sumText, meanText, maxText, minText, stdDevText) {
            return sumText + "\r\n" + meanText + "\r\n" + maxText + "\r\n" + minText + "\r\n" + stdDevText;
        },

        _createTextBox: function() {
            var $result = $("<input>").attr("type", "number");
            if (jsGrid.fieldsClasses.input) {
                $result.attr("class", jsGrid.fieldsClasses.input);
            }
            if (this.minValue !== undefined) {
                $result.attr("min", this.minValue);
            }
            if (this.maxValue !== undefined) {
                $result.attr("max", this.maxValue);
            }
            if (this.valueStep !== undefined) {
                $result.attr("step", this.valueStep);
            }

            return $result;
        }
    });

    jsGrid.fields.number = jsGrid.NumberField = NumberField;

}(jsGrid, jQuery));
