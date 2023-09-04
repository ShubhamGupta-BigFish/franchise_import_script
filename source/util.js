var fs = require('fs');
var path = require('path');
var colors = require('colors');
var prompt = require('prompt-sync')({ sigint: true });

colors.enable();

module.exports = {
    alphaToNum: function (alpha) {
        var i = 0,
            num = 0,
            len = alpha.length;

        for (; i < len; i++) {
            num = num * 26 + alpha.charCodeAt(i) - 0x40;
        }

        return num - 1;
    },
    numToAlpha: function (num) {

        var alpha = '';

        for (; num >= 0; num = parseInt(num / 26, 10) - 1) {
            alpha = String.fromCharCode(num % 26 + 0x41) + alpha;
        }

        return alpha;
    },
    buildColumnsArray: function (range) {

        var i,
            res = [],
            rangeNum = (range.toUpperCase()).split(':').map(function (val) {
                return module.exports.alphaToNum(val.replace(/[0-9]/g, ''));
            }),
            start = rangeNum[0],
            end = rangeNum[1] + 1;

        for (i = start; i < end; i++) {
            res.push(module.exports.numToAlpha(i));
        }

        return res;
    },
    upperCaseAndSpiltCellVal: function (cellId) {
        cellId = cellId.toUpperCase();
        return (cellId.split(/(\d+)/)).filter(Boolean);
    },
    replaceBraceAndCurlyBrackets: function (jsonData) {
        var chars = {
            ':': '=>',
            '{': '[',
            '}': ']'
        };

        var finalString = JSON.stringify(jsonData);
        // return finalString.replace(/[:{}]/g, function(m) {
        //     return chars[m];
        // });
        return finalString.replace(/[:{}]/g, m => chars[m]);
    },
    determineMaxColAndRowsInSheet: function (ws) {
        var rowsCount = ws.length;
        var columnCount = 0;
        for (var row = 0; row < rowsCount; row++) {
            if (ws[row].length > columnCount) {
                columnCount = ws[row].length;
            }
        }
        rowsCount += 10;
        columnCount += 10;
        return { rowsCount: rowsCount, columnCount: columnCount };
    },
    readValue: function (sheetName, sheet, cellId) {
        if (!sheet) {
            module.exports.logError("SHEET NOT FOUND");
            return;
        }

        if (!sheet[cellId] || (sheet[cellId] && !sheet[cellId].hasOwnProperty("v"))) {
            module.exports.logError("CELL " + cellId + " in SHEET " + sheetName + " does not have any value");
            return;
        }

        return sheet[cellId].v;
    },
    writeData: function (fileName, data) {
        try {
            fs.writeFileSync(path.join(__dirname, "/output/", fileName), data);
        } catch (e) {
            console.log(e);
        }
    },
    logError: function (msg) {
        console.log(msg.underline.red);
    },
    promptAndValidate: function (ques, parseType, validInputs) {
        if (validInputs === undefined) {
            module.exports.logError("Valid Input Values not found");
            return;
        }

        var inputValidated = false;
        while (!inputValidated) {
            try {
                var userResponse = prompt(ques);
                if (parseType === 'number') {
                    userResponse = parseInt(userResponse);
                }

                if (Array.isArray(validInputs)) {
                    if (validInputs.indexOf(userResponse) > -1) {
                        inputValidated = true;
                        break;
                    } else {
                        module.exports.logError("user input is not valid, user input is not present in predefined array");
                    }
                } else if (typeof validInputs == 'number') {
                    if (userResponse === validInputs) {
                        inputValidated = true;
                        break;
                    } else {
                        module.exports.logError("user input is not valid. user input is not correct number");
                    }
                } else if (validInputs === 'numberRange') {
                    if (!isNaN(userResponse)) {
                        inputValidated = true;
                        break;
                    } else {
                        module.exports.logError("user input is not valid. user input is not number");
                    }
                } else if (validInputs === 'notEmpty') {
                    console.log(userResponse);
                    if (userResponse === "") {
                        module.exports.logError("user input is not valid. user input is empty");
                    } else {
                        inputValidated = true;
                        break;
                    }
                }
            } catch (e) {
                throw e;
            }
        }

        return userResponse;
    }
}