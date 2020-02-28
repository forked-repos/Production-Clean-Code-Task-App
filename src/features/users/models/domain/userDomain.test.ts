import { User, userFactory } from './userDomain';

const userProps: Omit<User, 'id'> = {
    firstName: 'John',
    lastName: 'Doe',
    username: 'anything',
    biography: 'bio',
    email: 'j@domain.com',
    password: 'password'
};

test('should generate a user domain model with the provide id', () => {
    // Arrange
    const userId = 'id';

    // Act
    const user = userFactory(userProps, userId);

    // Assert
    expect(user).toEqual({
        id: userId,
        ...userProps
    });
});

test('should generate an id for a user if none is provided', () => {
    // Act
    const user = userFactory(userProps);

    // Assert
    expect(user).toEqual({
        id: expect.any(String),
        ...userProps
    });
});