import * as Knex from 'knex';

import { IEventBusMaster } from "../buses/MasterEventBus";
import { IEventBus } from "../buses/EventBus";

import { UserEvents } from "../../features/users/pub-sub/events";
import { TaskEvents } from "../../features/tasks/observers/events";

import OutboxMessage from './../outbox/outbox';
import { EventBuses } from './../../loaders/loadBuses';
import { OperationalDomain } from './../app/domains/operationalDomains';

const mapOperationalDomainToBusName = (domain: OperationalDomain) => {
    if (Object.keys(EventBuses.domainBusNameMap).indexOf(domain) > -1) {
        return EventBuses.domainBusNameMap[domain];
    } else {
        throw new Error();
    }
}

/**
 * Provides a Transactional Outbox Message Relay.
 * Returned function is Cron-Job scheduled.
 */
export const messageRelayProvider = (
    knexInstance: Knex,
    masterEventBus: IEventBusMaster<{
        userEventBus: IEventBus<UserEvents>,
        taskEventBus: IEventBus<TaskEvents>
    }>
) => () => {
    knexInstance.transaction(async trx => {
        const sqlGet = `
            SELECT
            outbox_id, operational_domain, operational_channel, payload
            FROM outbox
            WHERE processed_date IS NULL
            LIMIT 100;
        `;

        const messages: OutboxMessage[] = (await trx.raw(sqlGet)).rows;

        for (let message of messages) {
            const { outbox_id, operational_channel, operational_domain, payload } = message;

            const busName = mapOperationalDomainToBusName(operational_domain as OperationalDomain);

            // Completely lost type safety. I miss C#.
            masterEventBus.getBus(busName as any).dispatch(operational_channel, JSON.parse(payload));
    
            const sqlInsert = `
                UPDATE outbox 
                SET processed_date = CURRENT_TIMESTAMP
                WHERE outbox_id = '${outbox_id}';
            `;
    
            await trx.raw(sqlInsert);
        }

        await trx.commit();
    });
}