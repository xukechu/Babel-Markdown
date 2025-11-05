export interface TranslationConfiguration {
  apiBaseUrl: string;
  apiKey?: string;
  model: string;
  targetLanguage: string;
  timeoutMs: number;
}

export interface ExtensionConfiguration {
  previewTheme: 'light' | 'dark';
  transformPlugins: string[];
  translation: TranslationConfiguration;
}
