var prompt = require('prompt-sync')({ sigint: true });
var userInputConfig = require('./userInputConfig.json');
var util = require('./util');

// f33-f48 f17-f28 f4-f13 j19-j30 j4-j15
function createAnyTable(sheetName, sheet) {
    var tableData = "[\n";

    if (!sheet) {
        util.logError("SHEET NOT FOUND");
        return;
    }

    var importTableConfigNumber = prompt("Enter the tables you need to import : ");

    for (var versionNum = 0; versionNum < parseInt(importTableConfigNumber); versionNum++) {
        tableData += "'" + versionNum + "'=>[\n 'weights'=>[\n";

        var startingCellId = prompt("Enter Starting cell Id for table no " + (versionNum + 1) + " : ");
        var endCellId = prompt("Enter end cell Id for table no " + (versionNum + 1) + " : ");


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
        tableData += "],\n],\n"
    }
    tableData += "]";
    util.writeData('anyTable.txt', tableData);
}

module.exports.createAnyTable = createAnyTable;