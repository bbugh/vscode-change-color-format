'use strict';

import * as vscode from 'vscode';
import { parse } from './lib/color';

async function replaceColorText(conversion: (color: string) => string): Promise<boolean> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return false;
  }

  const { document, selections } = editor;

  return editor.edit((editBuilder) => {
    selections.forEach((selection) => {
      const text = document.getText(selection);

      let color: string;

      try {
        color = conversion(text);
      } catch {
        // Trim the selected text in case it's really long so the error message doesn't blow up
        const badSelection = text.substring(0, 30);
        void vscode.window.showErrorMessage(`Could not convert color '${badSelection}', unknown format.`);
        return;
      }

      editBuilder.replace(selection, color.toLowerCase());
    });
  });
}

type CommandId = 'hex' | 'hsl' | 'rgb';
interface Command {
  description: string;
  transform: () => Promise<boolean>;
}

export const commands: Record<CommandId, Command> = {
  hex: {
    description: 'Convert color to hex (#RRGGBB/AA)',
    transform: () => replaceColorText((color) => parse(color).toHex()),
  },
  hsl: {
    description: 'Convert color to hsl/hsla()',
    transform: () => replaceColorText((color) => parse(color).toHSL3()),
  },
  rgb: {
    description: 'Convert color to rgb/rgba()',
    transform: () => replaceColorText((color) => parse(color).toRGB3()),
  },
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  // Register quick pick commands
  let disposable = vscode.commands.registerCommand('extension.changeColorFormat.commands', () => {
    const opts: vscode.QuickPickOptions = {
      matchOnDescription: true,
      placeHolder: 'Which color space would you like to shift to?',
    };

    const items: vscode.QuickPickItem[] = (Object.keys(commands) as CommandId[]).map((label) => ({
      label,
      description: commands[label].description,
    }));

    void vscode.window
      .showQuickPick(items, opts)
      .then((option) => option && commands[option.label as CommandId]?.transform());
  });

  context.subscriptions.push(disposable);

  // Create individual commands
  Object.entries(commands).forEach(([key, options]) => {
    disposable = vscode.commands.registerCommand(`extension.changeColorFormat.${key}SmartConvert`, options.transform);
    context.subscriptions.push(disposable);
  });
}
