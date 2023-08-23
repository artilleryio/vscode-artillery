import * as vscode from 'vscode'
import { ArtilleryCodeLensProvider } from './ArtilleryCodeLensProvider'
import { ArtilleryScriptManager } from './ArtilleryScriptManager'

interface ArtilleryConfig {
  testMatch: string
}

export const ARTILLERY_JSON_SCHEMA_URL = 'https://www.artillery.io/schema.json'

export async function activate(context: vscode.ExtensionContext) {
  async function activateDependencies() {
    const vscodeYaml = vscode.extensions.getExtension('redhat.vscode-yaml')

    if (!vscodeYaml) {
      throw new Error('redhat.vscode-yaml failed to install')
    }

    await vscodeYaml.activate()
  }
  await activateDependencies()

  const scriptManager = new ArtilleryScriptManager(context)

  // Register the run test command.
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'artillery.runTest',
      (testScriptPath: string) => {
        const terminal = vscode.window.createTerminal()
        terminal.show()

        const runCommand = `npx artillery run ${testScriptPath}`
        terminal.sendText(runCommand, true)
      },
    ),
  )

  // Wait for the script manager to read the saved script paths
  // from the YAML extension configuration. Code lens will then
  // be registered for those saved paths.
  await scriptManager.readConfigPathsPromise

  // Register the lens view to display "Run load test" lens
  // on top of test script YAML files.
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      ['yaml', 'yml'],
      new ArtilleryCodeLensProvider(scriptManager),
    ),
  )
}

export function deactivate() {}
