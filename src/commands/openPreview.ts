import * as vscode from 'vscode';

import { MarkdownPreviewPanel } from '../panel/MarkdownPreviewPanel';
import { ExtensionLogger } from '../utils/logger';

export function createOpenPreviewCommand(
  previewPanel: MarkdownPreviewPanel,
  logger: ExtensionLogger,
): () => Promise<void> {
  return async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      void vscode.window.showWarningMessage('No active editor to preview.');
      return;
    }

    if (editor.document.languageId !== 'markdown') {
      void vscode.window.showWarningMessage('Babel MD Viewer only supports Markdown files.');
      return;
    }

    try {
      await previewPanel.show(editor.document);
    } catch (error) {
      logger.error('Failed to open preview panel.', error);
      void vscode.window.showErrorMessage('Unable to open Babel Markdown preview. Check logs.');
    }
  };
}
