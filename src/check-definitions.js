import fs from 'fs';
import glob from 'glob';
import path from 'path';

export async function getCheckDefinitions(globPattern) {
  const files = glob.sync(globPattern, { cwd: process.cwd() });

  const checkDefs = files.flatMap((file) => {
    const jsonFile = JSON.parse(fs.readFileSync(path.join(process.cwd(), file), {encoding:'utf8', flag:'r'}));
    let checks = jsonFile.checks;

    if (jsonFile.name) {
      checks = jsonFile.checks.map((check) => ({
        ...check,
        tags: [...(check.tags || []), `checkly-cli-suite-name=${jsonFile.name}`]
      }));
    }
    return checks;
  });

  return checkDefs;
}