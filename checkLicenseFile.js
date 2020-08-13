const fs = require("fs");

const checkLicenseFile = () => {
  try {
    fs.readFileSync("LICENSE");
  } catch (e) {
    if (e.message.includes("no such file or directory")) {
      throw new Error("File Not Found: LICENSE");
    }
    throw e;
  }

  console.log("- Success: LICENSE file found");
};

module.exports = checkLicenseFile;
