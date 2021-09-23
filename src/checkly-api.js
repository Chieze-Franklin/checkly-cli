import axios from "axios";
import chalk from "chalk";

const created = chalk.greenBright;
const deleted = chalk.redBright;
const updated = chalk.blueBright;

const mapOfCheckGroupToId = {};

export async function createCheck(checkDef, options) {
  axios({
    headers: { Authorization: `Bearer ${options.apiKey}` },
    method: "POST",
    url: "https://api.checklyhq.com/v1/checks",
    data: checkDef
  })
    .then((r) => console.log(created(`==> created new check ${r.data.name} (${r.data.id})`)))
    .catch((e) => console.log(e));
}

export async function createCheckGroup(checkGroupDef, options) {
  await axios({
    headers: { Authorization: `Bearer ${options.apiKey}` },
    method: "POST",
    url: "https://api.checklyhq.com/v1/check-groups",
    data: checkGroupDef
  })
    .then((r) => {
      mapOfCheckGroupToId[checkGroupDef.name] = r.data.id;
      console.log(created(`==> created new check group ${r.data.name} (${r.data.id})`));
    })
    .catch((e) => console.log(e));
}

export async function createOrIgnoreCheckGroup(checkGroupDef, existingCheckGroups, options) {
  const fullNameTag = checkGroupDef.tags.find((tag) => tag.startsWith("checkly-cli-full-name="));
  const matchingExistingCheckGroup = existingCheckGroups.find((g) => g.name === checkGroupDef.name && g.tags.includes(fullNameTag));

  if (!matchingExistingCheckGroup) {
    await createCheckGroup(checkGroupDef, options);
  } else {
    mapOfCheckGroupToId[checkGroupDef.name] = matchingExistingCheckGroup.id;
  }
}

export async function createOrUpdateCheck(checkDef, existingChecks, options) {
  const fullNameTag = checkDef.tags.find((tag) => tag.startsWith("checkly-cli-full-name="));
  const matchingExistingCheck = existingChecks.find((c) => c.name === checkDef.name && c.tags.includes(fullNameTag));

  if (matchingExistingCheck) {
    await updateCheck(matchingExistingCheck.id, checkDef, options);
  } else {
    await createCheck(checkDef, options);
  }
}

export async function deleteCheck(id, options) {
  axios({
    headers: { Authorization: `Bearer ${options.apiKey}` },
    method: "DELETE",
    url: `https://api.checklyhq.com/v1/checks/${id}`,
  })
    .then((r) => console.log(deleted(`==> deleted orphan check ${options.checkName} (${id})`)))
    .catch((e) => console.log(e));
}

export async function deleteCheckGroup(id, options) {
  axios({
    headers: { Authorization: `Bearer ${options.apiKey}` },
    method: "DELETE",
    url: `https://api.checklyhq.com/v1/check-groups/${id}`,
  })
    .then((r) => console.log(deleted(`==> deleted orphan check group ${options.checkGroupName} (${id})`)))
    .catch((e) => console.log(e));
}

export async function deleteOrphanedCheck(check, existingCheckDefs, options) {
  const fullNameTag = check.tags.find((tag) => tag.startsWith("checkly-cli-full-name="));
  const groupNameTag = check.tags.find((tag) => tag.startsWith("checkly-cli-group-name="));

  // see if this checkmatches the suite name of any existing check def
  if (existingCheckDefs.find((cd) => cd.tags.includes(groupNameTag))) {
    // see if this checkmatches the full name of any existing check def
    const matchingExistingCheckDef = existingCheckDefs.find((cd) => cd.tags.includes(fullNameTag));
    if (!matchingExistingCheckDef) {
      await deleteCheck(check.id, {
        ...options,
        checkName: check.name,
        });
    }
  }
}

export async function getChecks(options) {
  try {
    const response = await axios({
        headers: { Authorization: `Bearer ${options.apiKey}` },
        method: "GET",
        url: "https://api.checklyhq.com/v1/checks",
      });

    return response.data;
  } catch (e) {
    console.log(e);

    return [];
  }
}

export async function getCheckGroups(options) {
  try {
    const response = await axios({
        headers: { Authorization: `Bearer ${options.apiKey}` },
        method: "GET",
        url: "https://api.checklyhq.com/v1/check-groups",
      });

    return response.data;
  } catch (e) {
    console.log(e);

    return [];
  }
}

export async function updateCheck(id, checkDef, options) {
  axios({
    headers: { Authorization: `Bearer ${options.apiKey}` },
    method: "PUT",
    url: `https://api.checklyhq.com/v1/checks/${id}`,
    data: checkDef
  })
    .then((r) => console.log(updated(`==> updated existing check ${r.data.name} (${r.data.id})`)))
    .catch((e) => console.log(e));
}

export function getMapOfCheckGroupNameToId() {
  return mapOfCheckGroupToId;
}