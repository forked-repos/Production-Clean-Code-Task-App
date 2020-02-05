import { AuthorizationErrors } from "./errors";
import { BaseErrors, ErrorCausationReason, ErrorCode } from "../../../common/errors/errors";

describe('AuthorizationErrors', () => {
    describe('AuthorizationError', () => {
        test('should be an instance of DomainError', () => {
            expect(AuthorizationErrors.AuthorizationError.create()).toBeInstanceOf(BaseErrors.DomainError)
        });

        test('should have correct properties', () => {
            // Act
            const error = AuthorizationErrors.AuthorizationError.create();

            // Assert
            expect(error.serializeError).toBeInstanceOf(Function);
            expect(error.errorCausationReason).toEqual(ErrorCausationReason.NOT_AUTHORIZED);
            expect(error.name).toEqual('AuthorizationError');
            expect(error.message).not.toBe(undefined);
        });

        describe('with all data provided', () => {
            test('should serialize correctly', () => {
                // Arrange
                const domain = 'User';
                const message = ' A message';
                const reason = 'AuthorizationError';

                // Act
                const error = AuthorizationErrors.AuthorizationError.create(domain, message);

                // Assert
                expect(error.serializeError()).toEqual({
                    errorCode: ErrorCode.AUTHORIZATION_ERROR,
                    domain,
                    reason,
                    message
                });
            });
        });

        describe('without all data provided', () => {
            test('should serialize correctly', () => {
                // Act
                const error = AuthorizationErrors.AuthorizationError.create();

                // Assert
                expect(error.serializeError()).toEqual({
                    errorCode: ErrorCode.AUTHORIZATION_ERROR,
                    domain: 'Unknown',
                    reason: 'AuthorizationError',
                    message: 'You are not authorized to view this resource.'
                })
            });
        });
    });
});