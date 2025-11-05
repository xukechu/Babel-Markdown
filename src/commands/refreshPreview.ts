import * as vscode from 'vscode';

import { MarkdownPreviewPanel } from '../panel/MarkdownPreviewPanel';
import { ExtensionLogger } from '../utils/logger';

export function createRefreshPreviewCommand(
  previewPanel: MarkdownPreviewPanel,
  logger: ExtensionLogger,
): () => Promise<void> {
  return async () => {
    try {
      const refreshed = await previewPanel.refresh();

      if (!refreshed) {
        void vscode.window.showInformationMessage('Open a preview before refreshing.');
      }
    } catch (error) {
      logger.error('Failed to refresh preview panel.', error);
      void vscode.window.showErrorMessage('Unable to refresh Babel Markdown preview. Check logs.');
    }
  };
}
