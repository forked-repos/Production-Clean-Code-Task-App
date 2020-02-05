import { mock, instance, when, anything, spy } from 'ts-mockito';
import bcryptjs from 'bcryptjs';

// SUT:
import BcryptAdapter, { IHashHandler } from "./BcryptAdapter";
import { HashingErrors } from '../errors/errors';

describe('BcryptAdapter', () => {
    describe('generateSalt', () => {
        test('should resolve to a salt', async () => {
            // Arrange
            const rounds = 12;
            const expectedSalt: string = 'salt';

            const genSalt = jest.fn().mockResolvedValue(expectedSalt);
            const bcryptAdapter = new BcryptAdapter({ ...bcryptjs, genSalt });

            // Act
            const salt = await bcryptAdapter.generateSalt(rounds);

            // Assert
            expect(salt).toEqual(expectedSalt);
        });

        test('should reject with a CouldNotGenerateSaltError', async () => {
            // Arrange
            const rounds = 12;
            
            const genSalt = jest.fn().mockRejectedValue(new Error());
            const bcryptAdapter = new BcryptAdapter({ ...bcryptjs, genSalt });
            
            // Act, Assert
            await expect(bcryptAdapter.generateSalt(rounds))
                .rejects
                .toEqual(HashingErrors.CouldNotGenerateSaltError.create())
        });
    });

    describe('generateHash', () => {
        test('should resolve to a hash', async () => {
            // Arrange
            const toHash = 'original';
            const salt = 'salt';
            const expectedHash = 'hash';

            const hashMock = jest.fn().mockResolvedValue(expectedHash);
            const bcryptAdapter = new BcryptAdapter({ ...bcryptjs, hash: hashMock });

            // Act
            const hash = await bcryptAdapter.generateHash(toHash, salt);

            // Assert
            expect(hash).toEqual(expectedHash);
        });

        test('should reject with a CouldNotHashDataError', async () => {
            // Arrange
            const toHash = 'original';
            const salt = 'salt';
            
            const hashMock = jest.fn().mockRejectedValue(new Error());
            const bcryptAdapter = new BcryptAdapter({ ...bcryptjs, hash: hashMock });
            
            // Act, Assert
            await expect(bcryptAdapter.generateHash(toHash, salt))
                .rejects
                .toEqual(HashingErrors.CouldNotHashDataError.create())
        });
    });

    describe('compareAgainstHash', () => {
        test('should resolve to a boolean', async () => {
            // Arrange
            const candidate = 'candidate';
            const knownHash = 'hash';
            const expectedResult = true;

            const compare = jest.fn().mockResolvedValue(expectedResult);
            const bcryptAdapter = new BcryptAdapter({ ...bcryptjs, compare });

            // Act
            const isMatch = await bcryptAdapter.compareAgainstHash(candidate, knownHash);

            // Assert
            expect(isMatch).toEqual(expectedResult);
        });

        test('should reject with a CouldNotCompareHashesError', async () => {
            // Arrange
            const candidate = 'candidate';
            const knownHash = 'hash';
            
            const compare = jest.fn().mockRejectedValue(new Error());
            const bcryptAdapter = new BcryptAdapter({ ...bcryptjs, compare });
            
            // Act, Assert
            await expect(bcryptAdapter.compareAgainstHash(candidate, knownHash))
                .rejects
                .toEqual(HashingErrors.CouldNotCompareHashesError.create())
        });
    });
})
