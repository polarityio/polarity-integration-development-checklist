# Polarity Integration Development Checklist action

Checks a list of requirements found in the [Polarity Integration Development Checklist](https://polarity.atlassian.net/wiki/spaces/PROD/pages/126255145/Integration+Development+Checklist)

## Inputs

### `GITHUB_TOKEN`

**Required** Your secrets github token `${{ secrets.GITHUB_TOKEN }}`.


## Example Step

```yaml
- name: Polarity Integration Development Checklist
  id: int-dev-checklist
  uses: actions/polarity-integration-development-checklist@main
  with:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
