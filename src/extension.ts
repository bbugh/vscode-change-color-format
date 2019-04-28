'use strict';

import * as vscode from 'vscode';
import * as Color from 'color';

type ConversionCallback = (color: Color) => string;

async function replaceColorText(conversion: ConversionCallback): Promise<boolean> {
  const editor = vscode.window.activeTextEditor;
  const { document, selections } = editor;

  if (!selections.length) {
    return;
  }

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

export const commands = {
  hex: {
    description: 'Convert color to #RRGGBB/AA',
    // color library drops the alpha for hex :(
    transform: () =>
      replaceColorText(color => {
        const rgbColor = color.rgb().object();

        const red = Math.round(rgbColor.r).toString(16);
        const green = Math.round(rgbColor.g).toString(16);
        const blue = Math.round(rgbColor.b).toString(16);
        const alpha = rgbColor.alpha ? Math.round(255 * rgbColor.alpha).toString(16) : '';

        return '#' + red + green + blue + alpha;
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
  vscode.commands.registerCommand('extension.colorSpaceShift.commands', () => {
    const opts: vscode.QuickPickOptions = {
      matchOnDescription: true,
      placeHolder: 'Which color space would you like to shift to?'
    };

    const items: vscode.QuickPickItem[] = Object.keys(commands).map(label => ({
      label,
      description: commands[label].description
    }));

    vscode.window
      .showQuickPick(items, opts)
      .then(option => commands[option.label] && commands[option.label].transform());
  });

  // Create individual commands
  Object.entries(commands).forEach(([key, options]) => {
    vscode.commands.registerCommand(`extension.colorSpaceShift.${key}SmartConvert`, options.transform);
  });
}

// this method is called when your extension is deactivated
export function deactivate(): void {}
