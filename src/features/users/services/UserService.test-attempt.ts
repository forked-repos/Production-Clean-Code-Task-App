
import { IUserRepository } from './../repositories/UserRepository';
import { User } from './../models/domain/userDomain';
import { IUnitOfWork, IUnitOfWorkFactory } from './../../../common/unit-of-work/unit-of-work';
import { ITaskRepository } from './../../tasks/repositories/TaskRepository';
import { Task } from './../../tasks/models/domain/taskDomain';
import { IAuthenticationService } from '../../auth/services/AuthenticationService';
import { ITokenPayload } from './../../auth/services/AuthenticationService';
import { ITokenDecodingOptions } from '../../../common/operations/tokens/adapters/JwtAdapter';
import { Either, left } from '../../../utils/logic/Either';
import { ITokenEncodingOptions } from './../../../common/operations/tokens/adapters/JwtAdapter';
import { AuthorizationErrors } from '../../auth/errors/errors';
import { IDataValidator } from './../../../common/operations/validation/validation';
import UserService, { IUserService } from './UserService';
import { right } from './../../../utils/logic/Either';
import { CommonErrors, ApplicationErrors } from '../../../common/errors/errors';

class FakeUserRepository implements IUserRepository {
    public users: User[] = [];

    async existsByUsername(username: string): Promise<boolean> {
        return !!this.users.filter(user => user.username === username)[0];
    }    
    
    async existsByEmail(email: string): Promise<boolean> {
        return !!this.users.filter(user => user.email === email)[0];
    }
    
    async findUserByEmail(email: string): Promise<User> {
        const user = this.users.filter(user => user.email === email)[0];

        if (!user)
            return Promise.reject(CommonErrors.NotFoundError.create('Users'));

        return user;
    }
    
    async findUserById(id: string): Promise<User> {
        const user = this.users.filter(user => user.id === id)[0];

        if (!user)
            return Promise.reject(CommonErrors.NotFoundError.create('Users'));

        return user;
    }
    
    async updateUser(updatedUser: User): Promise<void> {
        const doesUserExist = await this.existsById(updatedUser.id);

        if (!doesUserExist)
            return Promise.reject(CommonErrors.NotFoundError.create('Users'));

        const userToUpdate = await this.findUserById(updatedUser.id);
        const userToUpdatedIndex = this.users.indexOf(userToUpdate);
        this.users[userToUpdatedIndex] = updatedUser;
    }
    
    async addUser(user: User): Promise<void> {
        this.users.push(user);
    }
    
    async removeUserById(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    async exists(t: User): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    
    async existsById(id: string): Promise<boolean> {
        return !!this.users.filter(user => user.id === id)[0];
    }
    
    forUnitOfWork(unitOfWork: IUnitOfWork): this {
        throw new Error("Method not implemented.");
    }   
}

class FakeTaskRepository implements ITaskRepository {
    removeTasksByOwnerId(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }    
    
    exists(t: Task): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    existsById(id: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    forUnitOfWork(unitOfWork: IUnitOfWork): this {
        throw new Error("Method not implemented.");
    }
}

class FakeUnitOfWorkFactory implements IUnitOfWorkFactory {
    create(): Promise<IUnitOfWork> {
        throw new Error("Method not implemented.");
    }
}

class FakeAuthenticationService implements IAuthenticationService {
    hashPassword(plainTextPassword: string, rounds?: number): Promise<string> {
        throw new Error("Method not implemented.");
    }    
    
    async checkHashMatch(candidate: string, hash: string): Promise<boolean> {
        if (candidate === hash) {
            return true;
        } else {
            return false;
        }
    }

    generateAuthToken(payload: ITokenPayload, opts?: ITokenEncodingOptions): string {
        if (payload.id === 'cause-error')
            throw new Error();

        return `${JSON.stringify(payload)}-${JSON.stringify(opts)}`;
    }

    verifyAndDecodeAuthToken(token: string, opts?: ITokenDecodingOptions): Either<AuthorizationErrors.AuthorizationError, ITokenPayload> {
        throw new Error("Method not implemented.");
    }
}

class FakeDataValidator implements IDataValidator {
    private shouldPass: boolean = true;
    private failureMessage: string = '';

    setToFailValidation(message: string) {
        this.shouldPass = false;
        this.failureMessage = message;
    }

    setToPassValidation() {
        this.shouldPass = true;
    }

    validate<TSchema, TCandidate>(objSchema: TSchema, candidate: TCandidate): Either<string, TCandidate> {
        if (this.shouldPass) {
            return right(candidate);
        } else {
            return left(this.failureMessage);
        }
    };
}

let fakeUserRepository: FakeUserRepository;
let fakeTaskRepository: FakeTaskRepository;
let fakeUnitOfWorkFactory: FakeUnitOfWorkFactory;
let fakeAuthenticationService: FakeAuthenticationService;
let fakeDataValidator: FakeDataValidator;

// SUT:
let userService: IUserService;

beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    fakeTaskRepository = new FakeTaskRepository();
    fakeUnitOfWorkFactory = new FakeUnitOfWorkFactory();
    fakeAuthenticationService = new FakeAuthenticationService();
    fakeDataValidator = new FakeDataValidator();

    userService = new UserService(
        fakeUserRepository,
        fakeTaskRepository,
        fakeUnitOfWorkFactory,
        fakeAuthenticationService,
        fakeDataValidator
    );

    // Config Setup
    fakeDataValidator.setToPassValidation();
    fakeUserRepository.users = [];
});

describe('loginUser()', () => {
    const credentialsDTO = {
        email: 'email',
        password: 'password'
    };

    describe('with malformed credentials', () => {
        test('should reject with ValidationError when Validator returns left-result', async () => {
            // Arrange
            const failureMessage = 'Prop "x" failed check "y"';
            fakeDataValidator.setToFailValidation(failureMessage);

            // Act, Assert
            await expect(userService.loginUser(credentialsDTO))
                .rejects
                .toEqual(CommonErrors.ValidationError.create('Users', failureMessage));
        });
    });

    describe('when dependencies error out', () => {
        test('should reject with AuthorizationError if UserRepository rejects with NotFoundError', async () => {
            // Act
            await expect(userService.loginUser(credentialsDTO))
                .rejects
                .toEqual(AuthorizationErrors.AuthorizationError.create('Users'))
        });
    
        test('should reject with AuthorizationError if passwords/hashes do not match', async () => {
            // Arrange
            const fakeUser = {
                id: 'fake-id',
                firstName: 'john',
                lastName: 'doe',
                username: 'some-username',
                email: credentialsDTO.email,
                password: 'a password',
                biography: 'bio',
            };

            fakeUserRepository.addUser(fakeUser);

            // Act, Assert
            await expect(userService.loginUser(credentialsDTO))
                .rejects
                .toEqual(AuthorizationErrors.AuthorizationError.create('Users'));
        });
    
        test('should reject with UnexpectedError if a non-Authorization/non-NotFound Error is thrown', async () => {
            // Arrange
            const fakeUser: User = {
                id: 'cause-error',
                firstName: 'name',
                lastName: 'name',
                username: 'some name',
                email: credentialsDTO.email,
                password: credentialsDTO.password,
                biography: 'data'
            };

            fakeUserRepository.addUser(fakeUser);

            // Act, Assert
            await expect(userService.loginUser(credentialsDTO))
                .rejects
                .toEqual(ApplicationErrors.UnexpectedError.create('Users'))

        });
    });

    describe('with correctly formed credentials', () => {
        describe('with no errors', () => {
            test('should return a token made from correct payload with correct expiry date', async () => {
                // Arrange
                const fakeUser: User = {
                    id: 'a user id',
                    firstName: 'John',
                    lastName: 'Doe',
                    username: 'username',
                    email: credentialsDTO.email,
                    password: credentialsDTO.password,
                    biography: 'bio'
                };

                fakeUserRepository.addUser(fakeUser);

                // Act
                const tokenResult = await userService.loginUser(credentialsDTO);

                // Assert
                expect(tokenResult).toEqual({
                    token: `${JSON.stringify({ id: fakeUser.id })}-${JSON.stringify({ expiresIn: '15 minutes'})}`
                })
            });
        });
    });
});
