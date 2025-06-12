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
    const configJson = getConfigJson();
    
    checkIntegrationOptionsDescriptions(configJson);

    checkDefaultColor(configJson);

    checkLoggingLevel(configJson);

    checkEntityTypes(configJson);

    checkDataTypes(configJson);

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

const checkLoggingLevel = (configJson) => {
  const loggingLevel = getOr("failed_to_get", "logging.level", configJson);
  if (loggingLevel === "failed_to_get") {
    throw new Error(
      "Logging Level not defined in config.json\n\n" +
        "  * Add `logging: { level: 'info' }` to your `./config/config.json` to resolve"
    );
  } else if (loggingLevel !== "info") {
    throw new Error(
      "Logging Level not set to 'info' in config.json\n\n" +
        "  * Set `logging.level` to `info` to your `./config/config.json` to resolve"
    );
  } else {
    console.info("- Success: Config Logging Level set to 'info' in config.json");
  }
};

const checkDefaultColor = (configJson) => {
  const defaultColor = getOr("failed_to_get", "defaultColor", configJson);
  if (defaultColor === "failed_to_get") {
    throw new Error(
      "Default Color not defined in config.json\n\n" +
        "  * `defaultColor: 'light-blue'` to your `./config/config.json to resolve"
    );
  }

  console.info("- Success: Config 'defaultColor' is set in config.json");
};

const checkIntegrationOptionsDescriptions = flow(
  getOr([], "options"),
  forEach((option) => {
    const description = option.description;
    if (!description) {
      throw new Error(
        `Config Integration Option ${option.name} in config.json does not have a description`
      );
    }
  }),
  thru(() =>
    console.info(
      "- Success: Config Integration Options all have descriptions in config.json"
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

const checkEntityTypes = (configJson) => {
  const configJsonInvalidEntityTypes = getInvalidEntityTypes(configJson);

  if (size(configJsonInvalidEntityTypes)) {
    const createErrorMessage = (invalidEntityTypes, configFileName) =>
      size(invalidEntityTypes)
        ? `The following \`entityTypes\` in ${configFileName} are invalid\n` +
          `  * ${join(invalidEntityTypes, ", ")}\n`
        : "";

    const configJsonErrorMessage = createErrorMessage(
      configJsonInvalidEntityTypes,
      "config.json"
    );

    /*TODO Add improvement to do a toLower comparison between invalid types to 
      give specific suggestions of what alternative types might be used instead 
      of the invalid type that was added to a config file*/
    throw new Error(
        configJsonErrorMessage +
        `It's possible this is an issue with spelling or casing.  The possible valid \`entityTypes\` are: ${flow(
          map((validEntityType) => `"${validEntityType}"`),
          join(", ")
        )(POSSIBLE_VALID_ENTITY_TYPES)}`
    );
  }
  console.info(
    "- Success: Config `entityTypes` are valid in config.json"
  );
};

const POSSIBLE_VALID_ENTITY_TYPES = [
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
  "string",
  "url",
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
      );

      previousPolarityIntegrationUuid = get(
        "polarityIntegrationUuid",
        JSON.parse(previousBranchConfigJson || "{}")
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

const EXPANDABLE_TYPES = ["IP", "hash", "*"];

const checkDataTypes = (configJson) => {
  let errorMessage = "";

  const expandableEntityTypesBeingUsed = flow(
    get("entityTypes"),
    filter((type) => EXPANDABLE_TYPES.includes(type))
  )(configJson);

  errorMessage += createExpandableTypeErrorMessage(
    "entityTypes",
    expandableEntityTypesBeingUsed
  );

  if (errorMessage) {
    throw new Error(errorMessage);
  } else {
    console.info("- Success: No expandable types used in config.json");
  }
};

const createExpandableTypeErrorMessage = (
  location,
  expandableTypesBeingUsed
) => {
  let errorMessage = "";
  if (size(expandableTypesBeingUsed)) {
    if (expandableTypesBeingUsed.includes("*")) {
      errorMessage +=
        `The following "${location}" in config.json are using expandable data types\n` +
        `  * Must make "*" -> ["IPv4", "IPv4CIDR", "IPv6", "domain", "url", "MD5", "SHA1", "SHA256", "email", "cve", "MAC", "string"]`;
    } else {
      errorMessage += `The following "${location}" in config.json are using expandable data types\n`;

      if (expandableTypesBeingUsed.includes("IP")) {
        errorMessage += `  * Must make "IP" -> "IPv4", "IPv6",\n`;
      }
      if (expandableTypesBeingUsed.includes("hash")) {
        errorMessage += `  * Must make "hash" -> "MD5", "SHA1", "SHA256",`;
      }
    }
    errorMessage += "\n";
  }
  return errorMessage;
};

module.exports = checkConfigFile;
