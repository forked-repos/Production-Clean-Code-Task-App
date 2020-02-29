import * as uuid from 'uuid';

export default interface OutboxMessage {
    outbox_id: string;

    /**
     * The domain upon which events are raised.
     */
    operational_domain: string;

    /**
     * The channel upon which events are dispatched.
     */
    operational_channel: string;

    /**
     * When the message is processed by the relay.
     */
    processed_date: string | null;

    /**
     * Serialized JSON payload.
     */
    payload: string;
}

interface IOutboxProps {
    operationalDomain: string;
    operationalChannel: string;
    payload: any
}

export const outboxFactory = (outboxProps: IOutboxProps, id?: string): OutboxMessage => {
    return {
        outbox_id: id ? id : uuid.v4(),
        operational_domain: outboxProps.operationalDomain,
        operational_channel: outboxProps.operationalChannel,
        processed_date: null,
        payload: JSON.stringify(outboxProps.payload)
    }
}