# Architecture Overview

This document captures initial architectural decisions for the Babel Markdown Viewer extension.

## Goals
- Provide a clean separation between VS Code integration (commands, activation) and domain logic (Markdown + Babel transformations).
- Keep the preview panel self-contained so the UI layer can evolve independently.
- Support automated testing with minimal manual setup.

## Layering

1. **Activation Layer (`src/activation`)**
   - Wires up the extension entry point.
   - Registers commands and disposables.
   - Loads configuration defaults.

2. **Command Layer (`src/commands`)**
   - Each command is encapsulated in its own module.
   - Commands delegate transformation work to services and orchestrate UI updates.

3. **Service Layer (`src/services`)**
   - Houses pure logic such as calling Babel, loading configuration, or caching results.
   - Keeps VS Code specific APIs at the edges so services remain testable.

4. **Presentation Layer (`src/panel`)**
   - Manages the preview webview, message passing, and state synchronization.
   - Allows alternative frontends (e.g., React) in the future without touching command logic.

5. **Utilities and Types (`src/utils`, `src/types`)**
   - Thin helpers for logging, error handling, and shared TypeScript contracts.

## Testing Strategy
- Lightweight unit tests cover services and utilities.
- Integration tests (via `@vscode/test-electron`) validate command behavior and webview wiring.
- Fixtures under `test/fixtures` provide sample Markdown inputs for regression coverage.

## Build and Packaging
- TypeScript compiler emits sources into `dist/` for runtime and `dist-test/` for tests.
- ESLint with `@typescript-eslint` enforces consistency.
- Future enhancements can introduce bundling (e.g., esbuild) if the codebase grows complex.
