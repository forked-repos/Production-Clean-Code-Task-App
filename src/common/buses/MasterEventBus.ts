import { IEventBus, ClassHandlerOrObserver } from './EventBus'

export interface MasterBusDefinition {
    [key: string]: IEventBus<any>;
}

export interface IEventBusMaster<T extends MasterBusDefinition> {
    getBus<K extends keyof T>(busName: K): T[K];

    subscribe<
        BusName extends keyof T,
        BusEvents extends T[BusName] extends IEventBus<infer A> ? A : never,
        EventName extends keyof BusEvents
    >(
        busName: BusName, 
        channel: EventName, 
        handlerOrObserver: ClassHandlerOrObserver<BusEvents[EventName]>
    ): ClassHandlerOrObserver<BusEvents[EventName]>;

    unsubscribe<
        BusName extends keyof T,
        BusEvents extends T[BusName] extends IEventBus<infer A> ? A : never,
        EventName extends keyof BusEvents,
    >(
        busName: BusName, 
        channel: EventName, 
        handlerOrObserver: ClassHandlerOrObserver<BusEvents[EventName]>
    ): void;

    dispatch<
        BusName extends keyof T,
        BusEvents extends T[BusName] extends IEventBus<infer A> ? A : never,
        EventName extends keyof BusEvents
    >(
        busName: BusName, 
        channel: EventName, 
        payload: BusEvents[EventName]
    ): void;
}

export class EventBusMaster<T extends MasterBusDefinition> implements IEventBusMaster<T> {
    public constructor (private busMap: T) {}

    public getBus<K extends keyof T>(busName: K): T[K] {
        return this.busMap[busName];
    }

    public subscribe<
        BusName extends keyof T,
        BusEvents extends T[BusName] extends IEventBus<infer A> ? A : never,
        EventName extends keyof BusEvents
    >(
        busName: BusName, 
        channel: EventName, 
        handler: ClassHandlerOrObserver<BusEvents[EventName]>
    ): ClassHandlerOrObserver<BusEvents[EventName]> {
        this.busMap[busName].subscribe(channel, handler);
        return handler;
    }

    public unsubscribe<
        BusName extends keyof T,
        BusEvents extends T[BusName] extends IEventBus<infer A> ? A : never,
        EventName extends keyof BusEvents
    >(
        busName: BusName, 
        channel: EventName, 
        handler: ClassHandlerOrObserver<BusEvents[EventName]>
    ): void {
        this.busMap[busName].unsubscribe(channel, handler);
    }

    public dispatch<
        BusName extends keyof T,
        BusEvents extends T[BusName] extends IEventBus<infer A> ? A : never,
        EventName extends keyof BusEvents
    >(
        busName: BusName, 
        channel: EventName, 
        payload: BusEvents[EventName]
    ): void {
        this.busMap[busName].dispatch(channel as string, payload);
    }
}