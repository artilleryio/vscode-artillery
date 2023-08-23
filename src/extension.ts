import * as fs from 'fs'
import * as vscode from 'vscode'
import { ArtilleryCodeLensProvider } from './ArtilleryCodeLensProvider'

interface ArtilleryConfig {
  testMatch: string
}

const ARTILLERY_JSON_SCHEMA_URL =
  'file:///Users/kettanaito/Projects/artilleryio/artillery/packages/types/schema.json'

export async function activate(context: vscode.ExtensionContext) {
  const vscodeYaml = vscode.extensions.getExtension('redhat.vscode-yaml')

  if (!vscodeYaml) {
    throw new Error('redhat.vscode-yaml failed to install')
  }

  await vscodeYaml.activate()

  //

  // const yamlConfigPath = vscode.Uri.joinPath(
  //   vscodeYaml.extensionUri,
  //   vscodeYaml.packageJSON.contributes.languages[0].configuration,
  // )
  // const yamlConfiguration = fs.readFileSync(yamlConfigPath.path, 'utf8')

  // context.subscriptions.push(
  //   vscode.languages.setLanguageConfiguration(
  //     'artillery-script',
  //     JSON.parse(yamlConfiguration),
  //   ),
  // )

  // Register JSON Schema for test script files.
  async function registerJsonSchema() {
    const config = vscode.workspace.getConfiguration()
    const artilleryConfig = config.get<ArtilleryConfig>('vscode-artillery')

    // Update the user's global configuration to associate the
    // Artillery test match glob with our JSON Schema.
    config
      .update(
        'yaml.schemas',
        {
          [ARTILLERY_JSON_SCHEMA_URL]: '**/*.yml',
        },
        true,
      )
      .then(
        () => console.log('YAML ACTIVATED!'),
        (error) => {
          console.error('Failed to configure JSON Schema.')
          console.error(error)
        },
      )
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
      ['artillery-script'],
      new ArtilleryCodeLensProvider(),
    ),
  )
}

export function deactivate() {}
