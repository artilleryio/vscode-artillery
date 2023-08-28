import * as vscode from 'vscode'
import { ArtilleryCodeLensProvider } from './ArtilleryCodeLensProvider'
import { ArtilleryScriptManager } from './ArtilleryScriptManager'
import { ArtilleryScriptAnalyzer } from './ArtilleryScriptAnalyzer'
import { updateArtilleryConfig } from './configUtils'

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

  // Register extension commands.
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'artillery.runTest',
      (exactTestScriptPath?: string) => {
        const testScriptPath =
          exactTestScriptPath ||
          vscode.window.activeTextEditor?.document.uri.path

        if (!testScriptPath) {
          return
        }

        const terminal = vscode.window.createTerminal()
        terminal.show()

        const runCommand = `npx artillery run ${testScriptPath}`
        terminal.sendText(runCommand, true)
      },
    ),
    vscode.commands.registerCommand('artillery.includeTestScript', async () => {
      const { activeTextEditor } = vscode.window

      if (!activeTextEditor) {
        return
      }

      if (
        !ArtilleryScriptAnalyzer.isSupportedDocument(activeTextEditor.document)
      ) {
        const displayFileName = activeTextEditor.document.fileName
        vscode.window.showErrorMessage(
          `Failed to include "${displayFileName}" as Artillery script: unsupported file`,
        )
        return
      }

      const documentUri = activeTextEditor.document.uri.toString()

      await updateArtilleryConfig('include', (prevInclude) => {
        const nextIncludeSet = new Set(prevInclude || []).add(documentUri)
        return Array.from(nextIncludeSet)
      })

      // Update the script manager to reflect the user choice in the
      // code lens and other extension's functionality.
      await scriptManager.addScript(documentUri)
    }),
    vscode.commands.registerCommand('artillery.excludeTestScript', async () => {
      const { activeTextEditor } = vscode.window

      if (!activeTextEditor) {
        return
      }

      if (
        !ArtilleryScriptAnalyzer.isSupportedDocument(activeTextEditor.document)
      ) {
        const displayFileName = activeTextEditor.document.fileName
        vscode.window.showErrorMessage(
          `Failed to exclude "${displayFileName}" from Artillery scripts: unsupported file`,
        )
        return
      }

      const documentUri = activeTextEditor.document.uri.toString()

      await updateArtilleryConfig('exclude', (prevExclude) => {
        const nextExcludeSet = new Set(prevExclude || []).add(documentUri)

        return Array.from(nextExcludeSet)
      })

      // Update the script manager to reflect the user choice in the
      // code lens and other extension's functionality.
      await scriptManager.deleteScript(documentUri)
    }),
    vscode.commands.registerCommand('artillery.clearScriptCache', async () => {
      await scriptManager.deleteAllScripts()
    }),
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
