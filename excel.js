var prompt = require('prompt-sync')({ sigint: true });
var config = require('./source/config.json');
var XLSX = require('xlsx');

var bets = require('./source/bet');
var reels = require('./source/reel');
var rules = require('./source/rules');
var lines = require('./source/lines');
var jackpots = require('./source/jackpots');
var importAnyTable = require('./source/importAnyTable');

var workbook = XLSX.readFile(config.fileName, config.excelInitConfig);

console.log("1. Bets\n2. Reels\n3. Rules\n4. Lines\n5. Jackpots\n6. Read Data from any table\n7. All\n");
var selectionVal = prompt(": ");

switch (selectionVal) {
    case "1":
        bets.createBets(workbook);
        break;
    case "2":
        reels.createReels(workbook);
        break;
    case "3":
        rules.createRules(workbook);
        break;
    case "4":
        lines.createLines(workbook);
        break;
    case "5":
        jackpots.createJackpots(workbook);
        break;
    case "6":
        importAnyTable.createAnyTable(workbook);
        break;
    case "7":
        runAllOneByOne(workbook);
        break;
}

function runAllOneByOne(workbook) {
    var readBets = prompt("Read Bets (1 for yes/0 for No) :");
    if (readBets && parseInt(readBets)) {
        bets.createBets(workbook);
    }

    var readReels = prompt("Read Reels (1 for yes/0 for No) :");
    if (readReels && parseInt(readReels)) {
        reels.createReels(workbook);
    }

    var readRules = prompt("Read Rules (1 for yes/0 for No) :");
    if (readRules && parseInt(readRules)) {
        rules.createRules(workbook);
    }

    var readLines = prompt("Read Lines (1 for yes/0 for No) :");
    if (readLines && parseInt(readLines)) {
        lines.createLines(workbook);
    }

    var readJackpots = prompt("Read Jackpots (1 for yes/0 for No) :");
    if (readJackpots && parseInt(readJackpots)) {
        jackpots.createJackpots(workbook);
    }

    var anyTable = prompt("Read Any Table (1 for yes/0 for No) :");
    if (anyTable && parseInt(anyTable)) {
        importAnyTable.createAnyTable(workbook);
    }
}

