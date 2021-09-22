# checkly-cli

A simple command line utility that creates, updates and deletes checks on [Checkly](https://checklyhq.com).

## Getting Started

### Installation

Install checkly-cli globally by running `npm i -g checkly-cli`

#### API Key

Before running the checkly-cli you need to [get your API key from Checkly](https://app.checklyhq.com/account/api-keys)

#### Check Definitions

You can define your checks in JSON files. Each file contains 2 root fields:

- `name` which is used by checkly-cli to group your checks
- `checks` which is an array of checks, where each check is identical to the request body of the [Create a check API](https://checklyhq.com/docs/api/#operation/postV1Checks)

You can have as many check definition files as you please, and each file can contain as many check definitions.

A sample check definition file is shown below.

```json
{
    "name": "api-checks-suit-1",
    "checks": [{
        "activated": true,
        "checkType": "API",
        "name": "api-check-1",
        "script": "",
        "request": {
            "method": "GET",
            "url": "https://api.checklyhq.com/",
            "assertions": [
            {
                "source": "STATUS_CODE",
                "target": "200",
                "property": "",
                "comparison": "EQUALS"
            }
            ]
        }
    }]
}
```

### Running 

To run the checkly-cli:

```bash
checkly run --api-key "YOUR_API_KEY" --checks "GLOB_PATTERN_TO_FIND_JSON_FILES"
```

For instance, if my check definition files are located in the `test/` directory and are all named after the pattern `*.checks.json`, then I can run the following command:

```bash
checkly run --api-key "d5866cdf0292dfd73770f2db22819c5e33d06ec3" --checks "tests/*.checks.json"
```

## Automated Checks

You can make the process happen automatically on, say, every push to the main branch on GitHub. One way of doing that would be to create a [GitHub Action](https://docs.github.com/en/actions) that runs checkly-cli on every `push` to branch `main`.

```yml
name: Checkly

on:
  push:
    branches: [ main, master ]

jobs:
  build:

    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [14.x]

    steps:
    - name: Checkout repository
      uses: actions/checkout@v2

    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v2
      with:
        node-version: ${{ matrix.node-version }}

    - name: Install checkly-cli
      run: npm i -g checkly-cli

    - name: Run Checkly Checks
      run: checkly run --api-key "${{ secrets.CHECKLY_API_KEY }}" --checks "tests/*.checks.json"

```

Ensure you create a [GitHub Secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets) for your `CHECKLY_API_KEY`.

Henceforth, every time code is pushed to the `main` branch, checkly-cli will run against your check definitions.

## Updating Checks

To update a check on Checkly, simply update its check definiton. Whenever you run checkly-cli the CLI determines if a new check should be created or if an existing one should be updated. This way, running the CLI over and over does not result in duplicate checks on Checkly.

For instance, to change the frequency of our existing check definition to 5 minutes, we add `"frequency": 5`:

```json
{
    "name": "api-checks-suit-1",
    "checks": [{
        "activated": true,
        "checkType": "API",
        "name": "api-check-1",
        "script": "",
        "frequency": 5,
        "request": {
            "method": "GET",
            "url": "https://api.checklyhq.com/",
            "assertions": [
            {
                "source": "STATUS_CODE",
                "target": "200",
                "property": "",
                "comparison": "EQUALS"
            }
            ]
        }
    }]
}
```

Now run the previous chekcly run command, go to your Checkly dashboard and confirm that the frequency of the check is now 5 minutes.
