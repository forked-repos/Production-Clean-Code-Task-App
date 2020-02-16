import { createEventBus, EventBusInternal, EventBus, ChannelPayload } from './../common/buses/EventBus';
import { UserEvents, UserEventingChannel } from './../features/users/observers/events';
import { EventBusMaster } from './../common/buses/MasterEventBus';
import { TaskEvents } from '../features/tasks/observers/events';

export namespace EventBuses {
    export const userEventBus = createEventBus<UserEvents>();
    export const taskEventBus = createEventBus<TaskEvents>();

    export const masterEventBus = new EventBusMaster({
        userEventBus,
        taskEventBus
    });
};




