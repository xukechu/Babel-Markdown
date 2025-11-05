import * as assert from 'assert';
import { suite, test } from 'mocha';
import * as vscode from 'vscode';

import { SecretStorageService } from '../../src/services/SecretStorageService';
import { BabelMarkdownService } from '../../src/services/BabelMarkdownService';
import type { TranslationConfiguration } from '../../src/types/config';
import { getExtensionConfiguration } from '../../src/utils/config';
import { ExtensionLogger } from '../../src/utils/logger';

const CONFIG_SECTION = 'babelMdViewer';

class InMemorySecretStorage implements vscode.SecretStorage {
  private readonly storageMap = new Map<string, string>();
  private readonly emitter = new vscode.EventEmitter<vscode.SecretStorageChangeEvent>();

  readonly onDidChange = this.emitter.event;

  async get(key: string): Promise<string | undefined> {
    return this.storageMap.get(key);
  }

  async store(key: string, value: string): Promise<void> {
    this.storageMap.set(key, value);
    this.emitter.fire({ key });
  }

  async delete(key: string): Promise<void> {
    this.storageMap.delete(key);
    this.emitter.fire({ key });
  }

  async keys(): Promise<string[]> {
    return Array.from(this.storageMap.keys());
  }
}

suite('Configuration Helper', () => {
  let originalConfig: TranslationConfiguration | undefined;

  suiteSetup(() => {
    const extensionConfig = getExtensionConfiguration();
    originalConfig = extensionConfig.translation;
  });

  suiteTeardown(async () => {
    const configuration = vscode.workspace.getConfiguration(CONFIG_SECTION);

    await configuration.update(
      'translation.apiBaseUrl',
      originalConfig?.apiBaseUrl,
      vscode.ConfigurationTarget.Workspace,
    );
    await configuration.update(
      'translation.apiKey',
      originalConfig?.apiKey,
      vscode.ConfigurationTarget.Workspace,
    );
    await configuration.update(
      'translation.model',
      originalConfig?.model,
      vscode.ConfigurationTarget.Workspace,
    );
    await configuration.update(
      'translation.targetLanguage',
      originalConfig?.targetLanguage,
      vscode.ConfigurationTarget.Workspace,
    );
    await configuration.update(
      'translation.timeoutMs',
      originalConfig?.timeoutMs,
      vscode.ConfigurationTarget.Workspace,
    );
  });

  test('reads translation configuration with overrides', async () => {
    const configuration = vscode.workspace.getConfiguration(CONFIG_SECTION);

    await configuration.update(
      'translation.apiBaseUrl',
      'https://example.com/v1',
      vscode.ConfigurationTarget.Workspace,
    );
    await configuration.update(
      'translation.apiKey',
      'secret-key',
      vscode.ConfigurationTarget.Workspace,
    );
    await configuration.update(
      'translation.model',
      'gpt-test',
      vscode.ConfigurationTarget.Workspace,
    );
    await configuration.update(
      'translation.targetLanguage',
      'fr',
      vscode.ConfigurationTarget.Workspace,
    );
    await configuration.update(
      'translation.timeoutMs',
      45000,
      vscode.ConfigurationTarget.Workspace,
    );

    const result = getExtensionConfiguration();

    assert.strictEqual(result.translation.apiBaseUrl, 'https://example.com/v1');
    assert.strictEqual(result.translation.apiKey, 'secret-key');
    assert.strictEqual(result.translation.model, 'gpt-test');
    assert.strictEqual(result.translation.targetLanguage, 'fr');
    assert.strictEqual(result.translation.timeoutMs, 45000);
  });
});

suite('SecretStorageService', () => {
  test('stores, retrieves and clears translation api key', async () => {
    const logger = new ExtensionLogger('Babel MD Viewer (Secret Test)');
    const storage = new InMemorySecretStorage();
    const service = new SecretStorageService(storage, logger);

    await service.storeTranslationApiKey(' test-key ');

    const stored = await service.getTranslationApiKey();
    assert.strictEqual(stored, 'test-key');

    await service.clearTranslationApiKey();

    const cleared = await service.getTranslationApiKey();
    assert.strictEqual(cleared, undefined);

    logger.dispose();
  });
});

suite('Babel Markdown Service', () => {
  test('returns escaped HTML for markdown content', async () => {
    const logger = new ExtensionLogger('Babel MD Viewer (Test)');
    const service = new BabelMarkdownService(logger);

    const document = await vscode.workspace.openTextDocument({
      language: 'markdown',
      content: '# Hello <world>',
    });

    const result = await service.transformDocument(document);

    assert.strictEqual(result.html.includes('&lt;world&gt;'), true);
    logger.dispose();
  });
});
