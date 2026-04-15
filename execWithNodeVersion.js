const { execSync } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");

const downloadNode = (majorVersion) => {
  const cacheDir = path.join(os.tmpdir(), `polarity-node-v${majorVersion}`);
  const nodeBin = path.join(cacheDir, "bin", "node");

  if (fs.existsSync(nodeBin)) {
    return cacheDir;
  }

  fs.mkdirSync(cacheDir, { recursive: true });

  const arch = os.arch();
  const platform = os.platform();
  const indexUrl = `https://nodejs.org/dist/latest-v${majorVersion}.x/`;
  const listing = execSync(`curl -sL "${indexUrl}"`, { encoding: "utf8" });
  const pattern = new RegExp(
    `(node-v\\d+\\.\\d+\\.\\d+-${platform}-${arch})\\.tar\\.gz`
  );
  const match = listing.match(pattern);

  if (!match) {
    throw new Error(
      `Could not find Node.js v${majorVersion} binary for ${platform}-${arch}`
    );
  }

  console.info(`  Downloading ${match[1]}...`);
  execSync(
    `curl -sL "${indexUrl}${match[0]}" | tar -xz --strip-components=1 -C "${cacheDir}"`,
    { stdio: "pipe" }
  );

  return cacheDir;
};

/**
 * Runs a shell command using a specific Node.js major version.
 * If the requested version matches the current runtime, runs directly.
 * Otherwise tries nvm, then falls back to downloading the Node binary.
 */
const getNodeBinDir = (nodeVersion) => {
  const currentMajor = parseInt(process.versions.node.split(".")[0], 10);

  // Use the running process's own binary directory
  if (nodeVersion === currentMajor) {
    return path.dirname(process.execPath);
  }

  // Try nvm
  const nvmDir = process.env.NVM_DIR;
  if (nvmDir && fs.existsSync(path.join(nvmDir, "nvm.sh"))) {
    return null; // signal to use nvm
  }

  // Download Node and return its bin directory
  const nodeDir = downloadNode(nodeVersion);
  return path.join(nodeDir, "bin");
};

const execWithNodeVersion = (nodeVersion, command, options = {}) => {
  const binDir = getNodeBinDir(nodeVersion);

  if (binDir === null) {
    // Use nvm
    const nvmDir = process.env.NVM_DIR;
    const nvmCommand =
      `bash -c "source ${nvmDir}/nvm.sh --no-use && nvm install ${nodeVersion} --silent && nvm use ${nodeVersion} --silent && ${command}"`;
    return execSync(nvmCommand, { stdio: "pipe", encoding: "utf8", ...options });
  }

  // Prepend the correct Node bin directory to PATH
  const env = { ...process.env, PATH: `${binDir}:${process.env.PATH}` };
  return execSync(command, { stdio: "pipe", encoding: "utf8", env, ...options });
};

module.exports = execWithNodeVersion;
