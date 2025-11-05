import * as vscode from 'vscode';

import type { ResolvedTranslationConfiguration, TranslationResult } from '../types/translation';
import { ExtensionLogger } from '../utils/logger';

export interface TranslateRequest {
  documentText: string;
  fileName: string;
  resolvedConfig: ResolvedTranslationConfiguration;
  signal?: AbortSignal;
}

interface OpenAIResponseChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: Array<{
    index: number;
    finish_reason: string | null;
    message: {
      role: 'assistant';
      content: string;
    };
  }>;
}

export class OpenAITranslationClient {
  constructor(private readonly logger: ExtensionLogger) {}

  async translate(request: TranslateRequest): Promise<TranslationResult> {
    const { resolvedConfig, documentText, fileName, signal } = request;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), resolvedConfig.timeoutMs);
    const combinedSignal = this.combineSignals(signal, controller.signal);

    const url = `${resolvedConfig.apiBaseUrl.replace(/\/$/, '')}/chat/completions`;
    const prompt = this.buildPrompt(documentText, resolvedConfig.targetLanguage, fileName);

    const started = Date.now();
    let response: Response | undefined;

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resolvedConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: resolvedConfig.model,
          messages: prompt,
          temperature: 0.2,
          top_p: 1,
          response_format: { type: 'text' },
        }),
        signal: combinedSignal ?? controller.signal,
      });
    } catch (error) {
      if (combinedSignal?.aborted || controller.signal.aborted) {
        throw new vscode.CancellationError();
      }

      clearTimeout(timeoutId);
      this.logger.error('Failed to call translation API.', error);
      throw error;
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await this.safeReadBody(response);
      this.logger.error(
        `Translation API responded with ${response.status}: ${errorBody ?? 'No body'}.`,
      );
      throw new Error(`Translation failed with status ${response.status}.`);
    }

    const body = (await response.json()) as OpenAIResponseChunk;
    const message = body.choices?.[0]?.message?.content;

    if (!message) {
      this.logger.error('Translation API returned an empty response.', body);
      throw new Error('Translation API returned an empty response.');
    }

    const latency = Date.now() - started;

    return {
      markdown: message,
      providerId: body.model || resolvedConfig.model,
      latencyMs: latency,
    };
  }

  private buildPrompt(
    markdown: string,
    targetLanguage: string,
    fileName: string,
  ): Array<{ role: 'system' | 'user'; content: string }> {
    const systemPrompt = `You are an expert technical translator. Translate Markdown documents into ${targetLanguage} while preserving the original Markdown structure, code blocks, inline formatting, tables, and metadata. Do not add commentary.`;

    const userPrompt = `Translate the following Markdown file (${fileName}). Respond only with translated Markdown.

${markdown}`;

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];
  }

  private combineSignals(signalA?: AbortSignal, signalB?: AbortSignal): AbortSignal | undefined {
    if (!signalA) {
      return signalB;
    }

    if (!signalB) {
      return signalA;
    }

    if ((signalA as any).addEventListener && (signalB as any).addEventListener) {
      const controller = new AbortController();
      const abort = () => controller.abort();

      if (signalA.aborted || signalB.aborted) {
        controller.abort();
      } else {
        signalA.addEventListener('abort', abort);
        signalB.addEventListener('abort', abort);
      }

      return controller.signal;
    }

    return signalA;
  }

  private async safeReadBody(response: Response): Promise<string | undefined> {
    try {
      return await response.text();
    } catch (error) {
  this.logger.warn('Failed to read error response body.');
      return undefined;
    }
  }
}
