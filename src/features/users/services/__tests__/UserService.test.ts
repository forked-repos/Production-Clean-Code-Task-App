import { userBuilder, createUserDTOBuilder } from './fixtures/fixtures';
import { taskBuilder } from './../../../tasks/services/__tests__/fixtures/fixtures';

// Repositories, UoW, Services, & Other Dependencies
import { FakeUserRepository } from './../../repositories/__tests__/FakeUserRepository';
import { FakeTaskRepository } from './../../../tasks/repositories/__tests__/FakeTaskRepository';
import { FakeAuthenticationService } from './../../../auth/services/__tests__/FakeAuthenticationService';

// DTOs
import CreateUserDTO from '../../dtos/ingress/createUserDTO';
import UserCredentialsDTO from './../../dtos/ingress/userCredentialsDTO';

// Errors
import { CreateUserErrors } from '../../errors/errors';
import { CommonErrors, ApplicationErrors } from '../../../../common/errors/errors';
import { AuthorizationErrors } from '../../../auth/errors/errors';

// Misc
import { FakeDataValidator } from './../../../../utils/wrappers/joi/__tests__/FakeDataValidator';
import jsonwebtoken  from 'jsonwebtoken';
import _, { Many } from 'lodash';

// SUT:
import UserService from '../UserService';
import UpdateUserDTO from './../../dtos/ingress/updateUserDTO';
import { FakeOutboxRepository } from './../../../../common/repositories/outbox/__tests__/FakeOutboxRepository';
import { FakeUnitOfWorkFactory } from './../../../../common/unit-of-work/__tests__/FakeUnitOfWorkFactory';
import { execSync } from 'child_process';

let userRepository: FakeUserRepository;
let taskRepository: FakeTaskRepository;
let outboxRepository: FakeOutboxRepository;
let unitOfWorkFactory: FakeUnitOfWorkFactory;
let authService: FakeAuthenticationService;
let dataValidator: FakeDataValidator;

// SUT:
let userService: UserService;

beforeEach(() => {
    userRepository = new FakeUserRepository();
    taskRepository = new FakeTaskRepository();
    outboxRepository = new FakeOutboxRepository();
    unitOfWorkFactory = new FakeUnitOfWorkFactory();
    authService = new FakeAuthenticationService();
    dataValidator = new FakeDataValidator();

    userService = new UserService(
        userRepository,
        taskRepository,
        outboxRepository,
        unitOfWorkFactory,
        authService,
        dataValidator,
    );

    dataValidator.allowBadData(false);
});

describe('signUpUser', () => {
    describe('in a successful case', () => {
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
                id: userRepository.nextIdentity(), // Implement Hi-Lo Algorithm for this.
                password: authService.hash
            });
        });
    
        test('should dispatch the correct outbox message with the correct information', async () => {
            // Arrange
            outboxRepository.outboxMessages = [];
            const dto = createUserDTOBuilder();
    
            // Act
            await userService.signUpUser(dto);
    
            // Assert
            expect(outboxRepository.outboxMessages.length).toBe(1);
            expect(outboxRepository.outboxMessages[0]).toEqual({
                domain: 'users',
                outbox_id: outboxRepository.nextIdentity(),
                payload: JSON.stringify({
                    id: userRepository.nextIdentity(),
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    email: dto.email
                })
            });        
        });
    
        test('should commit the transaction', async () => {
            // Arrange
            const dto = createUserDTOBuilder();
    
            // Act
            await userService.signUpUser(dto);
    
            // Assert
            expect(unitOfWorkFactory.didCommit).toBe(true);
    
        }); 
    });

    test('should reject with a ValidationError if the provided user DTO failed validation', async () => {
        // Arrange
        const invalidUserData = { email: 'domain.com' };
        const dto = createUserDTOBuilder(invalidUserData);

        // Act, Assert
        await expect(userService.signUpUser(dto))
            .rejects
            .toEqual(CommonErrors.ValidationError.create('Users', '"email" must be a valid email'));

        await expect(userRepository.findUserByEmail(invalidUserData.email))
            .rejects
            .toEqual(CommonErrors.NotFoundError.create('Users'));
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

        expect(userRepository.users.length).toBe(1);
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

        expect(userRepository.users.length).toBe(1);
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

    test('should reject with a ValidationError if bad data is provided', async () => {
        // Arrange
        const dto: UserCredentialsDTO = { email: 'addr', password: '12356,>>&*A& '};

        // Act, Assert
        await expect(userService.loginUser(dto))
            .rejects
            .toEqual(CommonErrors.ValidationError.create('Users', '"email" must be a valid email'));
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
    describe('when updates are allowed', () => {
        test('should correctly update a user', async () => {
            // Arrange
            const id = 'id';
            const existingUser = userBuilder({ id });
            const updatesDto: UpdateUserDTO = { 
                email: 'new@gmail.com', 
                biography: 'A new bio.', 
                username: 'newName' 
            };
    
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

        test('should not check for email or username duplication if none are provided', async () => {
            // Arrange
            const existingUser = userBuilder();
            const updatesDto: UpdateUserDTO = { biography: 'bio' };

            await userRepository.addUser(existingUser);

            // Act
            await userService.updateUserById(existingUser.id, updatesDto);

            // Assert
            expect(userRepository.users.length).toBe(1);
            expect(userRepository.users[0]).toEqual({
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

    test('should reject with a ValidationError if new fields do not pass validation', async () => {
        // Arrange
        const existingUser = userBuilder({ id: 'id' });
        const updatesDto: UpdateUserDTO = { email: 'my-email', biography: 'a new bio' };

        await userRepository.addUser(existingUser);

        // Act, Assert
        await expect(userService.updateUserById(existingUser.id, updatesDto))
            .rejects
            .toEqual(CommonErrors.ValidationError.create('Users', '"email" must be a valid email'));

        expect(await userRepository.findUserById(existingUser.id))
            .toEqual(existingUser);
    });

    test('should reject with an EmailTakenError if a provided email for someone else is already in use', async () => {
        // Arrange
        const duplicateEmail = 'duplicate@gmail.com';
        const existingUser = userBuilder({ email: duplicateEmail });
        const updatesDto = { email: duplicateEmail }

        const me = userBuilder();
        
        await userRepository.addUser(existingUser);
        await userRepository.addUser(me);

        // Act, Assert
        await expect(userService.updateUserById(me.id, updatesDto))
            .rejects
            .toEqual(CreateUserErrors.EmailTakenError.create());

        expect(userRepository.users[0]).toEqual(existingUser);
    });

    test('should reject with UsernameTakenError if a provided username for someone else is already in use', async () => {
        // Arrange
        const duplicateUsername = 'duplicateUsername';
        const existingUser = userBuilder({ username: duplicateUsername });
        const updatesDto = { username: duplicateUsername };

        const me = userBuilder();

        await userRepository.addUser(existingUser);
        await userRepository.addUser(me);

        // Act, Assert
        await expect(userService.updateUserById(me.id, updatesDto))
            .rejects
            .toEqual(CreateUserErrors.UsernameTakenError.create());

        expect(userRepository.users[0]).toEqual(existingUser);
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

        expect(userRepository.users.length).toBe(1);
    });
});

describe('deleteUserById', () => {
    test('should correctly delete a user and associated tasks', async () => {
        // Arrange
        const userOne = userBuilder({ id: 'user-one' });
        const userTwo = userBuilder({ id: 'user-two' });

        const taskOne = taskBuilder({ owner: userOne.id });
        const taskTwo = taskBuilder({ owner: userOne.id });
        const taskThree = taskBuilder({ owner: userTwo.id });

        await userRepository.addUser(userOne);
        await userRepository.addUser(userTwo);

        await taskRepository.addTask(taskOne);
        await taskRepository.addTask(taskTwo);
        await taskRepository.addTask(taskThree);

        // Act
        await userService.deleteUserById(userOne.id);

        // Assert
        expect(userRepository.users.filter(user => user == userOne)).toEqual([]);
        expect(await userRepository.findUserById(userTwo.id)).toEqual(userTwo);

        expect(await taskRepository.findTasksByOwnerId(userOne.id)).toEqual([]);
        expect(await taskRepository.findTasksByOwnerId(userTwo.id)).toEqual([taskThree]);

        expect(unitOfWorkFactory.didCommit).toBe(true);
    });

    test('should dispatch the correct outbox message with the correct information', async () => {
        // Arrange
        const userOne = userBuilder();
        const taskOne = taskBuilder({ owner: userOne.id });

        await userRepository.addUser(userOne);
        await taskRepository.addTask(taskOne);

        // Act
        await userService.deleteUserById(userOne.id);

        // Assert
        expect(outboxRepository.outboxMessages.length).toBe(1);
        expect(outboxRepository.outboxMessages[0]).toEqual({
            outbox_id: outboxRepository.nextIdentity(),
            domain: 'users',
            payload: JSON.stringify({
                id: userOne.id,
                firstName: userOne.firstName,
                lastName: userOne.lastName,
                email: userOne.email
            })
        });
    });

    test('should reject with a NotFoundError if no user exists and rollback', async () => {
        // Act, Assert
        await expect(userService.deleteUserById('any-id'))
            .rejects
            .toEqual(CommonErrors.NotFoundError.create('Users'));

        expect(unitOfWorkFactory.didCommit).toBe(false);
        expect(unitOfWorkFactory.didRollback).toBe(true);
    });
});
