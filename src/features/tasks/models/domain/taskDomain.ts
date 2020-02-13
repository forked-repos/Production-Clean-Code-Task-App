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
    description: string;
    owner: string;
    dueDate: string;
    priority: number;
    completionStatus: string;
}