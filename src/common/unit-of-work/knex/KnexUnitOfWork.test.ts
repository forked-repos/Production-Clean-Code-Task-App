import { mock, instance, verify } from 'ts-mockito';

import Knex from 'knex';
import { KnexUnitOfWork } from "./KnexUnitOfWork";

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
