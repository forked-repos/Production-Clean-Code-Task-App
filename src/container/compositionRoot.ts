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

// Misc
import UserDomainPersistenceMapper from './../features/users/mappers/domain-dal/mapper';
import TaskDomainPersistenceMapper from './../features/tasks/mappers/domain-dal/mapper';

import { validate } from './../utils/wrappers/joi/joiWrapper';

import { PushProcessAvatarJob, PushWelcomeEmailJob } from '../features/users/pub-sub/handlers/userSignedUpHandlers';
import BullTaskQueueService from "../common/operations/queueing/services/BullTaskQueueService";
import OutboxRepository from "../common/repositories/outbox/OutboxRepository";




export const configureContainer = (): AwilixContainer => {
    const container = createContainer({ injectionMode: InjectionMode.CLASSIC });

    const lifetimeScoped = { lifetime: Lifetime.SCOPED };

    // Register Services
    container.register({
        authService: asClass(AuthenticationService, lifetimeScoped),
        userService: asClass(UserService, lifetimeScoped),
        taskService: asClass(TaskService, lifetimeScoped),
        taskQueueService: asClass(BullTaskQueueService)
    });

    // Register Repositories
    container.register({
        userRepository: asClass(UserRepository, lifetimeScoped).singleton(),
        taskRepository: asClass(TaskRepository).singleton(),
        outboxRepository: asClass(OutboxRepository).singleton()
    });

    // Register Event Handlers
    container.loadModules([
        [
            './../../build/features/*/pub-sub/handlers/*.js'
        ]
    ], { cwd: __dirname, resolverOptions: { register: asClass } });

    // Register Mappers
    container.register({
        userDomainPersistenceMapper: asFunction(UserDomainPersistenceMapper),
        taskDomainPersistenceMapper: asFunction(TaskDomainPersistenceMapper)
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