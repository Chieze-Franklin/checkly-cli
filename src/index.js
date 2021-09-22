// import root from "app-root-path"; // seems to break on Linux
import boxen from "boxen";
import chalk from "chalk";
import terminalImage from "terminal-image";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { getCheckDefinitions } from "./check-definitions.js";
import { createOrUpdateCheck, deleteOrphanedCheck, getChecks } from "./checkly-api.js";

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

  const checkDefs = await getCheckDefinitions(argv.checks);

  const options = { apiKey: argv["api-key"] };
  const existingChecks = await getChecks(options);
  checkDefs.forEach((checkDef) => createOrUpdateCheck(checkDef, existingChecks, options));
  existingChecks.forEach((check) => deleteOrphanedCheck(check, checkDefs, options));
}
