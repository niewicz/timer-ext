import * as vscode from "vscode";

import { Timer } from "./timer";
import { appPath } from "./routes";

export function activate(context: vscode.ExtensionContext) {
  var timer = new Timer(context);

  let dispLogIn = vscode.commands.registerCommand("extension.logIn", () => {
    timer.logIn();
  });

  let dispLogOut = vscode.commands.registerCommand("extension.logOut", () => {
    timer.logOut();
  });

  let dispStartTracking = vscode.commands.registerCommand(
    "extension.startTracking",
    () => {
      timer.startTracking();
    }
  );

  let dispStopTracking = vscode.commands.registerCommand(
    "extension.stopTracking",
    () => {
      timer.stopTracking();
    }
  );

  let dispRefresh = vscode.commands.registerCommand("extension.refresh", () => {
    timer.getCurrentTimeEntry(true);
  });

  let dispOpenApp = vscode.commands.registerCommand("extension.openApp", () => {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(appPath()));
  });

  context.subscriptions.push(dispLogIn);
  context.subscriptions.push(dispLogOut);
  context.subscriptions.push(dispStartTracking);
  context.subscriptions.push(dispStopTracking);
  context.subscriptions.push(dispRefresh);
  context.subscriptions.push(dispOpenApp);
}

export function deactivate() {}
