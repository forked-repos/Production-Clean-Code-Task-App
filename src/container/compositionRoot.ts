import { AwilixContainer, createContainer, InjectionMode, asClass, Lifetime, asFunction, asValue } from "awilix";

// Operations - Hashing
import bcryptjs from 'bcryptjs';
import BcryptAdapter from "../common/operations/hashing/adapters/BcryptAdapter";

// Operations - Tokens
import jsonwebtoken from "jsonwebtoken";
import JwtAdapter from "../common/operations/tokens/adapters/JwtAdapter";

// Features - Authentication
import AuthenticationService from './../features/auth/services/AuthenticationService';

// Features - Users
import UserService from "../features/users/services/UserService";
import UserRepository from "../features/users/repositories/UserRepository";

// Features - Tasks
import TaskService from "../features/tasks/services/TaskService";
import TaskRepository from "../features/tasks/repositories/TaskRepository";

// Data Access
import { KnexUnitOfWorkFactory } from './../common/unit-of-work/knex/KnexUnitOfWork';

// HTTP
import ExpressHttpResponseHandler from './../common/http/express/ExpressHttpResponseHandler';

// Eventing
import { createEventBus } from "../common/buses/EventBus";
import { UserEvents } from "../features/users/observers/events";
//import { userEventBusProvider } from './../features/users/observers/onUserSignedUp';

// Misc
import UserDomainPersistenceMapper from './../features/users/mappers/domain-dal/mapper';

import { validate } from './../utils/wrappers/joi/joiWrapper';


export const configureContainer = (): AwilixContainer => {
    const container = createContainer({ injectionMode: InjectionMode.CLASSIC });

    const lifetimeScoped = { lifetime: Lifetime.SCOPED };

    // Register Services
    container.register({
        authService: asClass(AuthenticationService, lifetimeScoped),
        userService: asClass(UserService, lifetimeScoped),
        taskService: asClass(TaskService, lifetimeScoped)
    });

    // Register Repositories
    container.register({
        userRepository: asClass(UserRepository, lifetimeScoped).singleton(),
        taskRepository: asClass(TaskRepository).singleton()
    });

    // Register Mappers
    container.register({
        userDomainPersistenceMapper: asFunction(UserDomainPersistenceMapper),
    });

    // Register Event Buses
    container.register({
        userEventBus: asFunction(() => createEventBus<UserEvents>()).classic().singleton()
    });

    // Register Event Observers
    container.register({
        //userEventBusProvider: asFunction(userEventBusProvider)
    });

    // Register Adapters
    container.register({
        hashHandler: asClass(BcryptAdapter, lifetimeScoped),
        tokenHandler: asClass(JwtAdapter, lifetimeScoped),
    });

    // Register Unit of Work
    container.register({
        unitOfWorkFactory: asClass(KnexUnitOfWorkFactory, lifetimeScoped),
    });

    // Register Misc Helpers
    container.register({
        httpHandler: asClass(ExpressHttpResponseHandler, lifetimeScoped)
    });

    // Third-Party Deps
    container.register({
        bcrypt: asValue(bcryptjs),
        jwt: asValue(jsonwebtoken),
        dataValidator: asValue({validate}),
        knexInstance: asValue({}),
    });

    return container;
};