import axios from "axios";

export async function createCheck(check, options) {
  axios({
    headers: { Authorization: `Bearer ${options.apiKey}` },
    method: "POST",
    url: "https://api.checklyhq.com/v1/checks",
    data: check
  })
    .catch((e) => console.log(e));
}

export async function createOrUpdateCheck(check, existingChecks, options) {
  const fullNameTag = check.tags.find((tag) => tag.startsWith("checkly-cli-full-name="));
  const matchingExistingCheck = existingChecks.find((c) => c.name === check.name && c.tags.includes(fullNameTag));

  if (matchingExistingCheck) {
    await updateCheck(matchingExistingCheck.id, check, options);
  } else {
    await createCheck(check, options);
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

export async function updateCheck(id, check, options) {
  // TODO: server throws 500 internal server error when we try to update
  axios({
    headers: { Authorization: `Bearer ${options.apiKey}` },
    method: "PUT",
    url: `https://api.checklyhq.com/v1/checks/${id}`,
    data: check
  })
    .catch((e) => console.log(e));
}