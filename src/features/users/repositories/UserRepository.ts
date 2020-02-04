import { User } from './../models/domain/userDomain';

import { IRepository } from './../../../common/repositories/repository';

export interface IUserRepository extends IRepository<User> {

}
