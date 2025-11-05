import * as vscode from 'vscode';

import { SecretStorageService } from '../services/SecretStorageService';
import { getExtensionConfiguration } from '../utils/config';
import { ExtensionLogger } from '../utils/logger';

export function createConfigureTranslationApiKeyCommand(
  secrets: SecretStorageService,
  logger: ExtensionLogger,
): () => Promise<void> {
  return async () => {
    const configuration = getExtensionConfiguration();
    const existingSecret = await secrets.getTranslationApiKey();
    const hasStoredSecret = Boolean(existingSecret);
    const hasConfigValue = Boolean(configuration.translation.apiKey);

    const input = await vscode.window.showInputBox({
      title: 'Set Translation API Key',
      prompt:
        'Enter your OpenAI-compatible API key. Leave empty to clear the stored key. Value is stored securely via VS Code Secret Storage.',
      placeHolder: 'sk-...your key...',
      password: true,
      ignoreFocusOut: true,
      value: '',
      validateInput: (value) => {
        if (!value.trim()) {
          return null;
        }

        if (!value.trim().startsWith('sk-')) {
          return 'Expected an OpenAI-style API key starting with "sk-".';
        }

        return null;
      },
    });

    if (input === undefined) {
      logger.info('User cancelled translation API key input.');
      return;
    }

    const trimmed = input.trim();
    const configurationTarget = vscode.ConfigurationTarget.Workspace;
    const configurationSection = vscode.workspace.getConfiguration('babelMdViewer');

    try {
      if (!trimmed) {
        await secrets.clearTranslationApiKey();
        await configurationSection.update('translation.apiKey', undefined, configurationTarget);
        void vscode.window.showInformationMessage('Translation API key cleared.');
        return;
      }

      await secrets.storeTranslationApiKey(trimmed);

      if (hasConfigValue) {
        await configurationSection.update('translation.apiKey', undefined, configurationTarget);
      }

      void vscode.window.showInformationMessage('Translation API key stored securely.');
    } catch (error) {
      logger.error('Failed to persist translation API key.', error);
      void vscode.window.showErrorMessage('Unable to store translation API key. Check logs for details.');
      return;
    }

    if (!hasStoredSecret && !hasConfigValue) {
      logger.info('Translation API key saved for the first time.');
    }
  };
}
