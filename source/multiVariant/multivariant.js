var fs = require('fs');
var path = require('path');
var userInputConfig = require("../userInputConfig.json");
var config = require('./multiVariantConfig.json');
var util = require('../util');

if (!userInputConfig.hasOwnProperty("multiVariant")) {
    util.logError("multiVariant data not found, please set multi variant config data in userInputConfig.json");
    return;
}
var multiVariantUserConfig = userInputConfig.multiVariant;
if (!multiVariantUserConfig.hasOwnProperty("folderName") || !multiVariantUserConfig.folderName) {
    util.logError("folderName data not found, please set game folderName in multi variant config data in userInputConfig.json");
    return;
} else if (!multiVariantUserConfig.hasOwnProperty("gameName") || !multiVariantUserConfig.gameName) {
    util.logError("Game Name not found, please set gameName in multi variant config data in userInputConfig.json");
    return;
} else if (!multiVariantUserConfig.hasOwnProperty("percentages") || !multiVariantUserConfig.percentages || multiVariantUserConfig.percentages.length == 0) {
    util.logError("percentages data not found, please set percentages in multi variant config data in userInputConfig.json");
    return;
}

createMultiVariantFiles();

function createMultiVariantFiles() {
    for (const [lobbyName, lobbyData] of Object.entries(config.lobby)) {
        lobbyData.forEach(variantName => {
            multiVariantUserConfig.percentages.forEach(percentageId => {
                writeData(lobbyName, variantName, percentageId);
            })
        })
    }
}

function writeData(lobbyName, variantName, percentageId) {
    try {
        var writeData = createWriteData(lobbyName, variantName, percentageId);
        var folderPath = getFolderPath(lobbyName);
        try {
            if (!fs.existsSync(folderPath)) {
                util.logError("folder Pathis not correct " + folderPath);
                return;
            }
        } catch (err) {
            return console.error(err);
        }
        fs.writeFileSync(folderPath + "/" + config.varaintFileNameMap[variantName] + percentageId + ".php", writeData);
    } catch (e) {
        console.log(e);
    }
}

function getFolderPath(lobbyName) {
    return path.join(process.env.CASINO_CHECKOUT, "/trunk/server/app/models/slots/config/", multiVariantUserConfig.folderName, lobbyName.toLowerCase())
}

function createWriteData(lobbyName, variantName, percentageId) {
    return `<?php

namespace App\\Models\\Slots\\Config\\${multiVariantUserConfig.folderName}\\${lobbyName};

${getBaseClassLocation(lobbyName, variantName)}

class Config${variantName}${percentageId} {
    static $settingsFlatArrayOverride = null;

    static function setup() {
        $settings = ${getParentClassLocation(lobbyName, variantName, percentageId)}
        $settings['name'] = "${getGameName(variantName)}";
        ${useBaseBets(lobbyName, variantName)}
        self::$settingsFlatArrayOverride = new \\FlatArray($settings);
    }

    static function get($setting = null, $default = null) {
        if (self::$settingsFlatArrayOverride === null) {
            self::setup();
        }

        return self::$settingsFlatArrayOverride->get($setting, $default);
    }
}
`;
}

function useBaseBets(lobbyName, variantName) {
    if (lobbyName === "Casino" && variantName === "Standard") {
        return "";
    }
    return "BaseConfig::configure($settings, true);";
}

function getBaseClassLocation(lobbyName, variantName) {
    if (lobbyName === "Casino" && variantName === "Standard") {
        return "";
    }
    return "use \\App\\Models\\Slots\\Config\\BaseConfig\\" + lobbyName + "\\" + config.variantBaseClassMap[variantName] + " as BaseConfig;";
}

function getParentClassLocation(lobbyName, variantName, percentageId) {
    if (lobbyName === "Casino" && variantName === "Standard") {
        return "\\App\\Models\\Slots\\Config\\" + multiVariantUserConfig.folderName + "\\" + lobbyName + "\\Config" + config.variantParentClassMap[variantName] + "::get();"
    } else if (lobbyName === "Slotzilla" && variantName === "Standard") {
        return "\\App\\Models\\Slots\\Config\\" + multiVariantUserConfig.folderName + "\\Casino\\Config" + config.variantParentClassMap[variantName] + percentageId + "::get();"
    }
    return "\\App\\Models\\Slots\\Config\\" + multiVariantUserConfig.folderName + "\\" + lobbyName + "\\Config" + config.variantParentClassMap[variantName] + percentageId + "::get();"
}

function getGameName(variantName) {
    return config.variantGameNameMap[variantName].first + multiVariantUserConfig.gameName + config.variantGameNameMap[variantName].last;
}