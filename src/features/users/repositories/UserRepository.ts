import { User } from './../models/domain/userDomain';

import { IRepository } from './../../../common/repositories/repository';
import { IUnitOfWork, IUnitOfWorkCapable } from './../../../common/unit-of-work/unit-of-work';
import { BaseKnexRepository } from '../../../common/repositories/knex/BaseKnexRepository';
import { UserDalEntity } from './../models/entity/userEntity';
import { IDomainPersistenceMapper } from './../../../common/mappers/domain-dal/mapper';

export interface IUserRepository extends IRepository<User>, IUnitOfWorkCapable {
    existsByUsername(username: string): Promise<boolean>;
    existsByEmail(email: string): Promise<boolean>;
    addUser(user: User): Promise<void>;
    removeUserById(id: string): Promise<void>;
}

export default class UserRepository extends BaseKnexRepository implements IUserRepository {
    private users: UserDalEntity[] = [];

    public constructor (
        private readonly mapper: IDomainPersistenceMapper<User, UserDalEntity>
    ) {
        super();
    }

    public async addUser(user: User): Promise<void> {
        return this.handleErrors(async (): Promise<void> => {
            const dalUser = this.mapper.toPersistence(user);
            await this.users.push(dalUser);
        });
    }

    public async exists(t: User): Promise<boolean> {
        return this.handleErrors(async (): Promise<boolean> => {
            const user = this.users.filter(user => this.mapper.toDomain(user) == t)[0];
            return !!user;
        })
    }

    public async existsById(id: string): Promise<boolean> {
        return this.handleErrors(async (): Promise<boolean> => {
            const user = this.users.filter(user => user.user_id === id)[0];
            return !!user;
        });
    }

    public async existsByUsername(username: string): Promise<boolean> {
        return this.handleErrors(async (): Promise<boolean> => {
            const user = this.users.filter(user => user.username === username)[0];
            return !!user;
        });
    }

    public async existsByEmail(email: string): Promise<boolean> {
        return this.handleErrors(async (): Promise<boolean> => {
            const user = this.users.filter(user => user.email === email)[0];
            return !!user;
        });
    }

    public async removeUserById(id: string): Promise<void> {
        throw new Error();
    }

    public forUnitOfWork(unitOfWork: IUnitOfWork): this {
        throw new Error("Method not implemented.");
    }
}
