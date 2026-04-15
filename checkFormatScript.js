const fs = require("fs");
const { execSync } = require("child_process");
const fp = require("lodash/fp");

const checkFormatScript = () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const formatScript = fp.get("scripts.format", packageJson);

    if (!formatScript) {
      console.info("- Skipped: No `format` script found in package.json");
      return;
    }

    execSync("npm run format", { stdio: "pipe", encoding: "utf8" });

    console.info("- Success: `npm run format` passed with no errors");
  } catch (e) {
    if (e.message.includes("no such file or directory")) {
      throw new Error("File Not Found: package.json");
    }
    if (e.stdout || e.stderr) {
      const output = (e.stdout || "") + (e.stderr || "");
      throw new Error(`Formatting errors found:\n${output.trim()}`);
    }
    throw e;
  }
};

module.exports = checkFormatScript;
