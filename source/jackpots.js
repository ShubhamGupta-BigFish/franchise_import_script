var prompt = require('prompt-sync')({ sigint: true });
var config = require('./config.json');
var util = require('./util');
var autoFindRowColumn = require('./autoFindRowColumn');

function createJackpots(workbook) {
    var sheet = workbook.Sheets[config.sheetNames.jackpots];

    if (!sheet) {
        util.logError("SHEET NOT FOUND");
        return;
    }

    var autoFindData = autoFindRowColumn.determineData(workbook.Sheets[config.sheetNames.jackpots], config.autoFindKeys.jackpot)

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

    var jackpotStr = "'jackpot'=>[\n";
    if (startingCellId && endCellId) {
        var startingCellPoint = util.upperCaseAndSpiltCellVal(startingCellId);
        // var endCellPoint = util.upperCaseAndSpiltCellVal(endCellId);
        var cellIds = util.buildColumnsArray(startingCellId + ":" + endCellId);
        var rowNum = parseInt(startingCellPoint[1]);
        for (var cellNum = 0; cellNum < cellIds.length; cellNum++) {

            var jackpotType = util.readValue(config.sheetNames.jackpots, sheet, (cellIds[cellNum] + (rowNum - 1)));

            if(!jackpotType) {
                util.logError("JACKPOT TYPE NOT FOUND AT CELL " + (cellIds[cellNum] + (rowNum - 1)) + " in sheet " + config.sheetNames.jackpots);
                continue;
            }

            var jackpotVal = util.readValue(config.sheetNames.jackpots, sheet, (cellIds[cellNum] + rowNum));
            var incrementalPercentage = util.readValue(config.sheetNames.jackpots, sheet, (cellIds[cellNum] + (rowNum + 1)));

            jackpotStr += "[\n";
            jackpotStr += "'type'=>'" + (jackpotType).toLowerCase() + "',\n";
            jackpotStr += "'betMode'=>'anyBet',\n";
            jackpotStr += "'multiplier'=>" + jackpotVal + ",\n";
            jackpotStr += "'betContribution'=>" + ((incrementalPercentage / 100) * 100) + ",\n";
            jackpotStr += "'ident'=>[-1, -1, -1, -1, -1],\n";
            jackpotStr += "'allowWilds' => false\n],";
        }
        jackpotStr += '],';
    }

    util.writeData('jackpots.txt', jackpotStr);
}

module.exports.createJackpots = createJackpots;