import * as vscode from 'vscode'
import * as yaml from 'js-yaml'

export class ArtilleryScriptAnalyzer {
  private _onDidDetectScript = new vscode.EventEmitter<vscode.TextDocument>()
  public onDidDetectScript = this._onDidDetectScript.event

  constructor(private context: vscode.ExtensionContext) {
    this.checkActiveEditor()

    this.context.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument((document) => {
        this.analyzeAndNotify(document)
      }),
      vscode.workspace.onDidSaveTextDocument((document) => {
        // Handle creation of new Artillery scripts.
        this.analyzeAndNotify(document)
      }),
    )
  }

  private checkActiveEditor() {
    const { activeTextEditor } = vscode.window

    if (activeTextEditor) {
      this.analyzeAndNotify(activeTextEditor.document)
    }
  }

  private analyzeAndNotify(document: vscode.TextDocument) {
    if (!this.isSupportedDocument(document)) {
      return
    }

    if (this.isArtilleryScript(document.getText())) {
      /**
       * @note Notify the consumer on the next tick
       * because this can trigger before the extension
       * is ready to process these events.
       */
      process.nextTick(() => {
        this._onDidDetectScript.fire(document)
      })
    }
  }

  private isSupportedDocument(document: vscode.TextDocument): boolean {
    return (
      document.fileName.endsWith('.yaml') || document.fileName.endsWith('.yml')
    )
  }

  private isArtilleryScript(text: string): boolean {
    const json = yaml.load(text) as Record<string, any>

    if (json.config && json.config.target) {
      return true
    }

    if (json.scenarios && Array.isArray(json.scenarios)) {
      return true
    }

    return false
  }
}
