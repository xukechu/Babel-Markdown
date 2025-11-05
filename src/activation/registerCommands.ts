import * as vscode from 'vscode';

import { createOpenPreviewCommand } from '../commands/openPreview';
import { createRefreshPreviewCommand } from '../commands/refreshPreview';
import { createConfigureTranslationApiKeyCommand } from '../commands/configureTranslationApiKey';
import { createOpenTranslationPreviewCommand } from '../commands/openTranslationPreview';
import { createRefreshTranslationPreviewCommand } from '../commands/refreshTranslationPreview';
import { MarkdownPreviewPanel } from '../panel/MarkdownPreviewPanel';
import { BabelMarkdownService } from '../services/BabelMarkdownService';
import { SecretStorageService } from '../services/SecretStorageService';
import { ExtensionLogger } from '../utils/logger';

export function registerCommands(context: vscode.ExtensionContext): vscode.Disposable[] {
  const logger = new ExtensionLogger();
  const service = new BabelMarkdownService(logger);
  const previewPanel = new MarkdownPreviewPanel(context.extensionUri, service, logger);
  const secretStorageService = new SecretStorageService(context.secrets, logger);

  context.subscriptions.push(logger, previewPanel);

  return [
    vscode.commands.registerCommand(
      'babelMdViewer.openPreview',
      createOpenPreviewCommand(previewPanel, logger),
    ),
    vscode.commands.registerCommand(
      'babelMdViewer.refreshPreview',
      createRefreshPreviewCommand(previewPanel, logger),
    ),
    vscode.commands.registerCommand(
      'babelMdViewer.openTranslationPreview',
      createOpenTranslationPreviewCommand(logger),
    ),
    vscode.commands.registerCommand(
      'babelMdViewer.refreshTranslationPreview',
      createRefreshTranslationPreviewCommand(logger),
    ),
    vscode.commands.registerCommand(
      'babelMdViewer.configureTranslationApiKey',
      createConfigureTranslationApiKeyCommand(secretStorageService, logger),
    ),
  ];
}
