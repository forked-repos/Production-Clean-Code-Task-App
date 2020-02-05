import jsonwebtoken, { SignOptions, SignCallback, Secret, TokenExpiredError } from 'jsonwebtoken';

// SUT:
import JwtAdapter, { ITokenDecodingOptions } from './JwtAdapter';
import { TokenErrors } from '../errors/errors';

describe('JwtAdapter', () => {
    describe('generateToken', () => {
        test('should resolve to a token', () => {
            // Arrange
            const payload = 'payload';
            const secret = 'secret';
            const expectedToken = 'token';

            const sign = jest.fn().mockReturnValue(expectedToken)

            const jwtAdapter = new JwtAdapter({ ...jsonwebtoken, sign });

            // Act
            const token = jwtAdapter.generateToken(payload, secret); 

            // Assert
            expect(token).toEqual(expectedToken);
        });   

        test('should pass along options', () => {
            // Arrange
            const payload = 'payload';
            const secret = 'secret';
            const options = { expiresIn: '1 hour' };
    
            const sign = jest.fn().mockReturnValue('anything');
    
            const jwtAdapter = new JwtAdapter({ ...jsonwebtoken, sign });
    
            // Act
            jwtAdapter.generateToken(payload, secret, options);
    
            // Assert
            expect(sign.mock.calls[0][2]).toEqual(options);
        });
    
        test('should reject with a CouldNotGenerateTokenError', () => {
            // Arrange
            const payload = 'payload';
            const secret = 'secret';
            const options = { expiresIn: '1 hour' };
            const errorMessage = 'message';
    
            const sign = jest.fn().mockImplementation(() => { throw new Error(errorMessage); })
    
            const jwtAdapter = new JwtAdapter({ ...jsonwebtoken, sign });
    
            // Act, Assert
            expect(() => jwtAdapter.generateToken(payload, secret, options))
                .toThrow(TokenErrors.CouldNotGenerateTokenError.create(errorMessage))
        });
    });

    describe('verifyAndDecodeToken', () => {
        test('should resolve to a token payload', () => {
            // Arrange
            const candidateToken = 'payload-token';
            const secret = 'secret';
            const expectedPayload = { id: 123 };

            const verify = jest.fn().mockReturnValue(expectedPayload)

            const jwtAdapter = new JwtAdapter({ ...jsonwebtoken, verify });

            // Act
            const payload = jwtAdapter.verifyAndDecodeToken(candidateToken, secret); 

            // Assert
            expect(payload).toEqual(expectedPayload);
        });   

        test('should pass along options', () => {
            // Arrange
            const candidateToken = 'token';
            const secret = 'secret';
            const decodeOptions: ITokenDecodingOptions = { issuer: 'jamie' };

            const verify = jest.fn().mockReturnValue('anything')

            const jwtAdapter = new JwtAdapter({ ...jsonwebtoken, verify });

            // Act
            jwtAdapter.verifyAndDecodeToken(candidateToken, secret, decodeOptions);

            // Assert
            expect(verify.mock.calls[0][2]).toEqual(decodeOptions);
        });

        test('should throw a TokenExpiredError if token is expired', () => {
            // Arrange
            const errorMessage = 'Token expired.';
            const expiredAt = new Date();
            const verify = jest.fn().mockImplementation(() => { throw new TokenExpiredError(errorMessage, expiredAt); });

            const jwtAdapter = new JwtAdapter({ ...jsonwebtoken, verify });

            // Act, Assert
            expect(() => jwtAdapter.verifyAndDecodeToken('candidate', 'secret'))
                .toThrow(TokenErrors.TokenExpiredError.create(expiredAt, errorMessage));
        });

        test('should throw a CouldNotDecodeTokenError if an unknown error occurs', () => {
            // Arrange
            const errorMessage = 'Could not decode token.';
            const verify = jest.fn().mockImplementation(() => { throw new Error(errorMessage); });

            const jwtAdapter = new JwtAdapter({ ...jsonwebtoken, verify });

            // Act, Assert
            expect(() => jwtAdapter.verifyAndDecodeToken('candidate', 'secret'))
                .toThrow(TokenErrors.CouldNotGenerateTokenError.create(errorMessage));
        });
    });
});