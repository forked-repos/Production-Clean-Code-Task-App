import { EventBuses } from "../../../loaders/loadBuses";
import { TaskEventingChannel } from "./events";

const busMaster = EventBuses.masterEventBus;
const taskEventBus = busMaster.getBus('taskEventBus');

const pushJobForDueDateReminder = taskEventBus.subscribe(TaskEventingChannel.TASK_CREATED, payload => {
    console.log('Pushed job for task due date notification');
});
