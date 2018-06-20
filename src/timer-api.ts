import { window, ExtensionContext } from "vscode";

const rp = require("request-promise");
const Cache = require("vscode-cache");

import { camelize, decamelize } from "./utils";
import {
  validateTokenPath,
  signInPath,
  currentTimeEntryPath,
  timeEntriesPath,
  tasksPath
} from "./routes";
import { ITimeEntry, ITask, IPickTask } from "./interfaces";

export class TimerApi {
  private _storage;

  constructor(context: ExtensionContext) {
    this._storage = new Cache(context);
  }

  public validateToken(): Thenable<ITimeEntry> {
    const options = {
      method: "GET",
      uri: validateTokenPath(),
      headers: this.getAuthData()
    };

    return rp(options)
      .then(body => {
        window.setStatusBarMessage("TIMER: You are signed in");
        setTimeout(() => {
          window.setStatusBarMessage("");
        }, 5000);
        return this.getCurrentTimeEntry(false);
      })
      .catch(error => null);
  }

  public signIn(email: string, password: string): Thenable<ITimeEntry> {
    const options = {
      method: "POST",
      uri: signInPath(),
      form: { email, password },
      resolveWithFullResponse: true
    };

    return rp(options)
      .then(response => {
        console.log(response);
        if (response.statusCode === 200) {
          this.storeAuthData(response.headers);
          window.showInformationMessage("Timer: You are logged in.");
          return this.getCurrentTimeEntry(false);
        }
        if (response.statusCode !== 200) {
          window.showErrorMessage("Timer: Failed to log in.");
        }
      })
      .catch(error => window.showErrorMessage("Timer failed to sign in."));
  }

  public getCurrentTimeEntry(notify: boolean): Thenable<ITimeEntry> {
    const options = {
      method: "GET",
      uri: currentTimeEntryPath(),
      headers: this.getAuthData()
    };

    return rp(options)
      .then(body => camelize(JSON.parse(body)).timeEntry)
      .catch(error => {
        if (notify) {
          window.showErrorMessage(
            "Timer failed to refresh. Check if you are signed."
          );
        }
      });
  }

  public createTimeEntry(params: ITimeEntry): Thenable<ITimeEntry> {
    const options = {
      method: "POST",
      uri: timeEntriesPath(),
      headers: this.getAuthData(),
      form: {
        time_entry: decamelize(params)
      }
    };

    return rp(options)
      .then(body => camelize(JSON.parse(body)).timeEntry)
      .catch(error =>
        window.showErrorMessage(
          "Timer failed to create time entry. Check if you are signed in."
        )
      );
  }

  public updateTimeEntry(params: ITimeEntry): Thenable<ITimeEntry> {
    const options = {
      method: "PUT",
      uri: `${timeEntriesPath()}/${params.id}`,
      headers: this.getAuthData(),
      form: {
        time_entry: {
          id: params.id,
          start_at: params.startAt,
          end_at: params.endAt,
          task_id: params.taskId
        }
      }
    };

    return rp(options)
      .then(body => camelize(JSON.parse(body)).timeEntry)
      .catch(error =>
        window.showErrorMessage(
          "Timer failed to update time entry. Check if you are signed in."
        )
      );
  }

  public createTask(params: ITask): Thenable<ITask> {
    const options = {
      method: "POST",
      uri: tasksPath(),
      headers: this.getAuthData(),
      form: {
        task: decamelize(params)
      }
    };

    return rp(options)
      .then(body => camelize(JSON.parse(body)).task)
      .catch(error =>
        window.showErrorMessage(
          "Timer failed to create new task. Check if you are signed in."
        )
      );
  }

  public getLastTasks(): Thenable<IPickTask[]> {
    const options = {
      method: "GET",
      uri: tasksPath(),
      headers: this.getAuthData(),
      form: {
        order_by: "created_at",
        order: "DESC"
      }
    };

    return rp(options)
      .then(body => camelize(JSON.parse(body)).tasks)
      .then((tasks: ITask[]) =>
        tasks.map((task: ITask) => ({
          label: task.title,
          taskId: task.id,
          detail: `${task.project ? task.project.title : ""}${
            task.project && task.project.client
              ? " (" + task.project.client.name + ")"
              : ""
          }`
        }))
      )
      .then((items: IPickTask[]) => [
        {
          label: "New task",
          taskId: null,
          detail: "Create new task for this time entry"
        },
        ...items
      ])
      .catch(error =>
        window.showErrorMessage(
          "Timer failed to get tasks. Check if you are signed in."
        )
      );
  }

  public getAuthData() {
    const authData = this._storage.get("authData");

    if (authData) {
      return {
        "access-token": authData["access-token"],
        client: authData["client"],
        expiry: authData["expiry"],
        "token-type": authData["token-type"],
        uid: authData["uid"]
      };
    }
  }

  public storeAuthData(data: any) {
    this._storage.put("authData", {
      "access-token": data["access-token"],
      client: data["client"],
      expiry: data["expiry"],
      "token-type": data["token-type"],
      uid: data["uid"]
    });
  }
}
