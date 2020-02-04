import { User } from './../../models/domain/userDomain';

import UserResponseDTO from './../../dtos/egress/userResponseDTO';

export const mappers = {
    toUserResponseDTO:(user: User): UserResponseDTO {
        return {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                biography: user.biography
            }
        };
    }
}