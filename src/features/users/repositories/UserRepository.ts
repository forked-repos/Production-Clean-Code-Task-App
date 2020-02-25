import * as Knex from 'knex';

import { User } from './../models/domain/userDomain';

import { IRepository } from './../../../common/repositories/repository';
import { IUnitOfWork, IUnitOfWorkCapable } from './../../../common/unit-of-work/unit-of-work';
import { BaseKnexRepository } from '../../../common/repositories/knex/BaseKnexRepository';
import { UserDalEntity } from './../models/entity/userEntity';
import { IDomainPersistenceMapper } from './../../../common/mappers/domain-dal/mapper';
import { CommonErrors } from '../../../common/errors/errors';
import { KnexUnitOfWork } from '../../../common/unit-of-work/knex/KnexUnitOfWork';

export interface IUserRepository extends IRepository<User>, IUnitOfWorkCapable {
    existsByUsername(username: string): Promise<boolean>;
    existsByEmail(email: string): Promise<boolean>;
    findUserByEmail(email: string): Promise<User>;
    findUserById(id: string): Promise<User>;
    updateUser(updatedUser: User): Promise<void>
    addUser(user: User): Promise<void>;
    removeUserById(id: string): Promise<void>;
}

export default class UserRepository extends BaseKnexRepository implements IUserRepository {
    private users: UserDalEntity[] = [];

    private readonly dbContext: Knex | Knex.Transaction;
    private readonly mapper: IDomainPersistenceMapper<User, UserDalEntity>;

    public constructor (
        knexInstance: Knex | Knex.Transaction,
        userDomainPersistenceMapper: IDomainPersistenceMapper<User, UserDalEntity>
    ) {
        super();
        this.dbContext = knexInstance;
        this.mapper = userDomainPersistenceMapper;
    }

    public async addUser(user: User): Promise<void> {
        return this.handleErrors(async (): Promise<void> => {

            console.log(user)
            const dalUser = this.mapper.toPersistence(user);
            await this.dbContext<UserDalEntity>('users').insert(dalUser);
        });
    }

    public async findUserByEmail(email: string): Promise<User> {
        return this.handleErrors(async (): Promise<User> => {
            const dalUser = await this.dbContext<UserDalEntity>('users')
                .select()
                .where({ email })
                .first();

            if (!dalUser) 
                return Promise.reject(CommonErrors.NotFoundError.create('Tasks'));

            return this.mapper.toDomain(dalUser);
        });
    }

    public async findUserById(id: string): Promise<User> {
        return this.handleErrors(async (): Promise<User> => {
            const dalUser = await this.dbContext<UserDalEntity>('users')
                .select()
                .where({ user_id: id })
                .first();

            if (!dalUser) 
                return Promise.reject(CommonErrors.NotFoundError.create('Users'));

            return this.mapper.toDomain(dalUser);
        });
    }

    public async updateUser(updatedUser: User): Promise<void> {
        return this.handleErrors(async (): Promise<void> => {
            const dalUpdatedUser = this.mapper.toPersistence(updatedUser);
            const doesUserExist = await this.existsById(dalUpdatedUser.user_id);

            if (!doesUserExist)
                return Promise.reject(CommonErrors.NotFoundError.create('Users'));

            await this.dbContext<UserDalEntity>('users')
                .select('*')
                .where({ user_id: dalUpdatedUser.user_id })
                .update(dalUpdatedUser);
        });
    }

    public async exists(t: User): Promise<boolean> {
        return this.handleErrors(async (): Promise<boolean> => {
            const dalUser = this.mapper.toPersistence(t);
            return !!await this.dbContext<UserDalEntity>('users')
                .select()
                .where(dalUser)
                .first();
        });
    }

    public async existsById(id: string): Promise<boolean> {
        return this.handleErrors(async (): Promise<boolean> => {
            return !!await this.dbContext<UserDalEntity>('users')
                .select()
                .where({ user_id: id })
                .first();
        });
    }

    public async existsByUsername(username: string): Promise<boolean> {
        return this.handleErrors(async (): Promise<boolean> => {
            return !!await this.dbContext<UserDalEntity>('users')
                .select()
                .where({ username })
                .first();
        });
    }

    public async existsByEmail(email: string): Promise<boolean> {
        return this.handleErrors(async (): Promise<boolean> => {
            return !!await this.dbContext<UserDalEntity>('users')
                .select()
                .where({ email })
                .first();
        });
    }

    public async removeUserById(id: string): Promise<void> {
        return this.handleErrors(async (): Promise<void> => {
            await this.dbContext<UserDalEntity>('users').where({ user_id: id }).del();
        });
    }

    public forUnitOfWork(unitOfWork: IUnitOfWork): this {
        return new UserRepository((unitOfWork as KnexUnitOfWork).trxContext, this.mapper) as this;
    }
}
