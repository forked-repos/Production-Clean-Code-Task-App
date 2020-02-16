// I know, I know. I could have done this with classes. But, functions are fun.

export interface IEvent {
    [key: string]: any
}

export type Observer<TEvent extends IEvent> = (payload: TEvent) => void;

export type ClassHandlerOrObserver<TEvent extends IEvent> = Observer<TEvent> | IEventHandler<TEvent>;

export interface IEventHandler<TEvent extends IEvent> {
    handleEvent(event: TEvent): void;
}

export interface BusDefinition {
    [key: string]: IEvent;
}

export interface IEventBus<Events extends BusDefinition> {
    /**
     * Subscribes a given handler or observer as a listener for events on the provided Channel.
     * @param channel           The Bus channel upon which to consume events.
     * @param handlerOrObserver The handler/observer callback to consume events.
     */
    subscribe<K extends keyof Events>(channel: K, handlerOrObserver: ClassHandlerOrObserver<Events[K]>): ClassHandlerOrObserver<Events[K]>;

    /**
     * Removes a given handler/observer from a given Channel.
     * @param channel           The Bus channel from which to remove the Observer.
     * @param handlerOrObserver The handler/observer callback to remove from the Channel.
     */
    unsubscribe<K extends keyof Events>(channel: K, handlerOrObserver: ClassHandlerOrObserver<Events[K]>): void;

     /**
     * Dispatches an event with a given payload upon the provided Channel.
     * @param channel The Bus channel upon which to dispatch an event.
     * @param payload The payload to emit.
     */
    dispatch<K extends keyof Events>(channel: K, payload: Events[K]): void;
}

/**
 * Creates an Event Bus.
 */
export function createEventBus<Events extends BusDefinition>() {
    const EventBus = (): IEventBus<Events> => {
        const listenerMap: Map<keyof Events, (Observer<IEvent> | IEventHandler<IEvent>)[]> = new Map();

        return {
            subscribe: <K extends keyof Events>(channel: K, handlerOrObserver: ClassHandlerOrObserver<Events[K]>): ClassHandlerOrObserver<Events[K]> => {
                if (!listenerMap.has(channel)) {
                    listenerMap.set(channel, [handlerOrObserver] as ClassHandlerOrObserver<IEvent>[]);
                } else {
                    listenerMap.get(channel)!.push(handlerOrObserver as ClassHandlerOrObserver<IEvent>);
                }
                
                return handlerOrObserver;
            },

            unsubscribe: <K extends keyof Events>(channel: K, targetHandlerOrObserver: ClassHandlerOrObserver<Events[K]>): void => {
                if (listenerMap.has(channel)) {
                    const handlers = listenerMap.get(channel)!;
                    const handlersWithoutTarget = handlers.filter(handlerOrObserver => handlerOrObserver !== targetHandlerOrObserver);
                    listenerMap.set(channel, handlersWithoutTarget);
                }
            },

            dispatch<K extends keyof Events>(channel: K, payload: Events[K]): void {
                if (listenerMap.has(channel)) {
                    const handlers = listenerMap.get(channel)!;
                    handlers.forEach(handler => {
                        if (typeof handler === 'function') {
                            handler(payload)
                        } else {
                            handler.handleEvent(payload);
                        }
                    });
                }
            }
        }
    }

    return EventBus();
}