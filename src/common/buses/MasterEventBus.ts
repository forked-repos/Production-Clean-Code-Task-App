import { EventBus, IEventBus, Observer, EventBusInternal } from './EventBus';
import { EventBuses } from '../../loaders/loadBuses';

export interface IEventBusMaster<T extends { [key: string]: IEventBus<any> }> {
    getBus<K extends keyof T>(busName: K): T[K];
    
    subscribe<
        K extends keyof T,
        Y extends T[K] extends IEventBus<infer A> ? keyof A : never,
        U extends T[K] extends IEventBus<infer A> ? A : never
    >(busName: K, channel: Y, observer: Observer<U[Y]>): Observer<U[Y]>;

    unsubscribe<
        K extends keyof T,
        Y extends T[K] extends IEventBus<infer A> ? keyof A : never,
        U extends T[K] extends IEventBus<infer A> ? A : never
    >(busName: K, channel: Y, observer: Observer<U[Y]>): void;

    dispatch<
        K extends keyof T,
        Y extends T[K] extends IEventBus<infer A> ? keyof A : never,
        U extends T[K] extends IEventBus<infer A> ? A : never
    >(busName: K, channel: Y, payload: U[Y]): void;
}

/**
 * A manager to make working with multiple buses easier. This can be viewed as a 
 * Master Event Bus.
 */
export class EventBusMaster<T extends { [key: string]: IEventBus<any> }> implements IEventBusMaster<T> {
    public constructor (private busMap: T) {}

    public getBus<K extends keyof T>(busName: K): T[K] {
        return this.busMap[busName];
    }

    public subscribe<
        K extends keyof T,
        Y extends T[K] extends IEventBus<infer A> ? keyof A : never,
        U extends T[K] extends IEventBus<infer A> ? A : never
    >(busName: K, channel: Y, observer: Observer<U[Y]>): Observer<U[Y]> {
        this.busMap[busName].subscribe(channel, observer);
        return observer;
    }

    public unsubscribe<
        K extends keyof T,
        Y extends T[K] extends IEventBus<infer A> ? keyof A : never,
        U extends T[K] extends IEventBus<infer A> ? A : never
    >(busName: K, channel: Y, observer: Observer<U[Y]>): void {
        this.busMap[busName].unsubscribe(channel, observer);
    }

    public dispatch<
        K extends keyof T,
        Y extends T[K] extends IEventBus<infer A> ? keyof A : never,
        U extends T[K] extends IEventBus<infer A> ? A : never
    >(busName: K, channel: Y, payload: U[Y]) {
        this.busMap[busName].dispatch(channel, payload);
    }
}