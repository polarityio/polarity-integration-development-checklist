const fs = require("fs");
const fp = require("lodash/fp");
const core = require("@actions/core");

const checkPackageJsonFile = async (github) => {
  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json"));

    checkPrivateFlag(packageJson);

    checkVersionRegex(packageJson);

    await checkVersionIsNew(packageJson, github);
  } catch (e) {
    if (e.message.includes("no such file or directory")) {
      throw new Error("File Not Found: package.json");
    }
    throw e;
  }
};

const checkPrivateFlag = (packageJson) => {
  const private = fp.getOr("failed_to_get", "private", packageJson);
  if (private === "failed_to_get") {
    throw new Error("Private Flag not defined in package.json");
  } else if (private !== true) {
    throw new Error("Private Flag not set to true in package.json");
  }

  console.info("- Success: Private Flag set to true in package.json");
};

const checkVersionRegex = (packageJson) => {
  const semanticVersioningRegex = /^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/;

  const version = fp.getOr("failed_to_get", "version", packageJson);
  if (version === "failed_to_get") {
    throw new Error("Version property not defined in package.json");
  } else if (!semanticVersioningRegex.test(version)) {
    throw new Error(
      "Version property value is not in valid format in package.json"
    );
  }

  console.info(
    "- Success: Version property is correctly formatted in package.json"
  );
};

const checkVersionIsNew = async (packageJson, github) => {
  const token = core.getInput('GITHUB_TOKEN');

  const octokit = github.getOctokit(token);

  const repo = fp.get('context.payload.repository', github);

  const releaseTags = fp.getOr(
    [],
    'data',
    await octokit.repos.listTags({
      owner: repo.owner.login,
      repo: repo.name
    })
  );
  
  const version = fp.getOr("failed_to_get", "version", packageJson);
  const matchingReleaseTag = fp.find((releaseTag) => releaseTag.name === version, releaseTags)
  if (matchingReleaseTag) {
    throw new Error(
      `Version in package.json already has a release on Github (${matchingReleaseTag.name})`
    );
  }

  console.info("- Success: Version in package.json is new and unique on Github");
};

module.exports = checkPackageJsonFile;
