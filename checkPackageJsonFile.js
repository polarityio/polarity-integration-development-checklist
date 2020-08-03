const fs = require("fs");
const fp = require("lodash/fp");
const github = require("@actions/github");

const checkPackageJsonFile = async () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json"));

    checkPrivateFlag(packageJson);

    checkVersionRegex(packageJson);

    await checkVersionIsNew(packageJson);
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

  console.log("- Success: Private Flag set to true in package.json");
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

  console.log(
    "- Success: Version property is correctly formatted in package.json"
  );
};

const checkVersionIsNew = async (packageJson) => {
  const myToken = core.getInput("myToken");

  const octokit = github.getOctokit(myToken);

  const context = github.context;
  const releaseTags = await octokit.repos.listTags({
    owner: context.repository_owner,
    repo: context.repository,
  });

  const version = fp.getOr("failed_to_get", "version", packageJson);
  if (fp.any((releaseTag) => releaseTag.name === version, releaseTags)) {
    throw new Error("Version in package.json already has a release on Github");
  }

  console.log("- Success: Version in package.json is new and unique on Github");
};

module.exports = checkPackageJsonFile;
