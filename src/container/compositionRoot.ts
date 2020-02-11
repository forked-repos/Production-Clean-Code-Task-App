import { AwilixContainer, createContainer, InjectionMode, asClass, Lifetime, asFunction, asValue } from "awilix";

import AuthenticationService from './../features/auth/services/AuthenticationService';
import UserService from "../features/users/services/UserService";
import UserRepository from "../features/users/repositories/UserRepository";
import TaskRepository from "../features/tasks/repositories/TaskRepository";

import UserDomainPersistenceMapper from './../features/users/mappers/domain-dal/mapper';
import BcryptAdapter from "../common/operations/hashing/adapters/BcryptAdapter";
import JwtAdapter from "../common/operations/tokens/adapters/JwtAdapter";
import { KnexUnitOfWorkFactory } from './../common/unit-of-work/knex/KnexUnitOfWork';
import ExpressHttpResponseHandler from './../common/http/express/ExpressHttpResponseHandler';

import bcryptjs from 'bcryptjs';
import jsonwebtoken from "jsonwebtoken";
import { validate } from './../utils/wrappers/joi/joiWrapper';

export const configureContainer = (): AwilixContainer => {
    const container = createContainer({ injectionMode: InjectionMode.CLASSIC });

    const lifetimeScoped = { lifetime: Lifetime.SCOPED };

    // Register Services
    container.register({
        authService: asClass(AuthenticationService, lifetimeScoped),
        userService: asClass(UserService, lifetimeScoped),
    });

    // Register Repositories
    container.register({
        userRepository: asClass(UserRepository, lifetimeScoped),
        taskRepository: asClass(TaskRepository)
    });

    // Register Mappers
    container.register({
        mapper: asFunction(UserDomainPersistenceMapper)
    });

    // Register Adapters
    container.register({
        hashHandler: asClass(BcryptAdapter, lifetimeScoped),
        tokenHandler: asClass(JwtAdapter, lifetimeScoped),
    });

    // Register Unit of Work
    container.register({
        KnexUnitOfWorkFactory: asClass(KnexUnitOfWorkFactory, lifetimeScoped),
    });

    // Register Misc Helpers
    container.register({
        expressHttpResponseHandler: asClass(ExpressHttpResponseHandler, lifetimeScoped)
    });

    // Third-Party Deps
    container.register({
        bcrypt: asValue(bcryptjs),
        jwt: asValue(jsonwebtoken),
        dataValidator: asFunction(validate)
    })

    return container;
};