import { when, mock, anything, instance, verify, deepEqual } from 'ts-mockito';

// Authentication
import { IAuthenticationService } from '../../auth/services/AuthenticationService';
import { ITokenPayload } from '../../auth/services/AuthenticationService';
import { ITokenEncodingOptions, ITokenDecodingOptions } from '../../../common/operations/tokens/adapters/JwtAdapter';
import { AuthorizationErrors } from '../../auth/errors/errors';

// Repository & UoW
import { IUserRepository } from '../repositories/UserRepository';
import { ITaskRepository } from '../../tasks/repositories/TaskRepository';
import { IUnitOfWork, IUnitOfWorkFactory } from '../../../common/unit-of-work/unit-of-work';

// Service & Service DTOs
import UserService, { IUserService } from './UserService';
import CreateUserDTO from '../dtos/ingress/createUserDTO';

// Domain Models
import { User } from '../models/domain/userDomain';
import { Task } from '../../tasks/models/domain/taskDomain';

// Validation
import { IDataValidator } from '../../../common/operations/validation/validation';

// Errors
import { CommonErrors, ApplicationErrors } from '../../../common/errors/errors';
import { CreateUserErrors } from '../errors/errors';

// Utils
import { Either, left, right } from '../../../utils/logic/Either';
import { UserValidators } from '../validation/userValidation';
import UserCredentialsDTO from '../dtos/ingress/userCredentialsDTO';

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
                    id: 'create-an-id',
                    ...mockCreateUserDTO,
                    password: hashedPassword
                };

                verify(mockUserRepository.addUser(deepEqual(expectedPersistedUser))).once();
            });
        });
    });

    describe('signUpUser', () => {
        const mockCredentialsDTO: UserCredentialsDTO = {
            email: 'email',
            password: 'password'
        };

        describe('with malformed credentials data', () => {
            test('should reject with a ValidationError', async () => {
                // Arrange
                const errorMessage = 'A message.';
                when(mockDataValidator.validate(UserValidators.userCredentials, mockCredentialsDTO))
                    .thenReturn(left(errorMessage));

                // Act, Expert
                await expect(userService.loginUser(mockCredentialsDTO))
                    .rejects
                    .toEqual(CommonErrors.ValidationError.create('User', errorMessage));
            });
        });       
        
        describe('with incorrect login information', () => {
            test('should reject with AuthorizationError if user does not exist by email', async () => {
                // Arrange
                when(mockDataValidator.validate(UserValidators.userCredentials, mockCredentialsDTO))
                    .thenReturn(right(mockCredentialsDTO));
                when(mockUserRepository.findUserByEmail(mockCredentialsDTO.email))
                    .thenReject(CommonErrors.NotFoundError.create());

                // Act, Assert
                await expect(userService.loginUser(mockCredentialsDTO))
                    .rejects
                    .toEqual(AuthorizationErrors.AuthorizationError.create('User'));
            });

            test('should reject with an AuthorizationError if passwords do not match', async () => {
                // Arrange
                const actualPassword = 'password-hash';
                when(mockDataValidator.validate(UserValidators.userCredentials, mockCredentialsDTO))
                    .thenReturn(right(mockCredentialsDTO));
                when(mockUserRepository.findUserByEmail(mockCredentialsDTO.email))
                    .thenResolve({
                        id: '123',
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@live.com',
                        username: 'JDoe',
                        biography: 'Lorem ipsum',
                        password: actualPassword
                    });
                when(mockAuthService.checkHashMatch(mockCredentialsDTO.password, actualPassword))
                    .thenResolve(false);
                

                // Act, Assert
                await expect(userService.loginUser(mockCredentialsDTO))
                    .rejects
                    .toEqual(AuthorizationErrors.AuthorizationError.create('Users'));
            });        
            
        });

        describe('with AuthenticationService errors', () => {
            test('should reject with UnexpectedError if passwords can not be compared', async () => {
                // Arrange
                const actualPassword = 'correct-hash';
                when(mockDataValidator.validate(UserValidators.userCredentials, mockCredentialsDTO))
                    .thenReturn(right(mockCredentialsDTO));
                when(mockUserRepository.findUserByEmail(mockCredentialsDTO.email))
                    .thenResolve({
                        id: '123',
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@live.com',
                        username: 'JDoe',
                        biography: 'Lorem ipsum',
                        password: actualPassword
                    });
                when(mockAuthService.checkHashMatch(mockCredentialsDTO.password, actualPassword))
                    .thenReject(ApplicationErrors.UnexpectedError.create());

                // Act, Assert
                await expect(userService.loginUser(mockCredentialsDTO))
                    .rejects
                    .toEqual(ApplicationErrors.UnexpectedError.create('Users'));
            });

            test('should reject with UnexpectedError if token can not be generated', async () => {
                const actualPassword = 'correct-hash';
                const userID = '123';
                when(mockDataValidator.validate(UserValidators.userCredentials, mockCredentialsDTO))
                    .thenReturn(right(mockCredentialsDTO));
                when(mockUserRepository.findUserByEmail(mockCredentialsDTO.email))
                    .thenResolve({
                        id: userID,
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@live.com',
                        username: 'JDoe',
                        biography: 'Lorem ipsum',
                        password: actualPassword
                    });
                when(mockAuthService.checkHashMatch(mockCredentialsDTO.password, actualPassword))
                    .thenResolve(true);
                when(mockAuthService.generateAuthToken(deepEqual({ id: userID }), anything()))
                    .thenThrow(ApplicationErrors.UnexpectedError.create('Users'));

                // Act, Assert
                await expect(userService.loginUser(mockCredentialsDTO))
                    .rejects
                    .toEqual(ApplicationErrors.UnexpectedError.create('Users'));
            });
        });

        describe('with UserRepository errors', () => {
            test('should reject with UnexpectedError if data layer throws error', async () => {
                // Arrange
                when(mockDataValidator.validate(UserValidators.userCredentials, mockCredentialsDTO))
                    .thenReturn(right(mockCredentialsDTO));
                when(mockUserRepository.findUserByEmail(mockCredentialsDTO.email))
                    .thenThrow(new Error());
                
                // Act, Assert
                await expect(userService.loginUser(mockCredentialsDTO))
                    .rejects
                    .toEqual(ApplicationErrors.UnexpectedError.create('Users'));
            });
        });     
        
        describe('with correct login information', () => {
            test('should return a new token with correct expiry options', async () => {
                // Arrange
                const token = 'token';
                const actualPassword = 'correct-hash';
                const userID = '123';
                when(mockDataValidator.validate(UserValidators.userCredentials, mockCredentialsDTO))
                    .thenReturn(right(mockCredentialsDTO));
                when(mockUserRepository.findUserByEmail(mockCredentialsDTO.email))
                    .thenResolve({
                        id: userID,
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@live.com',
                        username: 'JDoe',
                        biography: 'Lorem ipsum',
                        password: actualPassword
                    });
                when(mockAuthService.checkHashMatch(mockCredentialsDTO.password, actualPassword))
                    .thenResolve(true);
                when(mockAuthService.generateAuthToken(deepEqual({ id: userID }), deepEqual({ expiresIn: '15 minutes'}))) 
                    .thenReturn(token);

                // Act
                const receivedToken = await userService.loginUser(mockCredentialsDTO);

                // Assert
                expect(receivedToken).toEqual({token});
            });
        });
    });
});
