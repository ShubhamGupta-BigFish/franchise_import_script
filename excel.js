var config = require('./source/config.json');
var userInputConfig = require('./source/userInputConfig.json');
var XLSX = require('xlsx');

var bets = require('./source/bet');

var reels = require('./source/reel');
var rules = require('./source/rules');
var lines = require('./source/lines');
var jackpots = require('./source/jackpots');
var importAnyTable = require('./source/importAnyTable');
var util = require('./source/util');

var workbook = XLSX.readFile(userInputConfig.fileName, config.excelInitConfig);

console.log("1. Bets\n2. Reels\n3. Rules\n4. Lines\n5. Jackpots\n6. Read Data from any table\n7. All\n");
var selectionVal = util.promptAndValidate(": ", "number", [1, 2, 3, 4, 5, 6, 7]);

runModule(selectionVal);

function runModule(selectionVal) {
    console.log("selectionVal -------- " + selectionVal);

    switch (selectionVal) {
        case 1:
            bets.createBets(userInputConfig.sheetNames.bets, workbook.Sheets[userInputConfig.sheetNames.bets]);
            break;
        case 2:
            reels.createReels(userInputConfig.sheetNames.reels, workbook.Sheets[userInputConfig.sheetNames.reels]);
            break;
        case 3:
            rules.createRules(userInputConfig.sheetNames.rules, workbook.Sheets[userInputConfig.sheetNames.rules]);
            break;
        case 4:
            lines.createLines(userInputConfig.sheetNames.lines, workbook.Sheets[userInputConfig.sheetNames.lines]);
            break;
        case 5:
            jackpots.createJackpots(userInputConfig.sheetNames.jackpots, workbook.Sheets[userInputConfig.sheetNames.jackpots]);
            break;
        case 6:
            importAnyTable.createAnyTable(userInputConfig.sheetNames.anyTable, workbook.Sheets[userInputConfig.sheetNames.anyTable]);
            break;
        case 7:
            runAllOneByOne();
            break;
    }
}

function runAllOneByOne() {
    for (var module = 0; module <= config.moduleNames.length; module++) {

        var moduleName = config.moduleNames[module];
        if (userInputConfig.sheetNames[moduleName]) {
            var userResponse = util.promptAndValidate("Read " + moduleName.toUpperCase() + " (1 for yes/0 for No) : ", "number", [0, 1]);
            if (userResponse === 1) {
                runModule((module + 1));
            }
        }
    }
}
