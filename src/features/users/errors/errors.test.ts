import { CreateUserErrors } from "./errors";
import { BaseErrors, ErrorCausationReason } from './../../../common/errors/errors';

describe('CreateUserErrors', () => {
    describe('UsernameTakenError', () => {
        test('should be an instance of DomainError', () => {
            expect(CreateUserErrors.UsernameTakenError.create()).toBeInstanceOf(BaseErrors.DomainError);
        });

        test('should have correct properties', () => {
            // Act
            const error = CreateUserErrors.UsernameTakenError.create();

            // Assert
            expect(error.serializeError).toBeInstanceOf(Function);
            expect(error.errorCausationReason).toEqual(ErrorCausationReason.BAD_DATA_PROVIDED);
            expect(error.name).toEqual('UsernameTakenError');
            expect(error.message).not.toBe(undefined);
        });

        test('should serialize correctly', () => {
            // Act
            const error = CreateUserErrors.UsernameTakenError.create();

            // Assert
            expect(error.serializeError()).toEqual({
                errorCode: CreateUserErrors.ErrorCode.USERNAME_TAKEN_ERROR,
                domain: 'Users',
                message: 'The provided username is already in use.',
                reason: 'UsernameTakenError'
            });
        });
    });

    describe('EmailTakenError', () => {
        test('should be an instance of DomainError', () => {
            expect(CreateUserErrors.EmailTakenError.create()).toBeInstanceOf(BaseErrors.DomainError)
        });

        test('should have correct properties', () => {
            // Act
            const error = CreateUserErrors.EmailTakenError.create();

            // Assert
            expect(error.serializeError).toBeInstanceOf(Function);
            expect(error.errorCausationReason).toEqual(ErrorCausationReason.BAD_DATA_PROVIDED);
            expect(error.name).toEqual('EmailTakenError');
            expect(error.message).not.toBe(undefined);
        });

        test('should serialize correctly', () => {
            // Act
            const error = CreateUserErrors.EmailTakenError.create();

            // Assert
            expect(error.serializeError()).toEqual({
                errorCode: CreateUserErrors.ErrorCode.EMAIL_TAKEN_ERROR,
                domain: 'Users',
                message: 'The provided email address is already in use.',
                reason: 'EmailTakenError'
            });
        });
    });
});
