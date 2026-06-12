const fs = require("fs");
const path = "C:/Users/Asus/.gemini/antigravity-ide/brain/ad927d0b-9f30-4a42-9cbf-69ef57f98f9e/.system_generated/logs/transcript.jsonl";
const lines = fs.readFileSync(path, "utf8").split("\n");
let lastDiff = "";
for (let line of lines) {
    if (line.includes("The following changes were made by the multi_replace_file_content tool")) {
        const obj = JSON.parse(line);
        if (obj.content.includes("multi_replace_file_content")) {
            lastDiff = obj.content;
        }
    }
}
fs.writeFileSync("diff.txt", lastDiff);
