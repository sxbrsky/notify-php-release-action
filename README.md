# Notify PHP Release Action

A GitHub Action to automatically creates an issue when a new version of PHP is released.

## Inputs

| Name       | Description                                                                            | Required | Default value       |
|------------|----------------------------------------------------------------------------------------|----------|---------------------|
| localfile  | The local file containing current php release.                                         | false    | .releases           |
| repo-token | Token for interacting with the Github API.                                             | true     | ${{ github.token }} |
| owner      | The account owner of the repository. The name is not case sensitive.                   | true     |                     |
| repo       | The name of the repository without the .git extension. The name is not case sensitive. | true     |                     |

## Example usage

```yaml
on: [push]

permissions:
  issues: write

jobs:
  notify_new_releases:
    runs-on: ubuntu-latest
    steps:
      - name: checkout
        uses: actions/checkout@v4
      - name: Check new php releases.
        uses: nulxrd/notify-php-release-action@v1
        with:
          repo-token: ${{ github.token }}
          repo: notify-php-release-action
          owner: nulxrd
          localfile: .releases

```

## License

This project is licensed under the [MIT License](LICENSE).
