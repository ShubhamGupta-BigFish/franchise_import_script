
var prompt = require('prompt-sync')({ sigint: true });
var config = require('./config.json');
var util = require('./util');
var autoFindSingleColumnData = require('./autoFindSingleColumnData.js');

// f33-f48 f17-f28 f4-f13 j19-j30 j4-j15
function createBets(workbook) {
    var bets = "[\n";
    var sheet = workbook.Sheets[config.sheetNames.bet];

    if (!sheet) {
        util.logError("SHEET NOT FOUND");
        return;
    }

    var autoFindData = autoFindSingleColumnData.determineData(sheet, config.autoFindKeys.bet);

    var toolCorrect = false;
    if (autoFindData && autoFindData.length > 0) {
        toolCorrect = prompt("Tool Found " + autoFindData.length + " bet structure (1 for yes/ 0 for no) : ");
    }

    if (toolCorrect && parseInt(toolCorrect) === 1) {
        // do nothing
        importBetConfigNumber = autoFindData.length;
    } else {
        var importBetConfigNumber = prompt("Enter the number of bet config you need to import : ");
    }

    for (var versionNum = 0; versionNum < parseInt(importBetConfigNumber); versionNum++) {

        var dataCorrect = false;
        if (autoFindData[versionNum] && Object.keys(autoFindData[versionNum]).length > 0) {
            dataCorrect = prompt("Tool Found staring and ending cell id at " + autoFindData[versionNum].finalKey + " (1 for yes/ 0 for no) : ");
        }

        if (dataCorrect && parseInt(dataCorrect) == 1) {
            startingCellId = autoFindData[versionNum].startingCell;
            endCellId = autoFindData[versionNum].endingCell;
        } else {
            var startingCellId = prompt("Enter Starting cell Id for " + versionNum + " : ");
            var endCellId = prompt("Enter end cell Id for " + versionNum + " : ");
        }

        bets += "'" + versionNum + "'=>[\n 'bets'=>[";
        if (startingCellId && endCellId) {
            var startingCellPoint = util.upperCaseAndSpiltCellVal(startingCellId);
            var endCellPoint = util.upperCaseAndSpiltCellVal(endCellId);
            for (var j = parseInt(startingCellPoint[1]); j <= parseInt(endCellPoint[1]); j++) {
                bets += util.readValue(config.sheetNames.bet, sheet, startingCellPoint[0] + j);
                bets += (j === parseInt(endCellPoint[1])) ? "" : ",";
            }
        }
        bets += "],\n],\n"
    }
    bets += "]";
    
    util.writeData('bet.txt', bets);
}

// function errorHandler() {
//     while (true) {
//         try {
//           //
//           break;
//         } catch (Exception e ) {
//           if (--numTries == 0) throw e;
//         }
//       }
// }

module.exports.createBets = createBets;