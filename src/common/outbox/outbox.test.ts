import { outboxFactory } from "./outbox";
import { OperationalDomain } from "../app/domains/operationalDomains";
import { UserEventingChannel } from "../../features/users/pub-sub/events";

test('should create an outbox message with the provided id', () => {
    // Arrange
    const domain = OperationalDomain.USERS;
    const channel = UserEventingChannel.USER_DELETED_ACCOUNT;
    const id = 'id';
    const payload = { anything: 'some-string' };

    // Act
    const outboxMessage = outboxFactory({ operationalDomain: domain, operationalChannel: channel, payload }, id);

    // Assert
    expect(outboxMessage).toEqual({
        outbox_id: id,
        operational_domain: domain,
        operational_channel: channel,
        processed_date: null,
        payload: JSON.stringify(payload)
    });
});

test('should generate id automatically', () => {
    // Arrange
    const domain = OperationalDomain.USERS;
    const channel = UserEventingChannel.USER_DELETED_ACCOUNT;
    const payload = { anything: 'some-string' };

    // Act
    const outboxMessage = outboxFactory({ operationalDomain: domain, operationalChannel: channel, payload });

    // Assert
    expect(outboxMessage).toEqual({
        outbox_id: expect.any(String),
        operational_domain: domain,
        operational_channel: channel,
        processed_date: null,
        payload: JSON.stringify(payload)
    });
});