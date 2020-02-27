import * as uuid from 'uuid';

export default interface OutboxMessage {
    outbox_id: string;

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
        outbox_id: id ? id : uuid.v4(),
        domain,
        payload: JSON.stringify(payload)
    }
}