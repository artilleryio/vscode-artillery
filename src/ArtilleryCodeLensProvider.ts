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

    // Ignore YAML files that are not Artillery scripts.
    if (!this.scriptManager.scriptPaths.has(document.uri.toString())) {
      return
    }

    return [
      new vscode.CodeLens(
        new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
        {
          title: '▶ Run load test',
          command: 'artillery.runTest',
          tooltip: 'Runs this test script using Artillery CLI',
          arguments: [document.fileName],
        },
      ),
    ]
  }
}
