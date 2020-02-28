import { Task, TaskPriority, TaskCompletionStatus } from './../../../models/domain/taskDomain';

export const taskBuilder = (opts?: Partial<Task>): Task => ({
    id: 'id',
    name: 'Complete DDD/CQRS/ES Course',
    description: 'Available on Pluralsight. Inquirely competitor.',
    owner: 'user-owner',
    dueDate: new Date().toISOString(),
    priority: TaskPriority.IMPORTANT,
    completionStatus: TaskCompletionStatus.PENDING,
    ...opts
});
