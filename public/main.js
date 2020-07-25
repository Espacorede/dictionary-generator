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

function findToken(string) {
    return Object.keys(languageData.english).find(key => languageData.english[key] === string);
}

function findString(language, token, noEscape = false) {
    if (noEscape) {
        return languageData[language][token];
    }

    if (languageData[language][token]) {
        return cleanString(languageData[language][token], language);
    }
}

function getTranslationsByString(string) {
    return getTranslationsByToken(findToken(string));
}

function getTranslationsByToken(token) {
    if (findString("english", token, true)) {
        const translations = {};
        let dicEntry = `${findString("english", token, true).toLowerCase()}:\n  en: ${findString("english", token)}\n`;

        for (const language of languages) {
            if (language !== "english" && findString(language, token) !== undefined) {
                translations[langCodes[language]] = findString(language, token);
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

    const output = getTranslationsByToken(token);

    if (output !== undefined) {
        $("#output").text(output);

        if (source === "fuzzy") {
            $("#fuzzy-area").fadeOut();
        }
    } else {
        $("#output").html("No tokens found. <!--<a href=\"#\" onclick=\"searchFuzzy()\">Try fuzzy search</a>?-->");
    }
}

function searchByString() {
    $("#output-area").fadeIn();

    const output = getTranslationsByString($("#search").val());

    if (output !== undefined) {
        $("#output").text(output);
    } else {
        $("#output").html("No tokens found. <!--<a href=\"#\" onclick=\"searchFuzzy()\">Try fuzzy search</a>?-->");
    }
}

function searchFuzzy() {
    const fuzzyData = Object.keys(languageData.english).map(function (key) {
        return {
            token: key,
            string: languageData.english[key]
        };
    });

    const options = {
        shouldSort: true,
        includeScore: true,
        keys: [{
            name: "token",
            weight: 0.3
        }, {
            name: "string",
            weight: 0.7
        }]
    };

    const fuse = new Fuse(fuzzyData, options);

    if (fuse.search($("#search").val()).length !== 0) {
        $("#fuzzy-table").text("");
        for (const i of fuse.search($("#search").val())) {
            $("#fuzzy-table").append(`
            <tr>
            <td>${cleanString(i.item.string)}</td>
            <td>${i.score}</td>
            <td>
                <input class="button button-clear" onclick="searchByToken('${i.item.token}', 'fuzzy')" value="Use this one pls">
            </td>
            </tr>
        `);
        }

        $("#fuzzy-area").fadeIn();
    } else {
        $("#output-area").fadeIn();
        $("#output").text("No strings nor tokens found. You're out of luck.");
    }
}

function copyOutput() {
    $("#output").focus();
    $("#output").select();
    document.execCommand("copy");
}

// Fim das funções

const languages = [
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
];
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
    koreana: "ka", // Copy of "ko"
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
const languageData = [];

for (const file of languages) {
    loadLangFile(file, function (response) {
        languageData[file] = response.data;
    });
}
