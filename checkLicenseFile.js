const fs = require("fs");

const CORRECT_LICENSE_VALUE1 =
  "The MIT License\n" +
  " \n" +
  "Copyright (c) 2020 Polarity.io, Inc.\n" +
  " \n" +
  "Permission is hereby granted, free of charge, to any person obtaining a copy\n" +
  'of this software and associated documentation files (the "Software"), to deal\n' +
  "in the Software without restriction, including without limitation the rights\n" +
  "to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n" +
  "copies of the Software, and to permit persons to whom the Software is\n" +
  "furnished to do so, subject to the following conditions:\n" +
  " \n" +
  "The above copyright notice and this permission notice shall be included in all\n" +
  "copies or substantial portions of the Software.\n" +
  " \n" +
  'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n' +
  "IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n" +
  "FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n" +
  "AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n" +
  "LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n" +
  "OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\n" +
  "SOFTWARE.";

const CORRECT_LICENSE_VALUE2 =
  "MIT License\n" +
  " \n" +
  "Copyright (c) 2020 Polarity.io, Inc.\n" +
  " \n" +
  "Permission is hereby granted, free of charge, to any person obtaining a copy\n" +
  'of this software and associated documentation files (the "Software"), to deal\n' +
  "in the Software without restriction, including without limitation the rights\n" +
  "to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n" +
  "copies of the Software, and to permit persons to whom the Software is\n" +
  "furnished to do so, subject to the following conditions:\n" +
  " \n" +
  "The above copyright notice and this permission notice shall be included in all\n" +
  "copies or substantial portions of the Software.\n" +
  " \n" +
  'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n' +
  "IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n" +
  "FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n" +
  "AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n" +
  "LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n" +
  "OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\n" +
  "SOFTWARE.";

const checkLicenseFile = () => {
  try {
    const licenseFile = fs.readFileSync("LICENSE", "utf-8").replace(/\s/g, "");
    if (
      licenseFile !== CORRECT_LICENSE_VALUE1.replace(/\s/g, "") &&
      licenseFile !== CORRECT_LICENSE_VALUE2.replace(/\s/g, "")
    ) {
      console.error(`\nCorrect License File:\n\n${CORRECT_LICENSE_VALUE1}`);
      throw new Error("LICENSE File Value Incorrect");
    }
  } catch (e) {
    if (e.message.includes("no such file or directory")) {
      throw new Error("File Not Found: LICENSE");
    }
    throw e;
  }

  console.log("- Success: LICENSE file contents correct");
};

module.exports = checkLicenseFile;
