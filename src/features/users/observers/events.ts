import { IEvent } from './../../../common/buses/EventBus';

// Channel Enumeration
export enum UserEventingChannel {
    USER_SIGNED_UP = 'userSignedUp',
    USER_DELETED_ACCOUNT = 'userDeletedAccount'
    // ...
}

export interface UserDataEvent {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface UserSignedUpEvent extends UserDataEvent {}
export interface UserDeletedAccountEvent extends UserDataEvent {}

// Mapping of Channel Name to Event Payload.
export type UserEvents = {
    [UserEventingChannel.USER_SIGNED_UP]: UserSignedUpEvent,
    [UserEventingChannel.USER_DELETED_ACCOUNT]: UserDeletedAccountEvent
};