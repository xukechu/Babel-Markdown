export type HostToWebviewMessage =
  | {
      type: 'translationResult';
      payload: {
        markdown: string;
        html: string;
        providerId: string;
        latencyMs: number;
        targetLanguage: string;
        documentPath: string;
        sourceVersion: number;
        wasCached: boolean;
      };
    }
  | {
      type: 'translationError';
      payload: {
        message: string;
        documentPath: string;
        targetLanguage: string;
      };
    }
  | {
      type: 'setLoading';
      payload: {
        isLoading: boolean;
        documentPath: string;
        targetLanguage: string;
      };
    }
  | {
      type: 'scrollSync';
      payload: {
        line: number;
        totalLines: number;
      };
    };

export type WebviewToHostMessage =
  | {
      type: 'requestScrollSync';
      payload: {
        fraction: number;
      };
    }
  | {
      type: 'requestRetry';
    }
  | {
      type: 'log';
      payload: {
        level: 'info' | 'warn' | 'error';
        message: string;
      };
    };
