import { when, mock, anything, instance, verify, deepEqual } from 'ts-mockito';

// Authentication
import { IAuthenticationService } from '../../auth/services/AuthenticationService';
import { ITokenPayload } from './../../auth/services/AuthenticationService';
import { ITokenEncodingOptions, ITokenDecodingOptions } from './../../../common/operations/tokens/adapters/JwtAdapter';
import { AuthorizationErrors } from '../../auth/errors/errors';

// Repository & UoW
import { IUserRepository } from './../repositories/UserRepository';
import { ITaskRepository } from './../../tasks/repositories/TaskRepository';
import { IUnitOfWork, IUnitOfWorkFactory } from './../../../common/unit-of-work/unit-of-work';

// Service & Service DTOs
import UserService, { IUserService } from './UserService';
import CreateUserDTO from './../dtos/ingress/createUserDTO';

// Domain Models
import { User } from './../models/domain/userDomain';
import { Task } from './../../tasks/models/domain/taskDomain';

// Validation
import { IDataValidator } from './../../../common/operations/validation/validation';

// Errors
import { CommonErrors, ApplicationErrors } from '../../../common/errors/errors';
import { CreateUserErrors } from '../errors/errors';

// Utils
import { Either, left, right } from '../../../utils/logic/Either';
import { UserValidators } from '../validation/userValidation';

const mockCreateUserDTO: CreateUserDTO = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john_doe@outlook.com',
    username: 'JohnD',
    biography: 'Lorem ipsum',
    password: 'password123P!@#'
};

// Fakes & Mocks
let mockUserRepository: IUserRepository;
let mockTaskRepository: ITaskRepository;
let mockUnitOfWorkFactory: IUnitOfWorkFactory;
let mockAuthService: IAuthenticationService;
let mockDataValidator: IDataValidator;

// SUT:
let userService: IUserService;

beforeEach(() => {
    mockUserRepository = mock<IUserRepository>();
    mockTaskRepository = mock<ITaskRepository>();
    mockUnitOfWorkFactory = mock<IUnitOfWorkFactory>();
    mockAuthService = mock<IAuthenticationService>();
    mockDataValidator = mock<IDataValidator>();

    userService = new UserService(
        instance(mockUserRepository),
        instance(mockTaskRepository), 
        instance(mockUnitOfWorkFactory),
        instance(mockAuthService),
        instance(mockDataValidator)
    );
});

describe('UserService', () => {
    describe('signUpUser', () => {
        describe('with bad data', () => {
            test('should reject with a ValidationError', async () => {
                // Arrange
                const errorMessage = 'An error message';
                when(mockDataValidator.validate(UserValidators.createUser, mockCreateUserDTO))
                    .thenReturn(left(errorMessage));

                // Act, Assert
                await expect(userService.signUpUser(mockCreateUserDTO))
                    .rejects
                    .toEqual(CommonErrors.ValidationError.create('User', errorMessage));

                verify(mockUserRepository.addUser(anything())).never();
            });

            test('should reject with a UsernameTakenError', async () => {
                // Arrange
                when(mockDataValidator.validate(UserValidators.createUser, mockCreateUserDTO))
                    .thenReturn(right(mockCreateUserDTO));
                when(mockUserRepository.existsByUsername(mockCreateUserDTO.username))
                    .thenResolve(true);

                // Act, Assert
                await expect(userService.signUpUser(mockCreateUserDTO))
                    .rejects
                    .toEqual(CreateUserErrors.UsernameTakenError.create());

                verify(mockUserRepository.addUser(anything())).never();
            });

            test('should reject with an EmailTakenError', async () => {
                // Arrange
                when(mockDataValidator.validate(UserValidators.createUser, mockCreateUserDTO))
                    .thenReturn(right(mockCreateUserDTO));
                when(mockUserRepository.existsByUsername(mockCreateUserDTO.username))
                    .thenResolve(false);
                when(mockUserRepository.existsByEmail(mockCreateUserDTO.email))
                    .thenResolve(true);

                // Act, Assert
                await expect(userService.signUpUser(mockCreateUserDTO))
                    .rejects
                    .toEqual(CreateUserErrors.EmailTakenError.create());

                verify(mockUserRepository.addUser(anything())).never();
            });
        });

        describe('with correct user data', () => {
            test('should pass a user to the repository', async () => {
                // Arrange
                when(mockDataValidator.validate(UserValidators.createUser, mockCreateUserDTO))
                    .thenReturn(right(mockCreateUserDTO));
                when(mockUserRepository.existsByUsername(mockCreateUserDTO.username))
                    .thenResolve(false);
                when(mockUserRepository.existsByEmail(mockCreateUserDTO.email))
                    .thenResolve(false);

                const hashedPassword = 'hashed';
                when(mockAuthService.hashPassword(mockCreateUserDTO.password))
                    .thenResolve(hashedPassword);

                // Act
                await userService.signUpUser(mockCreateUserDTO);

                // Assert
                const expectedPersistedUser: User = {
                    id: 'constant',
                    ...mockCreateUserDTO,
                    password: hashedPassword
                };

                verify(mockUserRepository.addUser(deepEqual(expectedPersistedUser))).once();
            });
        });
    });
});
