export function appPath(): string {
  return `https://tmr-app.herokuapp.com/`;
}

export function baseApiPath(): string {
  return "https://whispering-temple-93009.herokuapp.com";
}

export function validateTokenPath(): string {
  return `${baseApiPath()}/auth/validate_token`;
}

export function signInPath(): string {
  return `${baseApiPath()}/auth/sign_in`;
}

export function timeEntriesPath(): string {
  return `${baseApiPath()}/api/time_entries`;
}

export function currentTimeEntryPath(): string {
  return `${baseApiPath()}/api/time_entries/current`;
}

export function tasksPath(): string {
  return `${baseApiPath()}/api/tasks`;
}
