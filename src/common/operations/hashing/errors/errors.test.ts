import { HashingErrors } from "./errors";
import { BaseErrors, CommonErrors } from './../../../errors/errors';

describe('HashingErrors', () => {
    describe('CouldNotGenerateSaltError', () => {
        test('should be an instance of ApplicationError', () => {
            expect(HashingErrors.CouldNotGenerateSaltError.create()).toBeInstanceOf(BaseErrors.ApplicationError);
        });

        describe('with all data provided', () => {
            test('should have correct properties', () => {
                // Arrange
                const errorMessage = 'Could not create salt.';

                // Act
                const error = HashingErrors.CouldNotGenerateSaltError.create(errorMessage);

                // Assert
                expect(error.name).toEqual('CouldNotGenerateSaltError');
                expect(error.message).toEqual(errorMessage);
            });
        });

        describe('without all data provided', () => {
            test('should have correct properties', () => {
                // Act
                const error = HashingErrors.CouldNotGenerateSaltError.create();

                // Assert
                expect(error.name).toEqual('CouldNotGenerateSaltError');
                expect(error.message).toEqual('Could not generate a salt.')
            });
        });
    });

    describe('CouldNotHashDataError', () => {
        test('should be an instance of ApplicationError', () => {
            expect(HashingErrors.CouldNotHashDataError.create()).toBeInstanceOf(BaseErrors.ApplicationError);
        });

        describe('with all data provided', () => {
            test('should have correct properties', () => {
                // Arrange
                const errorMessage = 'Could not hash data.';

                // Act
                const error = HashingErrors.CouldNotHashDataError.create(errorMessage);

                // Assert
                expect(error.name).toEqual('CouldNotHashDataError');
                expect(error.message).toEqual(errorMessage);
            });
        });

        describe('without all data provided', () => {
            test('should have correct properties', () => {
                // Act
                const error = HashingErrors.CouldNotHashDataError.create();

                // Assert
                expect(error.name).toEqual('CouldNotHashDataError');
                expect(error.message).toEqual('Could not hash the provided data.');
            });
        });
    });

    describe('CouldNotCompareHashesError', () => {
        test('should be an instance of ApplicationError', () => {
            expect(HashingErrors.CouldNotCompareHashesError.create()).toBeInstanceOf(BaseErrors.ApplicationError);
        });

        describe('with all data provided', () => {
            test('should have correct properties', () => {
                // Arrange
                const errorMessage = 'Could not compare both hashes.';

                // Act
                const error = HashingErrors.CouldNotCompareHashesError.create(errorMessage);

                // Assert
                expect(error.name).toEqual('CouldNotCompareHashesError');
                expect(error.message).toEqual(errorMessage);
            });
        });

        describe('without all data provided', () => {
            test('should have correct properties', () => {
                // Act
                const error = HashingErrors.CouldNotCompareHashesError.create();

                // Assert
                expect(error.name).toEqual('CouldNotCompareHashesError');
                expect(error.message).toEqual('Could not compare the provided hashes.');
            });
        });
    });
});