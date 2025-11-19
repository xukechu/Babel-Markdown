import * as path from 'path';

import { runTests } from '@vscode/test-electron';

async function main(): Promise<void> {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '..', '..');
    const extensionTestsPath = path.resolve(__dirname, './suite/index');
    const workspacePath = path.resolve(__dirname, '..', '..');

    if (process.env.ELECTRON_RUN_AS_NODE) {
      delete process.env.ELECTRON_RUN_AS_NODE;
    }

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [workspacePath],
    });
  } catch (error) {
    console.error('Failed to run extension tests');
    if (error) {
      console.error(error);
    }
    process.exit(1);
  }
}

void main();
