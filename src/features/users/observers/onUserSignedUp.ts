import { UserSignedUpEvent } from './events';
import { EventBuses } from '../../../loaders/loadBuses';
import { IEventHandler } from '../../../common/buses/EventBus';

const busMaster = EventBuses.masterEventBus;
const userEventBus = busMaster.getBus('userEventBus');

// Fake - Will move later.
interface IEmailService {
    sendEmail(): void;
}
interface ISlackNotificationService {
    pushSlackNotification(): void;
}

interface IGoogleAnalyticsService {
    addEvent(): void;
}

interface IQueueRepository {
    push(name: string, data: any): void;
}

// Decorator?
export class UserSignedUpHandler implements IEventHandler<UserSignedUpEvent> {
    public constructor (
        private slackNotificationService: ISlackNotificationService,
        private gaService: IGoogleAnalyticsService,
        private queueRepository: IQueueRepository
    ) {}

    async handleEvent(event: UserSignedUpEvent) {
        // Job Queueing
        await this.queueRepository.push('welcome-email', event);
        await this.queueRepository.push('avatar-image-upload', event);
        
        // Other Misc
        await this.slackNotificationService.pushSlackNotification();
        await this.gaService.addEvent();
    }
}

