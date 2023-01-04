const fs = require("fs");
const { get } = require("lodash/fp");

const checkPackageLockFile = async (github) => {
  try {
    const packageLock = JSON.parse(fs.readFileSync("package-lock.json"));

    checkVersionInSyncWithPackageJson(packageLock);
  } catch (e) {
    if (e.message.includes("no such file or directory")) {
      throw new Error("File Not Found: package-lock.json");
    }
    throw e;
  }
};

const checkVersionInSyncWithPackageJson = (packageLock) => {
  const packageJSON = JSON.parse(fs.readFileSync("package.json"));
  if (get("version", packageLock) !== get("version", packageJSON)) {
    throw new Error(
      "Version in package.json is NOT in sync with version in package-lock.json.\nRun `npm install` and push the updated package-lock.json."
    );
  }

  console.log("- Success: package-lock.json and package.json are in sync");
};

module.exports = checkPackageLockFile;
