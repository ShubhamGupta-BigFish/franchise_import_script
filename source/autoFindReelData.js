var XLSX = require('xlsx');
var util = require('./util');

function determineReelData(sheet, keyName) {
    var ws = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    var maxRowCol = util.determineMaxColAndRowsInSheet(ws);
    var columns = util.buildColumnsArray("A1:" + util.numToAlpha(maxRowCol.columnCount) + "1");

    var posCellIds = [];
    posCellIds = determineNumberOfReelsInSheet(sheet, maxRowCol, posCellIds, columns, keyName);
    posCellIds = determineEachReelsWidth(sheet, maxRowCol, posCellIds, columns, keyName);
    posCellIds = determineEachReelHeight(sheet, maxRowCol, posCellIds, columns);

    for (var data = 0; data < posCellIds.length; data++) {
        var reelData = posCellIds[data];
        posCellIds[data]['startingCell'] = (reelData.cols[0] + reelData.startingRow[0]);
        posCellIds[data]['endingCell'] = reelData.cols[reelData.cols.length - 1] + reelData.endingRow[reelData.cols.length - 1];
        posCellIds[data]['finalKey'] = posCellIds[data]['startingCell'] + ":" + posCellIds[data]['endingCell'];
    }
    return posCellIds;
}



function determineNumberOfReelsInSheet(sheet, maxRowCol, posCellIds, columns, keyName) {
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
                    "reelHeight": [],
                    "finalKey": ''
                });
            }
        }
    }

    return posCellIds;
}

function determineEachReelsWidth(sheet, maxRowCol, posCellIds, columns, keyName) {
    for (var cell = 0; cell < posCellIds.length; cell++) {
        var counter = 0;
        for (var reelWidth = (posCellIds[cell].col + 1); reelWidth < maxRowCol.columnCount; reelWidth++) {
            var cellId = columns[reelWidth] + posCellIds[cell].row;
            if (!sheet[cellId] || (sheet[cellId] && sheet[cellId].hasOwnProperty("v") && sheet[cellId].v === keyName)) {
                posCellIds[cell].reelWidth = counter;
                break;
            }
            posCellIds[cell].cols.push(columns[reelWidth]);
            counter++;
        }
    }

    return posCellIds;
}

function determineEachReelHeight(sheet, maxRowCol, posCellIds, columns) {
    for (var cell = 0; cell < posCellIds.length; cell++) {
        for (var reelWidth = 0; reelWidth < posCellIds[cell].cols.length; reelWidth++) {
            var heightCounter = 0;
            for (var reelVal = (posCellIds[cell].row + 1); reelVal < maxRowCol.rowsCount; reelVal++) {
                var cellId = posCellIds[cell].cols[reelWidth] + reelVal;
                if (!sheet[cellId]) {
                    posCellIds[cell].reelHeight.push(heightCounter);
                    break;
                }
                heightCounter++;
                if (heightCounter === 1) {
                    posCellIds[cell].startingRow.push(reelVal);
                }
                posCellIds[cell].endingRow[reelWidth] = reelVal;
            }
        }
    }
    return posCellIds;
}

module.exports.determineReelData = determineReelData;