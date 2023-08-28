var prompt = require('prompt-sync')({ sigint: true });
var userInputConfig = require('./userInputConfig.json');
var util = require('./util');
var autoFindReelData = require('./autoFindReelData');

// aj5 ak129 an5-ao129 ar5-as29
function createReels(sheetName, sheet) {
    if(!sheet) {
        util.logError("SHEET NOT FOUND");
        return;
    }

    var reelData = autoFindReelData.determineReelData(sheet, userInputConfig.autoFindKeys.reel);

    var reels = "['reels'=>[\n";
    var toolCorrect = false;
    var numberOfReels = 0;
    if (reelData && reelData.length > 0) {
        toolCorrect = prompt("Tool Found " + reelData.length + " reels in sheet (1 for yes/ 0 for no)");
    }

    if (toolCorrect && parseInt(toolCorrect) === 1) {
        numberOfReels = reelData.length;
    } else {
        numberOfReels = prompt("Enter the number of reel configs you need to import : ");
    }

    for (var reelNum = 0; reelNum < parseInt(numberOfReels); reelNum++) {
        if (toolCorrect && parseInt(toolCorrect) === 1) { 
            reelPosConfirm = prompt("Tool Found Reel Config " + (reelNum + 1) + " starting and ending position are " + reelData[reelNum].finalKey + " (" + reelData[reelNum].reelHeight + ")" + " : (1 for yes/ 0 for no)");
        }

        if (reelPosConfirm && parseInt(reelPosConfirm) === 1) {
            reelName = reelData[reelNum].startingCell;
            startingCellId = reelData[reelNum].startingCell;
            endCellId = reelData[reelNum].endingCell;
            numberOfSymbolInReels = reelData[reelNum].reelHeight;
        } else {
            var reelName = prompt("Enter the name of Reel Config " + (reelNum + 1) + " :");
            var startingCellId = prompt("Enter the starting cell Id for " + reelName + " : ");
            var endCellId = prompt("Enter end cell Id for " + reelName + " : ");
            var numberOfSymbolInReels = prompt("number Of Symbol in Reel(comma separated) :").split(",");
        }

        reels += "'" + reelName + "'=>[\n";

        if (startingCellId && endCellId && numberOfSymbolInReels) {
            var startingCellPoint = util.upperCaseAndSpiltCellVal(startingCellId);
            var endCellPoint = util.upperCaseAndSpiltCellVal(endCellId);
            var cellIds = util.buildColumnsArray(startingCellId + ":" + endCellId);

            for (var i = 0; i < cellIds.length; i++) {
                // reels['reels'][reelName][i] = [];
                reels += "[";
                var reelLength = numberOfSymbolInReels.length != cellIds.length ? numberOfSymbolInReels[0] : numberOfSymbolInReels[i];
                for (var j = 0; j < parseInt(reelLength); j++) {
                    var rowNum = parseInt(startingCellPoint[1]) + j;

                    var val = util.readValue(sheetName, sheet, (cellIds[i] + rowNum));
                    if(!userInputConfig.symbolIdentMap.hasOwnProperty(val)) {
                        util.logError(val + " value at " + cellIds[i] + rowNum + " not found in symbolIdentMap object of config.json");
                        continue;
                    }

                    reels += userInputConfig.symbolIdentMap[val];
                    reels += ((j + 1) === parseInt(reelLength)) ? "" : ",";
                }
                reels += "],\n";
            }
            reels += "],\n";
        }
    }
    reels += ']\n]';

    util.writeData('reel.txt', reels);
}

module.exports.createReels = createReels;

