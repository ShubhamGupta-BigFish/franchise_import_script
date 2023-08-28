var XLSX = require('xlsx');
var util = require('./util');

function determineData(sheet, keyName) {
    var ws = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    var maxRowCol = util.determineMaxColAndRowsInSheet(ws);
    var columns = util.buildColumnsArray("A1:" + util.numToAlpha(maxRowCol.columnCount) + "1");

    var posCellIds = [];
    posCellIds = determineDataInSheet(sheet, maxRowCol, posCellIds, columns, keyName);
    posCellIds = determineHeight(sheet, maxRowCol, posCellIds, columns);

    if (posCellIds && posCellIds.length > 0) {
        for (var data = 0; data < posCellIds.length; data++) {
            posCellIds[data]['startingCell'] = posCellIds[data].cols + posCellIds[data].startingRow;
            posCellIds[data]['endingCell'] = posCellIds[data].cols + posCellIds[data].endingRow;
            posCellIds[data]['finalKey'] = posCellIds[data]['startingCell'] + ":" + posCellIds[data]['endingCell'];
        }
    }

    return posCellIds;
}

function determineDataInSheet(sheet, maxRowCol, posCellIds, columns, keyName) {
    for (var row = 1; row < maxRowCol.rowsCount; row++) {
        for (var column = 1; column < maxRowCol.columnCount; column++) {
            var cellId = columns[column] + row;
            if (sheet[cellId] && sheet[cellId].hasOwnProperty("v") && sheet[cellId].v === keyName) {
                posCellIds.push({
                    "id": cellId,
                    "col": column,
                    "row": row,
                    "cols": columns[column],
                    "startingRow": 0,
                    "endingRow": 0,
                    "reelHeight": 0,
                    "finalKey": ''
                });
            }
        }
    }
    return posCellIds;
}

function determineHeight(sheet, maxRowCol, posCellIds, columns) {
    for (var data = 0; data < posCellIds.length; data++) {
        var heightCounter = 0;
        for (var rowNum = (posCellIds[data].row + 1); rowNum < maxRowCol.rowsCount; rowNum++) {
            var cellId = columns[posCellIds[data].col] + rowNum;
            if (!sheet[cellId]) {
                break;
            }
            heightCounter++;
            if (heightCounter === 1) {
                posCellIds[data].startingRow = rowNum;
            }
            posCellIds[data].endingRow = rowNum;
        }
    }
    return posCellIds;
}

module.exports.determineData = determineData;