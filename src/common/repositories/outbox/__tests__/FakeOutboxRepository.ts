import { FakeBaseRepository } from './../../__tests__/FakeBaseRepository';
import { IOutboxRepository } from './../OutboxRepository';
import { IUnitOfWork } from './../../../unit-of-work/unit-of-work';
import OutboxMessage from './../../../outbox/outbox';

export class FakeOutboxRepository extends FakeBaseRepository implements IOutboxRepository {
    public outboxMessages: OutboxMessage[] = [];

    async addOutboxMessage(outboxMessage: OutboxMessage): Promise<void> {
        this.outboxMessages.push(outboxMessage);
    }    

    getOutboxMessages() {
        return this.outboxMessages;
    }
    
    forUnitOfWork(unitOfWork: IUnitOfWork): this {
        return this;
    }

    nextIdentity() {
        return 'id';
    }

    async exists(t: OutboxMessage): Promise<boolean> {
        return !!this.outboxMessages.filter(msg => msg == t)[0];
    }

    async existsById(id: string): Promise<boolean> {
        throw new Error('Not implemented');
    }
}