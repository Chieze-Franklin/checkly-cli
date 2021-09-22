import root from "app-root-path";
import boxen from "boxen";
import chalk from "chalk";
import terminalImage from "terminal-image";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { getCheckDefinitions } from "./check-definitions.js";
import { createCheck } from "./checkly-api.js";

export async function main() {
  try {
    console.log(await terminalImage.file(`${root.path}/assets/images/checkly_logo.png`, { width: "60%", height: "60%" }));
  }
  catch (e) {}
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
  checkDefs.forEach((checkDef) => createCheck(checkDef, { apiKey: argv["api-key"] }))
}
