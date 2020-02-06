import { UserDalEntity } from './../../models/entity/userEntity';
import { User } from './../../models/domain/userDomain';

import mapper from './mapper';

describe('DomainPersistenceMapper', () => {
    describe('toDomain', () => {
        test('should map correctly', () => {
            // Arrange
            const userDalEntity: UserDalEntity = {
                user_id: '123',
                first_name: 'John',
                last_name: 'Doe',
                username: 'JohnDoe',
                biography: 'Bio',
                email: 'john@gmail.com',
                password: 'hash'
            };
            const expectedUserDomainModel: User = {
                id: userDalEntity.user_id,
                firstName: userDalEntity.first_name,
                lastName: userDalEntity.last_name,
                username: userDalEntity.username,
                biography: userDalEntity.biography,
                email: userDalEntity.email,
                password: userDalEntity.password
            };

            // Act
            const userDomain = mapper().toDomain(userDalEntity);

            // Assert
            expect(userDomain).toEqual(expectedUserDomainModel);
        });
    });

    describe('toPersistence', () => {
        test('should map correctly', () => {
            // Arrange
            const expectedUserDalEntity: UserDalEntity = {
                user_id: '123',
                first_name: 'John',
                last_name: 'Doe',
                username: 'JohnDoe',
                biography: 'Bio',
                email: 'john@gmail.com',
                password: 'hash'
            };
            const userDomainModel: User = {
                id: expectedUserDalEntity.user_id,
                firstName: expectedUserDalEntity.first_name,
                lastName: expectedUserDalEntity.last_name,
                username: expectedUserDalEntity.username,
                biography: expectedUserDalEntity.biography,
                email: expectedUserDalEntity.email,
                password: expectedUserDalEntity.password
            };

            // Act
            const userDal = mapper().toPersistence(userDomainModel);

            // Assert
            expect(userDal).toEqual(expectedUserDalEntity);
        });
    });
    
    
})
