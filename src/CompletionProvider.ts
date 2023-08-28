import * as vscode from 'vscode'

export class ArtilleryCompletionProvider
  implements vscode.CompletionItemProvider
{
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext,
  ): vscode.ProviderResult<
    vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>
  > {
    return [
      {
        kind: vscode.CompletionItemKind.Field,
        label: 'config',
        insertText: 'config:\n\t',
        detail: 'Configuration',
        documentation: 'Artillery script configuration',
      },
    ]
  }
}
