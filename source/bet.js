
var userInputConfig = require('./userInputConfig.json');
var util = require('./util');
var autoFindSingleColumnData = require('./autoFindSingleColumnData.js');

// f33-f48 f17-f28 f4-f13 j19-j30 j4-j15
function createBets(sheetName, sheet) {
    var bets = "[\n";

    if (!sheet) {
        util.logError("SHEET NOT FOUND");
        return;
    }

    var autoFindData = autoFindSingleColumnData.determineData(sheet, userInputConfig.autoFindKeys.bet);

    var toolCorrect = false;
    var importBetConfigNumber = 0;

    if (autoFindData && autoFindData.length > 0) {
        toolCorrect = util.promptAndValidate("Tool Found " + autoFindData.length + " bet structure (1 for yes/ 0 for no) : ", "number", [0, 1]);
    }

    if (toolCorrect === 1) {
        importBetConfigNumber = autoFindData.length;
    } else {
        importBetConfigNumber = util.promptAndValidate("Enter the number of bet config you need to import : ", "number", "numberRange");
    }

    for (var versionNum = 0; versionNum < importBetConfigNumber; versionNum++) {

        var dataCorrect = false;
        var startingCellId;
        var endCellId;

        if (autoFindData[versionNum] && Object.keys(autoFindData[versionNum]).length > 0) {
            dataCorrect = util.promptAndValidate("Tool Found staring and ending cell id at " + autoFindData[versionNum].finalKey + " (1 for yes/ 0 for no) : ", "number", [0, 1]);
        }

        if (dataCorrect == 1) {
            startingCellId = autoFindData[versionNum].startingCell;
            endCellId = autoFindData[versionNum].endingCell;
        } else {
            startingCellId = util.promptAndValidate(
                "Enter Starting cell Id for " + versionNum + " : ",
                "",
                "notEmpty"
            );
            startingCellId = util.promptAndValidate(
                "Enter end cell Id for " + versionNum + " : ",
                "",
                "notEmpty"
            );
        }

        bets += "'" + versionNum + "'=>[\n 'bets'=>[";

        if (startingCellId && endCellId) {
            var startingCellPoint = util.upperCaseAndSpiltCellVal(startingCellId);
            var endCellPoint = util.upperCaseAndSpiltCellVal(endCellId);
            for (var j = parseInt(startingCellPoint[1]); j <= parseInt(endCellPoint[1]); j++) {
                bets += util.readValue(sheetName, sheet, startingCellPoint[0] + j);
                bets += (j === parseInt(endCellPoint[1])) ? "" : ",";
            }
        }
        
        bets += "],\n],\n"
    }
    bets += "]";

    util.writeData('bet.txt', bets);
}

module.exports.createBets = createBets;