# Polarity Integration Development Checklist action

Checks a list of requirements found in the Polarity Integration Development Checklist.  This currently includes:
- LICENSE File Checks 
  - Verifying the LICENSE file exists
- .prettierrc File Checks 
  - Verifying the .prettierrc file exists
- .gitignore File Checks 
  - Verifying the .gitignore file exists
- README.md File Checks 
  - Verifying the README.md file exists
- config.js File Checks 
  - Verifying Logging Level is set to `info`
  - Verifying `defaultColor` property has a value set
  - Verifying Request Options are set correctly including
    - `cert`, `key`, `passphrase`, `ca`, and `proxy` all having the value `''`
  - Verifying all Integration Options have a description containing content
  - v2 Integration Checks
    - If `webComponents` is defined, verifying `runtimeVersion` is set to `2`
    - If `webComponents.components` is defined, verifying each component's `element` version suffix matches the `version` in package.json (e.g., package.json version `3.0.1` expects elements to end with `v3-0-1`)
- package.json File Checks 
  - Verifying the package.json file exists
  - Verifying the `private` flag is set to true
  - Verifying the `version` property matches standard semantic versioning format
  - Checks to see if the current `version` property already exists as a release on Github.
- package-lock.json File Checks 
  - Verifying the package-lock.json file exists
  - Verifying the package-lock.json file `version` property matches the `version` property found in the package.json file
- Dependency Installation
  - Runs `npm ci` using Node 18 to install dependencies
  - If `@vitest/browser-playwright` or `@vitest/browser` is found in `dependencies` or `devDependencies`, automatically installs Chromium and its system dependencies via `npx playwright install --with-deps chromium`
- Lint Script Check
  - If a `lint` script is defined in package.json, runs `npm run lint` using Node 24
  - Skipped if no `lint` script is found
- Format Script Check
  - If a `format` script is defined in package.json, runs `npm run format` using Node 24
  - Skipped if no `format` script is found
- Test Script Check
  - If a `test` script is defined in package.json, runs `npm run test` using Node 24
  - Skipped if no `test` script is found
  

## Requirements

This action must run on `ubuntu-latest` (do not use a `container` directive such as `rockylinux:8`). This is required for Playwright browser tests which depend on system libraries installed via `apt-get`.

## Inputs

### `GITHUB_TOKEN`

**Required** Your secrets github token `${{ secrets.GITHUB_TOKEN }}`.


## Example Step

```yaml
- uses: actions/checkout@v2
- name: Polarity Integration Development Checklist
  id: int-dev-checklist
  uses: polarityio/polarity-integration-development-checklist@v1.0.0
  with:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
