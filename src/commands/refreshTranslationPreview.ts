import * as vscode from 'vscode';

import { ExtensionLogger } from '../utils/logger';

export function createRefreshTranslationPreviewCommand(
  logger: ExtensionLogger,
): () => Promise<void> {
  return async () => {
    logger.info('Refresh translation preview command invoked. (Stub implementation)');
    void vscode.window.showInformationMessage('Translation preview refresh is under development.');
  };
}
