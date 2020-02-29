import 'source-map-support/register'

import cron from 'node-cron';

import * as awilix from 'awilix';
import appFactory from './app';

import databaseConnectionFactory from './config/database/connection';

// Dependency Injection
import { configureContainer } from './container/compositionRoot';
import { EventBuses } from './loaders/loadBuses';

import { messageRelayProvider } from './common/relay/messageRelay';

const container = configureContainer();
const knexInstance = databaseConnectionFactory();

cron.schedule('*/5 * * * * *', () => messageRelayProvider(knexInstance, EventBuses.masterEventBus)())

container.register({ knexInstance: awilix.asValue(knexInstance) });
const PORT: number = (process.env.PORT && parseInt(process.env.PORT)) || 3000;

appFactory(container)
    .listen(PORT, () => console.log(`Server is up on port ${PORT}`));
