import { TokenErrors } from "./errors";
import { BaseErrors, CommonErrors } from './../../../errors/errors';

describe('TokenErrors', () => {
    describe('CouldNotGenerateTokenError', () => {
        test('should be an instance of ApplicationError', () => {
            expect(TokenErrors.CouldNotGenerateTokenError.create()).toBeInstanceOf(BaseErrors.ApplicationError);
        });

        describe('with all data provided', () => {
            test('should have correct properties', () => {
                // Arrange
                const errorMessage = 'Could not generate token.';

                // Act
                const error = TokenErrors.CouldNotGenerateTokenError.create(errorMessage);

                // Assert
                expect(error.name).toEqual('CouldNotGenerateTokenError');
                expect(error.message).toEqual(errorMessage);
            });
        });

        describe('without all data provided', () => {
            test('should have correct properties', () => {
                // Act
                const error = TokenErrors.CouldNotGenerateTokenError.create();

                // Assert
                expect(error.name).toEqual('CouldNotGenerateTokenError');
                expect(error.message).toEqual('Could not generate a token.')
            });
        });
    });

    describe('CouldNotDecodeTokenError', () => {
        test('should be an instance of ApplicationError', () => {
            expect(TokenErrors.CouldNotDecodeTokenError.create()).toBeInstanceOf(BaseErrors.ApplicationError);
        });

        describe('with all data provided', () => {
            test('should have correct properties', () => {
                // Arrange
                const errorMessage = 'Could not decode token data.';

                // Act
                const error = TokenErrors.CouldNotDecodeTokenError.create(errorMessage);

                // Assert
                expect(error.name).toEqual('CouldNotDecodeTokenError');
                expect(error.message).toEqual(errorMessage);
            });
        });

        describe('without all data provided', () => {
            test('should have correct properties', () => {
                // Act
                const error = TokenErrors.CouldNotDecodeTokenError.create();

                // Assert
                expect(error.name).toEqual('CouldNotDecodeTokenError');
                expect(error.message).toEqual('Could not decode token.');
            });
        });
    });

    describe('TokenExpiredError', () => {
        test('should be an instance of ApplicationError', () => {
            expect(TokenErrors.TokenExpiredError.create(new Date())).toBeInstanceOf(BaseErrors.ApplicationError);
        });

        describe('with all data provided', () => {
            test('should have correct properties', () => {
                // Arrange
                const errorMessage = 'The token has expired.';
                const expiredAt = new Date();

                // Act
                const error = TokenErrors.TokenExpiredError.create(expiredAt, errorMessage);

                // Assert
                expect(error.name).toEqual('TokenExpiredError');
                expect(error.message).toEqual(errorMessage);
                expect(error.expiredAt).toEqual(expiredAt);
            });
        });

        describe('without all data provided', () => {
            test('should have correct properties', () => {
                // Arrange
                const expiredAt = new Date();

                // Act
                const error = TokenErrors.TokenExpiredError.create(expiredAt);

                // Assert
                expect(error.name).toEqual('TokenExpiredError');
                expect(error.message).toEqual('The token is expired.');
                expect(error.expiredAt).toEqual(expiredAt);
            });
        });
    });
});