import * as vscode from 'vscode';

import type { ExtensionConfiguration } from '../types/config';

export function getExtensionConfiguration(
  scope?: vscode.ConfigurationScope,
): ExtensionConfiguration {
  const configuration = vscode.workspace.getConfiguration('babelMdViewer', scope);

  return {
    previewTheme: configuration.get<'light' | 'dark'>('previewTheme', 'light'),
    transformPlugins: configuration.get<string[]>('transformPlugins', []),
  };
}
