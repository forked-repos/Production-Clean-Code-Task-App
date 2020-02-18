import { UserSignedUpEvent, UserEventingChannel } from './events';
import { EventBuses } from '../../../loaders/loadBuses';
import { IEventHandler } from '../../../common/buses/EventBus';
import { IEventBusEventHandler } from '../../../loaders/loadDecorator';
import { ITaskQueueService } from '../../../common/operations/queueing/services/BullTaskQueueService';

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

@IEventBusEventHandler.registerHandler('userEventBus', UserEventingChannel.USER_SIGNED_UP)
export default class UserSignedUpEventHandler implements IEventHandler<UserSignedUpEvent> {
    public constructor ( 
        private readonly taskQueueService: ITaskQueueService
    ) {}

    async handleEvent(event: UserSignedUpEvent) {
        // Job Queueing
        this.taskQueueService.addWelcomeEmail(event.firstName, event.lastName, event.email);
        this.taskQueueService.addAvatarProcessing(Buffer.from('Any'));
    }
}

