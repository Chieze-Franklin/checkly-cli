// import root from "app-root-path"; // seems to break on Linux
import boxen from "boxen";
import chalk from "chalk";
import terminalImage from "terminal-image";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { getCheckDefinitions, getCheckGroupDefinitions } from "./check-definitions.js";
import { createOrIgnoreCheckGroup, createOrUpdateCheck, deleteOrphanedCheck, getCheckGroups, getChecks, getMapOfCheckGroupNameToId } from "./checkly-api.js";

export async function main() {
  // fancy block to draw the checkly racoon logo in the terminal
  try {
    const root = require("app-root-path");
    console.log(await terminalImage.file(`${root.path}/assets/images/checkly_logo.png`, { width: "60%", height: "60%" }));
  }
  catch (e) {}

  // fancy block to print "checkly cli" in the terminal
  const boxenOptions = {
    borderStyle: "bold",
    borderColor: "green",
    padding: 2,
    margin: {
      left: 6,
    },
  };
  console.log(boxen(chalk.blueBright.bold.italic("checkly cli"), boxenOptions));

  const argv = yargs(hideBin(process.argv))
    .command("run", "Execute check definitions")
    .option("api-key", {
      alias: "k",
      type: "string",
      description: "API key"
    })
    .usage("Usage: --api-key <api key>")
    .option("checks", {
      alias: "c",
      type: "string",
      description: "glob pattern of check definition files"
    })
    .usage("Usage: --checks <glob pattern>")
    .argv;

  const options = { apiKey: argv["api-key"] };

  const checkGroupDefs = await getCheckGroupDefinitions(argv.checks);
  const existingCheckGroups = await getCheckGroups(options);
  const createOrIgnoreCheckGroupPromises = checkGroupDefs.map((checkGroupDef) => createOrIgnoreCheckGroup(checkGroupDef, existingCheckGroups, options));
  await Promise.all(createOrIgnoreCheckGroupPromises);

  const mapOfCheckGroupNameToId = getMapOfCheckGroupNameToId();

  const checkDefs = [...(await getCheckDefinitions(argv.checks))].map((checkDef) => {
    const groupNameTag = checkDef.tags.find((tag) => tag.startsWith("checkly-cli-group-name="));

    let groupName;
    if (groupNameTag) {
      groupName = groupNameTag.substr("checkly-cli-group-name=".length);
    }

    let groupId;
    if (groupName) {
      groupId = mapOfCheckGroupNameToId[groupName];
    }

    return {
      ...checkDef,
        ...(groupId && { groupId })
    };
  });
  const existingChecks = await getChecks(options);
  checkDefs.forEach((checkDef) => createOrUpdateCheck(checkDef, existingChecks, options));
  existingChecks.forEach((check) => deleteOrphanedCheck(check, checkDefs, options));
}
