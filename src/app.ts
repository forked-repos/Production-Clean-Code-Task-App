import express from 'express';

import { AwilixContainer } from 'awilix';
import { scopePerRequest, loadControllers } from 'awilix-express';

export default (container: AwilixContainer): express.Application => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(scopePerRequest(container));
    app.use(loadControllers('./../build/features/*/controllers/*.js', { cwd: __dirname }));

    return app;
}