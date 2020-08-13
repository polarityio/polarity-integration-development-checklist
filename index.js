const core = require("@actions/core");
const github = require("@actions/github");
const checkConfigFile = require("./checkConfigFile");
const checkPackageJsonFile = require("./checkPackageJsonFile");
const checkLicenseFile = require("./checkLicenseFile");
const checkReadmeFile = require("./checkReadmeFile");
const checkPrettierRcFile = require("./checkPrettierRcFile");

const main = async () => {
  try {
    console.log('Starting Integration Development Checklist...\n');

    checkConfigFile();

    checkLicenseFile();

    checkReadmeFile();

    checkPrettierRcFile();

    await checkPackageJsonFile(github);

    console.log('\n\nIntegration Development Checklist Passed!\n');
  } catch (error) {
    core.setFailed(error.message);
  }
};

main();

module.exports = main;