(function(window, $, undefined) {

    var JSGRID = "JSGrid",
        JSGRID_DATA_KEY = JSGRID,
        JSGRID_ROW_DATA_KEY = "JSGridItem",
        JSGRID_EDIT_ROW_DATA_KEY = "JSGridEditRow",

        SORT_ORDER_ASC = "asc",
        SORT_ORDER_DESC = "desc",

        FIRST_PAGE_PLACEHOLDER = "{first}",
        PAGES_PLACEHOLDER = "{pages}",
        PREV_PAGE_PLACEHOLDER = "{prev}",
        NEXT_PAGE_PLACEHOLDER = "{next}",
        LAST_PAGE_PLACEHOLDER = "{last}",
        PAGE_INDEX_PLACEHOLDER = "{pageIndex}",
        PAGE_COUNT_PLACEHOLDER = "{pageCount}",
        ITEM_COUNT_PLACEHOLDER = "{itemCount}",

        EMPTY_HREF = "javascript:void(0);";

    var getOrApply = function(value, context) {
        if($.isFunction(value)) {
            return value.apply(context, $.makeArray(arguments).slice(2));
        }
        return value;
    };

    var normalizePromise = function(promise) {
        var d = $.Deferred();

        if(promise && promise.then) {
            promise.then(function() {
                d.resolve.apply(d, arguments);
            }, function() {
                d.reject.apply(d, arguments);
            });
        } else {
            d.resolve(promise);
        }

        return d.promise();
    };

    var defaultController = {
        loadData: $.noop,
        insertItem: $.noop,
        updateItem: $.noop,
        deleteItem: $.noop
    };


    function Grid(element, config) {
        var $element = $(element);

        $element.data(JSGRID_DATA_KEY, this);

        this._container = $element;

        this.data = [];
        this.fields = [];

        this._editingRow = null;
        this._sortField = null;
        this._sortOrder = SORT_ORDER_ASC;
        this._sortField2 = null;
        this._sortOrder2 = SORT_ORDER_ASC;
        this._firstDisplayingPage = 1;

        this._init(config);
        this.render();
    }

    Grid.prototype = {
        width: "auto",
        height: "auto",
        updateOnResize: true,

        rowClass: $.noop,
        rowRenderer: null,

        autoUpdate: true,
        editOnRowClick: false,
        rowClick: function(args) {
            if(this.editing && this.editOnRowClick) {
                this._editRow($(args.event.target).closest("tr"), $(args.event.target).closest("td").eq(0));
            }
            else if (this.autoUpdate && this._editingRow) {
                this.updateItem();
            }
            else {
                this.cancelEdit();
            }
        },
        rowDoubleClick:  function(args) {
            if(this.editing && this.editOnRowClick === false) {
                this._editRow($(args.event.target).closest("tr"), $(args.event.target).closest("td").eq(0));
            }
            else if (this.autoUpdate && this._editingRow) {
                this.updateItem();
            }
            else {
                this.cancelEdit();
            }
        },
        rowContextmenu: $.noop,

        noDataContent: "Not found",
        noDataRowClass: "jsgrid-nodata-row",

        heading: true,
        headerRowRenderer: null,
        headerRowClass: "jsgrid-header-row",
        headerCellClass: "jsgrid-header-cell",
        headerTitleClass: "jsgrid-header-title",

        summarying: false,
        summaryRowRenderer: null,
        summaryRowClass: "jsgrid-summary-row",
        summaryCellClass: "jsgrid-summary-cell",
        summaryContentClass: "jsgrid-summary-content",

        filtering: false,
        filterRowRenderer: null,
        filterRowClass: "jsgrid-filter-row",

        inserting: false,
        insertRowLocation: "sorted",
        insertRowRenderer: null,
        insertRowClass: "jsgrid-insert-row",

        contentHiddenHeaderClass: "jsgrid-content-hidden-header",
        contentHiddenHeaderRowClass: "jsgrid-content-hidden-header-row",
        contentHiddenHeaderCellClass: "jsgrid-content-hidden-header-cell",
        contentHiddenHeaderTitleClass: "jsgrid-content-hidden-header-title",

        editing: false,
        editRowRenderer: null,
        editRowClass: "jsgrid-edit-row",

        confirmDeleting: true,
        deleteConfirm: "Are you sure?",

        selecting: true,
        multiSelecting: false,
        lastSelectedRow: null,
        hoveredRowClass: "jsgrid-hovered-row",
        selectedRowClass: "jsgrid-selected-row",
        oddRowClass: "jsgrid-row",
        evenRowClass: "jsgrid-alt-row",
        cellClass: "jsgrid-cell",

        sorting: false,
        sortableClass: "jsgrid-header-sortable",
        sortAscClass: "jsgrid-header-sort jsgrid-header-sort-asc",
        sortDescClass: "jsgrid-header-sort jsgrid-header-sort-desc",

        resizing: false,
        resizeClass: "jsgrid-header-resize",

        paging: false,
        pagerContainer: null,
        pageIndex: 1,
        pageSize: 20,
        pageButtonCount: 15,
        pagerFormat: "Pages: {first} {prev} {pages} {next} {last} &nbsp;&nbsp; {pageIndex} of {pageCount}",
        pagePrevText: "Prev",
        pageNextText: "Next",
        pageFirstText: "First",
        pageLastText: "Last",
        pageNavigatorNextText: "...",
        pageNavigatorPrevText: "...",
        pagerContainerClass: "jsgrid-pager-container",
        pagerClass: "jsgrid-pager",
        pagerNavButtonClass: "jsgrid-pager-nav-button",
        pagerNavButtonInactiveClass: "jsgrid-pager-nav-inactive-button",
        pageClass: "jsgrid-pager-page",
        currentPageClass: "jsgrid-pager-current-page",

        customLoading: false,
        pageLoading: false,

        autoload: false,
        controller: defaultController,

        loadIndication: true,
        loadIndicationDelay: 500,
        loadMessage: "Please, wait...",
        loadShading: true,

        invalidMessage: "Invalid data entered!",

        invalidNotify: function(args) {
            var messages = $.map(args.errors, function(error) {
                return error.message || null;
            });

            window.alert([this.invalidMessage].concat(messages).join("\n"));
        },

        onInit: $.noop,
        onRefreshing: $.noop,
        onRefreshed: $.noop,
        onPageChanged: $.noop,
        onItemSelected: $.noop,
        onItemDeleting: $.noop,
        onItemConfirmDelete: function(item, succcessFunc){
            if (window.confirm(getOrApply(this.deleteConfirm, this, item)))
                return succcessFunc.apply(this);
        },
        onItemDeleted: $.noop,
        onItemInserting: $.noop,
        onItemInserted: $.noop,
        onItemEditing: $.noop,
        onItemEditCancelling: $.noop,
        onItemUpdating: $.noop,
        onItemUpdated: $.noop,
        onItemInvalid: $.noop,
        onDataLoading: $.noop,
        onDataLoaded: $.noop,
        onDataExporting: $.noop,
        onOptionChanging: $.noop,
        onOptionChanged: $.noop,
        onInitFilter: $.noop,
        onFilterChanged: $.noop,
        onInitFieldWidth: $.noop,
        onFieldWidthChanged: $.noop,
        onError: $.noop,

        invalidClass: "jsgrid-invalid",

        containerClass: "jsgrid",
        tableClass: "jsgrid-table",
        gridHeaderClass: "jsgrid-grid-header",
        gridBodyClass: "jsgrid-grid-body",
        gridSummaryClass: "jsgrid-grid-summary",

        _init: function(config) {
            $.extend(this, config);
            this._initLoadStrategy();
            this._initController();
            this._initFields();
            this._attachWindowLoadResize();
            this._attachWindowResizeCallback();
            this._callEventHandler(this.onInit)
        },

        loadStrategy: function() {
            return this.pageLoading
                ? new jsGrid.loadStrategies.PageLoadingStrategy(this)
                : new jsGrid.loadStrategies.DirectLoadingStrategy(this);
        },

        _initLoadStrategy: function() {
            this._loadStrategy = getOrApply(this.loadStrategy, this);
        },

        _initController: function() {
            this._controller = $.extend({}, defaultController, getOrApply(this.controller, this));
        },

        renderTemplate: function(source, context, config) {
            var args = [];
            for(var key in config) {
                args.push(config[key]);
            }

            args.unshift(source, context);

            source = getOrApply.apply(null, args);
            return (source === undefined || source === null) ? "" : source;
        },

        loadIndicator: function(config) {
            return new jsGrid.LoadIndicator(config);
        },

        validation: function(config) {
            return jsGrid.Validation && new jsGrid.Validation(config);
        },

        _initFields: function() {
            var self = this;
            self.fields = $.map(self.fields, function(field) {
                if($.isPlainObject(field)) {
                    var fieldConstructor = (field.type && jsGrid.fields[field.type]) || jsGrid.Field;
                    field = new fieldConstructor(field);
                    var eventArgs = {
                        columnName: field.name,
                        field: field
                    };
                    self._callEventHandler(self.onInitFieldWidth, eventArgs);
                }
                field._grid = self;
                return field;
            });
            var spacer = new jsGrid.SpacerField();
            spacer._grid = this;
            self.fields.push(spacer);
        },

        _attachWindowLoadResize: function() {
            $(window).on("load", $.proxy(this._refreshSize, this));
        },

        _attachWindowResizeCallback: function() {
            if(this.updateOnResize) {
                $(window).on("resize", $.proxy(this._refreshSize, this));
            }
        },

        _detachWindowResizeCallback: function() {
            $(window).off("resize", this._refreshSize);
        },

        option: function(key, value) {
            var optionChangingEventArgs,
                optionChangedEventArgs;

            if(arguments.length === 1)
                return this[key];

            optionChangingEventArgs = {
                option: key,
                oldValue: this[key],
                newValue: value
            };
            this._callEventHandler(this.onOptionChanging, optionChangingEventArgs);

            this._handleOptionChange(optionChangingEventArgs.option, optionChangingEventArgs.newValue);

            optionChangedEventArgs = {
                option: optionChangingEventArgs.option,
                value: optionChangingEventArgs.newValue
            };
            this._callEventHandler(this.onOptionChanged, optionChangedEventArgs);
        },

        fieldOption: function(field, key, value) {
            field = this._normalizeField(field);

            if(arguments.length === 2)
                return field[key];

            field[key] = value;
            this._renderGrid();
        },

        _handleOptionChange: function(name, value) {
            this[name] = value;

            switch(name) {
                case "width":
                case "height":
                    this._refreshSize();
                    break;
                case "rowClass":
                case "rowRenderer":
                case "rowClick":
                case "rowDoubleClick":
                case "noDataRowClass":
                case "noDataContent":
                case "selecting":
                case "multiSelecting":
                case "hoveredRowClass":
                case "selectedRowClass":
                case "oddRowClass":
                case "evenRowClass":
                    this._refreshContent();
                    break;
                case "pageButtonCount":
                case "pagerFormat":
                case "pagePrevText":
                case "pageNextText":
                case "pageFirstText":
                case "pageLastText":
                case "pageNavigatorNextText":
                case "pageNavigatorPrevText":
                case "pagerClass":
                case "pagerNavButtonClass":
                case "pageClass":
                case "currentPageClass":
                case "pagerRenderer":
                    this._refreshPager();
                    break;
                case "fields":
                    this._initFields();
                    this.render();
                    break;
                case "data":
                case "editing":
                case "heading":
                case "summarying":
                case "filtering":
                case "inserting":
                case "paging":
                    this.refresh();
                    break;
                case "loadStrategy":
                case "pageLoading":
                    this._initLoadStrategy();
                    this.search();
                    break;
                case "pageIndex":
                    this.openPage(value);
                    break;
                case "pageSize":
                    this.refresh();
                    this.search();
                    break;
                case "editRowRenderer":
                case "editRowClass":
                    this.cancelEdit();
                    break;
                case "updateOnResize":
                    this._detachWindowResizeCallback();
                    this._attachWindowResizeCallback();
                    break;
                case "invalidNotify":
                case "invalidMessage":
                    break;
                default:
                    this.render();
                    break;
            }
        },

        destroy: function() {
            this._detachWindowResizeCallback();
            this._clear();
            this._container.removeData(JSGRID_DATA_KEY);
        },

        render: function() {
            this._renderGrid();
            return this.autoload ? this.loadData() : $.Deferred().resolve().promise();
        },

        _renderGrid: function() {
            this._clear();

            this._container.addClass(this.containerClass)
                .css("position", "relative")
                .append(this._createHeader())
                .append(this._createBody())
                .append(this._createSummary());

            this._pagerContainer = this._createPagerContainer();
            this._loadIndicator = this._createLoadIndicator();
            this._validation = this._createValidation();

            this.refresh();
        },

        _createLoadIndicator: function() {
            return getOrApply(this.loadIndicator, this, {
                message: this.loadMessage,
                shading: this.loadShading,
                container: this._container
            });
        },

        _createValidation: function() {
            return getOrApply(this.validation, this);
        },

        _clear: function() {
            this.cancelEdit();

            clearTimeout(this._loadingTimer);

            this._pagerContainer && this._pagerContainer.empty();

            this._container.empty()
                .css({ position: "", width: "", height: "" });
        },

        _createHeader: function() {
            var $headerRow = this._headerRow = this._createHeaderRow(),
                $filterRow = this._filterRow = this._createFilterRow(),
                $insertRow = this._insertRow = this._createInsertRow();
            var $headerHeader = $("<thead>").append($headerRow);
            var $headerBody = $("<tbody>").append($filterRow).append($insertRow);
            var $headerGrid = this._headerGrid = $("<table>").addClass(this.tableClass)
                .append($headerHeader)
                .append($headerBody);

            var $header = this._header = $("<div>").addClass(this.gridHeaderClass)
                .addClass(this._scrollBarWidth() ? "jsgrid-header-scrollbar" : "")
                .append($headerGrid);

            return $header;
        },

        _createBody: function() {
            var $contentHeader = this._contentHeader = this._createContentHeader();
            var $content = this._content = $("<tbody>");

            var $bodyGrid = this._bodyGrid = $("<table>").addClass(this.tableClass)
                .append($contentHeader)
                .append($content);

            var $body = this._body = $("<div>").addClass(this.gridBodyClass)
                .append($bodyGrid)
                /*.on("scroll", $.proxy(function(e) {
                    this._header.scrollLeft(e.target.scrollLeft);
                    this._summary.scrollLeft(e.target.scrollLeft);
                }, this))*/
                .on("contextmenu", $.proxy(function(e) {
                    if (e.target.nodeName == "TD")
                        return;
                    var args = {
                        item: null,
                        itemIndex: -1,
                        event: e
                    };
                    this.rowContextmenu(args);
                    return !args.cancel;
                }, this));

            return $body;
        },

        _createSummary: function() {
            var $summaryRow = this._summaryRow = this._createSummaryRow();

            var $summaryGrid = this._summaryGrid = $("<table>").addClass(this.tableClass)
                .append($summaryRow);

            var $summary = this._summary = $("<div>").addClass(this.gridSummaryClass)
                .addClass(this._scrollBarWidth() ? "jsgrid-summary-scrollbar" : "")
                .append($summaryGrid)
                .on("scroll", $.proxy(function(e) {
                    var a1 = this._header.scrollLeft(e.target.scrollLeft);
                    var b1 = this._body.scrollLeft(e.target.scrollLeft);
                    var a2 = this._header.scrollLeft();
                    var b2 = this._body.scrollLeft();
                }, this))

            return $summary;
        },

        _createPagerContainer: function() {
            var pagerContainer = this.pagerContainer || $("<div>").appendTo(this._container);
            return $(pagerContainer).addClass(this.pagerContainerClass);
        },

        _eachField: function(callBack) {
            var self = this;
            $.each(this.fields, function(index, field) {
                if(field.visible) {
                    callBack.call(self, field, index);
                }
            });
        },

        _createHeaderRow: function() {
            if($.isFunction(this.headerRowRenderer))
                return $(this.renderTemplate(this.headerRowRenderer, this));

            var $result = $("<tr>").addClass(this.headerRowClass);

            this._eachField(function(field, index) {
                var $thTitle = $('<div>').addClass(this.headerTitleClass)
                    .append(this.renderTemplate(field.headerTemplate, field));
                var $th = this._prepareCell("<th>", field, "headercss", this.headerCellClass, true)
                    .css("width", field.width)
                    .append($thTitle)
                    .appendTo($result);
                $th.get(0).jsGridField = field;
                if(this.sorting && field.sorting) {
                    $thTitle.addClass(this.sortableClass)
                        .on("click", $.proxy(function(e) {
                            this.sort(index);
                        }, this));
                }
                if(this.resizing && field.resizing) {
                    var dragStartPosition = 0;
                    var columnStartingWidth = 0;
                    var isDragging = false;

                    var onMove = $.proxy(function (e) {
                        if (isDragging === true) {
                            var newWidth = columnStartingWidth + (e.clientX - dragStartPosition);
                            $th.css("width", newWidth);
                            var fieldIndex = $.inArray($th.get(0).jsGridField, this.fields);
                            var childIndex = $th.parent().children().index($th);
                            this._contentHeader.find('tr > th:eq('+childIndex+')').css("width", newWidth);
                            var beforeHight = this._summary.outerHeight(true);
                            this._summaryGrid.find('tr > th:eq('+childIndex+')').css("width", newWidth);
                            if (beforeHight !== this._summary.outerHeight(true))
                                this._refreshHeight();
                            this.fields[fieldIndex].width = newWidth;
                        }
                    }, this);

                    var onDragEnd = $.proxy(function (e) {
                        if (isDragging === true) {
                            var childIndex = $.inArray($th.get(0).jsGridField, this.fields);
                            //var childIndex = $th.parent().children().index($th);
                            document.removeEventListener("mousemove", onMove);
                            document.removeEventListener("mousemove", onDragEnd);
                            var eventArgs2 = {
                                columnName: this.fields[childIndex].name,
                                value: this.fields[childIndex].width
                            }
                            this._callEventHandler(this.onFieldWidthChanged, eventArgs2);
                            isDragging = false;
                        }
                    }, this);

                    var resizeElement = $('<span class="'+this.resizeClass+'">').on("mousedown", $.proxy(function(e) {
                        dragStartPosition = e.clientX;
                        columnStartingWidth = parseInt($th.outerWidth());
                        document.addEventListener("mousemove", onMove);
                        document.addEventListener("mouseup", onDragEnd);
                        isDragging = true;
                    }, this))

                    $th.append(resizeElement)
                }
            });
            $result.ready(this._initializeColumnWidth.bind(this));
            return $result;
        },

        _initializeColumnWidth(element, e) {
            if (this._columWidthInitialized === true) {
                return;
            }
            var widthes = [];
            var autoElemCount = 0;
            var rowWidth = this._headerRow.innerWidth() - this.fields.length * 2;
            if (rowWidth > 0) {
                var rowSpace = rowWidth;
                this._headerRow.find("th").each(function(index, elem) {
                    var field = elem.jsGridField;
                    var width = {style: "", real: $(elem).outerWidth(), min: 0};
                    if (field instanceof jsGrid.SpacerField) {
                        width.style = "spacer";
                        width.real = "auto";
                        width.value = 0;
                    }
                    else if (elem.style.width === "auto") {
                        width.style = "auto";
                        width.value = "auto";
                        width.min = field.minWidth;
                        autoElemCount++;
                    }
                    else {
                        width.value = width.real;
                        rowSpace -= width.real;
                    }
                    widthes.push(width);
                }.bind(this));

                var autoWidth = rowSpace / autoElemCount;
                widthes.forEach(function(width) {
                    if (width.style === "auto") {
                        width.real = Math.max(autoWidth, width.real, width.min);
                    }
                });
                this._headerRow.find("th").each(function(index, elem){
                    var field = elem.jsGridField;
                    field.width = widthes[index].real;//$(elem).outerWidth();
                    $(elem).css("width", widthes[index].real);
                    this._contentHeader.find('tr > th:eq('+index+')').css("width", widthes[index].real);
                    this._summaryGrid.find('tr > th:eq('+index+')').css("width", widthes[index].real);

                    var eventArgs = {
                        columnName: field.name,
                        value: field.width
                    };
                    this._callEventHandler(this.onFieldWidthChanged, eventArgs);
                }.bind(this));
                this._columWidthInitialized = true;
            }
            else {
                //this._headerRow.find("th").each(function(index, elem){
                //  if (this.fields[index] instanceof jsGrid.SpacerField) {
                //    $(elem).css("width","auto");
                //    this._contentHeader.find('tr > th:eq('+index+')').css("width", "auto");
                //    this._summaryGrid.find('tr > th:eq('+index+')').css("width", "auto");
                //  }
                //}.bind(this));
            }
        },

        _createContentHeader: function() {

            var $row = $("<tr>").addClass(this.contentHiddenHeaderRowClass);

            this._eachField(function(field, index) {
                var $thTitle = $('<p>').addClass(this.contentHiddenHeaderTitleClass)
                    .append(this.renderTemplate(field.name, field));
                var $th = this._prepareCell("<th>", field, "headercss", this.contentHiddenHeaderCellClass, true)
                    .css("width", field.width)
                    .append($thTitle)
                    .appendTo($row);
            });
            var $result = $("<thead>").addClass(this.contentHiddenHeaderClass).append($row);
            return $result;
        },

        _createSummaryRow: function() {
            if($.isFunction(this.summaryRowRenderer))
                return $(this.renderTemplate(this.summaryRowRenderer, this));

            var $tr = $("<tr>").addClass(this.summaryRowClass);
            var $result = $("<thead>").append($tr);

            this._eachField(function(field, index) {
                var $thTitle = $('<div>').addClass(this.summaryContentClass)
                    .append(this.renderTemplate(field.summaryTemplate, field));
                var $th = this._prepareCell("<th>", field, "headercss", this.summaryCellClass, true)
                  //.css("width", field.width)
                    .append($thTitle)
                    .appendTo($tr);
            });/*
            $result.ready(function() {
                var widthes = [];
                $result.find("th").each(function(index, elem){
                    if (elem.style.width === "auto" || (this.fields[index] instanceof jsGrid.ControlField))
                    widthes.push("");
                    else
                    widthes.push($(elem).innerWidth());
                }.bind(this));
                $result.find("th").each(function(index, elem){
                    if (widthes[index] !== "") {
                    $(elem).css("width", widthes[index]);
                    //var e =   this._content.find('tr > :eq('+index+')');
                    //this._content.find('tr > td:eq('+index+')').css("width", widthes[index]);
                    }
                }.bind(this));
            }.bind(this));*/
            return $result;
        },

        _prepareCell: function(cell, field, cssprop, cellClass, setWidth) {
            var $result = setWidth === true ? $(cell).css("width", field.width) : $(cell);
            return $result
                .addClass(cellClass || this.cellClass)
                .addClass(field.readOnly ? 'readonly' : '')
                .addClass((cssprop && field[cssprop]) || field.css)
                .addClass(field.align ? ("jsgrid-align-" + field.align) : "");
        },

        _createFilterRow: function() {
            if($.isFunction(this.filterRowRenderer))
                return $(this.renderTemplate(this.filterRowRenderer, this));

            var $result = $("<tr>").addClass(this.filterRowClass);

            this._eachField(function(field) {
                this._prepareCell("<td>", field, "filtercss")
                    .append(this.renderTemplate(field.filterTemplate, field))
                    .appendTo($result);
            });

            return $result;
        },

        _createInsertRow: function() {
            if($.isFunction(this.insertRowRenderer))
                return $(this.renderTemplate(this.insertRowRenderer, this));

            var $result = $("<tr>").addClass(this.insertRowClass);

            this._eachField(function(field) {
                this._prepareCell("<td>", field, "insertcss")
                    .append(this.renderTemplate(field.insertTemplate, field))
                    .appendTo($result);
            });

            return $result;
        },

        _callEventHandler: function(handler, eventParams) {
            handler.call(this, $.extend(eventParams, {
                grid: this
            }));

            return eventParams;
        },

        reset: function() {
            //this._resetSorting();
            this._resetPager();
            return this._loadStrategy.reset();
        },

        _resetPager: function() {
            this._firstDisplayingPage = 1;
            this._setPage(1);
        },

        _resetSorting: function() {
            this._sortField = null;
            this._sortOrder = SORT_ORDER_ASC;
            this._sortField2 = null;
            this._sortOrder2 = SORT_ORDER_ASC;
            this._clearSortingCss();
        },

        refresh: function() {
            this._callEventHandler(this.onRefreshing);

            this.cancelEdit();

            this._refreshHeading();
            this._refreshFiltering();
            this._refreshInserting();
            this._refreshSummarying();
            this._refreshContent();
            this._refreshPager();
            this._refreshSize();

            this._callEventHandler(this.onRefreshed);
        },

        _refreshHeading: function() {
            this._headerRow.toggle(this.heading);
        },

        _refreshFiltering: function() {
            this._filterRow.toggle(this.filtering);
        },

        _refreshInserting: function() {
            this._insertRow.toggle(this.inserting);
        },

        _refreshSummarying: function() {
            //this._summaryRow.toggle(this.summarying);
            if (this.summarying) {
                this._summary.removeClass('jsgrid-hidden-summary');
            }
            else {
                this._summary.addClass('jsgrid-hidden-summary');
            }
            if (this.summarying && this.data.length) {
                var indexFrom = this._loadStrategy.firstDisplayIndex();
                var indexTo = this._loadStrategy.lastDisplayIndex();
                var visibleContents = this.data.slice(indexFrom, indexTo);
                this._eachField(function(field) {
                    var args = { values: visibleContents.map(function(itm) { return itm[field.name]; }) };
                    this.renderTemplate(field.summaryValue, field, args)
                });
            }
        },

        _refreshContent: function() {
            this.lastSelectedRow = null;
            var $content = this._content;
            $content.empty();

            if(!this.data.length) {
                $content.append(this._createNoDataRow());
                return this;
            }

            var indexFrom = this._loadStrategy.firstDisplayIndex();
            var indexTo = this._loadStrategy.lastDisplayIndex();

            for(var itemIndex = indexFrom; itemIndex < indexTo; itemIndex++) {
                var item = this.data[itemIndex];
                $content.append(this._createRow(item, itemIndex));
            }
            if ($content.tooltip !== undefined && $content.tooltip !== null)
                $content.tooltip({relative: true, items: "td", position: {
                my: 'left top', at: 'right bottom', collision: 'none'
                }});
        },

        _createNoDataRow: function() {
            var amountOfFields = 0;
            this._eachField(function() {
                amountOfFields++;
            });

            return $("<tr>").addClass(this.noDataRowClass)
                .append($("<td>").addClass(this.cellClass).attr("colspan", amountOfFields)
                    .append(this.renderTemplate(this.noDataContent, this)));
        },

        _createRow: function(item, itemIndex) {
            var $result;

            if($.isFunction(this.rowRenderer)) {
                $result = this.renderTemplate(this.rowRenderer, this, { item: item, itemIndex: itemIndex });
            } else {
                $result = $("<tr>");
                this._renderCells($result, item);
            }

            $result.addClass(this._getRowClasses(item, itemIndex))
                .data(JSGRID_ROW_DATA_KEY, item)
                .on("click", $.proxy(function(e) {
                    var args = {
                        item: item,
                        itemIndex: itemIndex,
                        event: e
                    };
                    this.rowClick(args);
                    if (!args.cancel && this.selecting) {
                        var oldSelectItems = this.data.filter(function(itm) {
                            return (itm.selected && itm !== item);
                        });
                        if (!this.multiSelecting || (!e.ctrlKey && !e.shiftKey)) {
                            oldSelectItems.forEach(function(itm) {
                                itm.selected = false;
                                this.rowByItem(itm).removeClass(this.selectedRowClass);
                            }.bind(this));
                            if (!item.selected) {
                                $result.removeClass(this.hoveredRowClass);
                                $result.toggleClass(this.selectedRowClass);
                                item.selected = true;
                                this.onItemSelected([item], oldSelectItems);
                            }
                            else if (oldSelectItems.length > 0) {
                                this.onItemSelected([], oldSelectItems);
                            }
                            this.lastSelectedRow = $result;
                        }
                        else {
                            if (!e.shiftKey || !this.lastSelectedRow) {
                                if (e.ctrlKey) {
                                    $result.removeClass(this.hoveredRowClass);
                                    $result.toggleClass(this.selectedRowClass);
                                    if (!item.selected) {
                                        item.selected = true;
                                        this.onItemSelected([item], []);
                                    }
                                    else {
                                        item.selected = false;
                                        this.onItemSelected([], [item]);
                                    }
                                }
                                this.lastSelectedRow = $result;
                            }
                            else {
                                var oldSelectItems = this.data.filter(function(itm) {
                                    return (itm.selected);
                                });
                                var rows = this._content.find("tr");
                                var lastItemIndex = rows.index(this.lastSelectedRow);
                                var thisIndex = rows.index($result);
                                var minIndex = Math.min(lastItemIndex, thisIndex);
                                var maxIndex = Math.max(lastItemIndex, thisIndex);
                                var newSelected = [];
                                var newDeselected = [];
                                for (var i=minIndex; i<=maxIndex; i++) {
                                    var row = rows.get(i);
                                    $(row).removeClass(this.hoveredRowClass);
                                    var itm = $(row).data(JSGRID_ROW_DATA_KEY);
                                    //if (lastItemIndex <  thisIndex) {
                                    $(row).addClass(this.selectedRowClass);
                                    if (!itm.selected)
                                        newSelected.push(itm);
                                    itm.selected = true;

                                    var index = oldSelectItems.indexOf(itm);
                                    if (index > -1) {
                                        oldSelectItems.splice(index, 1);
                                    }
                                }
                                for (var i=0; i<oldSelectItems.length; i++) {
                                    var $row = this.rowByItem(oldSelectItems[i]);
                                    $row.removeClass(this.selectedRowClass);
                                    oldSelectItems[i].selected = false;
                                }
                                this.onItemSelected(newSelected, oldSelectItems);
                            }
                        }
                    }
                }, this))
                .on("dblclick", $.proxy(function(e) {
                    this.rowDoubleClick({
                        item: item,
                        itemIndex: itemIndex,
                        event: e
                    });
                }, this))
                .on("contextmenu", $.proxy(function(e) {
                    var args = {
                        item: item,
                        itemIndex: itemIndex,
                        event: e
                    };
                    this.rowContextmenu(args);
                    return !args.cancel;
                }, this));
            if (item.selected) {
                $result.addClass(this.selectedRowClass);
            }
            if(this.selecting) {
                this._attachRowHover($result);
            }

            return $result;
        },

        _getRowClasses: function(item, itemIndex) {
            var classes = [];
            classes.push(((itemIndex + 1) % 2) ? this.oddRowClass : this.evenRowClass);
            classes.push(getOrApply(this.rowClass, this, item, itemIndex));
            return classes.join(" ");
        },

        _attachRowHover: function($row) {
            var hoveredRowClass = this.hoveredRowClass;
            $row.hover(function() {
                    var item = $row.data(JSGRID_ROW_DATA_KEY);
                    if (!item.selected)
                        $(this).addClass(hoveredRowClass);
                },
                function() {
                    $(this).removeClass(hoveredRowClass);
                }
            );
        },

        _renderCells: function($row, item) {
            this._eachField(function(field) {
                $row.append(this._createCell(item, field));
            });
            return this;
        },

        _createCell: function(item, field) {
            var $result;
            var fieldValue = this._getItemFieldValue(item, field);

            var args = { value: fieldValue, item : item };
            if($.isFunction(field.cellRenderer)) {
                $result = this.renderTemplate(field.cellRenderer, field, args);
            } else {
                fieldValue = this.renderTemplate(field.itemTemplate || fieldValue, field, args)
                $result = $("<td>").append(fieldValue);
            }
            if ((typeof fieldValue) === "string"||(typeof fieldValue) === "number"||(typeof fieldValue) === "boolean") {
                $result.attr("title", fieldValue.toString());
            }

            return this._prepareCell($result, field);
        },

        _getItemFieldValue: function(item, field) {
            var props = field.name.split('.');
            var result = item[props.shift()];

            while(result && props.length) {
                result = result[props.shift()];
            }

            return result;
        },

        _setItemFieldValue: function(item, field, value) {
            var props = field.name.split('.');
            var current = item;
            var prop = props[0];

            while(current && props.length) {
                item = current;
                prop = props.shift();
                current = item[prop];
            }

            if(!current) {
                while(props.length) {
                    item = item[prop] = {};
                    prop = props.shift();
                }
            }

            item[prop] = value;
        },

        sort: function(field, order, field2, order2) {
            if($.isPlainObject(field)) {
                order = field.order;
                field = field.field;
            }
            if(field2 !== undefined && $.isPlainObject(field2)) {
                order2 = field2.order;
                field2 = field2.field;
            }

            this._clearSortingCss();
            this._setSortingParams(field, order, field2, order2);
            this._setSortingCss();
            return this._loadStrategy.sort();
        },

        _clearSortingCss: function() {
            this._headerRow.find("th")
                .removeClass(this.sortAscClass)
                .removeClass(this.sortDescClass);
        },

        _setSortingParams: function(field, order, field2, order2) {
            field = this._normalizeField(field);
            order = order || ((this._sortField === field) ? this._reversedSortOrder(this._sortOrder) : SORT_ORDER_ASC);
            if (field2 !== undefined && order2 !== undefined) {
                field2 = this._normalizeField(field2);
                order2 = order2 || ((this._sortField2 === field2) ? this._reversedSortOrder(this._sortOrder2) : SORT_ORDER_ASC);
            }
            this._sortField = field;
            this._sortOrder = order;

            if (field2 !== undefined && order2 !== undefined) {
                this._sortField2 = field2;
                this._sortOrder2 = order2;
            }
            else {
                this._sortField2 = null;
                this._sortOrder2 = SORT_ORDER_ASC;
            }
        },

        _normalizeField: function(field) {
            if($.isNumeric(field)) {
                return this.fields[field];
            }

            if(typeof field === "string") {
                return $.grep(this.fields, function(f) {
                    return f.name === field;
                })[0];
            }

            return field;
        },

        _reversedSortOrder: function(order) {
            return (order === SORT_ORDER_ASC ? SORT_ORDER_DESC : SORT_ORDER_ASC);
        },

        _setSortingCss: function() {
            var fieldIndex = this._visibleFieldIndex(this._sortField);

            this._headerRow.find("th").eq(fieldIndex)
                .addClass(this._sortOrder === SORT_ORDER_ASC ? this.sortAscClass : this.sortDescClass);
        },

        _visibleFieldIndex: function(field) {
            return $.inArray(field, $.grep(this.fields, function(f) { return f.visible; }));
        },

        _sortData: function() {
            var sortFactor = this._sortFactor(),
                sortField = this._sortField;
            var sortFactor2 = this._sortFactor2(),
                sortField2 = this._sortField2;

            if(sortField) {
                this.data.sort(function(item1, item2) {
                    var res = sortFactor * sortField.sortingFunc(item1[sortField.name], item2[sortField.name]);
                    if (res == 0 && sortField2 !== undefined && sortField2 !== null) {
                      return sortFactor2 * sortField2.sortingFunc(item1[sortField2.name], item2[sortField2.name]);
                    }
                    return res;
                });
            }
        },

        _sortFactor: function() {
            return this._sortOrder === SORT_ORDER_ASC ? 1 : -1;
        },

        _sortFactor2: function() {
            return this._sortOrder2 === SORT_ORDER_ASC ? 1 : -1;
        },

        _itemsCount: function() {
            return this._loadStrategy.itemsCount();
        },

        _pagesCount: function() {
            var itemsCount = this._itemsCount(),
                pageSize = this.pageSize;
            return Math.floor(itemsCount / pageSize) + (itemsCount % pageSize ? 1 : 0);
        },

        _refreshPager: function() {
            var $pagerContainer = this._pagerContainer;
            $pagerContainer.empty();

            if(this.paging) {
                $pagerContainer.append(this._createPager());
            }

            var showPager = this.paging && this._pagesCount() > 1;
            $pagerContainer.toggle(showPager);
        },

        _createPager: function() {
            var $result;

            if($.isFunction(this.pagerRenderer)) {
                $result = $(this.pagerRenderer({
                    pageIndex: this.pageIndex,
                    pageCount: this._pagesCount()
                }));
            } else {
                $result = $("<div>").append(this._createPagerByFormat());
            }

            $result.addClass(this.pagerClass);

            return $result;
        },

        _createPagerByFormat: function() {
            var pageIndex = this.pageIndex,
                pageCount = this._pagesCount(),
                itemCount = this._itemsCount(),
                pagerParts = this.pagerFormat.split(" ");

            return $.map(pagerParts, $.proxy(function(pagerPart) {
                var result = pagerPart;

                if(pagerPart === PAGES_PLACEHOLDER) {
                    result = this._createPages();
                } else if(pagerPart === FIRST_PAGE_PLACEHOLDER) {
                    result = this._createPagerNavButton(this.pageFirstText, 1, pageIndex > 1);
                } else if(pagerPart === PREV_PAGE_PLACEHOLDER) {
                    result = this._createPagerNavButton(this.pagePrevText, pageIndex - 1, pageIndex > 1);
                } else if(pagerPart === NEXT_PAGE_PLACEHOLDER) {
                    result = this._createPagerNavButton(this.pageNextText, pageIndex + 1, pageIndex < pageCount);
                } else if(pagerPart === LAST_PAGE_PLACEHOLDER) {
                    result = this._createPagerNavButton(this.pageLastText, pageCount, pageIndex < pageCount);
                } else if(pagerPart === PAGE_INDEX_PLACEHOLDER) {
                    result = pageIndex;
                } else if(pagerPart === PAGE_COUNT_PLACEHOLDER) {
                    result = pageCount;
                } else if(pagerPart === ITEM_COUNT_PLACEHOLDER) {
                    result = itemCount;
                }

                return $.isArray(result) ? result.concat([" "]) : [result, " "];
            }, this));
        },

        _createPages: function() {
            var pageCount = this._pagesCount(),
                pageButtonCount = this.pageButtonCount,
                firstDisplayingPage = this._firstDisplayingPage,
                pages = [];

            if(firstDisplayingPage > 1) {
                pages.push(this._createPagerPageNavButton(this.pageNavigatorPrevText, this.showPrevPages));
            }

            for(var i = 0, pageNumber = firstDisplayingPage; i < pageButtonCount && pageNumber <= pageCount; i++, pageNumber++) {
                pages.push(pageNumber === this.pageIndex
                    ? this._createPagerCurrentPage()
                    : this._createPagerPage(pageNumber));
            }

            if((firstDisplayingPage + pageButtonCount - 1) < pageCount) {
                pages.push(this._createPagerPageNavButton(this.pageNavigatorNextText, this.showNextPages));
            }

            return pages;
        },

        _createPagerNavButton: function(text, pageIndex, isActive) {
            return this._createPagerButton(text, this.pagerNavButtonClass + (isActive ? "" : " " + this.pagerNavButtonInactiveClass),
                isActive ? function() { this.openPage(pageIndex); } : $.noop);
        },

        _createPagerPageNavButton: function(text, handler) {
            return this._createPagerButton(text, this.pagerNavButtonClass, handler);
        },

        _createPagerPage: function(pageIndex) {
            return this._createPagerButton(pageIndex, this.pageClass, function() {
                this.openPage(pageIndex);
            });
        },

        _createPagerButton: function(text, css, handler) {
            var $link = $("<a>").attr("href", EMPTY_HREF)
                .html(text)
                .on("click", $.proxy(handler, this));

            return $("<span>").addClass(css).append($link);
        },

        _createPagerCurrentPage: function() {
            return $("<span>")
                .addClass(this.pageClass)
                .addClass(this.currentPageClass)
                .text(this.pageIndex);
        },

        _refreshSize: function() {
            this._refreshHeight();
            this._refreshWidth();
            this._initializeColumnWidth();
        },

        _refreshWidth: function() {
            var width = (this.width === "auto") ? this._getAutoWidth() : this.width;

            this._container.width(width);
/*
            var widthes = [];
            this._headerRow.find("th").each(function(index, elem) {
                if (elem.style.width === "auto")
                    widthes.push("");
                else
                    widthes.push($(elem).innerWidth());
                this.fields[index].width = widthes[index];//$(elem).outerWidth();
                }.bind(this));
                this._headerRow.find("th").each(function(index, elem){
                if (widthes[index] !== "") {
                    $(elem).css("width", widthes[index]);
                    this._contentHeader.find('tr > th:eq('+index+')').css("width", widthes[index]);
                    this._summaryGrid.find('tr > th:eq('+index+')').css("width", widthes[index]);
                }
            }.bind(this));*/
        },

        _getAutoWidth: function() {
            var $headerGrid = this._headerGrid,
                $header = this._header;

            $headerGrid.width("auto");

            var contentWidth = $headerGrid.outerWidth();
            var borderWidth = $header.outerWidth() - $header.innerWidth();

            $headerGrid.width("");

            return contentWidth + borderWidth;
        },

        _scrollBarWidth: (function() {
            var result;

            return function() {
                if(result === undefined) {
                    var $ghostContainer = $("<div style='width:50px;height:50px;overflow:hidden;position:absolute;top:-10000px;left:-10000px;'></div>");
                    var $ghostContent = $("<div style='height:100px;'></div>");
                    $ghostContainer.append($ghostContent).appendTo("body");
                    var width = $ghostContent.innerWidth();
                    $ghostContainer.css("overflow-y", "auto");
                    var widthExcludingScrollBar = $ghostContent.innerWidth();
                    $ghostContainer.remove();
                    result = width - widthExcludingScrollBar;
                }
                return result;
            };
        })(),

        _refreshHeight: function() {
            var container = this._container,
                summaryContainer = this._summary,
                pagerContainer = this._pagerContainer,
                height = this.height,
                nonBodyHeight;

            container.height(height);

            if(height !== "auto") {
                height = container.height();

                nonBodyHeight = this._header.outerHeight(true);
                if(summaryContainer.parents(container).length) {
                    nonBodyHeight += summaryContainer.outerHeight(true);
                }
                if(pagerContainer.parents(container).length) {
                    nonBodyHeight += pagerContainer.outerHeight(true);
                }

                this._body.outerHeight(height - nonBodyHeight);
            }
        },

        showPrevPages: function() {
            var firstDisplayingPage = this._firstDisplayingPage,
                pageButtonCount = this.pageButtonCount;

            this._firstDisplayingPage = (firstDisplayingPage > pageButtonCount) ? firstDisplayingPage - pageButtonCount : 1;

            this._refreshPager();
        },

        showNextPages: function() {
            var firstDisplayingPage = this._firstDisplayingPage,
                pageButtonCount = this.pageButtonCount,
                pageCount = this._pagesCount();

            this._firstDisplayingPage = (firstDisplayingPage + 2 * pageButtonCount > pageCount)
                ? pageCount - pageButtonCount + 1
                : firstDisplayingPage + pageButtonCount;

            this._refreshPager();
        },

        openPage: function(pageIndex) {
            if(pageIndex < 1 || pageIndex > this._pagesCount())
                return;

            this._setPage(pageIndex);
            this._loadStrategy.openPage(pageIndex);
        },

        _setPage: function(pageIndex) {
            var firstDisplayingPage = this._firstDisplayingPage,
                pageButtonCount = this.pageButtonCount;

            this.pageIndex = pageIndex;

            if(pageIndex < firstDisplayingPage) {
                this._firstDisplayingPage = pageIndex;
            }

            if(pageIndex > firstDisplayingPage + pageButtonCount - 1) {
                this._firstDisplayingPage = pageIndex - pageButtonCount + 1;
            }

            this._callEventHandler(this.onPageChanged, {
                pageIndex: pageIndex
            });
        },

        _controllerCall: function(method, param, isCanceled, doneCallback) {
            if(isCanceled)
                return $.Deferred().reject().promise();

            this._showLoading();

            var controller = this._controller;
            if(!controller || !controller[method]) {
                throw Error("controller has no method '" + method + "'");
            }

            return normalizePromise(controller[method](param))
                .done($.proxy(doneCallback, this))
                .fail($.proxy(this._errorHandler, this))
                .always($.proxy(this._hideLoading, this));
        },

        _errorHandler: function() {
            this._callEventHandler(this.onError, {
                args: $.makeArray(arguments)
            });
        },

        _showLoading: function() {
            if(!this.loadIndication)
                return;

            clearTimeout(this._loadingTimer);

            this._loadingTimer = setTimeout($.proxy(function() {
                this._loadIndicator.show();
            }, this), this.loadIndicationDelay);
        },

        _hideLoading: function() {
            if(!this.loadIndication)
                return;

            clearTimeout(this._loadingTimer);
            this._loadIndicator.hide();
        },

        search: function(filter) {
            //this._resetSorting();
            this._resetPager();
            return this.loadData(filter);
        },

        loadData: function(filter) {
            filter = filter || (this.filtering ? this.getFilter() : {});

            $.extend(filter, this._loadStrategy.loadParams(), this._sortingParams());

            var args = this._callEventHandler(this.onDataLoading, {
                filter: filter
            });

            return this._controllerCall("loadData", filter, args.cancel, function(loadedData) {
                if(!loadedData)
                    return;

                this._loadStrategy.finishLoad(loadedData);

                this._callEventHandler(this.onDataLoaded, {
                    data: loadedData
                });
            });
        },

        exportData: function(exportOptions){
            var options = exportOptions || {};
            var type = options.type || "csv";

            var result = "";

            this._callEventHandler(this.onDataExporting);

            switch(type){

                case "csv":
                    result = this._dataToCsv(options);
                    break;

            }
            return result;
        },

        _dataToCsv: function(options){
            var options = options || {};
            var includeHeaders = options.hasOwnProperty("includeHeaders") ? options.includeHeaders : true;
            var subset = options.subset || "all";
            var filter = options.filter || undefined;

            var result = [];

            if (includeHeaders){
                var fieldsLength = this.fields.length;
                var fieldNames = {};

                for(var i=0;i<fieldsLength;i++){
                    var field = this.fields[i];

                    if ("includeInDataExport" in field){
                        if (field.includeInDataExport === true)
                            fieldNames[i] = field.title || field.name;
                    }

                }

                var headerLine = this._itemToCsv(fieldNames,{},options);
                result.push(headerLine);
            }

            var exportStartIndex = 0;
            var exportEndIndex = this.data.length;

            switch(subset){

                case "visible":
                    exportEndIndex = this._firstDisplayingPage * this.pageSize;
                    exportStartIndex = exportEndIndex - this.pageSize;

                case "all":
                default:
                    break;
            }

            for (var i = exportStartIndex; i < exportEndIndex; i++){
                var item = this.data[i];
                var itemLine = "";
                var includeItem = true;

                if (filter)
                    if (!filter(item))
                        includeItem = false;

                if (includeItem){
                    itemLine = this._itemToCsv(item, this.fields, options);
                    result.push(itemLine);
                }

            }

            return result.join("");

        },

        _itemToCsv: function(item, fields, options){
            var options = options || {};
            var delimiter = options.delimiter || "|";
            var encapsulate = options.hasOwnProperty("encapsulate") ? options.encapsulate : true;
            var newline = options.newline || "\r\n";
            var transforms = options.transforms || {};

            var fields = fields || {};
            var getItem = this._getItemFieldValue;
            var result = [];

            Object.keys(item).forEach(function(key,index) {

                var entry = "";

                //Fields.length is greater than 0 when we are matching agaisnt fields
                //Field.length will be 0 when exporting header rows
                if (fields.length > 0){

                    var field = fields[index];

                    //Field may be excluded from data export
                    if ("includeInDataExport" in field){

                        if (field.includeInDataExport){

                            //Field may be a select, which requires additional logic
                            if (field.type === "select"){

                                var selectedItem = getItem(item, field);

                                var resultItem = $.grep(field.items, function(item, index) {
                                    return item[field.valueField] === selectedItem;
                                })[0] || "";

                                entry = resultItem[field.textField];
                            }
                            else{
                                entry = getItem(item, field);
                            }
                        }
                        else{
                            return;
                        }

                    }
                    else{
                        entry = getItem(item, field);
                    }

                    if (transforms.hasOwnProperty(field.name)){
                        entry = transforms[field.name](entry);
                    }


                }
                else{
                    entry = item[key];
                }

                if (encapsulate){
                    entry = '"'+entry+'"';
                }


                result.push(entry);
            });

            return result.join(delimiter) + newline;
        },

        getSelectedItems: function() {
            return this.data.filter(function(itm) {
                return (itm.selected);
            });
        },

        _scrollToView: function(element, parent) {
            element = $(element);
            parent = $(parent);
            var offset = element.offset().top + parent.scrollTop();
            var height = element.innerHeight();
            var offset_end = offset + height;
            if (!element.is(":visible")) {
                element.css({"visibility":"hidden"}).show();
                var offset = element.offset().top;
                element.css({"visibility":"", "display":""});
            }
            var visible_area_start = parent.scrollTop();
            var visible_area_end = visible_area_start + parent.innerHeight();
            if (offset-height < visible_area_start) {
                parent.animate({scrollTop: offset-height}, 600);
                return false;
            } else if (offset_end > visible_area_end) {
                parent.animate({scrollTop: parent.scrollTop()+ offset_end - visible_area_end }, 600);
                return false;
            }
            return true;
        },

        setSelectedItems: function(selectedItems) {
            var curSelected = this.getSelectedItems();
            curSelected.forEach(function(itm) {
                itm.selected = false;
                this.rowByItem(itm).removeClass(this.selectedRowClass);
            }.bind(this));

            if (selectedItems.length <= 1 || (this.multiSelecting && selectedItems.length > 1)) {
                var index = 0;
                selectedItems.forEach(function(itm) {
                    itm.selected = true;
                    let row = this.rowByItem(itm);
                    row.addClass(this.selectedRowClass);
                    if (index == 0) {
                        this._scrollToView(row, this._body);
                    }
                    index++;
                }.bind(this));
            }
        },

        getFilter: function() {
            var result = {};
            this._eachField(function(field) {
                if(field.filtering) {
                    this._setItemFieldValue(result, field, field.filterValue());
                }
            });
            return result;
        },

        _sortingParams: function() {
            var res = {};
            if(this.sorting && this._sortField) {
                res.sortField = this._sortField;
                res.sortFieldName = this._sortField.name;
                res.sortOrder = this._sortOrder;
                res.sortFactor = this._sortFactor();
            }
            if(this.sorting && this._sortField2) {
                res.sortField2 = this._sortField2;
                res.sortFieldName2 = this._sortField2.name;
                res.sortOrder2 = this._sortOrder2;
                res.sortFactor2 = this._sortFactor2();
            }
            return res;
        },

        getSorting: function() {
            var sortingParams = this._sortingParams();
            var res = {
                field: sortingParams.sortFieldName,
                order: sortingParams.sortOrder
            };
            if (sortingParams.sortField2) {
                res.field2 = sortingParams.sortFieldName2;
                res.order2 = sortingParams.sortOrder2;
            }
            return res;
        },

        clearFilter: function(doResearch) {
            //var $filterRow = this._createFilterRow();
            //this._filterRow.replaceWith($filterRow);
            //this._filterRow = $filterRow;
            this._eachField(function(field) {
                if(field.filtering) {
                    field.setFilterValue(undefined);
                }
            });
            if (doResearch)
                return this.search();
        },

        insertItem: function(item) {
            var insertingItem = item || this._getValidatedInsertItem();

            if(!insertingItem)
                return $.Deferred().reject().promise();

            var args = this._callEventHandler(this.onItemInserting, {
                item: insertingItem
            });

            return this._controllerCall("insertItem", insertingItem, args.cancel, function(insertedItem) {
                insertedItem = insertedItem || insertingItem;
                this._loadStrategy.finishInsert(insertedItem, this.insertRowLocation);

                this._callEventHandler(this.onItemInserted, {
                    item: insertedItem
                });
                this._refreshSummarying();
            });
        },

        _getValidatedInsertItem: function() {
            var item = this._getInsertItem();
            return this._validateItem(item, this._insertRow) ? item : null;
        },

        _getInsertItem: function() {
            var result = {};
            this._eachField(function(field) {
                if(field.inserting) {
                    this._setItemFieldValue(result, field, field.insertValue());
                }
            });
            return result;
        },

        _validateItem: function(item, $row) {
            var validationErrors = [];

            var args = {
                item: item,
                itemIndex: this._rowIndex($row),
                row: $row
            };

            this._eachField(function(field) {
                if(!field.validate ||
                    ($row === this._insertRow && !field.inserting) ||
                    ($row === this._getEditRow() && !field.editing))
                    return;

                var fieldValue = this._getItemFieldValue(item, field);

                var errors = this._validation.validate($.extend({
                    value: fieldValue,
                    rules: field.validate,
                    name: field.title ? field.title : field.name
                }, args));

                this._setCellValidity($row.children().eq(this._visibleFieldIndex(field)), errors);

                if(!errors.length)
                    return;

                validationErrors.push.apply(validationErrors,
                    $.map(errors, function(message) {
                        return { field: field, message: message };
                    }));
            });

            if(!validationErrors.length)
                return true;

            var invalidArgs = $.extend({
                errors: validationErrors
            }, args);
            this._callEventHandler(this.onItemInvalid, invalidArgs);
            this.invalidNotify(invalidArgs);

            return false;
        },

        _setCellValidity: function($cell, errors) {
            $cell
                .toggleClass(this.invalidClass, !!errors.length)
                .attr("title", errors.join("\n"));
        },

        clearInsert: function() {
            var insertRow = this._createInsertRow();
            this._insertRow.replaceWith(insertRow);
            this._insertRow = insertRow;
            this.refresh();
        },

        editItem: function(item) {
            var $row = this.rowByItem(item);
            if($row.length) {
                this._editRow($row);
            }
        },

        rowByItem: function(item) {
            if(item.jquery || item.nodeType)
                return $(item);

            return this._content.find("tr").filter(function() {
                return $.data(this, JSGRID_ROW_DATA_KEY) === item;
            });
        },

        _editRow: function($row, $cell) {
            if(!this.editing)
                return;

            var item = $row.data(JSGRID_ROW_DATA_KEY);

            var args = this._callEventHandler(this.onItemEditing, {
                row: $row,
                item: item,
                itemIndex: this._itemIndex(item)
            });

            if(args.cancel)
                return;

            if(this._editingRow) {
                this.cancelEdit();
            }

            var $editRow = this._createEditRow(item);
            $editRow.css('outline', 0).attr('tabindex',-1)
            $editRow.on('keyup',function(evt) {
                if (evt.keyCode == 27) {
                    this.cancelEdit();
                }
            }.bind(this));

            this._editingRow = $row;
            $row.hide();
            $editRow.insertBefore($row);
            if ($cell) {
                var cellIndex = $row.find("td").index($cell.eq(0));
                var tagetTd = $editRow.eq(0).focus().find('td').eq(cellIndex);
                if (tagetTd.find('input').length > 0)
                    tagetTd.find('input').focus();
                else if (tagetTd.find('button').length > 0)
                    tagetTd.find('button').focus();
                else if (tagetTd.find('select').length > 0)
                    tagetTd.find('select').focus();
                //$cell.find('input').focus()
            }
            else {
                $editRow.eq(0).focus().find('td').eq(0).find('input').focus();
            }
            $row.data(JSGRID_EDIT_ROW_DATA_KEY, $editRow);
            //$editRow.eq(0).focus();
            var focused = document.activeElement;
        },

        _createEditRow: function(item) {
            if($.isFunction(this.editRowRenderer)) {
                return $(this.renderTemplate(this.editRowRenderer, this, { item: item, itemIndex: this._itemIndex(item) }));
            }

            var $result = $("<tr>").addClass(this.editRowClass);

            this._eachField(function(field) {
                var fieldValue = this._getItemFieldValue(item, field);

                this._prepareCell("<td>", field, "editcss")
                    .append(this.renderTemplate(field.editTemplate || "", field, { value: fieldValue, item: item }))
                    .appendTo($result);
            });

            return $result;
        },

        updateItem: function(item, editedItem) {
            if(arguments.length === 1) {
                editedItem = item;
            }

            var $row = item ? this.rowByItem(item) : this._editingRow;
            editedItem = editedItem || this._getValidatedEditedItem();

            if(!editedItem)
                return;

            return this._updateRow($row, editedItem);
        },

        _getValidatedEditedItem: function() {
            var item = this._getEditedItem();
            return this._validateItem(item, this._getEditRow()) ? item : null;
        },

        _updateRow: function($updatingRow, editedItem) {
            var updatingItem = $updatingRow.data(JSGRID_ROW_DATA_KEY),
                updatingItemIndex = this._itemIndex(updatingItem),
                updatedItem = $.extend(true, {}, updatingItem, editedItem);

            var args = this._callEventHandler(this.onItemUpdating, {
                row: $updatingRow,
                item: updatedItem,
                itemIndex: updatingItemIndex,
                previousItem: updatingItem
            });

            return this._controllerCall("updateItem", updatedItem, args.cancel, function(loadedUpdatedItem) {
                var previousItem = $.extend(true, {}, updatingItem);
                updatedItem = loadedUpdatedItem || $.extend(true, updatingItem, updatedItem);

                var $updatedRow = this._finishUpdate($updatingRow, updatedItem, updatingItemIndex);

                this._callEventHandler(this.onItemUpdated, {
                    row: $updatedRow,
                    item: updatedItem,
                    itemIndex: updatingItemIndex,
                    previousItem: previousItem
                });

                this._refreshSummarying();
            });
        },

        _rowIndex: function(row) {
            return this._content.children().index($(row));
        },

        _itemIndex: function(item) {
            return $.inArray(item, this.data);
        },

        _finishUpdate: function($updatingRow, updatedItem, updatedItemIndex) {
            this.cancelEdit();
            this.data[updatedItemIndex] = updatedItem;

            var $updatedRow = this._createRow(updatedItem, updatedItemIndex);
            $updatingRow.replaceWith($updatedRow);
            return $updatedRow;
        },

        _getEditedItem: function() {
            var result = {};
            this._eachField(function(field) {
                if(field.editing) {
                    this._setItemFieldValue(result, field, field.editValue());
                }
            });
            return result;
        },

        cancelEdit: function() {
            if(!this._editingRow)
                return;

            var $row = this._editingRow,
                editingItem = $row.data(JSGRID_ROW_DATA_KEY),
                editingItemIndex = this._itemIndex(editingItem);

            this._callEventHandler(this.onItemEditCancelling, {
                row: $row,
                item: editingItem,
                itemIndex: editingItemIndex
            });

            this._getEditRow().remove();
            this._editingRow.show();
            this._editingRow = null;
        },

        _getEditRow: function() {
            return this._editingRow && this._editingRow.data(JSGRID_EDIT_ROW_DATA_KEY);
        },

        deleteItem: function(item) {
            var $row = this.rowByItem(item);

            if(!$row.length)
                return;

  //        if(this.confirmDeleting && !window.confirm(getOrApply(this.deleteConfirm, this, $row.data(JSGRID_ROW_DATA_KEY))))
  //            return;

  //        return this._deleteRow($row);
            if (this.confirmDeleting) {
                return this.onItemConfirmDelete.apply(this, [$row.data(JSGRID_ROW_DATA_KEY), function() {
                    this._deleteRow($row)
                }.bind(this)]);
            }
            return this._deleteRow($row);
        },

        _deleteRow: function($row) {
            var deletingItem = $row.data(JSGRID_ROW_DATA_KEY),
                deletingItemIndex = this._itemIndex(deletingItem);

            var args = this._callEventHandler(this.onItemDeleting, {
                row: $row,
                item: deletingItem,
                itemIndex: deletingItemIndex
            });

            return this._controllerCall("deleteItem", deletingItem, args.cancel, function() {
                this._loadStrategy.finishDelete(deletingItem, this._itemIndex(deletingItem));

                this._callEventHandler(this.onItemDeleted, {
                    row: $row,
                    item: deletingItem,
                    itemIndex: deletingItemIndex
                });
                this._refreshSummarying();
            });
        }
    };

    $.fn.jsGrid = function(config) {
        var args = $.makeArray(arguments),
            methodArgs = args.slice(1),
            result = this;

        this.each(function() {
            var $element = $(this),
                instance = $element.data(JSGRID_DATA_KEY),
                methodResult;

            if(instance) {
                if(typeof config === "string") {
                    methodResult = instance[config].apply(instance, methodArgs);
                    if(methodResult !== undefined && methodResult !== instance) {
                        result = methodResult;
                        return false;
                    }
                } else {
                    instance._detachWindowResizeCallback();
                    instance._init(config);
                    instance.render();
                }
            } else {
                new Grid($element, config);
            }
        });

        return result;
    };

    var fields = {};

    var setDefaults = function(config) {
        var componentPrototype;

        if($.isPlainObject(config)) {
            componentPrototype = Grid.prototype;
        } else {
            componentPrototype = fields[config].prototype;
            config = arguments[1] || {};
        }

        $.extend(componentPrototype, config);
    };

    var locales = {};

    var locale = function(lang) {
        lang = lang.replace("-", "_").toLowerCase();
        var localeConfig = $.isPlainObject(lang) ? lang : locales[lang];

        if(!localeConfig)
            throw Error("unknown locale " + lang);

        setLocale(jsGrid, localeConfig);
    };

    var setLocale = function(obj, localeConfig) {
        $.each(localeConfig, function(field, value) {
            if (obj) {
                if($.isPlainObject(value)) {
                    setLocale(obj[field] || obj[field[0].toUpperCase() + field.slice(1)], value);
                    return;
                }

                if(obj.hasOwnProperty(field)) {
                    obj[field] = value;
                } else {
                    obj.prototype[field] = value;
                }
            }
        });
    };

    window.jsGrid = {
        Grid: Grid,
        fields: fields,
        fieldsClasses: {button: "", checkbox:"", input: "", select: "", text: "", textarea: ""},
        setDefaults: setDefaults,
        locales: locales,
        locale: locale,
        version: "@VERSION"
    };

}(window, jQuery));
