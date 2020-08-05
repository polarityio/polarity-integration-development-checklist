const fs = require("fs");
const fp = require("lodash/fp");

const checkConfigFile = () => {
  try {
    const configJs = eval(fs.readFileSync("config/config.js", "utf8"));

    checkLoggingLevel(configJs);

    checkRequestOptions(configJs);

    checkIntegrationOptionsDescriptions(configJs);
  } catch (e) {
    if (e.message.includes("Cannot find module")) {
      throw new Error("File Not Found: config.js");
    }
    throw e;
  }
};

const checkLoggingLevel = (configJs) => {
  const loggingLevel = fp.getOr("failed_to_get", "logging.level", configJs);
  if (loggingLevel === "failed_to_get") {
    throw new Error("Logging Level not defined in config.js");
  } else if (loggingLevel !== "info") {
    throw new Error("Logging Level not set to 'info' in config.js");
  } else {
    console.log("- Success: Config Logging Level set to 'info' in config.js");
  }
};

const checkRequestOptions = (configJs) => {
  const request = fp.getOr("failed_to_get", "request", configJs);
  if (request === "failed_to_get") {
    throw new Error("Request Options object not defined in config.js");
  } else {
    ["cert", "key", "passphrase", "ca", "proxy"].forEach(
      checkEmptyRequestProperty(request)
    );
    checkRejectUnauthorized(request);

    console.log(
      "- Success: Config Request Options Defaults set correctly in config.js"
    );
  }
};

const checkEmptyRequestProperty = (request) => (propertyKey) => {
  const result = fp.getOr("failed_to_get", propertyKey, request);
  if (result === "failed_to_get") {
    throw new Error(
      `'${propertyKey}' property in Request Options object not defined in config.js`
    );
  } else if (result !== "") {
    throw new Error(
      `'${propertyKey}' property in Request Options object set to non-empty value in config.js: '${result}'`
    );
  }
};

const checkRejectUnauthorized = (request) => {
  const rejectUnauthorized = fp.getOr(
    "failed_to_get",
    "rejectUnauthorized",
    request
  );
  if (rejectUnauthorized === "failed_to_get") {
    throw new Error(
      "'rejectUnauthorized' property in Request Options object not defined in config.js"
    );
  } else if (rejectUnauthorized === false) {
    throw new Error(
      "'rejectUnauthorized' property in Request Options object set to false in config.js"
    );
  } else if (rejectUnauthorized !== true) {
    throw new Error(
      "'rejectUnauthorized' property in Request Options object set to non-boolean value in config.js"
    );
  }
};

const checkIntegrationOptionsDescriptions = fp.flow(
  fp.getOr([], "options"),
  fp.forEach((option) => {
    const description = option.description;
    if (!description) {
      throw new Error(
        `Config Integration Option ${option.name} in config.js does not have a description`
      );
    }
  }),
  fp.thru(() =>
    console.log(
      "- Success: Config Integration Options all have descriptions in config.js"
    )
  )
);

module.exports = checkConfigFile;
