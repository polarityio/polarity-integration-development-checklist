const fs = require("fs");
const core = require("@actions/core");
const github = require("@actions/github");
const { v1: uuidv1 } = require("uuid");
const { getOr, flow, forEach, thru, get } = require("lodash/fp");
const { getExistingFile, parseFileContent } = require("./octokitHelpers");

const checkConfigFile = async (octokit, repo) => {
  try {
    const configJs = eval(fs.readFileSync("config/config.js", "utf8"));

    checkLoggingLevel(configJs);

    checkDefaultColor(configJs);

    checkRequestOptions(configJs);

    checkIntegrationOptionsDescriptions(configJs);

    checkConfigJsonExists();

    const configJson = JSON.parse(
      fs.readFileSync("config/config.json", "utf8")
    );

    await checkPolarityIntegrationUuid(octokit, repo, configJson);
  } catch (e) {
    if (e.message.includes("no such file or directory")) {
      throw new Error(
        "File Not Found: config.js\n\n" +
          "  * Add `./config/config.js` file to your integration to resolve"
      );
    }
    throw e;
  }
};

const checkLoggingLevel = (configJs) => {
  const loggingLevel = getOr("failed_to_get", "logging.level", configJs);
  if (loggingLevel === "failed_to_get") {
    throw new Error(
      "Logging Level not defined in config.js\n\n" +
        "  * Add `logging: { level: 'info' }` to your `./config/config.js` to resolve"
    );
  } else if (loggingLevel !== "info") {
    throw new Error(
      "Logging Level not set to 'info' in config.js\n\n" +
        "  * Set `logging.level` to `info` to your `./config/config.js` to resolve"
    );
  } else {
    console.info("- Success: Config Logging Level set to 'info' in config.js");
  }
};

const checkDefaultColor = (configJs) => {
  const defaultColor = getOr("failed_to_get", "defaultColor", configJs);
  if (defaultColor === "failed_to_get") {
    throw new Error(
      "Default Color not defined in config.js\n\n" +
        "  * `defaultColor: 'light-blue'` to your `./config/config.js` to resolve"
    );
  }

  console.info("- Success: Config 'defaultColor' is set in config.js");
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

const checkPolarityIntegrationUuid = async (octokit, repo, configJson) => {
  const polarityIntegrationUuid = get("polarityIntegrationUuid", configJson);
  if (!polarityIntegrationUuid) {
    throw new Error(
      "Polarity Integration UUID not defined in config.json\n\n" +
        `  * Add \`"polarityIntegrationUuid": "${uuidv1()}",\` to your \`./config/config.json\` to resolve`
    );
  }

  const toMergeIntoBranch = github.context.payload.pull_request.base.ref;
  const previousPolarityIntegrationUuid = get(
    "polarityIntegrationUuid",
    JSON.parse(
      parseFileContent(
        await getExistingFile({
          octokit,
          repoName: repo.name,
          branch: toMergeIntoBranch,
          relativePath: "config/config.json",
        })
      ) || "{}"
    )
  );

  if (
    previousPolarityIntegrationUuid &&
    previousPolarityIntegrationUuid !== polarityIntegrationUuid
  ) {
    throw new Error(
      `Polarity Integration UUID in config.json does not match the UUID in the base branch config.json\n\n` +
        `  * Update to \`"polarityIntegrationUuid": "${previousPolarityIntegrationUuid}",\` in your \`./config/config.json\` to resolve`
    );
  }

  console.info(
    "- Success: Config `polarityIntegrationUuid` is set and has not been changed in `config.json`"
  );
};
module.exports = checkConfigFile;
