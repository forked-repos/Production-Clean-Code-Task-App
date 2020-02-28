import { Task, TaskPriority, TaskCompletionStatus } from './../../../models/domain/taskDomain';
import CreateTaskDTO from './../../../dtos/ingress/createTaskDTO';

export const taskBuilder = (opts?: Partial<Task>): Task => ({
    id: 'id',
    name: 'Task One',
    description: 'A desc.',
    owner: 'owner-id',
    dueDate: new Date().toISOString(),
    priority: TaskPriority.NOT_IMPORTANT,
    completionStatus: TaskCompletionStatus.PENDING,
    ...opts
});

export const createTaskDTOBuilder = (opts?: Partial<CreateTaskDTO>): CreateTaskDTO => ({
    name: 'Task One',
    description: 'A desc.',
    owner: 'owner-id',
    dueDate: new Date().toISOString(),
    priority: 1,
    completionStatus: 'PENDING',
    ...opts
});