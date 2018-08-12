import * as vscode from "vscode";

import { ITimeEntry, ITask, IPickTask } from "./interfaces";
import { TimerApi } from "./timer-api";
import { getDuration } from "./utils";

export class Timer {
  private _api: TimerApi;
  private _sbiStatus: vscode.StatusBarItem;
  private _sbiStop: vscode.StatusBarItem;
  private _sbiStart: vscode.StatusBarItem;

  private _currentTimeEntry: ITimeEntry;

  constructor(context: vscode.ExtensionContext) {
    // create cache storage
    this._api = new TimerApi(context);

    // register status bar elements
    this._sbiStatus = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right
    );
    this._sbiStatus.command = "extension.openApp";
    this._sbiStart = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right
    );
    this._sbiStart.command = "extension.startTracking";
    this._sbiStart.text = "$(primitive-dot)";
    this._sbiStart.color = "#fafafa";
    this._sbiStart.tooltip = "Start tracking";
    this._sbiStop = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right
    );
    this._sbiStop.command = "extension.stopTracking";
    this._sbiStop.text = "$(primitive-square)";
    this._sbiStop.color = "#F03737";
    this._sbiStop.tooltip = "Stop tracking";

    // check if signed in
    this._api
      .validateToken()
      .then((timeEntry: ITimeEntry) => (this._currentTimeEntry = timeEntry));

    // start event loops
    setInterval(() => this.draw(), 1000);
    setInterval(() => this.getCurrentTimeEntry(), 300000);
  }

  public logIn() {
    vscode.window
      .showInputBox({
        prompt: "Enter your email address:"
      })
      .then(
        emailInput => {
          if (emailInput === undefined) {
            return;
          }
          vscode.window
            .showInputBox({
              password: true,
              prompt: `Password for: ${emailInput}`
            })
            .then(
              passwordInput => {
                if (passwordInput === undefined) {
                  return;
                }
                this._api
                  .signIn(emailInput, passwordInput)
                  .then(
                    (timeEntry: ITimeEntry) =>
                      (this._currentTimeEntry = timeEntry)
                  );
              },
              error => {
                vscode.window.showErrorMessage(error);
              }
            );
        },
        error => {
          vscode.window.showErrorMessage(error);
        }
      );
  }

  public logOut() {
    this._api.signOut();
  }

  public getCurrentTimeEntry(notify: boolean = false) {
    this._api
      .getCurrentTimeEntry(notify)
      .then(timeEntry => (this._currentTimeEntry = timeEntry));
  }

  public startTracking() {
    vscode.window
      .showQuickPick(this._api.getLastTasks(), {
        canPickMany: false,
        placeHolder: "Select new option or continue previous task"
      })
      .then((item: IPickTask) => {
        if (item.taskId) {
          this._api
            .createTimeEntry({
              startAt: new Date().toString(),
              taskId: item.taskId
            })
            .then(
              (timeEntry: ITimeEntry) => (this._currentTimeEntry = timeEntry)
            );
        } else {
          vscode.window
            .showInputBox({
              prompt: "Enter task name:"
            })
            .then((taskName: string) => {
              if (taskName) {
                this._api
                  .createTimeEntry({
                    startAt: new Date().toString()
                  })
                  .then((timeEntry: ITimeEntry) => {
                    this._api
                      .createTask({ title: taskName })
                      .then((task: ITask) => {
                        if (task && task.id) {
                          this._api
                            .updateTimeEntry({
                              ...timeEntry,
                              taskId: task.id
                            })
                            .then(
                              (timeEntry: ITimeEntry) =>
                                (this._currentTimeEntry = timeEntry)
                            );
                        }
                      });
                  });
              } else {
                this._api
                  .createTimeEntry({
                    startAt: new Date().toString()
                  })
                  .then(
                    (timeEntry: ITimeEntry) =>
                      (this._currentTimeEntry = timeEntry)
                  );
              }
            });
        }
      });
  }

  public stopTracking() {
    if (this._currentTimeEntry) {
      this._api
        .updateTimeEntry({
          ...this._currentTimeEntry,
          endAt: new Date().toString()
        })
        .then((timeEntry: ITimeEntry) => {
          if (timeEntry) {
            this._currentTimeEntry = null;
          }
        });
    } else {
      vscode.window.showWarningMessage(
        "Timer: There is no current time entry. Try to refresh or check if you are signed in."
      );
    }
  }

  private draw() {
    if (!this._currentTimeEntry) {
      this._sbiStatus.text = "$(clock) Timer";
      this._sbiStatus.color = "#fafafa";
      this._sbiStatus.tooltip = "Open app";
      this._sbiStop.hide();
      this._sbiStart.show();
    } else {
      this._sbiStop.show();
      this._sbiStart.hide();
      this._sbiStatus.tooltip = this._currentTimeEntry.task
        ? this._currentTimeEntry.task.title
        : "Open app";
      this._sbiStatus.text = `$(clock) ${getDuration(
        new Date().toString(),
        this._currentTimeEntry.startAt
      )}`;
      this._sbiStatus.color = "#F03737";
    }
    this._sbiStatus.show();
  }
}
