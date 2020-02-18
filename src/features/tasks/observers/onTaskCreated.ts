import { TaskEventingChannel, TaskCreatedEvent } from "./events";
import { IEventHandler } from "../../../common/buses/EventBus";
import { IEventBusEventHandler } from "../../../loaders/loadDecorator";
import { ITaskQueueService } from './../../../common/operations/queueing/services/BullTaskQueueService';

@IEventBusEventHandler.registerHandler('taskEventBus', TaskEventingChannel.TASK_CREATED)
export default class TaskCreatedHandler implements IEventHandler<TaskCreatedEvent> {
    public constructor (
        private readonly taskQueueService: ITaskQueueService
    ) {}

    public async handleEvent(event: TaskCreatedEvent) {
        this.taskQueueService.addTaskNotification(event.name, event.dueDate ? new Date(event.dueDate) : undefined)
    }
}