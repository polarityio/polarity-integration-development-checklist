const fs = require("fs");
const github = require("@actions/github");
const { get } = require("lodash/fp");

const checkTargetBranch = () => {
  const toMergeIntoBranch = get(
    "context.payload.pull_request.base.ref",
    github
  );

  if (toMergeIntoBranch !== "support/v1") return;

  try {
    const configFile = fs.readFileSync("config/config.json", "utf8");
    const configJson = JSON.parse(configFile);
    const runtimeVersion = get("runtimeVersion", configJson);

    if (runtimeVersion === 2) {
      throw new Error(
        "v2 Integration cannot be merged into `support/v1` branch\n\n" +
          "  * This integration has `runtimeVersion` set to `2` in `./config/config.json`, which indicates it is a v2 integration.\n" +
          "  * v2 integrations should not be merged into the `support/v1` branch."
      );
    }
  } catch (error) {
    if (error.message.includes("no such file or directory")) {
      return;
    }
    throw error;
  }

  console.info(
    "- Success: Target branch is compatible with integration version"
  );
};

module.exports = checkTargetBranch;
