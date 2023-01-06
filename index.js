const core = require("@actions/core");
const github = require("@actions/github");
const checkConfigFile = require("./checkConfigFile");
const checkLicenseFile = require("./checkLicenseFile");
const checkReadmeFile = require("./checkReadmeFile");
const checkPrettierRcFile = require("./checkPrettierRcFile");
const checkGitignoreFile = require("./checkGitignoreFile");
const checkPackageJsonFile = require("./checkPackageJsonFile");
const checkPackageLockFile = require("./checkPackageLockFile");

const main = async () => {
  try {
    console.info('Starting Integration Development Checklist...\n');

    checkConfigFile();

    checkLicenseFile();

    checkReadmeFile();

    checkPrettierRcFile();

    checkGitignoreFile();

    // NOTE: The await keyword isn't working. Must use .then syntax instead
    checkPackageJsonFile(github).then(checkPackageLockFile);

    console.info('\n\nIntegration Development Checklist Passed!\n');
  } catch (error) {
    core.setFailed(error.message);
  }
};

main();

module.exports = main;