import * as vscode from 'vscode'

export const ARTILLERY_CONFIG_KEY = 'artillery'

export interface ArtilleryConfig {
  include?: Array<string>
  exclude?: Array<string>
}

export type ArtilleryWorkspaceConfiguration = vscode.WorkspaceConfiguration &
  ArtilleryConfig

export function getArtilleryConfig(): ArtilleryWorkspaceConfiguration {
  return vscode.workspace.getConfiguration(ARTILLERY_CONFIG_KEY)
}

export async function updateArtilleryConfig<Key extends keyof ArtilleryConfig>(
  section: Key,
  updateFn: (
    preValue?: ArtilleryConfig[Key],
  ) => ArtilleryConfig[Key] | Promise<ArtilleryConfig[Key]>,
): Promise<void> {
  const config = getArtilleryConfig()
  const nextValue = await updateFn(config.get(section))
  await config.update(section, nextValue, vscode.ConfigurationTarget.Global)
}
