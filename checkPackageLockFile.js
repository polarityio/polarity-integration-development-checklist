const fs = require("fs");
const { get } = require("lodash/fp");

const checkPackageLockFile = () => {
  try {
    const packageLock = JSON.parse(fs.readFileSync("package-lock.json"));

    checkVersionInSyncWithPackageJson(packageLock);

    console.info("- Success: package-lock.json and package.json are in sync");
  } catch (e) {
    if (e.message.includes("no such file or directory")) {
      throw new Error(
        "File Not Found: package-lock.json\n" +
          "\n     * * Can run `npm install` and push the updated package-lock.json to resolve"
      );
    }
    throw e;
  }
};

const checkVersionInSyncWithPackageJson = (packageLock) => {
  const packageJSON = JSON.parse(fs.readFileSync("package.json"));
  if (get("version", packageLock) !== get("version", packageJSON)) {
    throw new Error(
      "Version in package.json is NOT in sync with version in package-lock.json.\n" +
        "\n     * Can run `npm install` and push the updated package-lock.json to resolve"
    );
  }
};

module.exports = checkPackageLockFile;
