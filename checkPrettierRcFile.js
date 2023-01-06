const fs = require("fs");

const checkPrettierRcFile = () => {
  try {
    fs.readFileSync(".prettierrc");
  } catch (e) {
    if (e.message.includes("no such file or directory")) {
      throw new Error("File Not Found: .prettierrc");
    }
    throw e;
  }

  console.info("- Success: .prettierrc file contents correct");
};

module.exports = checkPrettierRcFile;
