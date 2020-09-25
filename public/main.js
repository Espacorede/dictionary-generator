$(document).ready(function () {
    const clipboard = new ClipboardJS(".button");

    clipboard.on("success", function (e) {
        $("#copy-output").text("Output copied to clipboard!").fadeIn();

        e.clearSelection();

        setTimeout(function () {
            $("#copy-output").fadeOut();
        }, 5000);
    });

    clipboard.on("error", function (e) {
        $("#copy-output").text("Failed to copy output! Try again or report.").fadeIn();

        setTimeout(function () {
            $("#copy-output").fadeOut();
        }, 5000);
    });
});

// Funções
function loadLangFile(language, callback) {
    $.ajax({
        url: `generated/${language}.json`,
        dataType: "json",
        success: function (data) {
            return callback(data);
        }
    });
}

function cleanString(s, language) {
    let string = s.trim();
    const escapeRegex = new RegExp(/\||\*|''+|\[\[+|~/, ["gim"]);
    const escapeRegexMatch = escapeRegex.exec(string);

    // \n to <br>
    string = string.replace(new RegExp(/(\\\\n|\\n)/, ["gim"]), "<br>");
    // \" to "
    string = string.replace(new RegExp(/(\\\\"|\\")/, ["gim"]), "\"");

    if (escapeRegexMatch !== null) {
        return `<nowiki>${string}</nowiki>`;
    }

    return string;
}

function findToken(string, file) {
    return Object.keys(languageData[file].english).find(key => languageData[file].english[key] === string);
}

function findString(file, language, token, noEscape = false) {
    if (noEscape) {
        return languageData[file][language][token];
    }

    if (languageData[file][language][token]) {
        return cleanString(languageData[file][language][token], language);
    }
}

function getTranslationsByString(string, file) {
    return getTranslationsByToken(findToken(string, file), file);
}

function getTranslationsByToken(token, file) {
    if (findString(file, "english", token, true)) {
        const translations = {};
        let dicEntry = `${findString(file, "english", token, true).toLowerCase()}:\n  en: ${findString(file, "english", token)}\n`;

        for (const language of languageFiles[file]) {
            if (language !== "english" && findString(file, language, token) !== undefined) {
                translations[langCodes[language]] = findString(file, language, token);
            }
        }

        for (const key of Object.keys(translations).sort()) {
            dicEntry += `  ${key}: ${translations[key]}\n`;
        };

        return dicEntry;
    }
}

function searchByToken(token = $("#search").val(), source) {
    $("#output-area").fadeIn();

    const mode = $("#searchmode").val();
    let output;
    if (mode === "proto") {
        output = getTranslationsByToken(token, "tf_proto_obj_defs");
    } else if (mode === "proto2") {
        output = getTranslationsByToken(`${token.replace(/ /g, "_")} { field_number: 4 }`, "tf_proto_obj_defs");
    } else if (mode === "proto3") {
        output = getTranslationsByToken(`${token.replace(/ /g, "_")} { field_number: 2 }`, "tf_proto_obj_defs");
    } else {
        output = getTranslationsByToken(token, "tf");
    }

    if (output !== undefined) {
        $("#output").text(output);

        if (source === "fuzzy") {
            $("#fuzzy-area").fadeOut();
        }
    } else {
        $("#output").html("No tokens found!");
    }
}

function searchByString() {
    $("#output-area").fadeIn();

    let output;

    if ($("#searchmode").val() !== "tf") {
        output = getTranslationsByString($("#search").val(), "tf_proto_obj_defs");
    } else {
        output = getTranslationsByString($("#search").val(), "tf");
    }

    if (output !== undefined) {
        $("#output").text(output);
    } else {
        $("#output").html(`No strings found on ${$("#searchmode").val()}.`);
    }
}

function copyOutput() {
    $("#output").focus();
    $("#output").select();
    document.execCommand("copy");
}

// Fim das funções
const languageFiles = {
    tf: [
        "brazilian",
        // "bulgarian",
        "czech",
        "danish",
        "dutch",
        "english",
        "finnish",
        "french",
        "german",
        // "greek",
        "hungarian",
        "italian",
        "japanese",
        "korean",
        // "koreana",
        // "latam",
        "norwegian",
        // "pirate",
        "polish",
        "portuguese",
        "romanian",
        "russian",
        "schinese",
        "spanish",
        "swedish",
        "tchinese",
        // "thai",
        "turkish"
        // "ukrainian",
        // "vietnamese"
    ],
    tf_proto_obj_defs: [
        "brazilian",
        // "bulgarian",
        "czech",
        "danish",
        "dutch",
        "english",
        "finnish",
        "french",
        "german",
        // "greek",
        "hungarian",
        "italian",
        // "japanese",
        "korean",
        // "koreana",
        // "latam",
        "norwegian",
        // "pirate",
        "polish",
        "portuguese",
        "romanian",
        "russian",
        "schinese",
        "spanish",
        "swedish",
        "tchinese",
        // "thai",
        "turkish"
        // "ukrainian",
        // "vietnamese"
    ]
};

const langCodes = {
    arabic: "ar", // No official support
    brazilian: "pt-br",
    bulgarian: "bg",
    czech: "cs",
    danish: "da",
    dutch: "nl",
    english: "en",
    finnish: "fi",
    french: "fr",
    german: "de",
    hungarian: "hu",
    italian: "it",
    japanese: "ja",
    korean: "ko",
    koreana: "ka", // Localization test file for korean
    latam: "es-latam",
    norwegian: "no",
    pirate: "en-pirate",
    polish: "pl",
    portuguese: "pt",
    romanian: "ro",
    russian: "ru",
    schinese: "zh-hans",
    spanish: "es",
    swedish: "sv",
    tchinese: "zh-hant",
    thai: "th", // https://wiki.tf/d/2097829
    turkish: "tr",
    ukrainian: "uk", // https://wiki.tf/d/2097829
    vietnamese: "vi" // https://wiki.tf/d/2097829
};

const languageData = {
    tf: [],
    tf_proto_obj_defs: []
};

for (const f in languageFiles) {
    for (const l of languageFiles[f]) {
        loadLangFile(`${f}_${l}`, function (response) {
            languageData[f][l] = response.data;
        });
    }
}
