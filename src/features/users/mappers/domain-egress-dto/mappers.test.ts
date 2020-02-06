import { UserDalEntity } from './../../models/entity/userEntity';
import { User } from './../../models/domain/userDomain';
import { mappers } from './mappers';
import UserResponseDTO from './../../dtos/egress/userResponseDTO';

// Fixtures
const userDomainModel: User = {
    id: '123',
    firstName: 'John',
    lastName: 'Doe',
    username: 'JDoe',
    biography: 'Bio',
    email: 'J@gmail.com',
    password: 'hash'
};

const userResponseDTO: UserResponseDTO = {
    user: {
        id: userDomainModel.id,
        firstName: userDomainModel.firstName,
        lastName: userDomainModel.lastName,
        username: userDomainModel.username,
        biography: userDomainModel.biography,
        email: userDomainModel.email,
    }
};

describe('DomainResponseDTOMapper', () => {
    describe('toUserResponseDTO', () => {
        test('should map correctly', () => {
            // Act
            const mapped = mappers.toUserResponseDTO(userDomainModel);

            // Assert
            expect(mapped).toEqual(userResponseDTO);
        });
    });

    describe('toUserCollectionResponseDTO', () => {
        test('should map correctly', () => {
            // Arrange
            const collection = [userDomainModel, userDomainModel];

            // Act
            const mapped = mappers.toUserCollectionResponseDTO(collection);

            // Assert
            expect(mapped).toEqual({
                users: collection.map(user => user)
            });
        });
    });
});
