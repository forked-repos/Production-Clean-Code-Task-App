import { BaseErrors, CommonErrors, ErrorCode, ErrorCausationReason, ApplicationErrors } from "./errors";

describe('BaseErrors.BaseError', () => {
    test('should extend Error', () => {
        // Act, Assert
        expect(new BaseErrors.BaseError('')).toBeInstanceOf(Error)
    });

    test('should have required properties', () => {
        // Arrange
        const message = 'Unknown error';

        // Act
        const baseError = new BaseErrors.BaseError(message);

        // Assert
        expect(baseError.message).toEqual(message);
        expect(baseError.name).toEqual('BaseError');
    });
});

describe('CommonErrors', () => {
    describe('ValidationError', () => {
        test('should be an instance of DomainError', () => {
            expect(CommonErrors.ValidationError.create()).toBeInstanceOf(BaseErrors.DomainError)
        });
        
        test('should have correct properties', () => {
            // Act
            const error = CommonErrors.ValidationError.create();

            // Assert
            expect(error.serializeError).toBeInstanceOf(Function)
            expect(error.errorCausationReason).toEqual(ErrorCausationReason.BAD_DATA_PROVIDED);
            expect(error.name).toEqual('ValidationError');
            expect(error.message).not.toBe(undefined);
        });

        describe('with all data provided', () => {
            test('should serialize correctly', () => {
                // Arrange
                const domain = 'User';
                const message = 'A message';
                const reason = 'ValidationError';
    
                // Act
                const error = CommonErrors.ValidationError.create(domain, message);
    
                // Assert
                expect(error.serializeError()).toEqual({
                    errorCode: ErrorCode.VALIDATION_ERROR,
                    domain,
                    reason,
                    message
                });
            });
        });

        describe('without all data provided', () => {
            test('should serialize correctly', () => {
                // Act
                const error = CommonErrors.ValidationError.create();

                // Assert
                expect(error.serializeError()).toEqual({
                    errorCode: ErrorCode.VALIDATION_ERROR,
                    domain: 'Unknown',
                    reason: 'ValidationError',
                    message: 'Validation failed for the requested operation.'
                });
            });
        });
    });

    describe('NotFoundError', () => {
        test('should be an instance of DomainError', () => {
            expect(CommonErrors.NotFoundError.create()).toBeInstanceOf(BaseErrors.DomainError)
        });
        
        test('should have correct properties', () => {
            // Act
            const error = CommonErrors.NotFoundError.create();

            // Assert
            expect(error.serializeError).toBeInstanceOf(Function)
            expect(error.errorCausationReason).toEqual(ErrorCausationReason.DATA_NON_EXISTENT);
            expect(error.name).toEqual('NotFoundError');
            expect(error.message).not.toBe(undefined);
        });

        describe('with all data provided', () => {
            test('should serialize correctly', () => {
                // Arrange
                const domain = 'User';
                const message = 'A message';
                const reason = 'NotFoundError';
    
                // Act
                const error = CommonErrors.NotFoundError.create(domain, message);
    
                // Assert
                expect(error.serializeError()).toEqual({
                    errorCode: ErrorCode.NOT_FOUND_ERROR,
                    domain,
                    reason,
                    message
                });
            });
        });

        describe('without all data provided', () => {
            test('should serialize correctly', () => {
                // Act
                const error = CommonErrors.NotFoundError.create();

                // Assert
                expect(error.serializeError()).toEqual({
                    errorCode: ErrorCode.NOT_FOUND_ERROR,
                    domain: 'Unknown',
                    reason: 'NotFoundError',
                    message: 'The requested resource could not be found.'
                });
            });
        });
    });
});

describe('ApplicationErrors', () => {
    describe('UnexpectedError', () => {
        test('should be an instance of DomainError', () => {
            expect(ApplicationErrors.UnexpectedError.create()).toBeInstanceOf(BaseErrors.DomainError)
        });
        
        test('should have correct properties', () => {
            // Act
            const error = ApplicationErrors.UnexpectedError.create();

            // Assert
            expect(error.serializeError).toBeInstanceOf(Function)
            expect(error.errorCausationReason).toEqual(ErrorCausationReason.UNKNOWN_ERROR);
            expect(error.name).toEqual('UnexpectedError');
            expect(error.message).not.toBe(undefined);
        });

        describe('with all data provided', () => {
            test('should serialize correctly', () => {
                // Arrange
                const domain = 'User';
                const message = 'A message';
                const reason = 'UnexpectedError';
    
                // Act
                const error = ApplicationErrors.UnexpectedError.create(message);
    
                // Assert
                expect(error.serializeError()).toEqual({
                    errorCode: ErrorCode.UNEXPECTED_ERROR,
                    domain: 'Unknown',
                    reason,
                    message
                });
            });
        });

        describe('without all data provided', () => {
            test('should serialize correctly', () => {
                // Act
                const error = ApplicationErrors.UnexpectedError.create();

                // Assert
                expect(error.serializeError()).toEqual({
                    errorCode: ErrorCode.UNEXPECTED_ERROR,
                    domain: 'Unknown',
                    reason: 'UnexpectedError',
                    message: 'An unexpected error has occurred.'
                });
            });
        });
    });
});
