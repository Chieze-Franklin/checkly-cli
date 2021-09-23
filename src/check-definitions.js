import fs from 'fs';
import glob from 'glob';
import path from 'path';

import { validateCheck } from "./validations.js";

let files;

function getFiles(globPattern) {
  if (!files) {
    const filePaths = glob.sync(globPattern, { cwd: process.cwd() });
    files = filePaths.map((filePath) => ({
      name: path.basename(filePath),
      path: filePath,
      content: fs.readFileSync(path.join(process.cwd(), filePath), {encoding:'utf8', flag:'r'}),
    }));
  }

  return files;
}

// read all files matching the glob pattern
// and return their checks
// for each check, add a tag to help us group them together
// and to help know which checks were created by the CLI
export async function getCheckDefinitions(globPattern) {
  const files = getFiles(globPattern);

  const checkDefs = files.flatMap((file) => {
    const json = JSON.parse(file.content);
    let checks = json.checks;

    if (json.name) {
      checks = json.checks.filter((check) => validateCheck(check, file.path)).map((check) => ({
        ...check,
        tags: [
          ...(check.tags || []),
          `checkly-cli-group-name=${json.name}`,
          `checkly-cli-full-name=${json.name}.${check.name}`
        ]
      }));
    }
    return checks;
  });

  return checkDefs;
}

export async function getCheckGroupDefinitions(globPattern) {
  const files = getFiles(globPattern);

  const allCheckGroupDefs = files.map((file) => {
    const json = JSON.parse(file.content);

    return {
      name: json.name,
      locations: ["us-east-1"],
      tags: [`checkly-cli-full-name=${json.name}`],
    };
  });

  const uniqueCheckGroupDefs = allCheckGroupDefs.filter((group, index, array) => array.findIndex((g) => g.name === group.name) === index);

  return uniqueCheckGroupDefs;
}
