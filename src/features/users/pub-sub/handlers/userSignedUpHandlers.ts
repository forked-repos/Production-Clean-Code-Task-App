import { UserSignedUpEvent, UserEventingChannel } from '../events';
import { EventBuses } from '../../../../loaders/loadBuses';
import { IEventHandler } from '../../../../common/buses/EventBus';
import { IEventBusEventHandler } from '../../../../loaders/loadDecorator';
import { ITaskQueueService } from '../../../../common/operations/queueing/services/BullTaskQueueService';
import { RESOLVER } from 'awilix';

@IEventBusEventHandler.registerHandler('userEventBus', UserEventingChannel.USER_SIGNED_UP)
export class PushWelcomeEmailJob implements IEventHandler<UserSignedUpEvent> {
    static [RESOLVER] = {
        name: 'PushWelcomeEmailJob'
    }
    
    public constructor ( 
        private readonly taskQueueService: ITaskQueueService
    ) {}

    async handleEvent(event: UserSignedUpEvent) {
        try {
            await this.taskQueueService.addWelcomeEmail(event.firstName, event.lastName, event.email);
        } catch (e) {
            console.log('Could not push send email job');
        }
    }
}

@IEventBusEventHandler.registerHandler('userEventBus', UserEventingChannel.USER_SIGNED_UP)
export class PushProcessAvatarJob implements IEventHandler<UserSignedUpEvent> {
    static [RESOLVER] = {
        name: 'PushProcessAvatarJob'
    }

    public constructor ( 
        private readonly taskQueueService: ITaskQueueService
    ) {}

    async handleEvent(event: UserSignedUpEvent) {
        try {
            await this.taskQueueService.addAvatarProcessing(Buffer.from('Any'), event.firstName);
        } catch (e) {
            console.log('Send notification, could not process avatar.');
        }
    }
}




