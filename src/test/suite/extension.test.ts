import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { commands } from '../../extension';
import { EOL } from 'os';

async function openDocument(content: string): Promise<vscode.TextEditor> {
  const uri = vscode.Uri.parse(`untitled:tmp-${Math.random()}.txt`);
  const document = await vscode.workspace.openTextDocument(uri);
  const editor = await vscode.window.showTextDocument(document);
  await editor.edit((edit) => edit.insert(new vscode.Position(0, 0), content));

  return editor;
}

function editorSelectAll(editor: vscode.TextEditor): vscode.TextEditor {
  const endpoint = editor.document.getText().length;
  const fullRange = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(endpoint));

  editor.selection = new vscode.Selection(fullRange.start, fullRange.end);
  return editor;
}

function closeEditor(): void {
  void vscode.commands.executeCommand('workbench.action.closeActiveEditor');
}

async function assertCommandResult(command: string, content: string, result: string): Promise<void> {
  const editor = await openDocument(content);
  editorSelectAll(editor);

  return vscode.commands
    .executeCommand(command)
    .then(() => {
      assert.strictEqual(editor.document.getText(), result);
    })
    .then(closeEditor);
}

suite('commands quick pick', () => {
  test('adds the transform commands to the showQuickPick drop down', () => {
    const quickPickSpy = sinon
      .stub(vscode.window, 'showQuickPick')
      .resolves({ label: 'anything', description: 'anything' });

    const items: vscode.QuickPickItem[] = Object.entries(commands).map(([key, cmd]) => ({
      label: key,
      description: cmd.description,
    }));

    return vscode.commands.executeCommand('extension.changeColorFormat.commands').then(() => {
      assert(quickPickSpy.calledOnce, 'showQuickPick is called once');
      assert(quickPickSpy.calledWith(items), 'showQuickPick is called with the commands');
    });
  });
});

suite('hex command', () => {
  const command = 'extension.changeColorFormat.hexSmartConvert';

  test('converts hsl to 6 letter hex', () => {
    return assertCommandResult(command, 'hsl(18, 36%, 52%)', '#b17359');
  });

  test('converts hsla to 8 letter hex', () => {
    return assertCommandResult(command, 'hsla(311, 54%, 26%, 0.5)', '#661e5980');
  });

  test('converts rgb to 6 letter hex', () => {
    return assertCommandResult(command, 'rgb(180, 80, 125)', '#b4507d');
  });

  test('converts rgba to 8 letter hex', () => {
    return assertCommandResult(command, 'rgba(94, 16, 230, 0.25)', '#5e10e640');
  });
});

suite('hsl', () => {
  const command = 'extension.changeColorFormat.hslSmartConvert';

  test('converts 3 letter hex to hsl', () => {
    return assertCommandResult(command, '#abc', 'hsl(210, 25%, 73.3%)');
  });

  test('converts 6 letter hex to hsl', () => {
    return assertCommandResult(command, '#000000', 'hsl(0, 0%, 0%)');
  });

  test('converts 8 letter hex to hsla', () => {
    return assertCommandResult(command, '#66339980', 'hsla(270, 50%, 40%, 0.5)');
  });

  test('converts rgb to hsl', () => {
    return assertCommandResult(command, 'rgb(102, 51, 153)', 'hsl(270, 50%, 40%)');
  });

  test('converts rgba to hsla', () => {
    return assertCommandResult(command, 'rgba(46, 139, 87, 0.4)', 'hsla(146.5, 50.3%, 36.3%, 0.4)');
  });

  test('converts color keywords to hsl', () => {
    return assertCommandResult(command, 'rebeccapurple', 'hsl(270, 50%, 40%)');
  });

  // regression because of https://github.com/Qix-/color/issues/127
  test('converts `tomato` color keyword to hsl', () => {
    return assertCommandResult(command, 'tomato', 'hsl(9.1, 100%, 63.9%)');
  });
});

suite('rgb', () => {
  const command = 'extension.changeColorFormat.rgbSmartConvert';

  test('converts 3 letter hex to rgb', () => {
    return assertCommandResult(command, '#def', 'rgb(221, 238, 255)');
  });

  test('converts 6 letter hex to rgb', () => {
    return assertCommandResult(command, '#BEADED', 'rgb(190, 173, 237)');
  });

  test('converts 8 letter hex to rgba', () => {
    return assertCommandResult(command, '#DEADBEEF', 'rgba(222, 173, 190, 0.9)');
  });

  test('converts hsl to rgb', () => {
    return assertCommandResult(command, 'hsl(206, 32%, 75%)', 'rgb(171, 194, 212)');
  });

  test('converts hsla to rgba', () => {
    return assertCommandResult(command, 'hsla(164, 18%, 90%, 0.7)', 'rgba(225, 234, 232, 0.7)');
  });
});

suite('editor selections', () => {
  test('transforming invalid selection', () => {
    const content = 'tricksy hobbits';

    return openDocument('tricksy hobbits').then((editor) => {
      editorSelectAll(editor);

      const messageStub = sinon.stub(vscode.window, 'showErrorMessage');

      return vscode.commands
        .executeCommand('extension.changeColorFormat.hslSmartConvert')
        .then(() => {
          assert(messageStub.calledOnce);
          assert(messageStub.calledWith(`Could not convert color '${content}', unknown format.`));
        })
        .then(closeEditor);
    });
  });

  test('replacing multiple colors at once via multi-select', () => {
    const content = ['tomato', 'hsl(100,50%,50%)', 'rgba(50, 150, 250)', 'mintcream'].join(EOL);
    const expected = [
      'hsl(9.1, 100%, 63.9%)',
      'hsl(100, 50%, 50%)',
      'hsl(210, 95.2%, 58.8%)',
      'hsl(150, 100%, 98%)',
    ].join(EOL);

    return openDocument(content).then((editor) => {
      for (let i = 0; i < editor.document.lineCount; i++) {
        const range = editor.document.lineAt(i).range;
        editor.selections[i] = new vscode.Selection(range.start, range.end);
      }

      return vscode.commands
        .executeCommand('extension.changeColorFormat.hslSmartConvert')
        .then(() => {
          assert.strictEqual(editor.document.getText(), expected);
        })
        .then(closeEditor);
    });
  });
});
