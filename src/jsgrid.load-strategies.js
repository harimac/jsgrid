(function(jsGrid, $, undefined) {

    function DirectLoadingStrategy(grid) {
        this._grid = grid;
    }

    DirectLoadingStrategy.prototype = {

        firstDisplayIndex: function() {
            var grid = this._grid;
            return grid.option("paging") ? (grid.option("pageIndex") - 1) * grid.option("pageSize") : 0;
        },

        lastDisplayIndex: function() {
            var grid = this._grid;
            var itemsCount = grid.option("data").length;

            return grid.option("paging")
                ? Math.min(grid.option("pageIndex") * grid.option("pageSize"), itemsCount)
                : itemsCount;
        },

        itemsCount: function() {
            return this._grid.option("data").length;
        },

        openPage: function(index) {
            this._grid.refresh();
        },

        loadParams: function() {
            return {};
        },

        sort: function() {
            this._grid._sortData();
            this._grid.refresh();
            return $.Deferred().resolve().promise();
        },

        reset: function() {
            this._grid.refresh();
            return $.Deferred().resolve().promise();
        },

        finishLoad: function(loadedData) {
            var sortFactor = this._grid._sortFactor(),
                sortField = this._grid._sortField;
            var sortFactor2 = this._grid._sortFactor2(),
                sortField2 = this._grid._sortField2;

            if(sortField) {
                loadedData.sort(function(item1, item2) {
                    var res = sortFactor * sortField.sortingFunc(item1[sortField.name], item2[sortField.name]);
                    if (res == 0 && sortField2 !== undefined && sortField2 !== null) {
                      return sortFactor2 * sortField2.sortingFunc(item1[sortField2.name], item2[sortField2.name]);
                    }
                    return res;
                });
            }
            this._grid.option("data", loadedData);
        },

        finishInsert: function(insertedItem, location) {
            var grid = this._grid;

            switch(location){
                case "top":
                    grid.option("data").unshift(insertedItem);
                    break;
                case "bottom":
                    grid.option("data").push(insertedItem);
                default:
                    var sortFactor = grid._sortFactor(),
                        sortField = grid._sortField;
                    if (sortField !== undefined && sortField !== null) {
                        var res = this.binaryFind(insertedItem, grid.option("data"));
                        if (!res.found)
                            grid.option("data").splice(res.index, 0, insertedItem);
                        else
                            grid.option("data").splice(res.index+1, 0, insertedItem);
                    }
                    else {
                        grid.option("data").push(insertedItem);
                    }
            }

            grid.refresh();
        },
        binaryFind: function (searchElement, sortedArray) {
            var grid = this._grid;
            var sortFactor = grid._sortFactor(),
                sortField = grid._sortField;
            var sortFactor2 = grid._sortFactor2(),
                sortField2 = grid._sortField2;
            var sortingFunc = function(item1, item2) {
                var res = sortFactor * sortField.sortingFunc(item1 ? item1[sortField.name] : null, item2 ? item2[sortField.name] : null);
                if (res == 0 && sortField2 !== undefined && sortField2 !== null) {
                return sortFactor2 * sortField2.sortingFunc(item1 ? item1[sortField2.name] : null, item2 ? item2[sortField2.name] : null);
                }
                return res;
            };
            var minIndex = 0;
            var maxIndex = sortedArray.length - 1;
            var currentIndex;
            var currentElement;

            while (minIndex <= maxIndex) {
                currentIndex = (minIndex + maxIndex) / 2 | 0;
                currentElement = sortedArray[currentIndex];
                var compare = sortingFunc(searchElement, currentElement)
                if (compare > 0) {
                    minIndex = currentIndex + 1;
                }
                else if (compare < 0) {
                    maxIndex = currentIndex - 1;
                }
                else {
                    return { // Modification
                        found: true,
                        index: currentIndex
                    };
                }
            }

            return { // Modification
                found: false,
                index: sortingFunc(searchElement, currentElement) > 0 ? currentIndex + 1 : currentIndex
            };
        },
        finishDelete: function(deletedItem, deletedItemIndex) {
            var grid = this._grid;
            if (deletedItemIndex > -1) {
                grid.option("data").splice(deletedItemIndex, 1);
                grid.reset();
            }
        }
    };


    function PageLoadingStrategy(grid) {
        this._grid = grid;
        this._itemsCount = 0;
    }

    PageLoadingStrategy.prototype = {

        firstDisplayIndex: function() {
            return 0;
        },

        lastDisplayIndex: function() {
            return this._grid.option("data").length;
        },

        itemsCount: function() {
            return this._itemsCount;
        },

        openPage: function(index) {
            this._grid.loadData();
        },

        loadParams: function() {
            var grid = this._grid;
            return {
                pageIndex: grid.option("pageIndex"),
                pageSize: grid.option("pageSize")
            };
        },

        reset: function() {
            return this._grid.loadData();
        },

        sort: function() {
            return this._grid.loadData();
        },

        finishLoad: function(loadedData) {
            this._itemsCount = loadedData.itemsCount;
            this._grid.option("data", loadedData.data);
        },

        finishInsert: function(insertedItem) {
            this._grid.search();
        },

        finishDelete: function(deletedItem, deletedItemIndex) {
            this._grid.search();
        }
    };

    jsGrid.loadStrategies = {
        DirectLoadingStrategy: DirectLoadingStrategy,
        PageLoadingStrategy: PageLoadingStrategy
    };

}(jsGrid, jQuery));
