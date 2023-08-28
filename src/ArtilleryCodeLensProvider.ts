import * as vscode from 'vscode'
import { ArtilleryScriptManager } from './ArtilleryScriptManager'

export class ArtilleryCodeLensProvider implements vscode.CodeLensProvider {
  constructor(private scriptManager: ArtilleryScriptManager) {}

  public provideCodeLenses(
    document: vscode.TextDocument,
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    // Ignore empty YAML documents—nothing to run.
    if (!document.getText()) {
      return
    }

    const documentUri = document.uri.toString()

    // Ignore YAML files that are not Artillery scripts
    // and are not explicitly listed in the "include" extension option by the user.
    if (!this.scriptManager.hasScript(documentUri)) {
      return
    }

    return [
      new vscode.CodeLens(
        new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
        {
          title: '▶ Run load test',
          command: 'artillery.runTest',
          tooltip: 'Runs this test script using Artillery CLI',
          arguments: [document.uri.path],
        },
      ),
    ]
  }
}
