export function appPath(): string {
  return `http://localhost:4200`;
}

export function baseApiPath(): string {
  return "http://localhost:3000";
}

export function validateTokenPath(): string {
  return `${baseApiPath()}/auth/validate_token`;
}

export function signInPath(): string {
  return `${baseApiPath()}/auth/sign_in`;
}

export function signOutPath(): string {
  return `${baseApiPath()}/auth/sign_out`;
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
