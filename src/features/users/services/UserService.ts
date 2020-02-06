import { IUserRepository } from './../repositories/UserRepository';
import { IAuthenticationService } from '../../auth/services/AuthenticationService';
import { IUnitOfWorkFactory } from '../../../common/unit-of-work/unit-of-work';

import CreateUserDTO from './../dtos/ingress/createUserDTO';

import { validate } from './../../../utils/wrappers/joi/joiWrapper';
import { UserValidators } from '../validation/userValidation';
import { CommonErrors } from '../../../common/errors/errors';
import { userFactory } from '../models/domain/userDomain';
import { ITaskRepository } from './../../tasks/repositories/TaskRepository';
import { CreateUserErrors } from '../errors/errors';

export interface IUserService {
    signUpUser(userDTO: CreateUserDTO): Promise<void>;

    deleteUserById(id: string): Promise<void>;
}

export default class UserService implements IUserService {
    public constructor (
        private readonly userRepository: IUserRepository,
        private readonly taskRepository: ITaskRepository,
        private readonly authService: IAuthenticationService,
        private readonly unitOfWorkFactory: IUnitOfWorkFactory
    ) {}

    public async signUpUser(userDTO: CreateUserDTO): Promise<void> {
        const validationResult = validate(UserValidators.createUser, userDTO);

        if (validationResult.isLeft())
            return Promise.reject(CommonErrors.ValidationError.create('User', validationResult.value));

        const [usernameTaken, emailTaken] = await Promise.all([
            this.userRepository.existsByUsername(userDTO.username),
            this.userRepository.existsByEmail(userDTO.email)
        ]) as [boolean, boolean];

        if (usernameTaken)
            Promise.reject(CreateUserErrors.UsernameTakenError.create());
        
        if (emailTaken)
            Promise.reject(CreateUserErrors.EmailTakenError.create());

        const hash = await this.authService.hashPassword(userDTO.password);

        const user = userFactory({ ...userDTO, password: hash });

        await this.userRepository.addUser(user);
    }
}