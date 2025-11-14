import * as vscode from 'vscode';

import type { ExtensionConfiguration } from '../types/config';
import type { TranslationPrompt } from '../types/translation';
import { DEFAULT_TRANSLATION_PROMPT } from '../constants/prompts';
import { ExtensionLogger } from '../utils/logger';
import { hashObject } from '../utils/hash';

export interface ResolvedPrompt extends TranslationPrompt {
  uri?: vscode.Uri;
}

export class PromptResolver {
  constructor(private readonly logger: ExtensionLogger) {}

  async resolve(document: vscode.TextDocument, configuration: ExtensionConfiguration): Promise<ResolvedPrompt> {
    const workspacePrompt = await this.tryReadWorkspacePrompt(document);

    if (workspacePrompt) {
      return workspacePrompt;
    }

    const templateFromSettings = configuration.translation.promptTemplate.trim();
    if (templateFromSettings && templateFromSettings !== DEFAULT_TRANSLATION_PROMPT) {
      return this.createPrompt(templateFromSettings, 'configuration');
    }

    return this.createPrompt(DEFAULT_TRANSLATION_PROMPT, 'default');
  }

  private async tryReadWorkspacePrompt(document: vscode.TextDocument): Promise<ResolvedPrompt | undefined> {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);

    if (!workspaceFolder) {
      return undefined;
    }

    const promptUri = vscode.Uri.joinPath(workspaceFolder.uri, '.babelmd', 'translation-prompt.md');

    try {
      const raw = await vscode.workspace.fs.readFile(promptUri);
      const decoded = new TextDecoder('utf-8', { fatal: false }).decode(raw).trim();

      if (!decoded) {
        return undefined;
      }

      return this.createPrompt(decoded, 'workspace', promptUri);
    } catch (error) {
      if ((error as vscode.FileSystemError).code === 'FileNotFound') {
        return undefined;
      }

      this.logger.error(
        `Failed to read workspace translation prompt from ${promptUri.fsPath}. Falling back to settings/default.`,
        error,
      );
      return undefined;
    }
  }

  private createPrompt(
    rawInstructions: string,
    source: TranslationPrompt['source'],
    uri?: vscode.Uri,
  ): ResolvedPrompt {
    const instructions = rawInstructions.trim();
    const fingerprint = hashObject({ instructions });

    return {
      instructions,
      source,
      fingerprint,
      uri,
    };
  }
}
