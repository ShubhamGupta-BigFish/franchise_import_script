var XLSX = require('xlsx');
var util = require('./util');

function determineData(sheet, keyName) {
    var ws = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    var maxRowCol = util.determineMaxColAndRowsInSheet(ws);
    var columns = util.buildColumnsArray("A1:" + util.numToAlpha(maxRowCol.columnCount) + "1");

    var posCellIds = {};
    posCellIds = determineDataInSheet(sheet, maxRowCol, posCellIds, columns, keyName);
    posCellIds = determineWidthAndHeight(sheet, maxRowCol, posCellIds, columns);
    if (posCellIds.cols && posCellIds.cols.length > 0) {
        posCellIds['startingCell'] = posCellIds.cols[0] + posCellIds.startingRow;
        posCellIds['endingCell'] = posCellIds.cols[posCellIds.cols.length - 1] + posCellIds.endingRow;
        posCellIds['finalKey'] = posCellIds['startingCell'] + ":" + posCellIds['endingCell'];
    }

    return posCellIds;
}

function determineDataInSheet(sheet, maxRowCol, posCellIds, columns, keyName) {
    var dataFound = false;
    for (var row = 1; row < maxRowCol.rowsCount; row++) {
        for (var column = 1; column < maxRowCol.columnCount; column++) {
            var cellId = columns[column] + row;
            if (sheet[cellId] && sheet[cellId].hasOwnProperty("v") && sheet[cellId].v === keyName) {
                posCellIds = {
                    "id": cellId,
                    "col": column,
                    "row": row,
                    "cols": [],
                    "startingRow": 0,
                    "endingRow": 0,
                    "reelHeight": 0,
                    "finalKey": ''
                };
                dataFound = true;
                break;
            }
        }
        if (dataFound) {
            break;
        }
    }
    return posCellIds;
}

function determineWidthAndHeight(sheet, maxRowCol, posCellIds, columns) {
    var counter = 0;
    for (var reelWidth = (posCellIds.col + 1); reelWidth < maxRowCol.columnCount; reelWidth++) {
        var cellId = columns[reelWidth] + posCellIds.row;
        if (!sheet[cellId]) {
            posCellIds.reelWidth = counter;
            break;
        }
        posCellIds.cols.push(columns[reelWidth]);
        counter++;
    }

    var heightCounter = 0;
    for (var reelHeight = (posCellIds.row + 1); reelHeight < maxRowCol.rowsCount; reelHeight++) {
        var cellId = columns[posCellIds.col] + reelHeight;
        if (!sheet[cellId]) {
            posCellIds.reelHeight = heightCounter;
            break;
        }

        heightCounter++;
        if (heightCounter === 1) {
            posCellIds.startingRow = reelHeight;
        }
        posCellIds.endingRow = reelHeight;
    }

    return posCellIds;
}

module.exports.determineData = determineData;