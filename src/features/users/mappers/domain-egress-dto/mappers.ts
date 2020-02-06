import { User } from './../../models/domain/userDomain';

import UserResponseDTO from './../../dtos/egress/userResponseDTO';
import UserCollectionResponseDTO from './../../dtos/egress/userCollectionResponseDTO';

export interface IDomainEgressDTOMapper {
    toUserResponseDTO(user: User): UserResponseDTO;
    toUserCollectionResponseDTO(users: User[]): UserCollectionResponseDTO;
}

export const mappers: IDomainEgressDTOMapper = {
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