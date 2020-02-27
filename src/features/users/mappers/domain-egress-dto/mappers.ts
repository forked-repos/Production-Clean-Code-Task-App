import { User } from './../../models/domain/userDomain';

import UserResponseDTO from './../../dtos/egress/userResponseDTO';
import UserCollectionResponseDTO from './../../dtos/egress/userCollectionResponseDTO';

export const mappers = {
    toUserResponseDTO: (user: User): UserResponseDTO => ({
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            biography: user.biography
        }
    }),

    toUserCollectionResponseDTO: (users: User[]): UserCollectionResponseDTO => ({
        users: users.map(user => user) 
    })
}