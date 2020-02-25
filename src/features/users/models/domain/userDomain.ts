import * as uuid from 'uuid';

/**
 * User domain structure.
 */
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    biography: string;
    email: string;
    password: string;
}

export const userFactory = (userProps: Omit<User, 'id'>, id?: string): User => ({
    id: id ? id : uuid.v4(),
    ...userProps
})