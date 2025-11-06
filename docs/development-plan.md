# Development Plan – Babel Markdown AI Translation

## Guiding Principles
- Deliver value incrementally: start with configuration + basic preview, then enrich UX.
- Keep services testable by isolating VS Code APIs from translation logic.
- Ensure translation operations are observable via logging and injectable dependencies.

## Phase 0 – Project Alignment
- [ ] Review `docs/requirements.md` and confirm scope/acceptance criteria with stakeholders.
- [ ] Refine architecture (see `docs/architecture.md`) to reflect translation-specific components.

## Phase 1 – Foundation Setup
1. **Configuration & Secrets**
   - [ ] Add new settings contributions for translation (base URL, key, model, language, timeout).
   - [ ] Implement `SecretStorage` helper for API key (prompt if missing, cache securely).
   - [ ] Unit tests: validate configuration retrieval, missing key warning flow.

2. **Command & UI Wiring**
   - [ ] Add `openTranslationPreview` and `refreshTranslationPreview` commands.
   - [ ] Add editor title button with when-clause targeting Markdown documents.
   - [ ] Integration test: command registers and rejects non-Markdown files.

3. **Preview Panel Skeleton**
   - [ ] Create translation preview webview with loading/error states.
   - [ ] Ensure lifecycle management when editor closes (dispose listeners).
   - [ ] Unit tests: panel creation/disposal, event wiring (mocked VS Code APIs).

## Phase 2 – Translation Pipeline
1. **Translation Service**
   - [ ] Define `TranslationService` interfaces (request payloads, responses, error types).
   - [ ] Implement OpenAI-compatible client with retry/backoff and timeout handling.
   - [ ] Add prompt builder ensuring Markdown preservation and language targeting.
   - [ ] Unit tests with mocked HTTP client verifying payloads and error branches.

2. **Document Transformation Flow**
   - [ ] Integrate service into preview pipeline: fetch translation, produce HTML via Markdown renderer.
   - [ ] Debounce translation triggers; respect manual refresh command.
   - [ ] Support caching per document/version to prevent redundant calls.
   - [ ] Unit tests: transformation results, cache hit/miss, error messaging.

## Phase 3 – UX Enhancements
1. **Scroll Synchronization**
   - [ ] Implement message channel between webview and extension host for scroll positions.
   - [ ] Calculate proportional scroll offsets respecting varying content heights.
   - [ ] Integration tests using simulated scroll events (webview message mocks).

2. **Status & Feedback**
   - [ ] Add loading indicator + retry CTA in webview.
   - [ ] Surface translation errors via VS Code notifications and panel copy.
   - [ ] Log telemetry events (non-sensitive) for translation lifecycle.

3. **Localization & Accessibility**
   - [ ] Ensure ARIA labels and accessible color contrast in preview HTML.
   - [ ] Externalize UI strings for potential localization.

## Phase 4 – Hardening & Release Prep
- [ ] Author regression tests covering multi-document scenarios and closing behavior.
- [ ] Add CLI script for translation smoke tests (mocked HTTP).
- [ ] Update `CHANGELOG.md` with milestone progress.
- [ ] Prepare README usage guide (configuration steps, screenshots).
- [ ] Run `npm run check` and fix all lint/test issues.
- [ ] Package `.vsix` (optional) for internal preview.

## Open Questions
- Should translations trigger automatically on save, or remain manual? (Default assumption: manual.)
- Any need for multi-language previews (e.g., choose target language per command)?
- Do we need rate limiting or quota feedback from API responses?

## Definition of Done
- Requirements confirmed, tests passing, lint clean.
- Translated preview experience validated against acceptance criteria.
- Documentation updated (README, architecture, usage instructions).
- Verified extension packaged/runnable via VS Code extension host.
