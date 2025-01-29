import * as vscode from "vscode";

const logFormats: Record<string, (varName: string) => string> = {
  javascript: (varName) => `console.log("${varName}: ", ${varName});`,
  typescript: (varName) => `console.log("${varName}: ", ${varName});`,
  python: (varName) => `print(f"${varName}: {${varName}}")`,
  java: (varName) => `System.out.println("${varName}: " + ${varName});`,
  csharp: (varName) => `Console.WriteLine("${varName}: " + ${varName});`,
  php: (varName) => `echo "${varName}: " . ${varName};`,
  ruby: (varName) => `puts "${varName}: #{${varName}}"`,
  go: (varName) => `fmt.Println("${varName}: ", ${varName})`,
  rust: (varName) => `println!("${varName}: {:?}", ${varName});`,
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  console.log('Congratulations, your extension "quicklogz" is now active!');

  // Register the "Hello World" command
  const helloWorldCommand = vscode.commands.registerCommand(
    "quicklog.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from quicklog!");
    }
  );

  // Register the "Insert Log" command
  const insertLogCommand = vscode.commands.registerCommand(
    "LogHelper.addLog",
    async () => {
      // Get the active text editor
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage("No active editor found!");
        return;
      }

      // Get the selected text (variable) in the editor
      const selectedText = editor.document.getText(editor.selection);

      // If there is no selected text, show an error
      if (!selectedText) {
        vscode.window.showErrorMessage("No text selected!");
        return;
      }

      // Determine the next line where the log should be inserted
      const position = editor.selection.end.translate(0, 0);
      const previousLine = editor.document.lineAt(position.line);
      const indentation = previousLine.text.match(/^\s*/)?.[0] || "";

      // To fetch log format for the language from language id through open ai api.
      const languageId = editor.document.languageId;
      let logMessage = getLogStatement(languageId, selectedText);
      logMessage = `${indentation}${logMessage}`;

      // Ensure we insert the log in the next line if it's at the end of a line
      const nextLinePosition = editor.document.lineAt(position.line).range.end;

      // Insert the log message into the next line
      editor
        .edit((editBuilder) => {
          editBuilder.insert(nextLinePosition, `\n${logMessage}`);
        })
        .then((success) => {
          if (success) {
            vscode.window.showInformationMessage("Log inserted successfully!");
          } else {
            vscode.window.showErrorMessage("Failed to insert log!");
          }
        });
    }
  );

  const insertLogCommandBeforeVariable = vscode.commands.registerCommand(
    "LogHelper.addLogBeforeVariable",
    async () => {
      // Get the active text editor
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage("No active editor found!");
        return;
      }

      // Get the selected text (variable) in the editor
      const selectedText = editor.document.getText(editor.selection);

      // If there is no selected text, show an error
      if (!selectedText) {
        vscode.window.showErrorMessage("No text selected!");
        return;
      }

      // Determine the next line where the log should be inserted
      const position = editor.selection.end.translate(-1, 0);

      const previousLine = editor.document.lineAt(position.line);
      const indentation = previousLine.text.match(/^\s*/)?.[0] || "";

      const languageId = editor.document.languageId;
      let logMessage = getLogStatement(languageId, selectedText);
      logMessage = `${indentation}${logMessage}`;

      // Ensure we insert the log in the next line if it's at the end of a line
      const previousLinePosition = editor.document.lineAt(position.line).range
        .end;

      // Insert the log message into the next line
      editor
        .edit((editBuilder) => {
          editBuilder.insert(previousLinePosition, `\n${logMessage}`);
        })
        .then((success) => {
          if (success) {
            vscode.window.showInformationMessage("Log inserted successfully!");
          } else {
            vscode.window.showErrorMessage("Failed to insert log!");
          }
        });
    }
  );

  // Push both disposables to the context subscriptions
  context.subscriptions.push(
    helloWorldCommand,
    insertLogCommand,
    insertLogCommandBeforeVariable
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}

function getLogStatement(languageId: string, varName: string): string {
  return logFormats[languageId]
    ? logFormats[languageId](varName)
    : `// Log format not found for ${languageId}`;
}
