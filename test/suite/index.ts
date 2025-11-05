import * as assert from 'assert';
import { suite, test } from 'mocha';
import * as vscode from 'vscode';

import { BabelMarkdownService } from '../../src/services/BabelMarkdownService';
import { ExtensionLogger } from '../../src/utils/logger';

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
