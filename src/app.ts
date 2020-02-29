import express from 'express';
import cron from 'node-cron';

import { AwilixContainer, asValue } from 'awilix';
import { scopePerRequest, loadControllers } from 'awilix-express';

import ExpressHttpResponseHandler from './common/http/express/ExpressHttpResponseHandler';

import { EventBuses } from './loaders/loadBuses';

import { IEventBusEventHandler } from './loaders/loadDecorator';
import { ClassHandlerOrObserver } from './common/buses/EventBus';
import { messageRelayProvider } from './common/relay/messageRelay';

export default (container: AwilixContainer): express.Application => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const masterBus = EventBuses.masterEventBus;

    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
        container.register({ 
            httpContext: asValue({ req, res }),
            eventBusMaster: asValue(masterBus)
        });

        next();
    });

    // Subscribing Event Handlers
    (() => {
        const busHandlerMap = IEventBusEventHandler.getEventHandlerImplementations();

        busHandlerMap.forEach((handlers, busNameChannel) => {
            handlers.forEach(handler => masterBus.subscribe(
                busNameChannel.busName,
                busNameChannel.channel,
                container.resolve(handler.name) as ClassHandlerOrObserver<any>
            ));
        });
    })();

    app.use(scopePerRequest(container));
    app.use(loadControllers('./../build/features/*/controllers/*.js', { cwd: __dirname }));

    // Just testing. I'll move this later.
    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => new ExpressHttpResponseHandler({ req, res }).fromError(err));

    return app;
}