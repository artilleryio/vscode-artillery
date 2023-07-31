import * as vscode from 'vscode'
import { ArtilleryCodeLensProvider } from './ArtilleryCodeLensProvider'

interface ArtilleryConfig {
  testMatch: string
}

/**
 * @todo This should point to an absolute URL
 * of the deployed JSON Schema.
 */
const ARTILLERY_JSON_SCHEMA_PATH =
  'file:///Users/kettanaito/Projects/artilleryio/tds/artillery.schema.json'

export async function activate(context: vscode.ExtensionContext) {
  async function activateDependencies() {
    const vscodeYaml = vscode.extensions.getExtension('redhat.vscode-yaml')

    if (!vscodeYaml) {
      throw new Error('redhat.vscode-yaml failed to install')
    }

    await vscodeYaml.activate()
  }
  await activateDependencies()

  // Register JSON Schema for test script files.
  async function registerJsonSchema() {
    const config = vscode.workspace.getConfiguration()
    const artilleryConfig = config.get<ArtilleryConfig>('artillery')

    // Update the user's global configuration to associate the
    // Artillery test match glob with our JSON Schema.
    config
      .update(
        'yaml.schemas',
        {
          [ARTILLERY_JSON_SCHEMA_PATH]: artilleryConfig?.testMatch,
        },
        true,
      )
      .then(undefined, (error) => {
        console.error('Failed to configure JSON Schema.')
        console.error(error)
      })
  }
  await registerJsonSchema()

  // Register the run test command.
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'artillery.runTest',
      (testScriptPath: string) => {
        const terminal = vscode.window.createTerminal()
        terminal.show()

        /**
         * @todo Check if the Artillery CLI is installed.
         * If not, prompt to install it.
         * We can also have an "Install Artillery CLI" as a command,
         * reusing it here.
         */
        const runCommand = `artillery run ${testScriptPath}`
        terminal.sendText(runCommand, true)
      },
    ),
  )

  // Register the lens view to display "Run load test" lens
  // on top of test script YAML files.
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      ['yaml', 'yml'],
      new ArtilleryCodeLensProvider(),
    ),
  )
}

export function deactivate() {}
