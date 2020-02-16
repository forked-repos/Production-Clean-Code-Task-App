
export enum TaskEventingChannel {
    TASK_CREATED = 'taskCreated',
    TASK_WITH_DUE_DATE = 'taskWithDueDate'
}

export type TaskEvents = {
    [TaskEventingChannel.TASK_CREATED]: {
        id: string;
        name: string;
        dueDate?: string;
    },

    [TaskEventingChannel.TASK_WITH_DUE_DATE]: {

    }
}