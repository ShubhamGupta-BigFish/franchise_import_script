let prompt = require('prompt-sync')({ sigint: true });
let userInputConfig = require('./userInputConfig.json');
let util = require('./util');
let autoFindAnyTableData = require('./autoFindAnyTableData');

function getNumberOfTables(sheet, importTableIndicies) {
    let toolCorrect = 0;
    let numberOfTables = 0;

    if (!sheet) {
        util.logError("SHEET NOT FOUND.");
        return;
    }

    if (importTableIndicies && importTableIndicies.length > 0) {
        toolCorrect = prompt("Tool Found " + importTableIndicies.length + " tables in sheet (1 for yes/ 0 for no) ");
    } else {
        util.logError("No Data Table Found.");
        let manual = prompt("Do you want to import table details manually? (1 for yes/ 0 for no) ");
        if (parseInt(manual) !== 1) {
            return;
        }
    }

    if (toolCorrect && parseInt(toolCorrect) === 1) {
        numberOfTables = importTableIndicies.length;
    } else {
        numberOfTables = prompt("Enter the number of other tables you need to import : ");
    }
    return numberOfTables;
}

function getCellValue(sheetName, sheet, cell, colNum, totalCells) {
    let val = util.readValue(sheetName, sheet, cell);
    let cellValue = '';
    if (userInputConfig.symbolIdentMap.hasOwnProperty(val)) {
        val = userInputConfig.symbolIdentMap[val];
    }
    if (typeof val === 'string') {
        cellValue = "'" + userInputConfig.importAnyTableCol.columns['column' + colNum] + "'=>'" + val + "'";
    } else {
        cellValue = "'" + userInputConfig.importAnyTableCol.columns['column' + colNum] + "'=>" + val;
    }
    if (cell < (totalCells - 1)) {
        cellValue = ",";
    }
    return cellValue;
}

function getStartingCellId(tableId, startingCellId) {
    let toolCorrect = prompt("Tool Found Table " + tableId + " starting Cell ID " + startingCellId + " (1 for yes/ 0 for no) ");
    if (!parseInt(toolCorrect)) {
        startingCellId = prompt("Enter starting cell ID for table " + tableId + " ");
    }
    return startingCellId;
}

function getEndingCellId(tableId, endingCellId) {
    let toolCorrect = prompt("Tool Found Table " + tableId + " ending Cell ID " + endingCellId + " (1 for yes/ 0 for no) ");
    if (!parseInt(toolCorrect)) {
        endingCellId = prompt("Enter ending cell ID for table " + tableId + " ");
    }
    return endingCellId;
}

function getTableData(sheetName, sheet, startCell, endCell, cellIds) {
    let tableData = '';
    for (let lineNum = startCell; lineNum <= endCell; lineNum++) {
        tableData += "[";
        if (userInputConfig.importAnyTableCol.hasOwnProperty("defaultCol") && userInputConfig.importAnyTableCol.defaultCol) {
            tableData += "'" + userInputConfig.importAnyTableCol.defaultCol + "'=>" + userInputConfig.importAnyTableCol.defaultVal + ",";
        }
        for (let [colNum, cellId] of cellIds.entries()) {
            tableData += getCellValue(sheetName, sheet, (cellId + lineNum), colNum, cellIds.length);
        }
        tableData += "],\n";
    }
    return tableData;
}

function createAnyTable(sheetName, sheet) {
    let importTableIndicies = autoFindAnyTableData.determineTableData(sheetName, sheet, userInputConfig.autoFindKeys.anyTable);
    let numberOfTables = getNumberOfTables(sheet, importTableIndicies);
    let tableData = "[\n";

    if (parseInt(numberOfTables) <= 0 || isNaN(numberOfTables)) {
        return;
    }

    for (let versionNum = 0; versionNum < parseInt(numberOfTables); versionNum++) {

        let tableName = (userInputConfig.importAnyTableCol.hasOwnProperty("defaultTableName")) ? userInputConfig.importAnyTableCol.defaultTableName : ('table_' + versionNum);
        let startingCellId = getStartingCellId(versionNum + 1, (importTableIndicies[versionNum].startingCell) ? importTableIndicies[versionNum].startingCell : '');
        let endCellId = getEndingCellId(versionNum + 1, (importTableIndicies[versionNum].endingCell) ? importTableIndicies[versionNum].endingCell : '');

        if (userInputConfig.importAnyTableCol.hasOwnProperty("definedTableNames") && userInputConfig.importAnyTableCol.definedTableNames) {
            tableName = util.readValue(sheetName, sheet, (importTableIndicies[versionNum].cols[(userInputConfig.importAnyTableCol.tableNameColumn - 1)] + (importTableIndicies[versionNum].startingRow[0] - 1)));
        }
        tableData += " '" + tableName + "'=>[\n";

        if (startingCellId && endCellId) {
            let startingCellPoint = util.upperCaseAndSpiltCellVal(startingCellId);
            let endCellPoint = util.upperCaseAndSpiltCellVal(endCellId);
            let cellIds = util.buildColumnsArray(startingCellId + ":" + endCellId);

            tableData += getTableData(sheetName, sheet, parseInt(startingCellPoint[1]), parseInt(endCellPoint[1]), cellIds);
        }
        tableData += "],\n"
    }
    tableData += "]";
    util.writeData('anyTable.txt', tableData);
    util.logError("Data import completed for other table(s).");
}

module.exports.createAnyTable = createAnyTable;