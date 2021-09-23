import Ajv from "ajv";
import chalk from "chalk";
import fs from 'fs';
import glob from 'glob';
import path from 'path';

const ajv = new Ajv();
const schema = {
  type: "object",
  properties: {
    activated: { type: "boolean" },
    checkType: { type: "string", pattern: "^(API|BROWSER)$" },
    name: { type: "string" },
    script: { type: "string" },
    request: {
      type: "object",
      properties: {
        method: { type: "string", pattern: "^(GET|DELETE|POST|PUT|get|delete|post|put)$" },
        url: { type: "string" },
        assertions: { type: "array" },
        body: { type: "string" },
        bodyType: { type: "string" },
        headers: { type: "array" },
        queryParameters: { type: "array" },
      },
      required: ["method", "url", "assertions", "body", "bodyType", "headers", "queryParameters"]
    },
    // TODO: add other fields
  },
  required: ["activated", "checkType", "name", "script", "request"],
  additionalProperties: true,
}
const validate = ajv.compile(schema);

const error = chalk.redBright;

// read all files matching the glob pattern
// and return their checks
// for each check, add a tag to help us group them together
// and to help know which checks were created by the CLI
export async function getCheckDefinitions(globPattern) {
  const files = glob.sync(globPattern, { cwd: process.cwd() });

  const checkDefs = files.flatMap((file) => {
    const jsonFile = JSON.parse(fs.readFileSync(path.join(process.cwd(), file), {encoding:'utf8', flag:'r'}));
    let checks = jsonFile.checks;

    if (jsonFile.name) {
      checks = jsonFile.checks.filter((check) => validateCheck(check, file)).map((check) => ({
        ...check,
        tags: [
          ...(check.tags || []),
          `checkly-cli-suite-name=${jsonFile.name}`,
          `checkly-cli-full-name=${jsonFile.name}.${check.name}`
        ]
      }));
    }
    return checks;
  });

  return checkDefs;
}

function validateCheck(check, file) {
  const valid = validate(check);

  if (!valid) {
    console.log(error(`==> Skipping invalid check definition${check.name ? ` (${check.name})` : ""} in ${file}`));
    console.log(validate.errors.map((e) => e.message));
  }

  return valid;
}