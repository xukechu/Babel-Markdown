import * as vscode from 'vscode';

import { ExtensionLogger } from '../utils/logger';

const TRANSLATION_API_KEY_SECRET = 'babelMdViewer.translation.apiKey.secret';

export class SecretStorageService {
  constructor(
    private readonly secretStorage: vscode.SecretStorage,
    private readonly logger: ExtensionLogger,
  ) {}

  async getTranslationApiKey(): Promise<string | undefined> {
    try {
      const value = await this.secretStorage.get(TRANSLATION_API_KEY_SECRET);
      return value?.trim() || undefined;
    } catch (error) {
      this.logger.error('Failed to retrieve translation API key from secret storage.', error);
      return undefined;
    }
  }

  async storeTranslationApiKey(apiKey: string): Promise<void> {
    try {
      await this.secretStorage.store(TRANSLATION_API_KEY_SECRET, apiKey.trim());
      this.logger.info('Stored translation API key in VS Code SecretStorage.');
    } catch (error) {
      this.logger.error('Failed to store translation API key in secret storage.', error);
      throw error;
    }
  }

  async clearTranslationApiKey(): Promise<void> {
    try {
      await this.secretStorage.delete(TRANSLATION_API_KEY_SECRET);
      this.logger.info('Cleared translation API key from VS Code SecretStorage.');
    } catch (error) {
      this.logger.error('Failed to clear translation API key from secret storage.', error);
      throw error;
    }
  }
}
