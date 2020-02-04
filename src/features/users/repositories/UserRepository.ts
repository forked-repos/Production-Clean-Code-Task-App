import { User } from './../models/domain/userDomain';

import { IRepository } from './../../../common/repositories/repository';
import { IUnitOfWork, IUnitOfWorkCapable } from './../../../common/unit-of-work/unit-of-work';
import { BaseKnexRepository } from '../../../common/repositories/knex/BaseKnexRepository';
import { UserDalEntity } from './../models/entity/userEntity';

export interface IUserRepository extends IRepository<User>, IUnitOfWorkCapable {

}

export default class UserRepository extends BaseKnexRepository implements IUserRepository {
    private users: UserDalEntity[] = [];

    public async exists(t: User): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    public async existsById(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    public forUnitOfWork(unitOfWork: IUnitOfWork): this {
        throw new Error("Method not implemented.");
    }
}
