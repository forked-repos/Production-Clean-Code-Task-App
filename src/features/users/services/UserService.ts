// Services
import { IAuthenticationService } from '../../auth/services/AuthenticationService';

// Repositories & UoW
import { IUserRepository } from './../repositories/UserRepository';
import { ITaskRepository } from './../../tasks/repositories/TaskRepository';
import { IUnitOfWorkFactory } from '../../../common/unit-of-work/unit-of-work';

// DTOs - Ingress
import CreateUserDTO from './../dtos/ingress/createUserDTO';
import UpdateUserDTO from '../dtos/ingress/updateUserDTO';
import UserCredentialsDTO from './../dtos/ingress/userCredentialsDTO';

// DTOs - Egress
import UserResponseDTO from '../dtos/egress/userResponseDTO';
import LoggedInUserResponseDTO from './../dtos/egress/loggedInUserResponseDTO';

// Domain
import { userFactory, User } from '../models/domain/userDomain';

// Errors
import { CommonErrors, ApplicationErrors } from '../../../common/errors/errors';
import { AuthorizationErrors } from '../../auth/errors/errors';
import { CreateUserErrors } from '../errors/errors';

// Eventing
import { IEventBus } from './../../../common/buses/EventBus';
import { UserEvents, UserEventingChannel } from '../pub-sub/events';

// Misc
import { UserValidators } from '../validation/userValidation';
import { IDataValidator } from '../../../common/operations/validation/validation';
import { mappers } from '../mappers/domain-egress-dto/mappers';
import { IEventBusMaster } from './../../../common/buses/MasterEventBus';
import { EventBuses } from './../../../loaders/loadBuses';


export interface IUserService {
    signUpUser(userDTO: CreateUserDTO): Promise<void>;
    loginUser(credentialsDTO: UserCredentialsDTO): Promise<LoggedInUserResponseDTO>;
    findUserById(id: string): Promise<UserResponseDTO>;
    updateUserById(id: string, updateUser: UpdateUserDTO): Promise<void>;
    deleteUserById(id: string): Promise<void>;
}

export default class UserService implements IUserService {
    private readonly userEventBus: IEventBus<UserEvents>;

    public constructor (
        // Data Access
        private readonly userRepository: IUserRepository,
        private readonly taskRepository: ITaskRepository,
        private readonly unitOfWorkFactory: IUnitOfWorkFactory,

        // Business 
        private readonly authService: IAuthenticationService,

        // Misc
        private readonly dataValidator: IDataValidator,

        // Event Bus
        eventBusMaster: IEventBusMaster<{ userEventBus: IEventBus<UserEvents> }>
    ) {
        this.userEventBus = eventBusMaster.getBus('userEventBus');
    }

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

        const user: User = { id: 1, ...userDTO, password: hash };

        await this.userRepository.addUser(user);

        this.userEventBus.dispatch(UserEventingChannel.USER_SIGNED_UP, {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        });
    }

    public async loginUser(credentialsDTO: UserCredentialsDTO): Promise<LoggedInUserResponseDTO> {
        const validationResult = this.dataValidator.validate(UserValidators.userCredentials, credentialsDTO);

        if (validationResult.isLeft())
            return Promise.reject(CommonErrors.ValidationError.create('Users', validationResult.value));

        const { email, password } = credentialsDTO;

        try {
            // Throws NotFoundError if no user is found by the specified email address.
            const user = await this.userRepository.findUserByEmail(email);
            const isAuthorized = await this.authService.checkHashMatch(password, user.password);

            if (!isAuthorized)
                return Promise.reject(AuthorizationErrors.AuthorizationError.create('Users'));

            const token = this.authService.generateAuthToken({ id: user.id }, { expiresIn: '15 minutes' });

            return { token };
        } catch (e) {
            switch (true) {
                case e instanceof AuthorizationErrors.AuthorizationError:
                case e instanceof CommonErrors.NotFoundError:
                    return Promise.reject(AuthorizationErrors.AuthorizationError.create('Users'));
                default:
                    return Promise.reject(ApplicationErrors.UnexpectedError.create('Users'));
            }
        }
    }

    public async findUserById(id: string): Promise<UserResponseDTO> {
        const user = await this.userRepository.findUserById(id);
        return mappers.toUserResponseDTO(user);
    }

    public async updateUserById(id: string, updateUserDTO: UpdateUserDTO): Promise<void> {
        const validateResult = this.dataValidator.validate(UserValidators.updateUser, updateUserDTO);

        if (validateResult.isLeft())
            return Promise.reject(CommonErrors.ValidationError.create('Users', validateResult.value));

        if (updateUserDTO.email) {
            const isEmailTaken = await this.userRepository.existsByEmail(updateUserDTO.email);
            if (isEmailTaken) return Promise.reject(CreateUserErrors.EmailTakenError.create());
        }
        
        if (updateUserDTO.username) {
            const isUsernameTaken = await this.userRepository.existsByUsername(updateUserDTO.username);
            if (isUsernameTaken) return Promise.reject(CreateUserErrors.UsernameTakenError.create());
        }

        const user = await this.userRepository.findUserById(id);

        const updatedUser: User = { ...user, ...updateUserDTO, password: user.password };

        await this.userRepository.updateUser(updatedUser);
    }

    public async deleteUserById(id: string): Promise<void> {
        const unitOfWork = await this.unitOfWorkFactory.create();
        const boundUserRepository = this.userRepository.forUnitOfWork(unitOfWork);
        const boundTaskRepository = this.taskRepository.forUnitOfWork(unitOfWork);

        const user = await this.userRepository.findUserById(id);

        try {
            await boundUserRepository.removeUserById(id);
            await boundTaskRepository.removeTasksByOwnerId(id);
            await unitOfWork.commit();
        } catch (e) {
            await unitOfWork.rollback();
        } 

        this.userEventBus.dispatch(UserEventingChannel.USER_DELETED_ACCOUNT, {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        });
    }
}