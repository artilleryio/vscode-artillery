import * as vscode from 'vscode'
import { ArtilleryScriptAnalyzer } from './ArtilleryScriptAnalyzer'
import { ARTILLERY_JSON_SCHEMA_URL } from './extension'
import { isObject } from './isObject'

interface YamlConfigSection {
  [schemaUrl: string]: Array<string>
}

export class ArtilleryScriptManager {
  private analyzer: ArtilleryScriptAnalyzer
  private scriptPaths = new Set<string>()

  public readConfigPathsPromise: Promise<void>

  constructor(private context: vscode.ExtensionContext) {
    this.analyzer = new ArtilleryScriptAnalyzer(context)

    this.context.subscriptions.push(
      this.analyzer.onDidDetectScript(async (document) => {
        /**
         * @note Provide the full document URI so we apply the schema
         * both to local and to remote files.
         */
        this.scriptPaths.add(document.uri.toString())
        await this.writeConfigPaths()
      }),
      vscode.workspace.onDidDeleteFiles(async (event) => {
        for (const fileUri of event.files) {
          this.scriptPaths.delete(fileUri.toString())
        }

        await this.writeConfigPaths()
      }),
    )

    this.readConfigPathsPromise = this.readConfigPaths().then(
      (savedScriptPaths) => {
        this.scriptPaths = savedScriptPaths
      },
    )
  }

  private async readConfigPaths(): Promise<Set<string>> {
    const yamlConfig = vscode.workspace
      .getConfiguration('yaml')
      .get<YamlConfigSection>('schemas')

    if (
      !yamlConfig ||
      (isObject(yamlConfig) && !(ARTILLERY_JSON_SCHEMA_URL in yamlConfig))
    ) {
      return new Set()
    }

    return new Set(yamlConfig[ARTILLERY_JSON_SCHEMA_URL])
  }

  private async writeConfigPaths() {
    const config = vscode.workspace.getConfiguration()
    const yamlConfig = config.get<YamlConfigSection>('yaml.schemas') || {}
    const scriptFilesSet = new Set(this.scriptPaths)

    scriptFilesSet.delete('*.yaml')
    scriptFilesSet.delete('*.yml')

    // If the provided schema URL doesn't point to production,
    // make sure any previously existing production schema associations are deleted.
    // This allows testing against arbitrary schema builds, like a locally built schema.
    if (ARTILLERY_JSON_SCHEMA_URL !== 'https://www.artillery.io/schema.json') {
      Reflect.deleteProperty(yamlConfig, 'https://www.artillery.io/schema.json')
      await config.update('yaml.schemas', yamlConfig)
    }

    await config.update('yaml.schemas', {
      ...yamlConfig,
      [ARTILLERY_JSON_SCHEMA_URL]: Array.from(scriptFilesSet),
    })
  }

  public async addScript(documentUri: string) {
    await this.readConfigPathsPromise
    this.scriptPaths.add(documentUri)
    await this.writeConfigPaths()
  }

  public async deleteScript(documentUri: string) {
    await this.readConfigPathsPromise

    if (this.scriptPaths.has(documentUri)) {
      this.scriptPaths.delete(documentUri)
      await this.writeConfigPaths()
    }
  }

  /**
   * Deletes the entire Artillery JSON Schema key from the YAML configuration.
   * Useful to reset the script analyzis to a clear state.
   */
  public async deleteAllScripts() {
    const yamlConfig = vscode.workspace.getConfiguration('yaml')
    const definedSchemas = yamlConfig.get<YamlConfigSection>('schemas')

    if (!definedSchemas) {
      return
    }

    await yamlConfig.update('schemas', {
      ...yamlConfig,
      [ARTILLERY_JSON_SCHEMA_URL]: [],
    })
  }

  public hasScript(documentUri: string): boolean {
    return this.scriptPaths.has(documentUri)
  }
}
