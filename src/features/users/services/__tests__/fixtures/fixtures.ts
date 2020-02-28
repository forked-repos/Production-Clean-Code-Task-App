import { User } from './../../../models/domain/userDomain';
import CreateUserDTO from './../../../dtos/ingress/createUserDTO';

export const userBuilder = (opts?: Partial<User>): User => ({
    id: 'id',
    firstName: 'John',
    lastName: 'Doe',
    username: 'JDoe',
    email: 'john_doe@gmail.com',
    password: 'hashed-password',
    biography: 'some bio',
    ...opts
});

export const createUserDTOBuilder = (opts?: Partial<CreateUserDTO>): CreateUserDTO => ({
    firstName: 'Jane',
    lastName: 'Doe',
    username: 'JaneDoe',
    email: 'janedoe@gmail.com',
    password: 'ABC123abc23&',
    biography: 'some bio',
    ...opts
});