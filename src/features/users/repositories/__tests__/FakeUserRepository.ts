// Repositories & UoW
import { IUserRepository } from './../UserRepository';
import { IUnitOfWork } from './../../../../common/unit-of-work/unit-of-work';

// Domain & Errors
import { User } from './../../models/domain/userDomain';
import { CommonErrors } from '../../../../common/errors/errors';
import { FakeBaseRepository } from './../../../../common/repositories/__tests__/FakeBaseRepository';

export class FakeUserRepository extends FakeBaseRepository implements IUserRepository {
    public users: User[] = [];

    async existsByUsername(username: string): Promise<boolean> {
        return this.handleErrors(
            async () => !!this.users.filter(user => user.username === username)[0],
            username
        );
    }    
    
    async existsByEmail(email: string): Promise<boolean> {
        return this.handleErrors(
            async () => !!this.users.filter(user => user.email === email)[0],
            email
        );
    }

    async addUser(user: User): Promise<void> {
        return this.handleErrors(
            async () => { this.users.push(user) },
            user.username
        );
    }
    
    async findUserByEmail(email: string): Promise<User> {
        return this.handleErrors(async () => {
            const user = this.users.filter(user => user.email === email)[0];

            if (!user)
                return Promise.reject(CommonErrors.NotFoundError.create('Users'));
    
            return user;
        }, email);
    }
    
    async findUserById(id: string): Promise<User> {
        return this.handleErrors(async () => {
            const user = this.users.filter(user => user.id === id)[0];

            if (!user)
                return Promise.reject(CommonErrors.NotFoundError.create('Users'));

            return user;
        }, id);
    }
    
    async updateUser(updatedUser: User): Promise<void> {
        return this.handleErrors(async () => {
            const doesUserExist = await this.existsById(updatedUser.id);

            if (!doesUserExist)
                return Promise.reject(CommonErrors.NotFoundError.create('Users'));
    
            const userToUpdate = await this.findUserById(updatedUser.id);
            const userToUpdatedIndex = this.users.indexOf(userToUpdate);
    
            this.users[userToUpdatedIndex] = updatedUser;
        }, updatedUser.username);
    }
    
    async removeUserById(id: string): Promise<void> {
        return this.handleErrors(
            async () => { this.users = this.users.filter(user => user.id !== id) },
            id
        );
    }
    
    async exists(t: User): Promise<boolean> {
        return this.handleErrors(
            async () => this.users.indexOf(t) > -1 ? true : false,
            t.username
        ); 
    }
    
    async existsById(id: string): Promise<boolean> {
        return !!this.users.filter(user => user.id === id)[0];
    }

    nextIdentity() {
        return 'id';
    }
    
    forUnitOfWork(unitOfWork: IUnitOfWork): this {
        return this;
    }   
}