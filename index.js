const core = require("@actions/core");
const github = require("@actions/github");
const checkConfigFile = require("./checkConfigFile");
const checkLicenseFile = require("./checkLicenseFile");
const checkReadmeFile = require("./checkReadmeFile");
const checkPrettierRcFile = require("./checkPrettierRcFile");
const checkGitignoreFile = require("./checkGitignoreFile");
const checkPackageJsonFile = require("./checkPackageJsonFile");
const checkPackageLockFile = require("./checkPackageLockFile");
const { get } = require("lodash/fp");

const main = async () => {
  try {
    console.info("Starting Integration Development Checklist...\n");
    const token = core.getInput('GITHUB_TOKEN');
    const octokit = github.getOctokit(token);
    const repo = get("context.payload.repository", github);

    await checkConfigFile(octokit, repo);

    checkLicenseFile();

    checkReadmeFile();

    checkPrettierRcFile();

    checkGitignoreFile();

    await checkPackageJsonFile(octokit, repo);

    checkPackageLockFile();

    console.info("\n\nIntegration Development Checklist Passed!\n");
  } catch (error) {
    core.setFailed(error.message);
  }
};

main();

module.exports = main;
