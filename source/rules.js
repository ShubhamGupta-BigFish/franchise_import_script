var prompt = require('prompt-sync')({ sigint: true });
var config = require('./config.json');
var userInputConfig = require('./userInputConfig.json');
var util = require('./util');
var autoFindRowColumn = require('./autoFindRowColumn');

//f3-j13
function createRules(sheetName, sheet) {
    var rulesData;

    if (!sheet) {
        util.logError("SHEET NOT FOUND");
        return;
    }

    var autoFindData = autoFindRowColumn.determineData(sheet, userInputConfig.autoFindKeys.rules);

    var toolCorrect = false;
    var gameType = prompt("Game Type(1 for Line, 2 for ways) : ");

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

    if (startingCellId && endCellId) {
        var startingCellPoint = util.upperCaseAndSpiltCellVal(startingCellId);
        var endCellPoint = util.upperCaseAndSpiltCellVal(endCellId);
        var cellIds = util.buildColumnsArray(startingCellId + ":" + endCellId);
        var previousCellId = util.numToAlpha(util.alphaToNum(startingCellPoint[0]) - 1);

        if (gameType && parseInt(gameType) === config.gameType.LINE) {
            rulesData = createLineDataFormat(sheetName, sheet, cellIds, startingCellPoint, endCellPoint, previousCellId);
        } else if (gameType && parseInt(gameType) === config.gameType.WAYS) {
            rulesData = createWaysDataFormat(sheetName, sheet, cellIds, startingCellPoint, endCellPoint, previousCellId);
        }

        util.writeData('rules.txt', rulesData);
    }
}

function createLineDataFormat(sheetName, sheet, cellIds, startingCellPoint, endCellPoint, previousCellId) {
    var rulesData = "'rules'=>[\n'standard'=>[\n";
    for (var symbolCount = parseInt(startingCellPoint[1]); symbolCount <= parseInt(endCellPoint[1]); symbolCount++) {
        var symbolId = (String(util.readValue(sheetName, sheet, (previousCellId + symbolCount)))).toUpperCase();

        if (!userInputConfig.symbolIdentMap.hasOwnProperty(symbolId)) {
            util.logError(symbolId + " value not found in symbolIdentMap object of userInputConfig.json");
            continue;
        }

        symbolId = userInputConfig.symbolIdentMap[symbolId];
        var identsStr = '';
        var resultStr = '';
        for (var reelNum = 0; reelNum < cellIds.length; reelNum++) {
            identsStr += symbolId;
            resultStr += util.readValue(sheetName, sheet, (cellIds[reelNum] + symbolCount));

            identsStr += ((reelNum + 1) === parseInt(cellIds.length)) ? "" : ",";
            resultStr += ((reelNum + 1) === parseInt(cellIds.length)) ? "" : ",";
        }
        rulesData += "['idents'=>[" + identsStr + "], 'result'=>[" + resultStr + "]],\n";
    }
    rulesData += ']\n],';
    return rulesData;
}

function createWaysDataFormat(sheetName, sheet, cellIds, startingCellPoint, endCellPoint, previousCellId) {
    var rulesData = "'rules'=>[\n'leftToRight'=>true,\n'rightToLeft'=>false,\n'waysPayouts'=>[\n"
    for (var symbolCount = parseInt(startingCellPoint[1]); symbolCount <= parseInt(endCellPoint[1]); symbolCount++) {
        var symbolId = (String(util.readValue(sheetName, sheet, (previousCellId + symbolCount)))).toUpperCase();

        if (!userInputConfig.symbolIdentMap.hasOwnProperty(symbolId)) {
            util.logError(symbolId + " value not found in symbolIdentMap object of userInputConfig.json");
            continue;
        }

        symbolId = userInputConfig.symbolIdentMap[symbolId];
        rulesData += symbolId + '=>[';
        for (var reelNum = 0; reelNum < cellIds.length; reelNum++) {
            rulesData += util.readValue(sheetName, sheet, (cellIds[reelNum] + symbolCount));
            rulesData += ((reelNum + 1) === cellIds.length) ? "" : ",";
        }
        rulesData += '],\n';
    }
    rulesData += ']\n]';
    return rulesData;
}

module.exports.createRules = createRules;