// var prompt = require('prompt-sync')({ sigint: true });
var userInputConfig = require('./userInputConfig.json');
var util = require('./util');
var autoFindAnyTableData = require('./autoFindAnyTableData');

// f33-f48 f17-f28 f4-f13 j19-j30 j4-j15
function createAnyTable(sheetName, sheet) {
    var tableData = "[\n";

    if (!sheet) {
        util.logError("SHEET NOT FOUND");
        return;
    }

    var importTableIndicies = autoFindAnyTableData.determineTableData(sheetName, sheet, userInputConfig.autoFindKeys.anyTable);

    for (var versionNum = 0; versionNum < importTableIndicies.length; versionNum++) {

        var tableName = (userInputConfig.importAnyTableCol.hasOwnProperty("defaultTableName")) ? userInputConfig.importAnyTableCol.defaultTableName : ('table_' + versionNum);
        var startingCellId = importTableIndicies[versionNum].startingCell;
        var endCellId = importTableIndicies[versionNum].endingCell;

        if (userInputConfig.importAnyTableCol.hasOwnProperty("definedTableNames") && userInputConfig.importAnyTableCol.definedTableNames) {
            tableName = util.readValue(sheetName, sheet, (importTableIndicies[versionNum].cols[(userInputConfig.importAnyTableCol.tableNameColumn - 1)] + (importTableIndicies[versionNum].startingRow[0] - 1)));
        }
        tableData += " '" + tableName + "'=>[\n";

        if (startingCellId && endCellId) {
            var startingCellPoint = util.upperCaseAndSpiltCellVal(startingCellId);
            var endCellPoint = util.upperCaseAndSpiltCellVal(endCellId);
            var cellIds = util.buildColumnsArray(startingCellId + ":" + endCellId);

            for (var lineNum = startingCellPoint[1]; lineNum <= parseInt(endCellPoint[1]); lineNum++) {
                tableData += "[";
                if (userInputConfig.importAnyTableCol.hasOwnProperty("defaultCol") && userInputConfig.importAnyTableCol.defaultCol) {
                    tableData += "'" + userInputConfig.importAnyTableCol.defaultCol + "'=>" + userInputConfig.importAnyTableCol.defaultVal + ",";
                }
                for (var colNum = 0; colNum < cellIds.length; colNum++) {
                    var val = util.readValue(sheetName, sheet, (cellIds[colNum] + lineNum));
                    if (userInputConfig.symbolIdentMap.hasOwnProperty(val)) {
                        val = userInputConfig.symbolIdentMap[val];
                    }
                    if (typeof val === 'string') {
                        tableData += "'" + userInputConfig.importAnyTableCol.columns['column' + colNum] + "'=>'" + val + "'";
                    } else {
                        tableData += "'" + userInputConfig.importAnyTableCol.columns['column' + colNum] + "'=>" + val;
                    }
                    if (colNum < (cellIds.length - 1)) {
                        tableData += ",";
                    }
                }
                tableData += "],\n";
            }
        }
        tableData += "],\n"
    }
    tableData += "]";
    util.writeData('anyTable.txt', tableData);
}

module.exports.createAnyTable = createAnyTable;