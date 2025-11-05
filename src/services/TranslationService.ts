import * as vscode from 'vscode';

import type { ExtensionConfiguration } from '../types/config';
import type { ResolvedTranslationConfiguration, TranslationResult } from '../types/translation';
import { OpenAITranslationClient } from './OpenAITranslationClient';
import { escapeHtml } from '../utils/text';
import { ExtensionLogger } from '../utils/logger';

export interface TranslationRequestContext {
  document: vscode.TextDocument;
  configuration: ExtensionConfiguration;
  resolvedConfig: ResolvedTranslationConfiguration;
  signal?: AbortSignal;
}

export class TranslationService {
  constructor(
    private readonly logger: ExtensionLogger,
    private readonly openAIClient: OpenAITranslationClient,
  ) {}

  async translateDocument(context: TranslationRequestContext): Promise<TranslationResult> {
    const relativePath = vscode.workspace.asRelativePath(context.document.uri);

    this.logger.info(
      `Translating ${relativePath} to ${context.resolvedConfig.targetLanguage} with model ${context.resolvedConfig.model}.`,
    );

    if (context.signal?.aborted) {
      throw new vscode.CancellationError();
    }

    const text = context.document.getText();

    if (!text.trim()) {
      return {
        markdown: '_The source document is empty; nothing to translate._',
        providerId: 'noop',
        latencyMs: 0,
      };
    }

    try {
      const result = await this.openAIClient.translate({
        documentText: text,
        fileName: relativePath,
        resolvedConfig: context.resolvedConfig,
        signal: context.signal,
      });

      return result;
    } catch (error) {
      if (error instanceof vscode.CancellationError) {
        throw error;
      }

      this.logger.error('Translation service failed.', error);

      const escaped = escapeHtml(text);
      return {
        markdown: `> **Translation failed**  \
> Target language: ${context.resolvedConfig.targetLanguage}\n\n${escaped}`,
        providerId: 'error-fallback',
        latencyMs: 0,
      };
    }
  }
}
