'use strict';

import * as vscode from 'vscode';
import * as Color from 'color';

type ConversionCallback = (color: Color) => string;

async function replaceColorText(conversion: ConversionCallback): Promise<boolean> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return false
  }

  const { document, selections } = editor;

  return editor.edit(editBuilder => {
    selections.forEach(selection => {
      const text = document.getText(selection);

      let color: Color;

      try {
        color = Color(text.toLowerCase());
      } catch {
        // Trim the selected text in case it's really long so the error message doesn't blow up
        const badSelection = text.substring(0, 30);
        vscode.window.showErrorMessage(`Could not convert color '${badSelection}', unknown format.`);
        return;
      }

      const colorString = conversion(color);
      editBuilder.replace(selection, colorString);
    });
  });
}

type CommandId = 'hex' | 'hsl' | 'rgb'
interface Command {
  description: string,
  transform: () => Promise<boolean>
}

export const commands: Record<CommandId, Command>  = {
  hex: {
    description: 'Convert color to #RRGGBB/AA',
    // color library drops the alpha for hex :(
    transform: () =>
      replaceColorText(color => {
        const { alpha } = color.object();

        const alphaString =
          alpha !== undefined
            ? Math.round(255 * alpha)
                .toString(16)
                .padStart(2, "0")
            : "";

        return color.hex() + alphaString;
      })
  },
  hsl: {
    description: 'Convert color to hsl/hsla()',
    transform: () => replaceColorText(color => color.hsl().round().string()) // prettier-ignore
  },
  rgb: {
    description: 'Convert color to rgb/rgba()',
    transform: () => replaceColorText(color => color.rgb().round().string()) // prettier-ignore
  }
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  // Register quick pick commands
  let disposable = vscode.commands.registerCommand('extension.changeColorFormat.commands', () => {
    const opts: vscode.QuickPickOptions = {
      matchOnDescription: true,
      placeHolder: 'Which color space would you like to shift to?'
    };

    const items: vscode.QuickPickItem[] = (Object.keys(commands) as CommandId[]).map(label => ({
      label,
      description: commands[label].description
    }));

    vscode.window
      .showQuickPick(items, opts)
      .then(option => option && commands[option.label as CommandId]?.transform());
  });

	context.subscriptions.push(disposable);

  // Create individual commands
  Object.entries(commands).forEach(([key, options]) => {
		disposable = vscode.commands.registerCommand(`extension.changeColorFormat.${key}SmartConvert`, options.transform);
		context.subscriptions.push(disposable);
  });
}
