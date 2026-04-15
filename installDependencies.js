const fs = require("fs");
const execWithNodeVersion = require("./execWithNodeVersion");

const hasPlaywrightDependency = () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    return "@vitest/browser-playwright" in allDeps || "@vitest/browser" in allDeps;
  } catch {
    return false;
  }
};

const installDependencies = () => {
  if (!fs.existsSync("package-lock.json")) {
    console.info("- Skipped: No package-lock.json found, skipping npm ci");
    return;
  }

  try {
    execWithNodeVersion(18, "npm ci");
    console.info("- Success: Dependencies installed with Node 18 via `npm ci`");
  } catch (e) {
    if (e.stdout || e.stderr) {
      const output = (e.stdout || "") + (e.stderr || "");
      throw new Error(`Failed to install dependencies:\n${output.trim()}`);
    }
    throw e;
  }

  if (hasPlaywrightDependency()) {
    try {
      execWithNodeVersion(18, "npx playwright install chromium");
      console.info("- Success: Playwright browsers installed");
    } catch (e) {
      if (e.stdout || e.stderr) {
        const output = (e.stdout || "") + (e.stderr || "");
        throw new Error(`Failed to install Playwright browsers:\n${output.trim()}`);
      }
      throw e;
    }
  }
};

module.exports = installDependencies;
