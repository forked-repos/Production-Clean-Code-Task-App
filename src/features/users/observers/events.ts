// Channel Enumeration
export enum UserEventingChannel {
    USER_SIGNED_UP = 'userSignedUp',
    USER_DELETED_ACCOUNT = 'userDeletedAccount'
    // ...
}

// Mapping of Channel Name to Event Payload.
export type UserEvents = {
    [UserEventingChannel.USER_SIGNED_UP]: {
        id: string;
        firstName: string;
        email: string;
    },
    [UserEventingChannel.USER_DELETED_ACCOUNT]: {
        id: string;
        firstName: string;
        email: string;
    }
}