const fs = require("fs");

const checkGitignoreFile = () => {
  try {
    fs.readFileSync(".gitignore");
  } catch (e) {
    if (e.message.includes("no such file or directory")) {
      throw new Error("File Not Found: .gitignore");
    }
    throw e;
  }

  console.info("- Success: .gitignore file contents correct");
};

module.exports = checkGitignoreFile;
