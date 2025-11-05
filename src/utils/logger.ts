import * as vscode from 'vscode';

export class ExtensionLogger implements vscode.Disposable {
  private readonly channel: vscode.OutputChannel;

  constructor(name = 'Babel MD Viewer') {
    this.channel = vscode.window.createOutputChannel(name);
  }

  info(message: string): void {
    this.channel.appendLine(this.format('info', message));
  }

  warn(message: string): void {
    this.channel.appendLine(this.format('warn', message));
  }

  error(message: string, error?: unknown): void {
    const details = error instanceof Error ? `\n${error.name}: ${error.message}\n${error.stack ?? ''}` : '';
    this.channel.appendLine(this.format('error', `${message}${details}`));
  }

  event(name: string, data: Record<string, unknown>): void {
    this.channel.appendLine(this.formatEvent(name, data));
  }

  dispose(): void {
    this.channel.dispose();
  }

  private format(level: 'info' | 'warn' | 'error', message: string): string {
    const timestamp = new Date().toISOString();
    return `[${level.toUpperCase()} - ${timestamp}] ${message}`;
  }

  private formatEvent(name: string, data: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    return `[EVENT - ${timestamp}] ${name} ${this.safeStringify(data)}`;
  }

  private safeStringify(data: Record<string, unknown>): string {
    try {
      return JSON.stringify(data, undefined, 0);
    } catch (error) {
      return JSON.stringify({ serializationError: (error as Error).message });
    }
  }
}
