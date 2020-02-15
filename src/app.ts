import express from 'express';

import { AwilixContainer, asValue } from 'awilix';
import { scopePerRequest, loadControllers } from 'awilix-express';

import ExpressHttpResponseHandler from './common/http/express/ExpressHttpResponseHandler';

import { userEventBusProvider } from './features/users/observers/onUserSignedUp';
import { createEventBus } from './common/buses/EventBus';
import { UserEvents } from './features/users/observers/events';

export default (container: AwilixContainer): express.Application => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const userEventBus = createEventBus<UserEvents>();

    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
        container.register({ 
            httpContext: asValue({ req, res })
        });

        next();
    });

    app.use(scopePerRequest(container));
    app.use(loadControllers('./../build/features/*/controllers/*.js', { cwd: __dirname }));

    // Just testing. I'll move this later.
    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => new ExpressHttpResponseHandler({ req, res }).fromError(err));

    return app;
}