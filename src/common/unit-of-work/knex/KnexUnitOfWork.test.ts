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
});