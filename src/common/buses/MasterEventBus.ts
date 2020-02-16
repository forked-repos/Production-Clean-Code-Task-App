import { EventBus, IEventBus, Observer, EventBusInternal, Channel } from './EventBus';
import { EventBuses } from '../../loaders/loadBuses';

interface BusDefinition {
    [key: string]: IEventBus<any>
}

export interface IEventBusMaster<T extends BusDefinition>  {
    getBus<K extends keyof T>(busName: K): T[K];
    
    subscribe<
        K extends keyof T,
        Y extends T[K] extends IEventBus<infer A> ? A : never,
        U extends keyof Y
    >(busName: K, channel: U, observer: Observer<Y[U]>): Observer<Y[U]>;

    unsubscribe<
        K extends keyof T,
        Y extends T[K] extends IEventBus<infer A> ? A : never,
        U extends keyof Y
    >(busName: K, channel: U, observer: Observer<Y[U]>): void;

    dispatch<
        K extends keyof T,
        Y extends T[K] extends IEventBus<infer A> ? A : never,
        U extends keyof Y
    >(busName: K, channel: U, payload: Y[U]): void;
}

/**
 * A master bus to make working with multiple buses easier.
 */
export class EventBusMaster<T extends BusDefinition> implements IEventBusMaster<T> {
    public constructor (private busMap: T) {}

    public getBus<K extends keyof T>(busName: K): T[K] {
        return this.busMap[busName];
    }

    public subscribe<
        K extends keyof T,
        Y extends T[K] extends IEventBus<infer A> ? A : never,
        U extends keyof Y
    >(busName: K, channel: U, observer: Observer<Y[U]>): Observer<Y[U]> {
        this.busMap[busName].subscribe(channel, observer);
        return observer;
    }

    public unsubscribe<
        K extends keyof T,
        Y extends T[K] extends IEventBus<infer A> ? A : never,
        U extends keyof Y
    >(busName: K, channel: U, observer: Observer<Y[U]>): void {
        this.busMap[busName].unsubscribe(channel, observer);
    }

    public dispatch<
        K extends keyof T,
        Y extends T[K] extends IEventBus<infer A> ? A : never,
        U extends keyof Y
    >(busName: K, channel: U, payload: Y[U]) {
        this.busMap[busName].dispatch(channel, payload);
    }
}