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