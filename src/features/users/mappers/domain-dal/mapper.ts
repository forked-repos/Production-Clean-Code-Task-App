import { User } from './../../models/domain/userDomain';
import { UserDalEntity } from './../../models/entity/userEntity';

import { IDomainPersistenceMapper } from './../../../../common/mappers/domain-dal/mapper';

export default (): IDomainPersistenceMapper<User, UserDalEntity> => ({
    toDomain: (raw: UserDalEntity) => ({
        id: raw.user_id,
        firstName: raw.first_name,
        lastName: raw.last_name,
        username: raw.username,
        biography: raw.biography,
        email: raw.email,
        password: raw.password
    }),

    toPersistence: (user: User) => ({
        user_id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        username: user.username,
        biography: user.biography,
        email: user.email,
        password: user.password
    })
});