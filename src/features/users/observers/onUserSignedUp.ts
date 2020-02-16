import { UserEventingChannel, UserSignedUpEvent } from './events';
import { EventBuses } from '../../../loaders/loadBuses';
import { IEventHandler } from '../../../common/buses/EventBus';

const busMaster = EventBuses.masterEventBus;
const userEventBus = busMaster.getBus('userEventBus');

class EnqueueWelcomeEmailHandler implements IEventHandler<UserSignedUpEvent> {
    handleEvent(event: UserSignedUpEvent): void {
        throw new Error("Method not implemented.");
    }
}

class EnqueueImageProcessHandler implements IEventHandler<UserSignedUpEvent> {
    handleEvent(event: UserSignedUpEvent): void {
        throw new Error("Method not implemented.");
    }
}

const userSignedUpHandlersProvider = () => {
    const enqueueWelcomeEmail = userEventBus.subscribe(UserEventingChannel.USER_SIGNED_UP, payload => {
        console.log(`Sent welcome email to address: ${payload.email}.`);
    });
    
    // Push job to queue to process and upload images.
    const enqueueImageProcessing = userEventBus.subscribe(UserEventingChannel.USER_SIGNED_UP, payload => {
        console.log(`Enqueued image processing job for id: ${payload.id}`);
    });
    
    // Push job to queue to send Slack Notification to company channel.
    const sendSlackNotification = userEventBus.subscribe(UserEventingChannel.USER_SIGNED_UP, payload => {
        console.log(`Sent Slack Notification for new sign up. User had id ${payload.id}`);
    });
    
    // Publish Google Analytics event.
    const pushGAEvent = userEventBus.subscribe(UserEventingChannel.USER_SIGNED_UP, payload => {
        console.log(`Investors are happy. Pushed Google Analytics event. ${payload.id}`)
    });
}



