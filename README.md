[Artillery](https://www.artillery.io/) extension for Visual Studio Code for test script intellisense, validation, and running your load tests directly from the IDE.

## Installation

Install the extension from [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=Artilleryio.vscode-artillery).

## Features

### Intellisense

When writing test scripts with this extension installed, you can browse the list of all available test script options at any point in time. Take advantage of on-the-fly validation to write tests faster and avoid mistakes.

![Test script intellisense](https://raw.github.com/artilleryio/vscode-artillery/main/assets/intellisense-suggestions.png)

> Learn more about [Writing test scripts with Artillery](https://www.artillery.io/docs/reference/test-script).

Explore existing test scripts by hovering at any of its properties to get a short description, examples, and links to the documentation to learn more.

![Inline tooltips for existing properties](https://raw.github.com/artilleryio/vscode-artillery/main/assets/intellisense-tooltips.png)

### Inline test runs

Open any Artillery test script and click the "▶ Run locally" link at the top of the file to run that script in Visual Studio Code. This will spawn a new terminal and run the current test script using Artillery CLI.

## Configuration

### `include: Array<string>`

- Default: `[]`

A list of absolute file URIs or glob patterns to always treat as Artillery test scripts.

```json
{
  "artillery.include": ["file:///User/john/Projects/acme/load-tests/**/*.yml"]
}
```

### `exclude: Array<string>`

- Default: `[]`

A list of absolute file URIs or glob patterns to ignore. The extension will not activate for the ignored files.

```json
{
  "artillery.exclude": ["**/*.conf.yml"]
}
```
