// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "editor-switcher" is now active!'
  );

  // 注册命令
  const disposable = vscode.commands.registerCommand(
    "editor-switcher.openInWebstorm",
    (uri: vscode.Uri) => {
      // 获取当前工作区根路径
      const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
      if (!workspacePath) {
        vscode.window.showErrorMessage("No workspace folder found");
        return;
      }

      // 如果是从编辑器中调用，使用当前光标位置
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document.uri.fsPath === uri.fsPath) {
        const position = editor.selection.active;
        const line = position.line + 1;
        const column = position.character + 1;

        const relativePath = path.relative(workspacePath, uri.fsPath);
        const url = `webstorm://open?project=${workspacePath}&file=${workspacePath}/${relativePath}&line=${line}&column=${column}`;
        openWithCommand(url);
      } else {
        // 检查是否是目录
        const stats = fs.statSync(uri.fsPath);
        if (stats.isDirectory()) {
          // 如果是目录，只打开项目
          const url = `webstorm://open?project=${workspacePath}`;
          openWithCommand(url);
        } else {
          // 如果是文件，打开具体文件
          const relativePath = path.relative(workspacePath, uri.fsPath);
          const url = `webstorm://open?project=${workspacePath}&file=${workspacePath}/${relativePath}`;
          openWithCommand(url);
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

function openWithCommand(url: string) {
  let command = "";
  switch (process.platform) {
    case "darwin":
      command = `open "${url}"`;
      break;
    case "win32":
      command = `start "${url}"`;
      break;
    case "linux":
      command = `xdg-open "${url}"`;
      break;
    default:
      vscode.window.showErrorMessage("Unsupported operating system");
      return;
  }

  exec(command, (error) => {
    if (error) {
      vscode.window.showErrorMessage(
        `Failed to open WebStorm: ${error.message}`
      );
    }
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
