import * as vscode from 'vscode';

import { registerCommands } from './activation/registerCommands';

export function activate(context: vscode.ExtensionContext): void {
  const disposables = registerCommands(context);

  for (const disposable of disposables) {
    context.subscriptions.push(disposable);
  }
}

export function deactivate(): void {
  // Intentionally left blank: resources are disposed via context subscriptions.
}
