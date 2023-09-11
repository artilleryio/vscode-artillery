import * as vscode from 'vscode'
import * as yaml from 'js-yaml'
import { isMatch } from 'micromatch'
import { getArtilleryConfig } from './configUtils'

export class ArtilleryScriptAnalyzer {
  private _onDidDetectScript = new vscode.EventEmitter<vscode.TextDocument>()
  public onDidDetectScript = this._onDidDetectScript.event

  static isSupportedDocument(document: vscode.TextDocument): boolean {
    return (
      document.fileName.endsWith('.yaml') || document.fileName.endsWith('.yml')
    )
  }

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
    if (!ArtilleryScriptAnalyzer.isSupportedDocument(document)) {
      return
    }

    const notifyOnValidTestScript = () => {
      /**
       * @note Notify the consumer on the next tick
       * because this can trigger before the extension
       * is ready to process these events.
       */
      process.nextTick(() => this._onDidDetectScript.fire(document))
    }

    const artilleryConfig = getArtilleryConfig()
    const { include = [], exclude = [] } = artilleryConfig || {}

    const documentUri = document.uri.toString()

    // Skip analyzing and ignore files explicitly listed in the "exclude"
    // extension option.
    if (exclude.some((pattern) => isMatch(documentUri, pattern))) {
      return
    }

    // Skip analyzing a file if it's explicitly listed in the "include"
    // extension option. The user has instructed us to treat those files
    // as valid Artillery test scripts.
    if (include.some((pattern) => isMatch(documentUri, pattern))) {
      return notifyOnValidTestScript()
    }

    // Otherwise, analyze the file to see if it looks like a test script.
    if (this.isArtilleryScript(document.getText())) {
      notifyOnValidTestScript()
    }
  }

  /**
   * Detects if the given text content of a document look
   * like a valid Artillery test script.
   */
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
