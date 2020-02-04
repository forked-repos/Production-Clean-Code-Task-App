import { IUserRepository } from './../repositories/UserRepository';
import { IAuthenticationService } from '../../auth/services/AuthenticationService';
import { IUnitOfWorkFactory } from '../../../common/unit-of-work/unit-of-work';

export interface IUserService {

}

export default class UserService {
    public constructor (
        private readonly userRepository: IUserRepository,
        private readonly authService: IAuthenticationService,
        private readonly unitOfWorkFactory: IUnitOfWorkFactory
    ) {}
}