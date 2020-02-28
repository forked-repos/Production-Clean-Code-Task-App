import { Left, Right, right, left, Either } from "./Either"

describe('Left', () => {
    describe('isLeft', () => {
        test('should return true', () => {
            // Arrange
            const left = new Left<string, never>('data');

            // Act
            const isLeft = left.isLeft();

            // Assert
            expect(isLeft).toBe(true);            
        });
    });

    describe('isRight', () => {
        test('should return false', () => {
            // Arrange
            const left = new Left<string, never>('data');

            // Act
            const isRight = left.isRight();

            // Assert
            expect(isRight).toBe(false);   
        });
    });

    describe('map', () => {
        test('should return itself', () => {
            // Arrange
            const left = new Left<string, never>('data');

            // Act
            const result = left.map(() => 'whatever');

            // Assert
            expect(result).toEqual(left);
        }); 
    }); 
    
    describe('flatMap', () => {
        test('should return itself', () => {
            // Arrange
            const left = new Left<string, never>('data');

            // Act
            const result = left.flatMap(() => right('whatever'));

            // Assert
            expect(result).toEqual(left);
        }); 
    }); 
});

describe('Right', () => {
    describe('isLeft', () => {
        test('should return false', () => {
            // Arrange
            const right = new Right<never, string>('data');

            // Act
            const isLeft = right.isLeft();

            // Assert
            expect(isLeft).toBe(false);            
        });
    });

    describe('isRight', () => {
        test('should return true', () => {
            // Arrange
            const right = new Right<never, string>('data');

            // Act
            const isRight = right.isRight();

            // Assert
            expect(isRight).toBe(true);   
        });
    });

    describe('map', () => {
        test('should wrap the callback return value in an instance of Right', () => {
            // Arrange
            const right = new Right<never, string>('data');
            const mapper = (existing: any) => `${existing}2`;

            // Act
            const result = right.map(mapper);

            // Assert
            expect(result).toEqual(new Left<string, never>(mapper('data')));
            expect(result.isRight()).toBe(true);
        }); 
    });    
    
    describe('flatMap', () => {
        test('should flatten the result and have the correct value', () => {
            // Arrange
            const right = new Right<any, string>('data');
            const mapper = (existing: any): Either<string, never> => left(`${existing}2`);

            // Act
            const result = right.flatMap(mapper);

            // Assert
            expect(result).toEqual(new Left<string, never>(mapper('data').value));
            expect(result.isRight()).toBe(false);
        });
    });
});

