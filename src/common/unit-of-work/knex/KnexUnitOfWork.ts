import Knex from 'knex';

import { IUnitOfWork, IUnitOfWorkFactory } from '../unit-of-work';

/**
 * Represents a consistent business transaction with Knex in which all parts must
 * succeed lest the entire operation be aborted.
 */
export interface IKnexUnitOfWork extends IUnitOfWork {
    trxContext: Knex.Transaction;
}

/**
 * A Unit of Work for Knex.
 */
export class KnexUnitOfWork implements IKnexUnitOfWork {
    public constructor (public readonly trxContext: Knex.Transaction) {}

    public async commit(): Promise<void> {
        await this.trxContext.commit();
    }

    public async rollback(): Promise<void> {
        await this.trxContext.rollback();
    }
}

/**
 * Builds a Unit of Work for Knex.
 */
export class KnexUnitOfWorkFactory implements IUnitOfWorkFactory {
    public constructor (private readonly knexInstance: Knex) {}

    public async create(): Promise<IKnexUnitOfWork> {
        const trxContext = await this.knexInstance.transaction();
        return new KnexUnitOfWork(trxContext);
    }

    public async createUnderScope<T>(operation: (unitOfWork: IUnitOfWork) => Promise<T>): Promise<T> {
        const unitOfWork = await this.create();

        try {
            return await operation(unitOfWork);
        } catch (e) {
            await unitOfWork.rollback();
            throw e;
        }
    }
}