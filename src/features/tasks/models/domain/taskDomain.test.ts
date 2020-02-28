
import { Task, TaskCompletionStatus, taskFactory } from './taskDomain';

const taskProps: Omit<Task, 'id'> = {
    name: 'any',
    description: 'any',
    owner: '123',
    dueDate: 'a-due-date',
    priority: 1,
    completionStatus: TaskCompletionStatus.COMPLETE
};

test('should create a task domain object correctly with the provided ID', () => {
    // Arrange
    const taskId = 'id';

    // Act
    const task = taskFactory(taskProps, taskId);

    // Assert
    expect(task).toEqual({
        id: taskId,
        ...taskProps
    });
});

test('should generate an id if one is not provided', () => {
    // Act
    const task = taskFactory(taskProps);

    // Assert
    expect(task).toEqual({
        id: expect.any(String),
        ...taskProps
    });
});