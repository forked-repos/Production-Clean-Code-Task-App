// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Express } from 'express-serve-static-core';

import { AwilixContainer } from 'awilix';

import { User } from './../features/users/models/domain/userDomain';
import { Task } from './../features/tasks/models/domain/taskDomain';

declare module 'express-serve-static-core' {
    interface Request {
        container: AwilixContainer;
        token?: string;
        user?: User;
    }
}