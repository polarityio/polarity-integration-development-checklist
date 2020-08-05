# Polarity Integration Development Checklist action

Checks a list of requirements found in the Polarity Integration Development Checklist.  This currently includes:
- LICENSE File Checks 
  - Verifying the LICENSE file exists
  - Verifying contents of the LICENSE are correct and up to date
- config.js File Checks 
  - Verifying Logging Level is set to `info`
  - Verifying Request Options are set correctly including
    - `cert`, `key`, `passphrase`, `ca`, and `proxy` all having the value `''`
    - `rejectUnauthorized` being set to `true`
  - Verifying all Integration Options have a description containing content
- package.json File Checks 
  - Verifying the `private` flag is set to true
  - Verifying the `version` property matches standard semantic versioning format
  - Checks to see if the current `version` property already exists as a release on Github.
  

## Inputs

### `GITHUB_TOKEN`

**Required** Your secrets github token `${{ secrets.GITHUB_TOKEN }}`.


## Example Step

```yaml
- name: Polarity Integration Development Checklist
  id: int-dev-checklist
  uses: polarityio/polarity-integration-development-checklist@v1.0.0
  with:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
