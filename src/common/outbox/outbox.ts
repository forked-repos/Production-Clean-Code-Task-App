import * as uuid from 'uuid';

export default interface OutboxMessage {
    id: string;

    /**
     * The domain upon which events are dispatched.
     */
    domain: string;

    /**
     * Serialized JSON payload.
     */
    payload: string;
}

export const outboxFactory = (domain: string, payload: any, id?: string): OutboxMessage => {
    return {
        id: id ? id : uuid.v4(),
        domain,
        payload: JSON.stringify(payload)
    }
}