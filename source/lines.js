var prompt = require('prompt-sync')({ sigint: true });
var config = require('./config.json');
var util = require('./util');
var autoFindRowColumn = require('./autoFindRowColumn');

function createLines(workbook) {

    var sheet = workbook.Sheets[config.sheetNames.lines];

    if (!sheet) {
        util.logError("SHEET NOT FOUND");
        return;
    }

    var autoFindData = autoFindRowColumn.determineData(sheet, config.autoFindKeys.lines);
    var toolCorrect = false;

    if (autoFindData && Object.keys(autoFindData).length > 0) {
        toolCorrect = prompt("Tool Found staring and ending cell id at " + autoFindData.finalKey + " (1 for yes/ 0 for no) : ");
    }

    if (toolCorrect && parseInt(toolCorrect) == 1) {
        startingCellId = autoFindData.startingCell;
        endCellId = autoFindData.endingCell;
    } else {
        var startingCellId = prompt("Enter Starting cell Id : ");
        var endCellId = prompt("Enter end cell Id for : ");
    }

    var isReelHeightOne = prompt("is reels height in game is 1 (1 for yes/ 2 for no) : ");
    if (isReelHeightOne && parseInt(isReelHeightOne) === 1) {
        createLinesForReelHeightOne(sheet, startingCellId, endCellId);
    } else if (isReelHeightOne && parseInt(isReelHeightOne) === 2) {
        createLinesForMultiReelHeight(sheet, startingCellId, endCellId);
    }
}

function createLinesForReelHeightOne(sheet, startingCellId, endCellId) {
    var linesData;
    var visibleReelHeight = prompt("Enter visible Reel Height : ");


    if (startingCellId && endCellId && visibleReelHeight) {
        var startingCellPoint = util.upperCaseAndSpiltCellVal(startingCellId);
        var endCellPoint = util.upperCaseAndSpiltCellVal(endCellId);
        var cellIds = util.buildColumnsArray(startingCellId + ":" + endCellId);

        linesData = '[\n';
        for (var lineNum = startingCellPoint[1]; lineNum <= parseInt(endCellPoint[1]); lineNum++) {
            linesData += '[';
            for (var columnNum = 0; columnNum < cellIds.length; columnNum++) {
                var colNum = columnNum * visibleReelHeight;

                var val = util.readValue(config.sheetNames.lines, sheet, (cellIds[columnNum] + lineNum));
                linesData += '[' + (colNum + val) + ", 0]";
                linesData += ((columnNum + 1) === cellIds.length) ? "" : ",";
            }
            linesData += '],\n';
        }
        linesData += ']';
    }

    util.writeData('lines.txt', linesData);
}

function createLinesForMultiReelHeight(sheet, startingCellId, endCellId) {
    var linesData;
    if (startingCellId && endCellId) {
        var startingCellPoint = util.upperCaseAndSpiltCellVal(startingCellId);
        var endCellPoint = util.upperCaseAndSpiltCellVal(endCellId);
        var cellIds = util.buildColumnsArray(startingCellId + ":" + endCellId);

        linesData = '[\n';
        for (var lineNum = startingCellPoint[1]; lineNum <= parseInt(endCellPoint[1]); lineNum++) {
            linesData += '[';
            for (var columnNum = 0; columnNum < cellIds.length; columnNum++) {
                var val = util.readValue(config.sheetNames.lines, sheet, (cellIds[columnNum] + lineNum));
                linesData += '[' + columnNum + "," + val + "]";
                linesData += ((columnNum + 1) === cellIds.length) ? "" : ",";
            }
            linesData += '],\n';
        }
        linesData += ']';
    }

    util.writeData('lines.txt', linesData);
}

//n3 - r52
module.exports.createLines = createLines;