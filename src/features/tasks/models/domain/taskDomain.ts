import * as uuid from 'uuid';

export enum TaskPriority {
    NOT_IMPORTANT = 1,
    KEEP_NOTICE,
    IMPORTANT,
    CRITICAL
}

export enum TaskCompletionStatus {
    COMPLETE = 'COMPLETE',
    PENDING = 'PENDING'
}

export interface Task {
    id: string;
    name: string;
    description?: string;
    owner: string;
    dueDate?: Date;
    priority: number;
    completionStatus: string;
}