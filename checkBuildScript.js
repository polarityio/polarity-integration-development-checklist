const fs = require("fs");
const fp = require("lodash/fp");
const execWithNodeVersion = require("./execWithNodeVersion");

const checkBuildScript = () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const buildScript = fp.get("scripts.build", packageJson);

    if (!buildScript) {
      console.info("- Skipped: No `build` script found in package.json");
      return;
    }

    execWithNodeVersion(24, "npm run build");

    console.info("- Success: `npm run build` passed with no errors (Node 24)");
  } catch (e) {
    if (e.message.includes("no such file or directory")) {
      throw new Error("File Not Found: package.json");
    }
    if (e.stdout || e.stderr) {
      const output = (e.stdout || "") + (e.stderr || "");
      throw new Error(`Build errors found:\n${output.trim()}`);
    }
    throw e;
  }
};

module.exports = checkBuildScript;
