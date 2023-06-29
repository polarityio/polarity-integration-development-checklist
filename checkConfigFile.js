const fs = require("fs");
const core = require("@actions/core");
const github = require("@actions/github");
const { v1: uuidv1 } = require("uuid");
const {
  getOr,
  flow,
  forEach,
  thru,
  get,
  negate,
  size,
  filter,
  map,
  reduce,
  join,
} = require("lodash/fp");
const { getExistingFile, parseFileContent } = require("./octokitHelpers");

const checkConfigFile = async (octokit, repo) => {
  try {
    const configJs = eval(fs.readFileSync("config/config.js", "utf8"));

    // TODO: Add description, default color, & logging level checks for config.json

    checkIntegrationOptionsDescriptions(configJs);

    checkDefaultColor(configJs);

    checkLoggingLevel(configJs);

    checkRequestOptions(configJs);

    const configJson = getConfigJson();

    checkEntityTypes(configJs, configJson);

    checkRequestOptions(configJson, true);

    await checkPolarityIntegrationUuid(octokit, repo, configJson);
  } catch (error) {
    if (error.message.includes("no such file or directory")) {
      throw new Error(
        "File Not Found: config.js\n\n" +
          "  * Add `./config/config.js` file to your integration to resolve"
      );
    }
    throw error;
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

const checkRequestOptions = (config, isJson) => {
  const configFileName = `config.js${isJson ? "on" : ""}`;
  const request = getOr("failed_to_get", "request", config);
  if (request === "failed_to_get") {
    throw new Error(`Request Options object not defined in ${configFileName}`);
  }

  checkRequestOptionsStringProperties(request, configFileName);

  checkIfRejectUnauthorizedIsSet(request);

  console.info(
    `- Success: Config Request Options Defaults set correctly in ${configFileName}`
  );
};

const checkRequestOptionsStringProperties = (request, configFileName) => {
  const emptyRequestPropertyErrorMessages = reduce(
    (agg, propertyKey) => {
      const emptyRequestPropertyErrorMessage = checkEmptyRequestProperty(
        request,
        propertyKey,
        configFileName
      );

      return emptyRequestPropertyErrorMessage
        ? agg.concat(emptyRequestPropertyErrorMessage)
        : agg;
    },
    [],
    ["cert", "key", "passphrase", "ca", "proxy"]
  );

  if (size(emptyRequestPropertyErrorMessages)) {
    throw new Error(
      `Request Option parameter(s) in ${configFileName} are invalid\n\n` +
        join("\n", emptyRequestPropertyErrorMessages)
    );
  }
};

const checkEmptyRequestProperty = (request, propertyKey, configFileName) => {
  const result = getOr("failed_to_get", propertyKey, request);
  if (result === "failed_to_get") {
    return `  * '${propertyKey}' property in Request Options object not defined in ${configFileName}`;
  } else if (result !== "") {
    return `  * '${propertyKey}' property in Request Options object set to non-empty value in ${configFileName}: '${result}'`;
  }
};

const checkIfRejectUnauthorizedIsSet = (request) => {
  if (
    getOr("failed_to_get", "rejectUnauthorized", request) !== "failed_to_get"
  ) {
    throw new Error(
      `Request Option parameter \`rejectUnauthorized\` should not be set in config file\n`+
        "  * Remove the `rejectUnauthorized` property from your config files to resolve"
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

const getConfigJson = () => {
  try {
    const configFile = fs.readFileSync("config/config.json", "utf8");
    const configJson = JSON.parse(configFile);
    return configJson;
  } catch (error) {
    if (error.message.includes("no such file or directory")) {
      throw new Error("File Not Found: config.json");
    }
    if (error.message.includes("Unexpected string in JSON at position")) {
      throw new Error(
        "Invalid JSON in config.json. Please verify your syntax is correct then push."
      );
    }
    throw error;
  }
};

const checkEntityTypes = (configJs, configJson) => {
  const configJsInvalidEntityTypes = getInvalidEntityTypes(configJs);
  const configJsonInvalidEntityTypes = getInvalidEntityTypes(configJson);

  if (size(configJsInvalidEntityTypes) || size(configJsonInvalidEntityTypes)) {
    const createErrorMessage = (invalidEntityTypes, configFileName) =>
      size(invalidEntityTypes)
        ? `The following \`entityTypes\` in ${configFileName} are invalid\n` +
          `  * ${join(invalidEntityTypes, ", ")}\n`
        : "";

    const configJsErrorMessage = createErrorMessage(
      configJsInvalidEntityTypes,
      "config.js"
    );
    const configJsonErrorMessage = createErrorMessage(
      configJsonInvalidEntityTypes,
      "config.json"
    );

    /*TODO Add improvement to do a toLower comparison between invalid types to 
      give specific suggestions of what alternative types might be used instead 
      of the invalid type that was added to a config file*/
    throw new Error(
      configJsErrorMessage +
        configJsonErrorMessage +
        `It's possible this is an issue with spelling or casing.  The possible valid \`entityTypes\` are: ${flow(
          map((validEntityType) => `"${validEntityType}"`),
          join(", ")
        )(POSSIBLE_VALID_ENTITY_TYPES)}`
    );
  }
  console.info(
    "- Success: Config `entityTypes` are valid in config.js & config.json"
  );
};

const POSSIBLE_VALID_ENTITY_TYPES = [
  "IP",
  "IPv4",
  "IPv4CIDR",
  "IPv6",
  "MAC",
  "MD5",
  "SHA1",
  "SHA256",
  "cve",
  "domain",
  "email",
  "hash",
  "string",
  "url",
  "*",
];
const entityTypeIsValid = (entityType) =>
  POSSIBLE_VALID_ENTITY_TYPES.includes(entityType);

const getInvalidEntityTypes = flow(
  get("entityTypes"),
  filter(negate(entityTypeIsValid))
);

const checkPolarityIntegrationUuid = async (octokit, repo, configJson) => {
  const polarityIntegrationUuid = get("polarityIntegrationUuid", configJson);
  if (!polarityIntegrationUuid) {
    throw new Error(
      "Polarity Integration UUID not defined in config.json\n" +
        `  * Add \`"polarityIntegrationUuid": "${uuidv1()}",\` to your \`./config/config.json\` to resolve`
    );
  }

  const toMergeIntoBranch = get(
    "context.payload.pull_request.base.ref",
    github
  );
  if (toMergeIntoBranch) {
    let previousPolarityIntegrationUuid;
    try {
      const previousBranchConfigJson = parseFileContent(
        await getExistingFile({
          octokit,
          repoName: repo.name,
          branch: toMergeIntoBranch,
          relativePath: "config/config.json",
        })
      ) 
      
      previousPolarityIntegrationUuid = get(
        "polarityIntegrationUuid",
        JSON.parse(
          previousBranchConfigJson || "{}"
        )
      );
    } catch (error) {
      if (error.message.includes("Unexpected string in JSON at position")) {
        console.info(
          "\n NOTE: Unable to parse other branch's `config/config.json`, which means the check for the polarityIntegrationUuid not changing is not being run\n\n"
        );
      }
      throw error;
    }

    if (
      previousPolarityIntegrationUuid &&
      previousPolarityIntegrationUuid !== polarityIntegrationUuid
    ) {
      throw new Error(
        `Polarity Integration UUID in config.json does not match the UUID in the base branch config.json\n\n` +
          `  * Update to \`"polarityIntegrationUuid": "${previousPolarityIntegrationUuid}",\` in your \`./config/config.json\` to resolve`
      );
    }
  }

  console.info(
    "- Success: Config `polarityIntegrationUuid` is set and has not been changed in `config.json`"
  );
};
module.exports = checkConfigFile;
