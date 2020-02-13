import express from 'express';

import { AwilixContainer } from 'awilix';
import { scopePerRequest, loadControllers } from 'awilix-express';
import { asValue } from 'awilix';
import ExpressHttpResponseHandler from './common/http/express/ExpressHttpResponseHandler';

export default (container: AwilixContainer): express.Application => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

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