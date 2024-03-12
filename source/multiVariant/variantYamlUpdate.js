const fs = require('fs');
const yaml = require("js-yaml");
var path = require('path');
var util = require('../util');

function updateYamlFile(gameFolderName, createdFilesData) {
    if (createdFilesData && Object.keys(createdFilesData).length === 0) {
        return;
    }
    var slotsConfigYamlPath = path.join(process.env.CASINO_CHECKOUT, "/trunk/server/app/yaml/slots_2_config.yaml");
    var slotsConfigYamlData = yaml.load(fs.readFileSync(slotsConfigYamlPath, 'utf-8'));
    var gameIdsConfigWise = findGameIdConfigWise(gameFolderName, slotsConfigYamlData);

    var slotsConfigVariantYamlPath = path.join(process.env.CASINO_CHECKOUT, "/trunk/server/app/yaml/slots_2_config_variant.yaml");
    var slotsConfigVariantYamlData = fs.readFileSync(slotsConfigVariantYamlPath, 'utf-8');
    var gameIdsToInsert = determineGameIdsToInsert(yaml.load(slotsConfigVariantYamlData), gameIdsConfigWise, createdFilesData);
    if(gameIdsToInsert.updateExistingData.length || gameIdsToInsert.createCompleteData.length) {
        writeDataToInsert(gameFolderName, slotsConfigVariantYamlData, gameIdsToInsert, slotsConfigVariantYamlPath);
    }
}

function writeDataToInsert(gameFolderName, slotsConfigVariantYamlData, data, slotsConfigVariantYamlPath) {
    var casinoPatch = "";
    var slotzillaPatch = "";
    for (const createData of data.createCompleteData) {
        if (createData.lobbyId === "casino") {
            casinoPatch += `    ${createData.gameId}:
`;
            var str = '';
            for (var j = 0; j < createData.percentageIdIds.length; j++) {
                var percentageId = createData.percentageIdIds[j];
                str += `        ${percentageId}: \\App\\Models\\Slots\\Config\\${gameFolderName}\\Casino\\Config${createData.configId}${percentageId}`;
                str += '\n';
            }
            casinoPatch += str;
        } else if (createData.lobbyId === "slotzilla") {
            slotzillaPatch += `    ${createData.gameId}:
`;
            var str = '';
            for (var j = 0; j < createData.percentageIdIds.length; j++) {
                var percentageId = createData.percentageIdIds[j];
                str += `        ${percentageId}: \\App\\Models\\Slots\\Config\\${gameFolderName}\\Slotzilla\\Config${createData.configId}${percentageId}`;
                str += '\n';
            }
            slotzillaPatch += str;
        }
    }

    var casinoData = slotsConfigVariantYamlData.substring(0, slotsConfigVariantYamlData.indexOf("slotzilla:"));
    var slotzillaData = slotsConfigVariantYamlData.substring(slotsConfigVariantYamlData.indexOf("slotzilla:"), slotsConfigVariantYamlData.length);
    casinoData += casinoPatch;
    slotzillaData += slotzillaPatch
    casinoData += slotzillaData;

    var casinoPatch = "";
    var slotzillaPatch = "";
    for (const createData of data.updateExistingData) {
        var str = '';
        for (var j = 0; j < createData.percentageIdIds.length; j++) {
            var percentageId = createData.percentageIdIds[j];
            if (createData.lobbyId === "casino") {
                str += `
        ${percentageId}: \\App\\Models\\Slots\\Config\\${gameFolderName}\\Casino\\Config${createData.configId}${percentageId}`;
            } else {
                str += `
        ${percentageId}: \\App\\Models\\Slots\\Config\\${gameFolderName}\\Slotzilla\\Config${createData.configId}${percentageId}`;
            }
        }
        var targetIndex = casinoData.indexOf(createData.uniqueKey) + createData.uniqueKey.length;
        casinoData = casinoData.slice(0, targetIndex) + str + casinoData.slice(targetIndex, casinoData.length);

    }
    fs.writeFileSync(slotsConfigVariantYamlPath, casinoData);
    util.logSuccess("Yaml File Updated successfully ");
}

function findGameIdConfigWise(gameFolderName, slotsConfigYamlData) {
    var gameIdsConfigWise = {};
    for (const allData in slotsConfigYamlData) {
        for (const data in slotsConfigYamlData[allData]) {
            var lineData = slotsConfigYamlData[allData][data];
            if (lineData.indexOf(gameFolderName) > -1) {
                if (lineData.indexOf("ConfigStandard") > -1) {
                    gameIdsConfigWise[allData + "_" + 'Standard'] = Number(data);
                } else if (lineData.indexOf("ConfigVIP") > -1) {
                    gameIdsConfigWise[allData + "_" + 'VIP'] = Number(data);
                } else if (lineData.indexOf("ConfigHighVIP") > -1) {
                    gameIdsConfigWise[allData + "_" + 'HighVIP'] = Number(data);
                }
            }
        }
    }
    return gameIdsConfigWise;
}

function determineGameIdsToInsert(slotsConfigVariantYamlData, gameIdsConfigWise, createdFilesData) {
    var data = {
        createCompleteData: [],
        updateExistingData: []
    };
    for (const gameConfigKey in gameIdsConfigWise) {
        var lobbyId = gameConfigKey.split("_")[0];
        var configId = gameConfigKey.split("_")[1];
        var gameId = gameIdsConfigWise[gameConfigKey];

        if (!createdFilesData.hasOwnProperty(gameConfigKey)) {
            return;
        }

        if (slotsConfigVariantYamlData[lobbyId] && slotsConfigVariantYamlData[lobbyId][gameId]) {
            var updateData = [];
            for (const percentageIdId of createdFilesData[gameConfigKey]) {
                if (!slotsConfigVariantYamlData[lobbyId][gameId].hasOwnProperty(percentageIdId)) {
                    updateData.push(percentageIdId);
                }
            }
            if (updateData.length > 0) {
                var selectedGameConfigYamlData = Object.values(slotsConfigVariantYamlData[lobbyId][gameId]);
                data.updateExistingData.push({
                    gameId: gameId,
                    lobbyId: lobbyId,
                    configId: configId,
                    gameConfigKey: gameConfigKey,
                    percentageIdIds: updateData,
                    uniqueKey: selectedGameConfigYamlData[selectedGameConfigYamlData.length - 1]
                });
            }
        } else {
            data.createCompleteData.push({
                gameId: gameId,
                lobbyId: lobbyId,
                configId: configId,
                gameConfigKey: gameConfigKey,
                percentageIdIds: createdFilesData[gameConfigKey]
            })
        }
    }
    return data;
}

module.exports.updateYamlFile = updateYamlFile;