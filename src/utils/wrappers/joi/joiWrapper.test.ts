import { mock, when, instance, deepEqual } from 'ts-mockito';
import { Either, Left, Right } from './../../logic/Either';

// SUT
import { validate } from './joiWrapper';
import { ObjectSchema, ValidationResult } from '@hapi/joi';

describe('validation', () => {
    test('should return an Either right type with the correct value', () => {
        // Arrange
        const objectSchema = mock<ObjectSchema>();
        const resultObject = { error: undefined, value: 'data' };
        when(objectSchema.validate(deepEqual({}))).thenReturn(resultObject);

        const result = validate(instance(objectSchema), {});

        // Act, Assert
        expect(result).toBeInstanceOf(Right)
        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual(resultObject.value);
    }); 
});

test('should return an Either left type with the correct error', () => {
    // Arrange
    const objectSchema = mock<ObjectSchema>();
    const resultObject = { error: new Error('Message'), value: undefined } as ValidationResult;
    when(objectSchema.validate(deepEqual({}))).thenReturn(resultObject);

    const result = validate(instance(objectSchema), {});

    // Act, Assert
    expect(result).toBeInstanceOf(Left)
    expect(result.isLeft()).toBe(true);
    expect(result.value).toEqual(resultObject.error!.message);
}); 
