import Ajv from "ajv";
import chalk from "chalk";

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

export function validateCheck(check, filePath) {
  const valid = validate(check);

  if (!valid) {
    console.log(error(`==> Skipping invalid check definition${check.name ? ` (${check.name})` : ""} in ${filePath}`));
    console.log(validate.errors.map((e) => e.message));
  }

  return valid;
}