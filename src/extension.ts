// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { exec } from "child_process";
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "editor-switcher" is now active!'
  );

  // 注册编辑器上下文菜单命令
  const disposable = vscode.commands.registerCommand(
    "editor-switcher.openInWebstorm",
    (uri: vscode.Uri) => {
      // 获取当前活动的文本编辑器
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      // 获取当前工作区根路径
      const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
      if (!workspacePath) {
        vscode.window.showErrorMessage("No workspace folder found");
        return;
      }

      // 获取当前文件相对路径
      const filePath = uri.fsPath;

      // 获取当前光标位置
      const position = editor.selection.active;
      const line = position.line + 1; // VSCode 是从0开始计数，WebStorm 从1开始
      const column = position.character + 1;

      // 构建 WebStorm URL
      const url = `webstorm://open?file=${filePath}&line=${line}&column=${column}`;

      // 根据操作系统执行不同的命令
      let command = "";
      switch (process.platform) {
        case "darwin": // macOS
          command = `open "${url}"`;
          break;
        case "win32": // Windows
          command = `start "${url}"`;
          break;
        case "linux": // Linux
          command = `xdg-open "${url}"`;
          break;
        default:
          vscode.window.showErrorMessage("Unsupported operating system");
          return;
      }

      // 执行命令
      exec(command, (error) => {
        if (error) {
          vscode.window.showErrorMessage(
            `Failed to open WebStorm: ${error.message}`
          );
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
