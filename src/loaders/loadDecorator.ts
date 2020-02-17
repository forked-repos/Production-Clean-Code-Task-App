import { IEventHandler, IEventBus } from "../common/buses/EventBus";
import { EventBuses } from "./loadBuses";

export namespace IEventBusEventHandler {
    export type Constructor<T> = {
        new (...args: any[]): T;
        readonly prototype: T;
    };

    // Classes that implement IEventHandler<T>
    const implementations: Map<{ 
        busName: keyof EventBuses.BusMap, 
        channel: EventBuses.BusMap[keyof EventBuses.BusMap] extends IEventBus<infer A> ? keyof A : never
    }, Constructor<IEventHandler<any>>[]> = new Map();

    export const getEventHandlerImplementations = () => implementations;

    export const registerHandler = <
        BusName extends keyof EventBuses.BusMap,
        BusEvents extends EventBuses.BusMap[BusName] extends IEventBus<infer A> ? A : never,
        EventName extends keyof BusEvents
    >(
        busName: BusName, 
        channel: EventName
    ) => {
        return <T extends Constructor<IEventHandler<any>>>(ctor: T): T => {
            if (implementations.has({ busName, channel: channel as any })) {
                implementations.get({ busName, channel: channel as any })!.push(ctor);
            } else {
                implementations.set({ busName, channel: channel as any }, [ctor]);
            }

            return ctor;
        }
    }
}