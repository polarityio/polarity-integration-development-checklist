const fs = require("fs");
const { getOr, flow, forEach, thru } = require("lodash/fp");

const checkConfigFile = () => {
  try {
    const configJs = eval(fs.readFileSync("config/config.js", "utf8"));

    checkLoggingLevel(configJs);

    checkDefaultColor(configJs);

    checkRequestOptions(configJs);

    checkIntegrationOptionsDescriptions(configJs);

    checkConfigJsonExists();
  } catch (e) {
    if (e.message.includes("no such file or directory")) {
      throw new Error("File Not Found: config.js");
    }
    throw e;
  }
};

const checkLoggingLevel = (configJs) => {
  const loggingLevel = getOr("failed_to_get", "logging.level", configJs);
  if (loggingLevel === "failed_to_get") {
    throw new Error("Logging Level not defined in config.js");
  } else if (loggingLevel !== "info") {
    throw new Error("Logging Level not set to 'info' in config.js");
  } else {
    console.info("- Success: Config Logging Level set to 'info' in config.js");
  }
};

const checkDefaultColor = (configJs) => {
  const defaultColor = getOr("failed_to_get", "defaultColor", configJs);
  if (defaultColor === "failed_to_get") {
    throw new Error("Default Color not defined in config.js");
  }

  console.info("- Success: Config Logging Level set to 'info' in config.js");
};

const checkRequestOptions = (configJs) => {
  const request = getOr("failed_to_get", "request", configJs);
  if (request === "failed_to_get") {
    throw new Error("Request Options object not defined in config.js");
  } else {
    ["cert", "key", "passphrase", "ca", "proxy"].forEach(
      checkEmptyRequestProperty(request)
    );

    console.info(
      "- Success: Config Request Options Defaults set correctly in config.js"
    );
  }
};

const checkEmptyRequestProperty = (request) => (propertyKey) => {
  const result = getOr("failed_to_get", propertyKey, request);
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

const checkIntegrationOptionsDescriptions = flow(
  getOr([], "options"),
  forEach((option) => {
    const description = option.description;
    if (!description) {
      throw new Error(
        `Config Integration Option ${option.name} in config.js does not have a description`
      );
    }
  }),
  thru(() =>
    console.info(
      "- Success: Config Integration Options all have descriptions in config.js"
    )
  )
);

const checkConfigJsonExists = () => {
  try {
    fs.readFileSync("config/config.json", "utf8");
  } catch (e) {
    if (e.message.includes("no such file or directory")) {
      throw new Error("File Not Found: config.json");
    }
    throw e;
  }
};

module.exports = checkConfigFile;
