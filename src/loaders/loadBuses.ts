import { createEventBus, IEventHandler, IEventBus, BusDefinition } from './../common/buses/EventBus';
import { UserEvents, UserEventingChannel } from '../features/users/handlers/events';
import { EventBusMaster } from './../common/buses/MasterEventBus';
import { TaskEvents } from '../features/tasks/observers/events';

export namespace EventBuses {
    export const userEventBus = createEventBus<UserEvents>();
    export const taskEventBus = createEventBus<TaskEvents>();

    export type BusMap = {
        userEventBus: IEventBus<UserEvents>,
        taskEventBus: IEventBus<TaskEvents>
    }

    export const busMap: BusMap = {
        userEventBus,
        taskEventBus
    };

    export const masterEventBus = new EventBusMaster(busMap);
};






