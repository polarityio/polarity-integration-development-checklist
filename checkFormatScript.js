const fs = require("fs");
const fp = require("lodash/fp");
const execWithNodeVersion = require("./execWithNodeVersion");

const checkFormatScript = () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const formatScript = fp.get("scripts.format", packageJson);

    if (!formatScript) {
      console.info("- Skipped: No `format` script found in package.json");
      return;
    }

    execWithNodeVersion(24, "npm run format");

    console.info("- Success: `npm run format` passed with no errors (Node 24)");
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
