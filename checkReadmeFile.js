const fs = require("fs");

const checkReadmeFile = () => {
  try {
    fs.readFileSync("README.md");
  } catch (e) {
    if (e.message.includes("no such file or directory")) {
      throw new Error("File Not Found: README.md");
    }
    throw e;
  }

  console.log("- Success: README.md file contents correct");
};

module.exports = checkReadmeFile;
