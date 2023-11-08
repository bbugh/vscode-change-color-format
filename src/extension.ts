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

type CommandId = 'hex' | 'hsl' | 'rgb' | 'hsl4' | 'rgb4';
interface Command {
  description: string;
  transform: () => Promise<boolean>;
  enabled?: (config: vscode.WorkspaceConfiguration) => boolean;
}

export const commands: Record<CommandId, Command> = {
  hex: {
    description: 'Convert Color to hex #RRGGBB[AA]',
    transform: () => replaceColorText((color) => parse(color).toHex()),
  },
  hsl: {
    description: 'Convert Color to hsl/hsla() (CSS3 legacy)',
    transform: () => replaceColorText((color) => parse(color).toHSL3()),
    enabled: (config) => !!config.get('showCSS3LegacyConversions'),
  },
  rgb: {
    description: 'Convert Color to rgb/rgba() (CSS3 legacy)',
    transform: () => replaceColorText((color) => parse(color).toRGB3()),
    enabled: (config) => !!config.get('showCSS3LegacyConversions'),
  },
  hsl4: {
    description: 'Convert Color to hsl()',
    transform: () => replaceColorText((color) => parse(color).toHSL4()),
  },
  rgb4: {
    description: 'Convert Color to rgb()',
    transform: () => replaceColorText((color) => parse(color).toRGB4()),
  },
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  // Register quick pick commands
  let disposable = vscode.commands.registerCommand('extension.changeColorFormat.commands', () => {
    const config = vscode.workspace.getConfiguration('changeColorFormat');

    const opts: vscode.QuickPickOptions = {
      matchOnDescription: true,
      placeHolder: 'Which color space would you like to shift to?',
    };

    const items = Object.entries(commands)
      .filter(([, command]) => typeof command.enabled !== 'function' || command.enabled(config))
      .map(([label, _]) => ({
        label,
        description: commands[label as CommandId].description,
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
