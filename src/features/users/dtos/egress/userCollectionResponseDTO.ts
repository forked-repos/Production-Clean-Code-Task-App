import UserResponseDTO from './userResponseDTO';

export default interface UserCollectionResponseDTO {
    users: UserResponseDTO['user'][];
}