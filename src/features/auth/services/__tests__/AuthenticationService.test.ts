import { mock, when, instance, reset, anything } from 'ts-mockito';

// SUT
import AuthenticationService, { IAuthenticationService, ITokenPayload } from '../AuthenticationService';

import { IHashHandler } from '../../../../common/operations/hashing/adapters/BcryptAdapter';
import { ITokenHandler, ITokenEncodingOptions, ITokenDecodingOptions } from '../../../../common/operations/tokens/adapters/JwtAdapter';
import { ApplicationErrors } from '../../../../common/errors/errors';
import { TokenExpiredError } from 'jsonwebtoken';
import { TokenErrors } from '../../../../common/operations/tokens/errors/errors';
import { AuthorizationErrors } from '../../errors/errors';

let hashHandlerMock = mock<IHashHandler>();
let tokenHandlerMock = mock<ITokenHandler>();
let authenticationService: IAuthenticationService;

beforeEach(() => {
    reset(hashHandlerMock);
    reset(tokenHandlerMock);

    authenticationService = new AuthenticationService(instance(hashHandlerMock), instance(tokenHandlerMock));
});

describe('AuthenticationService', () => {
    describe('hashPassword', () => {
        test('should return a password hash with rounds specified', async () => {
            // Arrange
            const plainTextPassword = 'password';
            const rounds = 10;
            const expectedHash = 'hash';
            const salt = 'salt';

            when(hashHandlerMock.generateSalt(rounds)).thenResolve(salt);
            when(hashHandlerMock.generateHash(plainTextPassword, salt)).thenResolve(expectedHash);

            // Act
            const hash = await authenticationService.hashPassword(plainTextPassword, rounds);

            // Assert
            expect(hash).toEqual(expectedHash);
        });

        test('should return a password hash with default rounds specified', async () => {
            // Arrange
            const plainTextPassword = 'password';
            const expectedHash = 'hash';
            const salt = 'salt';

            when(hashHandlerMock.generateSalt(12)).thenResolve(salt);
            when(hashHandlerMock.generateHash(plainTextPassword, salt)).thenResolve(expectedHash);

            // Act
            const hash = await authenticationService.hashPassword(plainTextPassword);

            // Assert
            expect(hash).toEqual(expectedHash);
        });

        test('should reject with an UnexpectedError', async () => {
            // Arrange
            when(hashHandlerMock.generateSalt(anything())).thenReject(new Error());

            // Act, Assert
            await expect(authenticationService.hashPassword(''))
                .rejects
                .toEqual(ApplicationErrors.UnexpectedError.create());
        });
    });

    describe('checkHashMatch', () => {
        test('should return a boolean match result', async () => {
            // Arrange
            const candidate = 'candidate';
            const hash = 'hash';
            const expectedMatchResult = true;

            when(hashHandlerMock.compareAgainstHash(candidate, hash)).thenResolve(expectedMatchResult);

            // Act
            const matchResult = await authenticationService.checkHashMatch(candidate, hash);

            // Assert
            expect(matchResult).toEqual(expectedMatchResult);
        });

        test('should reject with an UnexpectedError', () => {
            // Arrange
            when(hashHandlerMock.compareAgainstHash(anything(), anything())).thenReject(new Error());

            // Act, Assert
            expect(authenticationService.checkHashMatch('', ''))
                .rejects
                .toEqual(ApplicationErrors.UnexpectedError.create());
        });
    });

    describe('generateAuthToken', () => {
        test('should generate an authentication token with opts specified', () => {
            // Arrange
            const payload: ITokenPayload = { id: 'user-id' };
            const opts: ITokenEncodingOptions = { expiresIn: '1 hour' };
            const expectedToken = 'token';

            when(tokenHandlerMock.generateToken(payload, anything(), opts)).thenReturn(expectedToken);

            // Act
            const token = authenticationService.generateAuthToken(payload, opts);

            // Assert
            expect(token).toEqual(expectedToken);
        });

        test('should generate an authentication token without opts specified', () => {
            // Arrange
            const payload: ITokenPayload = { id: 'user-id' };
            const expectedToken = 'token';

            when(tokenHandlerMock.generateToken(payload, anything(), undefined)).thenReturn(expectedToken);

            // Act
            const token = authenticationService.generateAuthToken(payload);

            // Assert
            expect(token).toEqual(expectedToken);
        });

        test('should throw an UnexpectedError', () => {
            // Arrange
            const errorMessage = 'Message';
            when(tokenHandlerMock.generateToken(anything(), anything(), anything()))
                .thenThrow(new Error(errorMessage));

            // Act, Assert
            expect(() => authenticationService.generateAuthToken({ id: 'string' }))
                .toThrow(ApplicationErrors.UnexpectedError.create())
        });
    }); 
    
    describe('verifyAndDecodeAuthToken', () => {
        test('should return a decoded token with opts specified', () => {
            // Arrange
            const candidateToken = 'token';
            const expectedTokenPayload: ITokenPayload = { id: 'user-id' };
            const opts: ITokenDecodingOptions = { issuer: 'jamie' };
            when(tokenHandlerMock.verifyAndDecodeToken(candidateToken, anything(), opts))
                .thenReturn(expectedTokenPayload);

            // Act
            const tokenPayloadResult = authenticationService.verifyAndDecodeAuthToken(candidateToken, opts);

            // Assert
            expect(tokenPayloadResult.isRight()).toBe(true);
            expect(tokenPayloadResult.value).toEqual(expectedTokenPayload);
        });

        test('should return a decoded token without opts specified', () => {
            // Arrange
            const candidateToken = 'token';
            const expectedTokenPayload: ITokenPayload = { id: 'user-id' };
            when(tokenHandlerMock.verifyAndDecodeToken(candidateToken, anything(), undefined))
                .thenReturn(expectedTokenPayload);

            // Act
            const tokenPayloadResult = authenticationService.verifyAndDecodeAuthToken(candidateToken);

            // Assert
            expect(tokenPayloadResult.isRight()).toBe(true);
            expect(tokenPayloadResult.value).toEqual(expectedTokenPayload);
        });

        test('should return an AuthorizationError on the left', () => {
            // Arrange
            when(tokenHandlerMock.verifyAndDecodeToken(anything(), anything(), anything()))
                .thenThrow(TokenErrors.TokenExpiredError.create(new Date()));

            // Act
            const tokenPayloadResult = authenticationService.verifyAndDecodeAuthToken('');

            // Assert
            expect(tokenPayloadResult.isLeft()).toBe(true);
            expect(tokenPayloadResult.value).toEqual(AuthorizationErrors.AuthorizationError.create())
        });

        test('should throw an UnexpectedError if a CouldNotDecodeTokenError was thrown', () => {
            // Arrange
            when(tokenHandlerMock.verifyAndDecodeToken(anything(), anything(), anything()))
                .thenThrow(TokenErrors.CouldNotDecodeTokenError.create());

            // Act, Assert
            expect(() => authenticationService.verifyAndDecodeAuthToken(''))
                .toThrow(ApplicationErrors.UnexpectedError.create())
        });

        test('should throw an UnexpectedError in any other case', () => {
            // Arrange
            when(tokenHandlerMock.verifyAndDecodeToken(anything(), anything(), anything()))
                .thenThrow(new Error());

            // Act, Assert
            expect(() => authenticationService.verifyAndDecodeAuthToken(''))
                .toThrow(ApplicationErrors.UnexpectedError.create())
        });
    });
});
