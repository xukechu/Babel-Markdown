import * as vscode from 'vscode';

import { ExtensionLogger } from '../utils/logger';

export function createOpenTranslationPreviewCommand(
  logger: ExtensionLogger,
): () => Promise<void> {
  return async () => {
    logger.info('Open translation preview command invoked. (Stub implementation)');
    void vscode.window.showInformationMessage('Translation preview is under development.');
  };
}
