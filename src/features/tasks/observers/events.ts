
import { IEvent } from './../../../common/buses/EventBus';
export enum TaskEventingChannel {
    TASK_CREATED = 'taskCreated',
    TASK_WITH_DUE_DATE = 'taskWithDueDate'
}

export interface TaskDataEvent extends IEvent {
    id: string;
    name: string;
    dueDate?: string;
}

export interface TaskCreatedEvent extends TaskDataEvent {}

export type TaskEvents = {
    [TaskEventingChannel.TASK_CREATED]: TaskCreatedEvent,

    [TaskEventingChannel.TASK_WITH_DUE_DATE]: {

    }
}