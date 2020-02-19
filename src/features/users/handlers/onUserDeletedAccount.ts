import { UserEventingChannel } from './events';
import { EventBuses } from '../../../loaders/loadBuses';

const busMaster = EventBuses.masterEventBus;
const userEventBus = busMaster.getBus('userEventBus');

const userDeletedAccountEventHandlerProvider = () => {
    // Push job to queue to send farewell email.
    const sendFarewellEmail = userEventBus.subscribe(UserEventingChannel.USER_DELETED_ACCOUNT, payload => {
        console.log(`Sent farewell email to address: ${payload.email}.`);
    });

    // Push job to remove any user-data for GDPR.
    const removeGdprProtectedData = userEventBus.subscribe(UserEventingChannel.USER_DELETED_ACCOUNT, payload => {
        console.log(`Removing GDPR protected data for id: ${payload.id}`);
    });
}



