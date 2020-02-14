import events from 'events';

import { UserEvents } from './events';

const emitter = new events.EventEmitter();

// TODO: Make EventEmitter type-safe, make listeners DRY, refactor to proper domain events.

// Push job to queue to send welcome email.
emitter.on('userSignedUp', (payload: UserEvents['onUserSignedUp']) => {
    console.log(payload)
});

// Push job to queue to process and upload images.
emitter.on('userSignedUp', (payload: UserEvents['onUserSignedUp']) => {
    
});

// Push job to queue to send Slack Notification to company channel.
emitter.on('userSignedUp', (payload: UserEvents['onUserSignedUp']) => {
    
});

// Publish Google Analytics event.
emitter.on('userSignedUp', (payload: UserEvents['onUserSignedUp']) => {
    
});