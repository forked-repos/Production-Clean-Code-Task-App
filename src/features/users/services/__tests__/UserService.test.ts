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
