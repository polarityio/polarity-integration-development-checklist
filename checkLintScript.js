const fs = require("fs");
const fp = require("lodash/fp");
const execWithNodeVersion = require("./execWithNodeVersion");

const checkLintScript = () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const lintScript = fp.get("scripts.lint", packageJson);

    if (!lintScript) {
      console.info("- Skipped: No `lint` script found in package.json");
      return;
    }

    execWithNodeVersion(18, "npm run lint");

    console.info("- Success: `npm run lint` passed with no errors");
  } catch (e) {
    if (e.message.includes("no such file or directory")) {
      throw new Error("File Not Found: package.json");
    }
    if (e.stdout || e.stderr) {
      const output = (e.stdout || "") + (e.stderr || "");
      throw new Error(`Linting errors found:\n${output.trim()}`);
    }
    throw e;
  }
};

module.exports = checkLintScript;
