import { mock, instance } from 'ts-mockito';

// Repositories, UoW, Services, & Other Dependencies
import { FakeUserRepository } from './../../repositories/__tests__/FakeUserRepository';
import { FakeTaskRepository } from './../../../tasks/repositories/__tests__/FakeTaskRepository';
import { IUnitOfWorkFactory } from '../../../../common/unit-of-work/unit-of-work';
import { FakeAuthenticationService } from './../../../auth/services/__tests__/FakeAuthenticationService';
import { validate } from './../../../../utils/wrappers/joi/joiWrapper';
import { IDataValidator } from './../../../../common/operations/validation/validation';

// DTOs
import CreateUserDTO from '../../dtos/ingress/createUserDTO';

// Errors
import { CreateUserErrors } from '../../errors/errors';

// Misc
import { User } from './../../models/domain/userDomain';

// SUT:
import UserService from '../UserService';
import { CommonErrors } from '../../../../common/errors/errors';
import UserCredentialsDTO from './../../dtos/ingress/userCredentialsDTO';
import { AuthorizationErrors } from '../../../auth/errors/errors';

let userRepository: FakeUserRepository;
let taskRepository: FakeTaskRepository;
let unitOfWorkFactory: IUnitOfWorkFactory;
let authService: FakeAuthenticationService;

// SUT:
let userService: UserService;

beforeEach(() => {
    userRepository = new FakeUserRepository();
    taskRepository = new FakeTaskRepository();
    unitOfWorkFactory = mock<IUnitOfWorkFactory>();
    authService = new FakeAuthenticationService();

    userService = new UserService(
        userRepository,
        taskRepository,
        instance(unitOfWorkFactory),
        authService,
        { validate: validate } as IDataValidator
    );
});

const userBuilder = (opts?: Partial<User>): User => ({
    id: 'id',
    firstName: 'John',
    lastName: 'Doe',
    username: 'JDoe',
    email: 'john_doe@gmail.com',
    password: 'hashed-password',
    biography: 'some bio',
    ...opts
});

const createUserDTOBuilder = (opts?: Partial<CreateUserDTO>): CreateUserDTO => ({
    firstName: 'Jane',
    lastName: 'Doe',
    username: 'JaneDoe',
    email: 'janedoe@gmail.com',
    password: 'ABC123abc23&',
    biography: 'some bio',
    ...opts
});

describe('signUpUser', () => {
    test('should correctly sign up a user', async () => {
        // Arrange
        const dto = createUserDTOBuilder();

        // Act
        await userService.signUpUser(dto);

        // Assert
        const user = await userRepository.findUserByEmail(dto.email);

        expect(authService.didHash(dto.password)).toBe(true);
        expect(user).toEqual({
            ...dto,
            id: 'create-an-id',
            password: authService.hash
        });
    });

    test('should reject with a UsernameTakenError if a provided username is in use', async () => {
        // Arrange
        const duplicateUsername = 'j_doe';
        const dto = createUserDTOBuilder({ username: duplicateUsername });
        const existingUser = userBuilder({ username: duplicateUsername });

        await userRepository.addUser(existingUser);

        // Act, Assert
        await expect(userService.signUpUser(dto))
            .rejects
            .toEqual(CreateUserErrors.UsernameTakenError.create());
    });

    test('should reject with an EmailTakenError if a provided email is in use', async () => {
        // Arrange
        const duplicateEmail = 'jDoe@gmail.com';
        const dto = createUserDTOBuilder({ email: duplicateEmail });
        const existingUser = userBuilder({ email: duplicateEmail });

        await userRepository.addUser(existingUser);

        // Act, Assert
        await expect(userService.signUpUser(dto))
            .rejects
            .toEqual(CreateUserErrors.EmailTakenError.create());
    });

    test('should reject with a ValidationError if the provided user DTO failed validation', async () => {
        // Arrange
        const invalidUserData = { email: 'domain.com' };
        const dto = createUserDTOBuilder(invalidUserData);

        // Act, Assert
        await expect(userService.signUpUser(dto))
            .rejects
            .toEqual(CommonErrors.ValidationError.create('Users', '"email" must be a valid email'));
    });
});

describe('loginUser', () => {
    test('should return a correct login response DTO for a user with correct credentials', async () => {
        // Arrange
        const knownEmail = 'jdoe@gmail.com';
        const knownPassword = '123!aA.#14w';
        const existingUser = userBuilder({ email: knownEmail, password: knownPassword });
        const dto: UserCredentialsDTO = { email: knownEmail, password: knownPassword };

        await userRepository.addUser(existingUser);

        // Act
        const tokenDTO = await userService.loginUser(dto);

        // Assert
        expect(tokenDTO).toEqual({ token: authService.token });
        expect(authService.didGenerateTokenForPayload({ id: existingUser.id })).toBe(true);
    });

    test('should reject with an AuthorizationError if a user does not exist by the provided email', async () => {
        // Arrange
        const existingEmail = 'jdoe@gmail.com';
        const candidateEmail = 'jdoe@outlook.com';
        const existingUser = userBuilder({ email: existingEmail });
        const dto: UserCredentialsDTO = { email: candidateEmail, password: '132abc!@#Q' };

        await userRepository.addUser(existingUser);

        // Act, Assert
        await expect(userService.loginUser(dto))
            .rejects
            .toEqual(AuthorizationErrors.AuthorizationError.create('Users'));
    });

    test('should reject with AuthorizationError if a user exists but passwords do not match', async () => {
        // Arrange
        const existingEmail = 'jdoe@gmail.com';
        const existingPassword = '132abc!@A5';
        const candidatePassword = 'abc67qA45^&';
        const existingUser = userBuilder({ email: existingEmail, password: existingPassword });
        const dto: UserCredentialsDTO = { email: existingEmail, password: candidatePassword };

        await userRepository.addUser(existingUser);

        // Act, Assert
        await expect(userService.loginUser(dto))
            .rejects
            .toEqual(AuthorizationErrors.AuthorizationError.create('Users'));
    });
});

