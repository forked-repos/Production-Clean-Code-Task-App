import { mock, instance, verify, when } from 'ts-mockito';

import Knex from 'knex';
import { KnexUnitOfWorkFactory, KnexUnitOfWork } from "./KnexUnitOfWork";

describe('KnexUnitOfWork', () => {
    test('should have all required properties', () => {
        // Act
        const knexUoW = new KnexUnitOfWork({} as Knex.Transaction);

        // Assert
        expect(knexUoW.trxContext).not.toBe(undefined);
    });

    test('should call commit', async () => {
        // Arrange
        const trxContextMock = mock<Knex.Transaction>();
        const knexUoW = new KnexUnitOfWork(instance(trxContextMock));

        // Act
        await knexUoW.commit();

        // Assert
        verify(trxContextMock.commit()).once();
    });

    test('should call rollback', async () => {
        // Arrange
        const trxContextMock = mock<Knex.Transaction>();
        const knexUoW = new KnexUnitOfWork(instance(trxContextMock));

        // Act
        await knexUoW.rollback();

        // Assert
        verify(trxContextMock.rollback()).once();
    });
});

describe('KnexUnitOfWorkFactory', () => {
    describe('create', () => {
        test('should create a KnexUnitOfWork with the correct properties', async () => {
            // Arrange
            const knex = mock<Knex>();
            const knexUoWFactory = new KnexUnitOfWorkFactory(instance(knex));
            when(knex.transaction()).thenResolve({} as Knex.Transaction);

            // Act
            const knexUnitOfWork = await knexUoWFactory.create();

            // Assert
            expect(knexUnitOfWork).toBeInstanceOf(KnexUnitOfWork);
            expect(knexUnitOfWork.trxContext).not.toBe(undefined);
            expect(knexUnitOfWork.trxContext).toEqual({});
        });
    });     

    describe('createUnderScope', () => {
        test('should call the callback and pass it the UoW', async () => {
            // Arrange
            const fakeKnex = FakeKnex();
            const knexUoWFactory = new KnexUnitOfWorkFactory(fakeKnex);
            const operationMock = jest.fn();

            // Act
            await knexUoWFactory.createUnderScope(operationMock);

            // Assert
            expect(operationMock).toHaveBeenCalledTimes(1);
            expect(JSON.stringify(operationMock.mock.calls[0][0])).toEqual(JSON.stringify(new KnexUnitOfWork(await fakeKnex.transaction())));
            expect(fakeKnex.didRollback).toBe(false);
        });
        
        test('should rollback and throw if the callback errors out', async () => {
            // Arrange
            const fakeKnex = FakeKnex();
            const knexUoWFactory = new KnexUnitOfWorkFactory(fakeKnex);
            const operationMock = jest.fn().mockRejectedValue('rejection');

            // Act, Assert
            await expect(knexUoWFactory.createUnderScope(operationMock))
                .rejects
                .toEqual('rejection')

            // Assert
            expect(operationMock).toHaveBeenCalledTimes(1);
            expect(fakeKnex.didRollback).toBe(true);
        }); 
    });
    
});

interface IFakeKnex {
    didCommit: boolean;
    didRollback: boolean;
}

const FakeKnex = () => {
    return {
        didCommit: false,
        didRollback: false,

        async transaction() { 
            return {
                commit: () => {
                    this.didCommit = true;
                },

                rollback: () => {
                    this.didRollback = true;
                }
            }
        }
    } as IFakeKnex as Knex & IFakeKnex;
}