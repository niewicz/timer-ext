export interface ITimeEntry {
  id?: number;
  taskId?: number;
  startAt: string;
  endAt?: string;
  task?: ITask;
  project?: IProject;
  client?: IClient;
}

export interface ITask {
  id?: number;
  projectId?: number;
  clientId?: number;
  title: string;
  price?: number;
  currency?: string;
  totalTime?: number;
  timeEntries?: ITimeEntry;
  project?: IProject;
}

export interface IProject {
  id?: number;
  clientId?: number;
  title: string;
  description?: string;
  client?: IClient;
  taskCounter?: number;
  lastTask?: ITask;
  totalTracked?: number;
  tasks?: ITask;
}

export interface IClient {
  id?: number;
  name: string;
  email?: string;
  autoSend: boolean;
  contactPersonName?: string;
  contactPersonEmail?: string;
  projectsCounter?: number;
  lastProject?: IProject;
  projects?: IProject[];
}

export interface IPickTask {
  taskId: number;
  label: string;
  details: string;
}
