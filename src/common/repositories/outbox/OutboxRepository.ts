import * as Knex from 'knex';

import { BaseKnexRepository } from './../knex/BaseKnexRepository';
import { IUnitOfWork, IUnitOfWorkCapable } from './../../unit-of-work/unit-of-work';
import { KnexUnitOfWork } from '../../unit-of-work/knex/KnexUnitOfWork';
import OutboxMessage from './../../outbox/outbox';
import { IRepository } from './../repository';
import uuid = require('uuid');

export interface IOutboxRepository extends IRepository<OutboxMessage>, IUnitOfWorkCapable {
    addOutboxMessage(outboxMessage: OutboxMessage): Promise<void>;
}

export default class OutboxRepository extends BaseKnexRepository implements IOutboxRepository {
    private outboxMessages: OutboxMessage[] = [];

    private readonly dbContext: Knex | Knex.Transaction;

    public constructor (
        knexInstance: Knex | Knex.Transaction
    ) {
        super();
        this.dbContext = knexInstance;
    }
    
    public async addOutboxMessage(outboxMessage: OutboxMessage): Promise<void> {
        return this.handleErrors(async () => {
            await this.dbContext<OutboxMessage>('outbox').insert(outboxMessage);
        });
    }

    public forUnitOfWork(unitOfWork: IUnitOfWork): this {
        return new OutboxRepository((unitOfWork as KnexUnitOfWork).trxContext) as this;
    }

    public exists(t: OutboxMessage): Promise<boolean> {
        throw new Error('Not implemented');
    }

    public existsById(id: string): Promise<boolean> {
        throw new Error('Not implemented');
    }

    public nextIdentity() {
        return uuid.v4();
    }
}