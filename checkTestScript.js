const fs = require("fs");
const fp = require("lodash/fp");
const execWithNodeVersion = require("./execWithNodeVersion");

const checkTestScript = () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const testScript = fp.get("scripts.test", packageJson);

    if (!testScript) {
      console.info("- Skipped: No `test` script found in package.json");
      return;
    }

    execWithNodeVersion(24, "npm run test");

    console.info("- Success: `npm run test` passed with no errors");
  } catch (e) {
    if (e.message.includes("no such file or directory")) {
      throw new Error("File Not Found: package.json");
    }
    if (e.stdout || e.stderr) {
      const output = (e.stdout || "") + (e.stderr || "");
      throw new Error(`Test errors found:\n${output.trim()}`);
    }
    throw e;
  }
};

module.exports = checkTestScript;
