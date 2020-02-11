
import appFactory from './app';
import { configureContainer } from './container/compositionRoot';

const container = configureContainer();

const PORT: number = (process.env.PORT && parseInt(process.env.PORT)) || 3000;

appFactory(container)
    .listen(PORT, () => console.log(`Server is up on port ${PORT}`));
