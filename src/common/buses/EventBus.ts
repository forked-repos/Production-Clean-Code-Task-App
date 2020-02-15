// I know, I know. I could have done this with classes. But, functions are fun.

export type Channel = string;
export type Observer<Payload> = (payload: Payload) => void;

export type EventBusInternal = Record<Channel, any>;
export type EventBus = IEventBus<EventBusInternal>;

export interface IEventBus<Events extends EventBusInternal> {
    /**
     * Subscribes a given Observer as a listener for events on the provided Channel.
     * @param channel  The Bus channel upon which to observe events.
     * @param observer The Observer callback to consume events.
     */
    subscribe<K extends keyof Events>(channel: K, observer: Observer<Events[K]>): Observer<Events[K]>;

    /**
     * Removes a given Observer from a given Channel.
     * @param channel  The Bus channel from which to remove the Observer.
     * @param observer The Observer callback to remove from the Channel.
     */
    unsubscribe<K extends keyof Events>(channel: K, observer: Observer<Events[K]>): void;

    /**
     * Dispatches an event with a given payload upon the provided Channel.
     * @param channel The Bus channel upon which to dispatch an event.
     * @param payload The payload to emit.
     */
    dispatch<K extends keyof Events>(channel: K, payload: Events[K]): void;
}

/**
 * Creates an Event Bus for the provided Event Mappings.
 */
export function createEventBus<Events extends Record<Channel, any>>() {
    const EventBus = (): IEventBus<Events> => {
        const observerMap: Map<keyof Events, Observer<any>[]> = new Map();

        return {
            subscribe: <K extends keyof Events>(channel: K, observer: Observer<Events[K]>): Observer<Events[K]> => {
                console.log('subscribe')
                if (!observerMap.has(channel)) {
                    observerMap.set(channel, [observer] as Observer<any>[])
                } else {
                    observerMap.get(channel)!.push(observer);
                }
        
                return observer;
            },
        
            unsubscribe: <K extends keyof Events>(channel: K, targetObserver: Observer<Events[K]>) => {
                if (observerMap.has(channel)) {
                    const observers = observerMap.get(channel)!;
                    const observersWithoutTarget = observers.filter(observer => observer !== targetObserver);
                    observerMap.set(channel, observersWithoutTarget)
                }
            },
        
            dispatch: <K extends keyof Events>(channel: K, payload: Events[K]) => {
                if (observerMap.has(channel)) {
                    const observers = observerMap.get(channel)!;
                    observers.forEach(observer => observer(payload));
                }
            }
        }
    }

    return EventBus();
}

