import * as vscode from 'vscode'

export class ArtilleryCodeLensProvider implements vscode.CodeLensProvider {
  public provideCodeLenses(
    document: vscode.TextDocument,
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    const hasContent = !!document.getText()
    if (!hasContent) {
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
