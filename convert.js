const fs = require("fs");
const readline = require("readline");
const config = require("./config");
const languages = [
    "brazilian",
    "bulgarian",
    "czech",
    "danish",
    "dutch",
    "english",
    "finnish",
    "french",
    "german",
    "greek",
    "hungarian",
    "italian",
    "japanese",
    "korean",
    "koreana",
    "latam",
    "norwegian",
    "pirate",
    "polish",
    "portuguese",
    "romanian",
    "russian",
    "schinese",
    "spanish",
    "swedish",
    "tchinese",
    "thai",
    "turkish",
    "ukrainian",
    "vietnamese"
];

for (const language of languages) {
    if (config.IGNORELANGUAGES.includes(language)) {
        console.log(`Ignored: tf_${language}.txt`);
        continue;
    }

    const tokens = {};

    const rl = readline.createInterface({
        input: fs.createReadStream(`${config.STEAMDIR}/steamapps/common/Team Fortress 2/tf/resource/tf_${language}.txt`, {
            encoding: "ucs2" // Direto da pasta do TF
        })
    });

    rl.on("line", (line) => {
        const regex = new RegExp(/(?:^"(.*?)?")[\t ]+(?:"([^"].*)")/, ["gim"]);

        const regexMatch = regex.exec(line);

        if (regexMatch !== null) {
            const token = regexMatch[1];
            const string = regexMatch[2];

            if (!token.includes("[english]")) {
                tokens[token] = string;
            }
        }
    }).on("close", () => {
        fs.writeFile(
            path = `public/generated/${language}.json`,
            data = JSON.stringify(
                {
                    source: `tf_${language}.txt`,
                    updated: new Date(),
                    data: tokens
                }
            ),
            callback = function (err) {
                if (err) throw err;

                console.log(`Converted: tf_${language}.txt`);
            }
        );
    });
}
