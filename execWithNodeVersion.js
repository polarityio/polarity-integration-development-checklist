const { execSync } = require("child_process");

/**
 * Runs a shell command using a specific Node.js version via nvm.
 * Falls back to running the command directly if nvm is not available.
 */
const execWithNodeVersion = (nodeVersion, command, options = {}) => {
  const nvmCommand =
    `bash -c "source $NVM_DIR/nvm.sh --no-use && nvm install ${nodeVersion} --silent && nvm use ${nodeVersion} --silent && ${command}"`;

  try {
    return execSync(nvmCommand, { stdio: "pipe", encoding: "utf8", ...options });
  } catch (e) {
    if (e.message.includes("NVM_DIR")) {
      console.warn(
        `  Warning: nvm not available, running "${command}" with default Node version`
      );
      return execSync(command, { stdio: "pipe", encoding: "utf8", ...options });
    }
    throw e;
  }
};

module.exports = execWithNodeVersion;
