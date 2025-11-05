import type { HostToWebviewMessage, WebviewToHostMessage } from '../messaging/channel';

declare const acquireVsCodeApi: <T>() => {
  postMessage(message: T): void;
  getState(): unknown;
  setState(state: unknown): void;
};

const vscodeApi = (typeof acquireVsCodeApi !== 'undefined'
  ? acquireVsCodeApi()
  : { postMessage: () => undefined, getState: () => undefined, setState: () => undefined });

const outputElement = document.getElementById('preview-content');
const statusElement = document.getElementById('preview-status');
const errorElement = document.getElementById('preview-error');
const retryElement = document.getElementById('preview-retry');

if (!(outputElement instanceof HTMLDivElement)) {
  throw new Error('Translation preview DOM failed to initialize: preview-content.');
}

if (!(statusElement instanceof HTMLParagraphElement)) {
  throw new Error('Translation preview DOM failed to initialize: preview-status.');
}

if (!(errorElement instanceof HTMLDivElement)) {
  throw new Error('Translation preview DOM failed to initialize: preview-error.');
}

if (!(retryElement instanceof HTMLButtonElement)) {
  throw new Error('Translation preview DOM failed to initialize: preview-retry.');
}

const outputContainer = outputElement;
const statusContainer = statusElement;
const errorContainer = errorElement;
const retryButton = retryElement;

function postMessage(message: WebviewToHostMessage): void {
  vscodeApi.postMessage(message);
}

function renderHtml(html: string): void {
  outputContainer.innerHTML = html;
}

let lastDocumentPath = '';
let lastTargetLanguage = '';
let pendingRetry = false;

function setLoading(isLoading: boolean, documentPath: string, targetLanguage: string): void {
  if (documentPath) {
    lastDocumentPath = documentPath;
  }

  if (targetLanguage) {
    lastTargetLanguage = targetLanguage;
  }

  statusContainer.dataset.state = isLoading ? 'loading' : 'idle';

  if (isLoading) {
    const documentLabel = lastDocumentPath || 'current document';
    const languageLabel = lastTargetLanguage || 'configured language';
    statusContainer.textContent = `Translating ${documentLabel} → ${languageLabel}…`;
    retryButton.hidden = true;
    retryButton.disabled = true;
  } else if (!pendingRetry) {
    statusContainer.textContent = '';
  }
}

function renderResult(payload: Extract<HostToWebviewMessage, { type: 'translationResult' }>['payload']): void {
  pendingRetry = false;
  lastTargetLanguage = payload.targetLanguage;
  errorContainer.hidden = true;
  retryButton.hidden = true;
  retryButton.disabled = false;
  statusContainer.dataset.state = 'idle';
  statusContainer.textContent = `Provider: ${payload.providerId} · Target: ${payload.targetLanguage} · Latency: ${payload.latencyMs}ms`;
  renderHtml(payload.html);
}

function renderError(message: string): void {
  pendingRetry = false;
  errorContainer.hidden = false;
  errorContainer.textContent = message;
  statusContainer.dataset.state = 'idle';
  statusContainer.textContent = '';
  outputContainer.innerHTML = '';
  retryButton.hidden = false;
  retryButton.disabled = false;
}
let suppressScrollEvents = false;
let suppressTimer: number | undefined;

function applyScrollSync(line: number, totalLines: number): void {
  if (totalLines <= 1) {
    suppressScrollEvents = true;
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (suppressTimer !== undefined) {
      window.clearTimeout(suppressTimer);
    }
    suppressTimer = window.setTimeout(() => {
      suppressScrollEvents = false;
    }, 50);
    return;
  }

  const clampedLine = Math.max(0, Math.min(line, totalLines - 1));
  const fraction = clampedLine / (totalLines - 1);
  const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 0);

  suppressScrollEvents = true;
  window.scrollTo({ top: fraction * maxScroll, behavior: 'auto' });
  if (suppressTimer !== undefined) {
    window.clearTimeout(suppressTimer);
  }
  suppressTimer = window.setTimeout(() => {
    suppressScrollEvents = false;
  }, 50);
}

window.addEventListener('message', (event: MessageEvent<HostToWebviewMessage>) => {
  const message = event.data;

  switch (message.type) {
    case 'setLoading':
      setLoading(message.payload.isLoading, message.payload.documentPath, message.payload.targetLanguage);
      break;
    case 'translationResult':
      setLoading(false, '', message.payload.targetLanguage);
      renderResult(message.payload);
      break;
    case 'translationError':
      setLoading(false, '', '');
      renderError(message.payload.message);
      break;
    case 'scrollSync':
      applyScrollSync(message.payload.line, message.payload.totalLines);
      break;
    default: {
      const unexpected: never = message;
      void unexpected;
      postMessage({ type: 'log', payload: { level: 'warn', message: 'Unknown message received from host.' } });
      break;
    }
  }
});
let scrollEventQueued = false;

document.addEventListener('scroll', () => {
  if (suppressScrollEvents) {
    return;
  }

  if (scrollEventQueued) {
    return;
  }

  scrollEventQueued = true;
  window.requestAnimationFrame(() => {
    scrollEventQueued = false;
    const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    const fraction = window.scrollY / maxScroll;
    postMessage({ type: 'requestScrollSync', payload: { fraction } });
  });
});

retryButton.addEventListener('click', () => {
  if (pendingRetry) {
    return;
  }

  pendingRetry = true;
  retryButton.disabled = true;
  setLoading(true, lastDocumentPath, lastTargetLanguage);
  postMessage({ type: 'requestRetry' });
});
