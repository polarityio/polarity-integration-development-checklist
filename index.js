const core = require("@actions/core");
const checkConfigFile = require("./checkConfigFile");
const checkPackageJsonFile = require("./checkPackageJsonFile");
const checkLicenseFile = require("./checkLicenseFile");

try {
  console.log("Starting Integration Development Checklist...\n");

  checkConfigFile();

  checkLicenseFile();

  await checkPackageJsonFile();

  console.log("Integration Development Checklist Passed!");
} catch (error) {
  core.setFailed(error.message);
}
