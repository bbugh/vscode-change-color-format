'use strict';

import * as vscode from 'vscode';
import * as Color from 'color';

type ConversionCallback = (color: Color) => string;

async function replaceColorText(conversion: ConversionCallback): Promise<boolean> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return false;
  }

  const { document, selections } = editor;

  return editor.edit((editBuilder) => {
    selections.forEach((selection) => {
      const text = document.getText(selection);

      let color: Color;

      try {
        color = Color(text);
      } catch {
        // Trim the selected text in case it's really long so the error message doesn't blow up
        const badSelection = text.substring(0, 30);
        void vscode.window.showErrorMessage(`Could not convert color '${badSelection}', unknown format.`);
        return;
      }

      const colorString = conversion(color).toLowerCase();
      editBuilder.replace(selection, colorString);
    });
  });
}

type CommandId = 'hex' | 'hsl' | 'rgb';
interface Command {
  description: string;
  transform: () => Promise<boolean>;
}

// HACK: Color has a bug in alpha that doesn't actually round:
// https://github.com/Qix-/color/issues/127
const formatter = Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

function fixColorPkgHslAlphaBug(color: Color): string {
  const array = color.array();

  const hue = formatter.format(color.hue());
  const saturation = formatter.format(color.saturationl());
  const lightness = formatter.format(color.lightness());
  const alpha = formatter.format(color.alpha());

  if (array.length === 3) {
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  } else {
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
  }
}

function fixColorPkgRgbAlphaBug(color: Color): string {
  const array = color.array();
  if (array.length === 3) {
    return color.string();
  }

  const red = Math.round(color.red());
  const green = Math.round(color.green());
  const blue = Math.round(color.blue());
  const alpha = formatter.format(color.alpha());

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
// END HACK

export const commands: Record<CommandId, Command> = {
  hex: {
    description: 'Convert color to #RRGGBB/AA',
    // color library drops the alpha for hex :(
    transform: () =>
      replaceColorText((color) => {
        const { alpha } = color.object();

        const alphaString =
          alpha !== undefined
            ? Math.round(255 * alpha)
                .toString(16)
                .padStart(2, '0')
            : '';

        return color.hex() + alphaString;
      }),
  },
  hsl: {
    description: 'Convert color to hsl/hsla()',
    transform: () => replaceColorText((color) => fixColorPkgHslAlphaBug(color.hsl())),
  },
  rgb: {
    description: 'Convert color to rgb/rgba()',
    transform: () => replaceColorText((color) => fixColorPkgRgbAlphaBug(color.rgb())),
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
