# Feature Requirements – Babel Markdown AI Translation

## Summary
- **Product name:** Babel Markdown (AI translation edition)
- **Primary users:** VS Code users working with Markdown who need real-time translated previews.
- **Core idea:** While reading a Markdown document, the user can open a side-by-side preview that shows an AI-translated version rendered with the same Markdown formatting. The extension handles OpenAI-compatible API configuration, translation requests, and synchronized preview UX.

## Goals
- Streamline multilingual document review by displaying source Markdown and translated Markdown simultaneously.
- Keep the translation workflow minimal: one command/button, instant preview panel, no external browser steps.
- Maintain the fidelity of Markdown formatting in the translated output.

## Out of Scope
- Non-Markdown file types.
- Offline translation, caching, or custom model hosting.
- Inline, per-block editing of translated content (read-only preview only).
- Support for non-OpenAI API providers.

## User Journeys
1. **Configure Translation API**
  - User opens VS Code settings, searches for "Babel Markdown".
   - User enters OpenAI-compatible base URL and API key.
   - Optionally adjusts model name and output language preference.

2. **Preview Translation**
   - User opens a Markdown document.
   - User clicks the preview button located in the editor title toolbar (top-right of the editor).
   - Extension opens a split view: left shows source Markdown editor, right shows translated Markdown webview.
   - Translation request is sent; once complete, translated Markdown renders in the webview.
   - Scrolling either pane keeps the other in sync.

3. **Close Preview**
   - User closes the source editor tab.
   - Extension automatically disposes the associated translation preview webview.

## Functional Requirements
- **F1 – Command & UI Entry Point**
  - Provide a command `babelMdViewer.openTranslationPreview` accessible via command palette and a toolbar button on Markdown editors.
  - Toolbar icon should reflect state (idle/loading) if possible.

- **F2 – Translation Preview Panel**
  - Create a side-by-side layout: source editor on the left, preview/webview on the right.
  - Render translated Markdown preserving heading hierarchy, lists, code blocks, tables, etc.
  - Surface loading/error states in the webview.

- **F3 – Translation Pipeline**
  - Invoke OpenAI-compatible chat/completions API with user-configured endpoint, key, and model.
  - Prompt should instruct the model to preserve Markdown structure, including inline code, code blocks, and frontmatter.
  - Implement retries/backoff for transient API errors.

- **F4 – Configuration**
  - Settings:
    - `babelMdViewer.translation.apiBaseUrl` (string)
    - `babelMdViewer.translation.apiKey` (string, secret)
    - `babelMdViewer.translation.model` (string, default `gpt-4o-mini` or similar)
    - `babelMdViewer.translation.targetLanguage` (string, default `en`)
    - `babelMdViewer.translation.timeoutMs` (number, default `30000`)
  - Validate presence of `apiKey` and `apiBaseUrl` before requests.
  - Optionally expose a command to prompt for API key input with secure storage.

- **F5 – Scroll Synchronization**
  - Bidirectional sync between source editor scroll position and preview webview using DOM scroll events and VS Code APIs.

- **F6 – Lifecycle Management**
  - Close/dipose preview when the source editor tab closes.
  - Support refreshing translation manually (command and toolbar button).
  - Reuse preview instance when toggling between already-open documents.

- **F7 – Telemetry & Logging**
  - Record info/warning/error logs in output channel for troubleshooting.
  - Avoid logging sensitive data (API key, raw translation text).

## Non-Functional Requirements
- **Reliability:** Handle API failures gracefully with user-facing messages and retry guidance.
- **Performance:** Debounce translation requests; avoid repeated calls on minor editor changes until user-triggered refresh.
- **Security:** Store API keys using VS Code SecretStorage when possible; never expose in logs or preview HTML.
- **Extensibility:** Architecture should allow future support for additional providers with minimal changes.
- **Testing:** Cover translation service mocks, configuration validation, preview lifecycle, and scroll sync messaging.

## Acceptance Criteria
- Successful translations appear within 3 seconds for average-length Markdown (<2k words) assuming API latency <1.5s.
- No translation request is attempted when required configuration is missing; user receives actionable warning.
- Scroll synchronization remains responsive with a latency under 100ms between panes.
- Closing the source editor removes the preview panel without leaving orphaned disposables.
- All commands and settings are discoverable via VS Code UI (Command Palette, extension settings).
