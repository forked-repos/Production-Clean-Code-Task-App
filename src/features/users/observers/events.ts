// Channel Enumeration
export enum UserEventingChannel {
    USER_SIGNED_UP = 'userSignedUp',
    // ...
}

// Mapping of Channel Name to Event Payload.
export type UserEvents = {
    [UserEventingChannel.USER_SIGNED_UP]: {
        id: string;
        firstName: string;
        email: string;
    }
}