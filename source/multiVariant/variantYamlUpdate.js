const fs = require('fs');
const yaml = require("js-yaml");
var path = require('path');
// var createdFilesData = {
//     casino_Standard: [88, 90],
//     casino_VIP: [88, 90],
//     casino_HighVIP: [88, 90],
//     slotzilla_Standard: [88, 90],
//     slotzilla_VIP: [88, 90]
// };

function updateYamlFile(gameFolderName, createdFilesData) {
    if (createdFilesData && Object.keys(createdFilesData).length === 0) {
        return;
    }
    console.log(createdFilesData);
    var slotsConfigYamlPath = path.join(process.env.CASINO_CHECKOUT, "/trunk/server/app/yaml/slots_2_config.yaml");
    var slotsConfigYamlData = yaml.load(fs.readFileSync(slotsConfigYamlPath, 'utf-8'));
    var gameIdsConfigWise = findGameIdConfigWise(gameFolderName, slotsConfigYamlData)

    var slotsConfigVariantYamlPath = path.join(process.env.CASINO_CHECKOUT, "/trunk/server/app/yaml/slots_2_config_variant.yaml");
    var slotsConfigVariantYamlData = fs.readFileSync(slotsConfigVariantYamlPath, 'utf-8');
    var gameIdsToInsert = determineGameIdsToInsert(yaml.load(slotsConfigVariantYamlData), gameIdsConfigWise, createdFilesData);
    writeDataToInsert(gameFolderName, slotsConfigVariantYamlData, gameIdsConfigWise, gameIdsToInsert, createdFilesData, slotsConfigVariantYamlPath);
}

function writeDataToInsert(gameFolderName, slotsConfigVariantYamlData, gameIdsConfigWise, gameIdsToInsert, createdFilesData, slotsConfigVariantYamlPath) {
    var casinoPatch = '';
    var slotzillaPatch = '';
    for (var i = 0; i < gameIdsToInsert.length; i++) {
        var lobbyId = gameIdsToInsert[i].split("_")[0];
        var configId = gameIdsToInsert[i].split("_")[1];

        if (lobbyId === 'casino') {
            casinoPatch += `    ${gameIdsConfigWise[gameIdsToInsert[i]]}:
`;
            var str = '';
            for (var j = 0; j < createdFilesData[gameIdsToInsert[i]].length; j++) {
                str += `        ${createdFilesData[gameIdsToInsert[i]][j]}: \\App\\Models\\Slots\\Config\\${gameFolderName}\\Casino\\Config${configId}${createdFilesData[gameIdsToInsert[i]][j]}`;
                str += '\n';
            }
            casinoPatch += str;
        } else if (lobbyId === 'slotzilla') {
            slotzillaPatch += `    ${gameIdsConfigWise[gameIdsToInsert[i]]}:
`;
            var str = '';
            for (var j = 0; j < createdFilesData[gameIdsToInsert[i]].length; j++) {
                str += `        ${createdFilesData[gameIdsToInsert[i]][j]}: \\App\\Models\\Slots\\Config\\${gameFolderName}\\Slotzilla\\Config${configId}${createdFilesData[gameIdsToInsert[i]][j]}`;
                str += '\n';
            }
            slotzillaPatch += str;
        }
    }
    console.log(casinoPatch);
    console.log(slotzillaPatch);

    var casinoData = slotsConfigVariantYamlData.substring(0, slotsConfigVariantYamlData.indexOf("slotzilla:"));
    var slotzillaData = slotsConfigVariantYamlData.substring(slotsConfigVariantYamlData.indexOf("slotzilla:"), slotsConfigVariantYamlData.length);
    casinoData += casinoPatch;
    slotzillaData += slotzillaPatch
    casinoData += slotzillaData;

    fs.writeFileSync(slotsConfigVariantYamlPath, casinoData);
    console.log("write complete");

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
    var gameIdsToInsert = [];
    for (const gameId in gameIdsConfigWise) {
        if (slotsConfigVariantYamlData.casino && slotsConfigVariantYamlData.casino.hasOwnProperty(gameIdsConfigWise[gameId])) {
            continue;
        } else if (slotsConfigVariantYamlData.slotzilla && slotsConfigVariantYamlData.slotzilla.hasOwnProperty(gameIdsConfigWise[gameId])) {
            continue;
        } else if (createdFilesData.hasOwnProperty(gameId)) {
            gameIdsToInsert.push(gameId);
        }
    }
    return gameIdsToInsert;
}

module.exports.updateYamlFile = updateYamlFile;