/*
 * jsGrid v1.5.3 (http://js-grid.com)
 * (c) 2023 Artem Tabalin
 * Licensed under  ()
 */

(function(jsGrid, $, undefined) {

	var DateField = function (config) {
		jsGrid.TextField.call(this, config);
	};

	DateField.prototype = new jsGrid.TextField({
		filter_placeholder: 'Input a date range to filter...',
		textDirection: 'ltr', // or 'rtl'
		applyLabel: null,
		cancelLabel: null,
		fromLabel: null,
		toLabel: null,
		weekLabel: null,
		customRangeLabel: null,
		todayLabel: 'Today',
		yesterdayLabel: 'Yesterday',
		last30daysLabel: 'Last 30 days',
		thisMonthLabel: 'This month',
		lastMonthLabel: 'Last month',
		orderYearMonthFunc: null,
		initFilterValue: null,

		sorter: function(date1, date2) {
			if (!date1)
				date1 = new Date(8640000000000000); // MAX
			if (!date2)
				date2 = new Date(8640000000000000); // MAX
			var dateValue1 = $.type(date1) === 'date' ? date1: new Date(date1);
			var dateValue2 = $.type(date2) === 'date' ? date2: new Date(date2);
			return dateValue1.getTime() - dateValue2.getTime();
		},
		itemTemplate: function(value) {
			if (value === undefined || value === null)
				return '';
			return value.toLocaleDateString();
		},
		insertTemplate: function() {
			var $result = this._insertPicker = this.createInput(this.defaultValue);
			this._insertPicker.attr('title', this.insert_placeholder);
			if (this.editable ===false) {
				$result.attr('readonly', true);
			}
			return $result;
		},

		filterTemplate: function() {
			this._filterPicker = this.createFilterInput();
			this._filterPicker.attr('placeholder', this.filter_placeholder);
			this._filterPicker.attr('title', this.filter_placeholder);
			var grid = this._grid;
			var eventArgs = {
				columnName: this.name,
				field: this
			}
			grid._callEventHandler(grid.onInitFilter, eventArgs);
			if(this.autosearch) {
				var grid = this._grid
				this._filterPicker.on('change', function(e) {
					var eventArgs2 = {
						columnName: this.name,
						value: this.filterValue()
					}
					grid._callEventHandler(grid.onFilterChanged, eventArgs2);
					grid.search();
				}.bind(this));
			}
			return this._filterPicker;
		},

		editTemplate: function(value, item) {
			var $result = this._editPicker = this.createInput(value);
			this._editPicker.attr('title', this.edit_placeholder);
			if (this.editable === false || (this.editableFlagField && !item[this.editableFlagField])) {
				$result.attr('readonly', true);
			}
			return $result;
		},

		insertValue: function() {
			var value = this._insertPicker.val()
			if (value === null || value === undefined || value === '')
				return null;
			return $.type(value) === 'date' ? value: new Date(value);
		},

		filterValue: function() {
			var valString = this._filterPicker.val();
			if (!valString)
				return null;
			var picker = this._filterPicker.data('daterangepicker');
			if (!picker) {
				if (this.initFilterValue !== null) {
					return this.initFilterValue;
				}
				return null;
			}
			var range = {
				start: picker.startDate,
				end: picker.endDate
			};
			return range;
			//var value = this._filterPicker.val()
			//if (value === null || value === undefined || value === '')
			//	return null;
			//return $.type(value) === 'date' ? value: new Date(value);
		},
		setFilterValue: function(newValue) {
			if (this._filterPicker !== null && this._filterPicker !== undefined) {
				var curValue = this.filterValue();
				if (newValue !== undefined && newValue !== null) {
					var picker = this._filterPicker.data('daterangepicker');
					var start =  moment(newValue.start);
					var end = moment(newValue.end);
					if (picker !== null && picker !== undefined) {
						picker.start = start;
						picker.end = end;
					}
					else {
						this.initFilterValue = { startDate: start, endDate: end };
					}
					var value = start.format('L') + ' - ' + end.format('L');
					this._filterPicker.val(value);
					this._filterPicker.attr('title', value);
				}
				else {
					this._filterPicker.val(newValue);
					this._filterPicker.attr('title', newValue);
				}
				var eventArgs2 = {
					columnName: this.name,
					value: newValue
				}
				var grid = this._grid;
				grid._callEventHandler(grid.onFilterChanged, eventArgs2);
			}
		},

		editValue: function() {
			var value = this._editPicker.val()
			if (value === null || value === undefined || value === '')
				return null;
			return $.type(value) === 'date' ? value: new Date(value);
		},

		createInput: function(defaultValue) {
			var strValue = moment(defaultValue === undefined || defaultValue === null ? new Date() : new Date(defaultValue)).format('YYYY-MM-DD');
			var classes = jsGrid.fieldsClasses.input ? ' class="' + jsGrid.fieldsClasses.input + '"' : '';
			var $input =  $('<input>').attr('type', 'date');
			$input.addClass(jsGrid.fieldsClasses.input);
			if (defaultValue !== undefined && defaultValue !== null)
				$input.val(strValue);
			return $input;
		},
		generateFilterRange(ranges) {
			ranges[this.todayLabel] = [moment(), moment()];
			ranges[this.yesterdayLabel] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
			ranges[this.last30daysLabel] = [moment().subtract(29, 'days'), moment()];
			ranges[this.thisMonthLabel] = [moment().startOf('month'), moment().endOf('month')];
			ranges[this.lastMonthLabel] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];
		},
		createFilterInput: function() {
			var classes = jsGrid.fieldsClasses.input ? ' class="' + jsGrid.fieldsClasses.input + '"' : '';
			var $input =  $('<input>').attr('type', 'text');
			$input.addClass(jsGrid.fieldsClasses.input);
			//$input.attr('type', 'text');
			var grid = this._grid;
			$input.ready(function(){
				var option ={
					//autoApply: true,
					autoUpdateInput: false,
					linkedCalendars: false,
					showCustomRangeLabel: true,
					alwaysShowCalendars: false,
					//showDropdowns: true,
					buttonClasses: 'btn btn-sm ',
					ranges: {},
					locale: {
						direction: this.textDirection, // 'ltr' or 'rtl'
						applyLabel: this.applyLabel,
						cancelLabel: this.cancelLabel,
						fromLabel: this.fromLabel,
						toLabel: this.toLabel,
						weekLabel: this.weekLabel,
						customRangeLabel: this.customRangeLabel
					},
					orderYearMonth: this.orderYearMonthFunc/*function(yearHtml, monthHtml) {
						return yearHtml + 'å¹´ ' + monthHtml;
					}*/
				};
				if (this.initFilterValue !== null) {
					option.startDate = this.initFilterValue.start;
					option.endDate = this.initFilterValue.end;
					//var value = this.initFilterValue.startDate.format('L') + ' - ' + this.initFilterValue.endDate.format('L');
					//$input.val(value);
					//$input.attr('title', value);
				}
				this.generateFilterRange(option.ranges);
				//option.ranges[this.todayLabel] = [moment(), moment()];
				//option.ranges[this.yesterdayLabel] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
				//option.ranges[this.last30daysLabel] = [moment().subtract(29, 'days'), moment()];
				//option.ranges[this.thisMonthLabel] = [moment().startOf('month'), moment().endOf('month')];
				//option.ranges[this.lastMonthLabel] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];
				$input.daterangepicker(option, function(start, end, label) {
					console.log('New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')');
				});
				$input.on('apply.daterangepicker', function(ev, picker) {
					var value = picker.startDate.format('L') + ' - ' + picker.endDate.format('L');
					$input.val(value);
					$input.attr('title', value);
					var eventArgs = {
						columnName: this.name,
						value: this.filterValue()
					}
					grid._callEventHandler(grid.onFilterChanged, eventArgs);
					grid.search();
        }.bind(this));
        $input.on('cancel.daterangepicker', function(ev, picker) {
					$input.val('');
					input.attr('title', this.filter_placeholder);
					eventArgs = {
						columnName: this.name,
						value: this.filterValue()
					}
					grid._callEventHandler(grid.onFilterChanged, eventArgs);
					grid.search();
        }.bind(this));
				if (this.initFilterValue !== null) {
					grid.search();
					this.initFilterValue = null;
				}
			}.bind(this));
			$input.on('remove', function () {
				$input.data('daterangepicker').remove();
			})
			return $input;
		}
	});
	jsGrid.fields.date = jsGrid.DateField = DateField;
	jsGrid.filterDate = function(value, filter) {
		if (filter === undefined || filter === null || filter === '')
			return true;
		if (value === undefined || value === null || value === '')
			return false;
		if ($.type(filter) === 'date' || $.type(filter) === 'string') {
			var dateValue = $.type(value) === 'date' ? value: new Date(value);
			var dateFilter = $.type(filter) === 'date' ? filter: new Date(filter);
			return dateValue.getTime() === dateFilter.getTime();
		}
		else if($.type(filter) === 'object' && filter.start && filter.end){
			var momValue = moment(value);
			return momValue.isAfter(filter.start) && momValue.isBefore(filter.end);
		}
		return true;
	};

	var ColorField = function (config) {
		jsGrid.TextField.call(this, config);
	};

	ColorField.prototype = new jsGrid.TextField({

		filter_placeholder: 'Input or select a color to filter...',
		insert_placeholder: 'Input or select a color to insert...',
		edit_placeholder: 'Input or select a color to edit...',

		itemTemplate: function(value) {
			this._itemPicker = this.createInput(value);
			this._itemPicker.find('input').attr('disabled', 'disabled');
			return this._itemPicker;
		},
		insertTemplate: function() {
			this._insertPicker = this.createInput(this.defaultValue);
			var $input = this._insertPicker.find('input');
			$input.attr('title', this.insert_placeholder);
		//this._insertPicker.find('div.minicolors').children('div.minicolors-panel').css('position', 'fixed');
			return this._insertPicker;
		},

		filterTemplate: function() {
			this._filterPicker = this.createInput();
			var $input = this._filterPicker.find('input');
			$input.attr('placeholder', this.filter_placeholder);
			$input.attr('title', this.filter_placeholder);
			//this._filterPicker.find('div.minicolors').children('div.minicolors-panel').css('position', 'fixed');
			var grid = this._grid;
			var eventArgs = {
				columnName: this.name,
				field: this
			}
			grid._callEventHandler(grid.onInitFilter, eventArgs);
			if(this.autosearch) {
				var grid = this._grid
				$input.on('change', function(e) {
					var eventArgs2 = {
						columnName: this.name,
						value: this.filterValue()
					}
					grid._callEventHandler(grid.onFilterChanged, eventArgs2);
					grid.search();
					//$input.minicolors('hide');
				}.bind(this));
			}
			return this._filterPicker;
		 },

		editTemplate: function(value, item) {
			this._editPicker = this.createInput(value);
			var $input = this._editPicker.find('input');
			$input.attr('title', this.edit_placeholder);
			//this._editPicker.find('div.minicolors').children('div.minicolors-panel').css('position', 'fixed');
			$input.minicolors('value', value);
			if (this.editable ===false || (this.editableFlagField && !item[this.editableFlagField])) {
				$input.attr('disabled', 'disabled');
			}
			else {
				$input.on('change', function(e) {
					//$input.minicolors('hide');
				});
			}
			return this._editPicker;
		},

		insertValue: function() {
			var value = this._insertPicker.find('input').val();
			if (value === null || value === undefined || value === 'TRANSPARENT')
				return '';
			return value;
		},

		filterValue: function() {
			var value = this._filterPicker.find('input').val();
			if (value === null || value === undefined || value === 'TRANSPARENT')
				return '';
			return value;
		},
		setFilterValue: function(newValue) {
			if (this._filterPicker !== null && this._filterPicker !== undefined) {
				var curValue = this.filterValue();
				if (curValue !== newValue) {
					//if (newValue !== undefined && newValue !== null && newValue !== '') {
						var $input = this._filterPicker.find('input');
						if ($input !== null && $input !== undefined) {
							$input.minicolors('value', newValue);
						}
						var eventArgs2 = {
							columnName: this.name,
							value: newValue
						}
						var grid = this._grid;
						grid._callEventHandler(grid.onFilterChanged, eventArgs2);
					//}
				}
			}
		},

		editValue: function() {
			var value = this._editPicker.find('input').val();
			if (value === null || value === undefined || value === 'TRANSPARENT')
				return '';
			return value;
		},

		createInput: function(defaultValue) {
			var classes = jsGrid.fieldsClasses.input ? ' class="' + jsGrid.fieldsClasses.input + '"' : '';
			var $element = $('<input' + classes + '>').attr('type', 'text').attr('placeholder', 'TRANSPARENT').val(defaultValue || '');
			var $parent = $('<div>').append($element);
			$element.minicolors({
				control: 'wheel',
				defaultValue: defaultValue || '',
				format: 'hex',
				keywords: '',
				inline: false,
				letterCase: 'lowercase',
				opacity: false,
				position: 'bottom',
				swatches: ['#ef9a9a','#90caf9','#a5d6a7','#fff59d','#ffcc80','#bcaaa4','#eeeeee','#f44336','#2196f3','#4caf50','#ffeb3b','#ff9800','#795548','#9e9e9e'],
				theme: 'bootstrap'
			});
			var childDiv = $parent.children('div');
			var childSpan = childDiv.children('span.minicolors-swatch');
			childSpan.css('height', '100%').css('top', '0px').css('left', '0px');
			return $parent;
		}
	});
	jsGrid.fields.color = jsGrid.ColorField = ColorField;

	function SelectExField(config) {
		this.items = [];
		this.selectedIndex = -1;
		this.valueField = '';
		this.textField = '';
		this.tokenField = '';

/*		if(config.valueField && config.items.length) {
			var firstItemValue = config.items[0][config.valueField];
			this.valueType = (typeof firstItemValue) === 'number' ? 'number' : 'string';
		}*/

		this.valueType = config.valueFieldType ? config.valueFieldType : 'number';
		this.sortCollator = new Intl.Collator(window.navigator.userLanguage || window.navigator.language, {
			  numeric: true,
			  sensitivity: 'base'
			});

		jsGrid.SelectField.call(this, config);
	}

	SelectExField.prototype = new jsGrid.SelectField({

		align: 'left',
		valueType: 'number',

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

			return (result === undefined || result === null) ? '' : result;
		},

		filterTemplate: function() {
			if(!this.filtering)
				return '';

			var grid = this._grid,
				$result = this._createSelect('filter');
			this.filterControl = $result.control;

			var eventArgs = {
				columnName: this.name,
				field: this
			}
			grid._callEventHandler(grid.onInitFilter, eventArgs);
			if(this.autosearch) {
				this.filterControl.on('change', function(e) {
					var eventArgs2 = {
						columnName: this.name,
						value: this.filterValue()
					}
					grid._callEventHandler(grid.onFilterChanged, eventArgs2);
					grid.search();
				}.bind(this));
			}

			return $result.container;
		},

		insertTemplate: function() {
			if(!this.inserting)
				return '';

			var $result = this._createSelect('insert');
			this.insertControl = $result.control;
			if (this.editable ===false) {
				this.insertControl.prop('disabled', true);
			}
			if (this.defaultValue !== undefined) {
				this.insertControl.val(value);
			}
			if (this.insertControl.data('selectpicker'))
				this.insertControl.selectpicker('refresh');
			return $result.container;
		},

		editTemplate: function(value, item) {
			if(!this.editing)
				return this.itemTemplate.apply(this, arguments);

			var $result = this._createSelect('edit');
			this.editControl = $result.control;
			if (this.editable ===false || (this.editableFlagField && !item[this.editableFlagField])) {
				this.editControl.prop('disabled', true);
			}
			if (value !== undefined) {
				this.editControl.val(value);
			}
			if (this.editControl.data('selectpicker'))
				this.editControl.selectpicker('refresh');
			return $result.container;
		},

		filterValue: function() {
			var val = this.filterControl.val();
			if (val == undefined || val == null || val == '')
				return null;
			if ($.isArray(val)) {
				if (this.valueType === 'number')
					return val.map(v => parseInt(v || -1, 10));
				else
					return val;
			}
			return this.valueType === 'number' ? parseInt(val || -1, 10) : val;
		},
		setFilterValue: function(newValue) {
			if (this.filterControl !== null && this.filterControl !== undefined) {
				var curValue = this.filterValue();
				if (curValue !== newValue) {
					this.filterControl.val(newValue);
					if (this.filterControl.data('selectpicker'))
						this.filterControl.selectpicker('refresh');

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
			if (val == undefined || val == null || val == '')
				return null;
			if ($.isArray(val)) {
				if (this.valueType === 'number')
					return val.map(v => parseInt(v || -1, 10));
				else
					return val;
			}
			return this.valueType === 'number' ? parseInt(val || -1, 10) : val;
		},

		editValue: function() {
			var val = this.editControl.val();
			if (val == undefined || val == null || val == '')
				return null;
			if ($.isArray(val)) {
				if (this.valueType === 'number')
					return val.map(v => parseInt(v || -1, 10));
				else
					return val;
			}
			return this.valueType === 'number' ? parseInt(val || -1, 10) : val;
		},

		_createSelect: function(mode) {
			var classes = jsGrid.fieldsClasses.select ? ' class="' + jsGrid.fieldsClasses.select + '"' : '';
			var $result = $('<select' + classes + ' data-container="body" style="display:none;">'),
				valueField = this.valueField,
				textField = this.textField,
				tokenField = this.tokenField,
				selectedIndex = this.selectedIndex;
			if (mode === 'filter') {
				$result.attr('multiple', 'multiple');
			}
			if (mode !== 'filter' && this.allowEmpty) {
				var $option = $('<option>')
						.attr('value', '')
						.text('')
						.appendTo($result);
			}
			$.each(this.items, function(index, item) {
				var value = valueField ? item[valueField] : index,
					text = textField ? item[textField] : item,
					token = tokenField ? item[tokenField] : item;

				var $option = $('<option>')
					.attr('value', value)
					.text(text)
					.appendTo($result);
				if (token)
					$option.attr('data-tokens', token);
			});
			$result.ready(function(){
				var options = { dropupAuto: false, liveSearch: true, size: 10, dropdownAlignRight: 'auto', width: 'auto', actionsBox: (mode === 'filter')};
				if (mode === 'filter') {
					options.selectedTextFormat = 'count';
					options.noneSelectedText = this.filter_placeholder;
				}
				else if (mode === 'insert') {
					options.noneSelectedText = this.insert_placeholder;
				}
				else {
					options.noneSelectedText = this.edit_placeholder;
				}
				$result.selectpicker(options);
			}.bind(this));
			$result.on('remove', function () {
				$result.selectpicker('hide');
				$result.selectpicker('destroy');
			})
			$result.prop('selectedIndex', selectedIndex);
			var $parent = $('<div>').css('width', '100%').append($result);

			return { container: $parent, control: $result};
		}
	});

	jsGrid.fields.selectex = jsGrid.SelectExField = SelectExField;
	jsGrid.filterIDs = function(value, filter) {
		if (!filter)
			return true;
		else if ($.isArray(filter)) {
			return filter.includes(value);
		}
		return value === filter
	};

}(jsGrid, jQuery));
