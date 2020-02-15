import { createEventBus } from './../common/buses/EventBus';
import { UserEvents, UserEventingChannel } from './../features/users/observers/events';
import { EventBusMaster } from './../common/buses/MasterEventBus';

export namespace EventBuses {
    export const userEventBus = createEventBus<UserEvents>();

    console.log('created bus')

    export const masterEventBus = new EventBusMaster({
        userEventBus
    });
};




