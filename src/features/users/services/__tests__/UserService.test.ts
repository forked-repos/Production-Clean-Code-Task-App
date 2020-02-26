import { mock, instance } from 'ts-mockito';

// Repositories, UoW, Services, & Other Dependencies
import { FakeUserRepository } from './../../repositories/__tests__/FakeUserRepository';
import { FakeTaskRepository } from './../../../tasks/repositories/__tests__/FakeTaskRepository';
import { IUnitOfWorkFactory } from '../../../../common/unit-of-work/unit-of-work';
import { FakeAuthenticationService } from './../../../auth/services/__tests__/FakeAuthenticationService';

// DTOs
import CreateUserDTO from '../../dtos/ingress/createUserDTO';
import UserCredentialsDTO from './../../dtos/ingress/userCredentialsDTO';

// Errors
import { CreateUserErrors } from '../../errors/errors';
import { CommonErrors, ApplicationErrors } from '../../../../common/errors/errors';
import { AuthorizationErrors } from '../../../auth/errors/errors';

// Misc
import { User } from './../../models/domain/userDomain';
import { FakeDataValidator } from './../../../../utils/wrappers/joi/__tests__/FakeDataValidator';
import jsonwebtoken  from 'jsonwebtoken';
import _, { Many } from 'lodash';

// SUT:
import UserService from '../UserService';
import UpdateUserDTO from './../../dtos/ingress/updateUserDTO';
import { IEventBus, createEventBus } from './../../../../common/buses/EventBus';
import { UserEvents } from '../../pub-sub/events';
import { IEventBusMaster, EventBusMaster } from './../../../../common/buses/MasterEventBus';

let userRepository: FakeUserRepository;
let taskRepository: FakeTaskRepository;
let unitOfWorkFactory: IUnitOfWorkFactory;
let authService: FakeAuthenticationService;
let dataValidator: FakeDataValidator;
let masterEventBus;

// SUT:
let userService: UserService;

beforeEach(() => {
    userRepository = new FakeUserRepository();
    taskRepository = new FakeTaskRepository();
    unitOfWorkFactory = mock<IUnitOfWorkFactory>();
    authService = new FakeAuthenticationService();
    dataValidator = new FakeDataValidator();
    masterEventBus = new EventBusMaster({ userEventBus: mock<IEventBus<UserEvents>>() });

    userService = new UserService(
        userRepository,
        taskRepository,
        instance(unitOfWorkFactory),
        authService,
        dataValidator,
        masterEventBus
    );

    dataValidator.allowBadData(false);
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
    test('should correctly persist a user', async () => {
        // Arrange
        const dto = createUserDTOBuilder();

        // Act
        await userService.signUpUser(dto);

        // Assert
        const user = await userRepository.findUserByEmail(dto.email);

        expect(authService.didHash(dto.password)).toBe(true);
        expect(user).toEqual({
            ...dto,
            id: 'id', // Implement Hi-Lo Algorithm for this.
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
        const payload = { id: existingUser.id };
        const expectedToken = jsonwebtoken.sign(payload, 'my-secret', { expiresIn: '15 minutes' });
        expect(tokenDTO).toEqual({ token: expectedToken });
    });

    test('should reject with an AuthorizationError if a user does not exist by the provided email', async () => {
        // Arrange
        const candidateEmail = 'jdoe@outlook.com';
        const dto: UserCredentialsDTO = { email: candidateEmail, password: '132abc!@#Q' };

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

    test('should reject with an UnexpectedError in the event of a non-NotFound, non-AuthorizationError', async () => {
        // Arrange
        const triggerEmail = 'network-error';
        const dto: UserCredentialsDTO = { email: triggerEmail, password: '123abcAB!@#' };
        dataValidator.allowBadData(true);

        // Act, Assert
        await expect(userService.loginUser(dto))
            .rejects
            .toEqual(ApplicationErrors.UnexpectedError.create());
    });

    test('should reject with a ValidationError if bad data is provided', async () => {
        // Arrange
        const dto: UserCredentialsDTO = { email: 'addr', password: '12356,>>&*A& '};

        // Act, Assert
        await expect(userService.loginUser(dto))
            .rejects
            .toEqual(CommonErrors.ValidationError.create('Users', '"email" must be a valid email'))
    });
});

describe('findUserById', () => {
    test('should return a Response DTO of the correct form if a valid, existing ID is provided', async () => {
        // Arrange
        const id = '1';
        const existingUser = userBuilder({ id });

        userRepository.addUser(existingUser);

        // Act
        const dto = await userService.findUserById(id);

        // Assert
        expect(dto).toEqual({ user: _.omit(existingUser, ['password'] as Many<any>) });
    });
});

describe('updateUserById', () => {
    test('should reject with a ValidationError if new fields do not pass validation', async () => {
        // Arrange
        const updatesDto: UpdateUserDTO = { email: 'my-email', biography: 'a new bio' };

        // Act, Assert
        await expect(userService.updateUserById('id', updatesDto))
            .rejects
            .toEqual(CommonErrors.ValidationError.create('Users', '"email" must be a valid email'));

    });

    test('should reject with an EmailTakenError if a provided email is already in use', async () => {
        // Arrange
        const duplicateEmail = 'duplicate@gmail.com';
        const existingUser = userBuilder({ email: duplicateEmail });
        const updatesDto = { email: duplicateEmail }
        
        await userRepository.addUser(existingUser);

        // Act, Assert
        await expect(userService.updateUserById('id', updatesDto))
            .rejects
            .toEqual(CreateUserErrors.EmailTakenError.create());
    });

    test('should reject with UsernameTakenError if a provided username is already in use', async () => {
        // Arrange
        const duplicateUsername = 'duplicateUsername';
        const existingUser = userBuilder({ username: duplicateUsername });
        const updatesDto = { username: duplicateUsername };

        await userRepository.addUser(existingUser);

        // Act, Assert
        await expect(userService.updateUserById('id', updatesDto))
            .rejects
            .toEqual(CreateUserErrors.UsernameTakenError.create())
    });

    test('should reject with NotFoundError if a provided id is not found', async () => {
        // Arrange
        const existingID = 'id';
        const unknownID = 'unknown_id';
        const existingUser = userBuilder({ id: existingID });

        await userRepository.addUser(existingUser)
        
        // Act, Assert
        await expect(userService.updateUserById(unknownID, {}))
            .rejects
            .toEqual(CommonErrors.NotFoundError.create('Users'));
    });

    test('should correctly update a user', async () => {
        // Arrange
        const id = 'id';
        const existingUser = userBuilder({ id });
        const updatesDto: UpdateUserDTO = { email: 'new@gmail.com', biography: 'A new bio.' };

        await userRepository.addUser(existingUser);

        // Act
        await userService.updateUserById(id, updatesDto);

        // Assert
        const updatedUser = await userRepository.findUserById(id);
        expect(updatedUser).toEqual({
            ...existingUser,
            ...updatesDto
        });
    });

    test('should not mutate existing id',async  () => {
        // Arrange
        const originalId = 'original';
        const newId = 'updated';
        const existingUser = userBuilder({ id: originalId });
        const updatesDto = { id: newId };

        await userRepository.addUser(existingUser);

        // Act, Assert
        await expect(userService.updateUserById(originalId, updatesDto as UpdateUserDTO))
            .rejects
            .toEqual(CommonErrors.ValidationError.create('Users', '"id" is not allowed'));

        const persistedUser = await userRepository.findUserByEmail(existingUser.email);
        expect(persistedUser).toEqual(existingUser);
    });

    test('should not mutate existing password', async () => {
        // Arrange
        const id = 'id';
        const originalPassword = 'somePass123.%^';
        const newPassword = 'aNewPass7^^&*0';
        const existingUser = userBuilder({ id, password: originalPassword });
        const updatesDto = { password: newPassword };

        await userRepository.addUser(existingUser);

        // Act, Assert
        await expect(userService.updateUserById(id, updatesDto as UpdateUserDTO))
            .rejects
            .toEqual(CommonErrors.ValidationError.create('Users', '"password" is not allowed'));

        const persistedUser = await userRepository.findUserByEmail(existingUser.email);
        expect(persistedUser).toEqual(existingUser);
    });
});
