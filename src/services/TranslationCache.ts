import type * as vscode from 'vscode';

import type { ResolvedTranslationConfiguration, TranslationResult } from '../types/translation';
import { hashObject } from '../utils/hash';

type DocumentLike = Pick<vscode.TextDocument, 'uri' | 'version'>;

interface CacheKey {
  uri: string;
  version: number;
  configHash: string;
}

interface CacheEntry {
  key: CacheKey;
  result: TranslationResult;
  timestamp: number;
}

export class TranslationCache {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly maxEntries: number;
  private readonly ttlMs: number;

  constructor(options?: { maxEntries?: number; ttlMs?: number }) {
    this.maxEntries = options?.maxEntries ?? 16;
    this.ttlMs = options?.ttlMs ?? 1000 * 60 * 5;
  }

  get(
    document: DocumentLike,
    resolvedConfig: ResolvedTranslationConfiguration,
  ): TranslationResult | undefined {
    const key = this.buildKey(document, resolvedConfig);
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.result;
  }

  set(
    document: DocumentLike,
    resolvedConfig: ResolvedTranslationConfiguration,
    result: TranslationResult,
  ): void {
    const key = this.buildKey(document, resolvedConfig);

    if (this.cache.size >= this.maxEntries) {
      this.evictOne();
    }

    this.cache.set(key, {
      key: this.parseKey(key),
      result,
      timestamp: Date.now(),
    });
  }

  clearForDocument(document: DocumentLike): void {
    const prefix = `${document.uri.toString()}::`;

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  private buildKey(
    document: DocumentLike,
    resolvedConfig: ResolvedTranslationConfiguration,
  ): string {
    const configHash = hashObject({
      apiBaseUrl: resolvedConfig.apiBaseUrl,
      model: resolvedConfig.model,
      targetLanguage: resolvedConfig.targetLanguage,
    });

    return `${document.uri.toString()}::${document.version}::${configHash}`;
  }

  private parseKey(key: string): CacheKey {
    const [uri, version, configHash] = key.split('::');

    return {
      uri,
      version: Number(version),
      configHash,
    };
  }

  private evictOne(): void {
    let oldestKey: string | undefined;
    let oldestTs = Number.POSITIVE_INFINITY;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTs) {
        oldestKey = key;
        oldestTs = entry.timestamp;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}
