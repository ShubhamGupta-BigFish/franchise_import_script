var prompt = require('prompt-sync')({ sigint: true });
var config = require('./source/config.json');
var userInputConfig = require('./source/userInputConfig.json');
var XLSX = require('xlsx');

var bets = require('./source/bet');

var reels = require('./source/reel');
var rules = require('./source/rules');
var lines = require('./source/lines');
var jackpots = require('./source/jackpots');
var importAnyTable = require('./source/importAnyTable');

var workbook = XLSX.readFile(userInputConfig.fileName, config.excelInitConfig);

console.log("1. Bets\n2. Reels\n3. Rules\n4. Lines\n5. Jackpots\n6. Read Data from any table\n7. All\n");
var selectionVal = prompt(": ");

switch (selectionVal) {
    case "1":
        bets.createBets(userInputConfig.sheetNames.bets, workbook.Sheets[userInputConfig.sheetNames.bets]);
        break;
    case "2":
        reels.createReels(userInputConfig.sheetNames.reels, workbook.Sheets[userInputConfig.sheetNames.reels]);
        break;
    case "3":
        rules.createRules(userInputConfig.sheetNames.rules, workbook.Sheets[userInputConfig.sheetNames.rules]);
        break;
    case "4":
        lines.createLines(userInputConfig.sheetNames.lines, workbook.Sheets[userInputConfig.sheetNames.lines]);
        break;
    case "5":
        jackpots.createJackpots(userInputConfig.sheetNames.jackpots, workbook.Sheets[userInputConfig.sheetNames.jackpots]);
        break;
    case "6":
        importAnyTable.createAnyTable(userInputConfig.sheetNames.anyTable, workbook.Sheets[userInputConfig.sheetNames.anyTable]);
        break;
    case "7":
        runAllOneByOne();
        break;
}

function runAllOneByOne() {
    var readBets = prompt("Read Bets (1 for yes/0 for No) :");
    if (readBets && parseInt(readBets)) {
        bets.createBets(userInputConfig.sheetNames.bets, workbook.Sheets[userInputConfig.sheetNames.bets]);
    }

    var readReels = prompt("Read Reels (1 for yes/0 for No) :");
    if (readReels && parseInt(readReels)) {
        reels.createReels(userInputConfig.sheetNames.reels, workbook.Sheets[userInputConfig.sheetNames.reels]);
    }

    var readRules = prompt("Read Rules (1 for yes/0 for No) :");
    if (readRules && parseInt(readRules)) {
        rules.createRules(userInputConfig.sheetNames.rules, workbook.Sheets[userInputConfig.sheetNames.rules]);
    }

    var readLines = prompt("Read Lines (1 for yes/0 for No) :");
    if (readLines && parseInt(readLines)) {
        lines.createLines(userInputConfig.sheetNames.lines, workbook.Sheets[userInputConfig.sheetNames.lines]);
    }

    var readJackpots = prompt("Read Jackpots (1 for yes/0 for No) :");
    if (readJackpots && parseInt(readJackpots)) {
        jackpots.createJackpots(userInputConfig.sheetNames.jackpots, workbook.Sheets[userInputConfig.sheetNames.jackpots]);
    }

    var anyTable = prompt("Read Any Table (1 for yes/0 for No) :");
    if (anyTable && parseInt(anyTable)) {
        importAnyTable.createAnyTable(userInputConfig.sheetNames.anyTable, workbook.Sheets[userInputConfig.sheetNames.anyTable]);
    }
}
