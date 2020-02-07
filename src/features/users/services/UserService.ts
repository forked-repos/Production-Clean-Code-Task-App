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
import { IDataValidator } from '../../../common/operations/validation/validation';

export interface IUserService {
    signUpUser(userDTO: CreateUserDTO): Promise<void>;

    deleteUserById(id: string): Promise<void>;
}

export default class UserService implements IUserService {
    public constructor (
        // Data Access
        private readonly userRepository: IUserRepository,
        private readonly taskRepository: ITaskRepository,
        private readonly unitOfWorkFactory: IUnitOfWorkFactory,

        // Business 
        private readonly authService: IAuthenticationService,

        // Misc
        private readonly dataValidator: IDataValidator
    ) {}

    public async signUpUser(userDTO: CreateUserDTO): Promise<void> {
        const validationResult = this.dataValidator.validate(UserValidators.createUser, userDTO);

        if (validationResult.isLeft()) 
            return Promise.reject(CommonErrors.ValidationError.create('User', validationResult.value)); 

        const [usernameTaken, emailTaken] = await Promise.all([
            this.userRepository.existsByUsername(userDTO.username),
            this.userRepository.existsByEmail(userDTO.email)
        ]) as [boolean, boolean];

        if (usernameTaken)
            return Promise.reject(CreateUserErrors.UsernameTakenError.create());
        
        if (emailTaken)
            return Promise.reject(CreateUserErrors.EmailTakenError.create());

        const hash = await this.authService.hashPassword(userDTO.password);

        const user = userFactory({ ...userDTO, password: hash });

        await this.userRepository.addUser(user);
    }

    public async deleteUserById(id: string): Promise<void> {
        const unitOfWork = await this.unitOfWorkFactory.create();
        const boundUserRepository = this.userRepository.forUnitOfWork(unitOfWork);
        const boundTaskRepository = this.taskRepository.forUnitOfWork(unitOfWork);

        try {
            await boundUserRepository.removeUserById(id);
            await boundTaskRepository.removeTasksByOwnerId(id);
            await unitOfWork.commit();
        } catch (e) {
            await unitOfWork.rollback();
        }
    }
}