# Contributors Guide

Thank you for considering contributing to the Visual Studio Code extension for Artillery!

Please note that this guide act as an extension of the global [Contributors guide for Artillery](https://github.com/artilleryio/artillery/blob/main/CONTRIBUTING.md). We highly recommend you read those first as they describe things like forking a repository, raising discussions, tracking issues, and following our Git workflow.

## Running extension locally

Once you forked this repository, open it in Visual Studio Code and press <kbd>F5</kbd> (<kbd>Fn + F5</kbd>, depending on your keyboard preferences). This will do two things:

1. Run the compiler to watch for source code changes;
1. Launch the Extension host where you can preview the extension live while developing.

> You can also refresh the Extension host at any time by pressing <kbd>CMD + R</kbd>/<kbd>CTRL + R</kbd> while the Extension host window is focused.

## Running tests

1. Press <kbd>CMD + SHIFT + D</kbd> to open a debug viewlet.
1. Choose "Extension Test" option from the launch configuration dropdown.
1. Press <kbd>F5</kbd> to run the tests.

You can observe the test output in the debug console.

## Materials

- [**Extension Guidelines (UX)**](https://code.visualstudio.com/api/ux-guidelines/overview)
- [`vscode` API](https://code.visualstudio.com/api/references/vscode-api)
