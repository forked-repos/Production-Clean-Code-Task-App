// Repositories & UoW
import { IUserRepository } from './../UserRepository';
import { IUnitOfWork } from './../../../../common/unit-of-work/unit-of-work';

// Domain & Errors
import { User } from './../../models/domain/userDomain';
import { CommonErrors } from '../../../../common/errors/errors';

export class FakeUserRepository implements IUserRepository {
    public users: User[] = [];

    async existsByUsername(username: string): Promise<boolean> {
        return !!this.users.filter(user => user.username === username)[0];
    }    
    
    async existsByEmail(email: string): Promise<boolean> {
        return !!this.users.filter(user => user.email === email)[0];
    }

    async addUser(user: User): Promise<void> {
        this.users.push(user);
    }
    
    async findUserByEmail(email: string): Promise<User> {
        const user = this.users.filter(user => user.email === email)[0];

        if (!user)
            return Promise.reject(CommonErrors.NotFoundError.create('Users'));

        return user;
    }
    
    async findUserById(id: string): Promise<User> {
        const user = this.users.filter(user => user.id === id)[0];

        if (!user)
            return Promise.reject(CommonErrors.NotFoundError.create('Users'));

        return user;
    }
    
    async updateUser(updatedUser: User): Promise<void> {
        const doesUserExist = await this.existsById(updatedUser.id);

        if (!doesUserExist)
            return Promise.reject(CommonErrors.NotFoundError.create('Users'));

        const userToUpdate = await this.findUserById(updatedUser.id);
        const userToUpdatedIndex = this.users.indexOf(userToUpdate);

        this.users[userToUpdatedIndex] = updatedUser;
    }
    
    async removeUserById(id: string): Promise<void> {
        this.users = this.users.filter(user => user.id !== id);
    }
    
    async exists(t: User): Promise<boolean> {
        return this.users.indexOf(t) > -1 ? true : false;
    }
    
    async existsById(id: string): Promise<boolean> {
        return !!this.users.filter(user => user.id === id)[0];
    }
    
    forUnitOfWork(unitOfWork: IUnitOfWork): this {
        return new FakeUserRepository() as this;
    }   
}