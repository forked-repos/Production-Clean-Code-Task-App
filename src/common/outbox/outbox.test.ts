// import { outboxFactory } from "./outbox";

// test('should create an outbox message with the provided id', () => {
//     // Arrange
//     const domain = 'Users';
//     const id = 'id';
//     const payload = { anything: 'some-string' };

//     // Act
//     const outboxMessage = outboxFactory(domain, payload, id);

//     // Assert
//     expect(outboxMessage).toEqual({
//         outbox_id: id,
//         domain,
//         payload: JSON.stringify(payload)
//     });
// });

// test('should generate id automatically', () => {
//     // Arrange
//     const domain = 'Users';
//     const payload = { anything: 'some-string' };

//     // Act
//     const outboxMessage = outboxFactory(domain, payload);

//     // Assert
//     expect(outboxMessage).toEqual({
//         outbox_id: expect.any(String),
//         domain,
//         payload: JSON.stringify(payload)
//     });
// });