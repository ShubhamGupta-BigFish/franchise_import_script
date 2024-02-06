var XLSX = require('xlsx');
var util = require('./util');

function determineTableData(sheetName, sheet, keyName) {
    var ws = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    var maxRowCol = util.determineMaxColAndRowsInSheet(ws);
    var columns = util.buildColumnsArray("A1:" + util.numToAlpha(maxRowCol.columnCount) + "1");

    var posCellIds = [];
    posCellIds = determineNumberOfTablesInSheet(sheet, maxRowCol, posCellIds, columns, keyName);
    posCellIds = determineEachTablesWidth(sheet, maxRowCol, posCellIds, columns, keyName);
    posCellIds = determineEachTableHeight(sheet, maxRowCol, posCellIds, columns);

    for (var data = 0; data < posCellIds.length; data++) {
        var tableData = posCellIds[data];
        posCellIds[data]['startingCell'] = (tableData.cols[0] + tableData.startingRow[0]);
        posCellIds[data]['endingCell'] = tableData.cols[tableData.cols.length - 1] + tableData.endingRow[tableData.cols.length - 1];
        posCellIds[data]['finalKey'] = posCellIds[data]['startingCell'] + ":" + posCellIds[data]['endingCell'];
    }
    return posCellIds;
}



function determineNumberOfTablesInSheet(sheet, maxRowCol, posCellIds, columns, keyName) {
    for (var row = 1; row < maxRowCol.rowsCount; row++) {
        for (var column = 1; column < maxRowCol.columnCount; column++) {
            var cellId = columns[column] + row;
            if (sheet[cellId] && sheet[cellId].hasOwnProperty("v") && sheet[cellId].v === keyName) {
                posCellIds.push({
                    "id": cellId,
                    "col": column,
                    "row": row,
                    // "colAlpha": columns[column],
                    "cols": [],
                    "startingRow": [],
                    "endingRow": [],
                    "tableHeight": [],
                    "finalKey": ''
                });
            }
        }
    }

    return posCellIds;
}

function determineEachTablesWidth(sheet, maxRowCol, posCellIds, columns, keyName) {
    for (var cell = 0; cell < posCellIds.length; cell++) {
        var counter = 0;
        for (var tableWidth = (posCellIds[cell].col); tableWidth < maxRowCol.columnCount; tableWidth++) {
            var cellId = columns[tableWidth] + (parseInt(posCellIds[cell].row) + 1);
            if (!sheet[cellId]) {
                posCellIds[cell].tableWidth = counter;
                break;
            }
            posCellIds[cell].cols.push(columns[tableWidth]);
            counter++;
        }
    }

    return posCellIds;
}

function determineEachTableHeight(sheet, maxRowCol, posCellIds, columns) {
    for (var cell = 0; cell < posCellIds.length; cell++) {
        for (var tableWidth = 0; tableWidth < posCellIds[cell].cols.length; tableWidth++) {
            var heightCounter = 0;
            for (var tableVal = (posCellIds[cell].row + 1); tableVal < maxRowCol.rowsCount; tableVal++) {
                var cellId = posCellIds[cell].cols[tableWidth] + tableVal;
                if (!sheet[cellId]) {
                    posCellIds[cell].tableHeight.push(heightCounter);
                    break;
                }
                heightCounter++;
                if (heightCounter === 1) {
                    posCellIds[cell].startingRow.push(tableVal);
                }
                posCellIds[cell].endingRow[tableWidth] = tableVal;
            }
        }
    }
    return posCellIds;
}

module.exports.determineTableData = determineTableData;