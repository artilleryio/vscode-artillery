import * as vscode from 'vscode'
import { ArtilleryScriptAnalyzer } from './ArtilleryScriptAnalyzer'
import { ARTILLERY_JSON_SCHEMA_URL } from './extension'
import { isObject } from './isObject'

interface YamlConfigSection {
  [schemaUrl: string]: Array<string>
}

// The path to the YAML extension in vscode config
// where it stores its "schema: [patterns]" associations.
const YAML_CONFIG_KEY = 'yaml.schemas'

export class ArtilleryScriptManager {
  private analyzer: ArtilleryScriptAnalyzer

  public scriptPaths = new Set<string>()
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
      .getConfiguration()
      .get<YamlConfigSection>(YAML_CONFIG_KEY)

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
    const yamlConfig = config.get<YamlConfigSection>(YAML_CONFIG_KEY) || {}
    const scriptFilesSet = new Set(this.scriptPaths)

    scriptFilesSet.delete('*.yaml')
    scriptFilesSet.delete('*.yml')

    // If the provided schema URL doesn't point to production,
    // make sure any previously existing production schema associations are deleted.
    // This allows testing against arbitrary schema builds, like a locally built schema.
    if (ARTILLERY_JSON_SCHEMA_URL !== 'https://www.artillery.io/schema.json') {
      delete yamlConfig['https://www.artillery.io/schema.json']
      await config.update(YAML_CONFIG_KEY, yamlConfig)
    }

    await config.update(YAML_CONFIG_KEY, {
      ...yamlConfig,
      [ARTILLERY_JSON_SCHEMA_URL]: Array.from(scriptFilesSet),
    })
  }
}
