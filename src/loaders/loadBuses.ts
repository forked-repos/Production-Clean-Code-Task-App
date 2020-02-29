import { createEventBus, IEventBus } from './../common/buses/EventBus';
import { UserEvents } from '../features/users/pub-sub/events';
import { EventBusMaster } from './../common/buses/MasterEventBus';
import { TaskEvents } from '../features/tasks/observers/events';
import { OperationalDomain } from '../common/app/domains/operationalDomains';

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

    export const domainBusNameMap: { [key in OperationalDomain]: keyof BusMap } = {
        [OperationalDomain.USERS]: 'userEventBus',
        [OperationalDomain.TASKS]: 'taskEventBus'
    }

    export const masterEventBus = new EventBusMaster(busMap);
};






