import { taskBuilder, createTaskDTOBuilder } from './fixtures/fixtures';
import { userBuilder } from './../../../users/services/__tests__/fixtures/fixtures';
import { Task, TaskPriority, TaskCompletionStatus } from "../../models/domain/taskDomain";

// Repositories, UoW, Services, & Other Dependencies.
import { FakeTaskRepository } from './../../repositories/__tests__/FakeTaskRepository';
import { FakeUserRepository } from './../../../users/repositories/__tests__/FakeUserRepository';
import { FakeOutboxRepository } from './../../../../common/repositories/outbox/__tests__/FakeOutboxRepository';
import { FakeUnitOfWorkFactory } from './../../../../common/unit-of-work/__tests__/FakeUnitOfWorkFactory';
import { FakeDataValidator } from './../../../../utils/wrappers/joi/__tests__/FakeDataValidator';

// DTOs
import CreateTaskDTO from '../../dtos/ingress/createTaskDTO';
import UpdateTaskDTO from './../../dtos/ingress/updateTaskDTO';

// Errors
import { CommonErrors } from "../../../../common/errors/errors";

// SUT:
import TaskService from './../TaskService';

let taskRepository: FakeTaskRepository;
let outboxRepository: FakeOutboxRepository;
let unitOfWorkFactory: FakeUnitOfWorkFactory;
let dataValidator: FakeDataValidator;

let userRepository: FakeUserRepository;

let taskService: TaskService;

beforeEach(() => {
    taskRepository = new FakeTaskRepository();
    outboxRepository = new FakeOutboxRepository();
    unitOfWorkFactory = new FakeUnitOfWorkFactory();
    dataValidator = new FakeDataValidator();

    userRepository = new FakeUserRepository();


    taskService = new TaskService(
        taskRepository,
        outboxRepository,
        unitOfWorkFactory,
        dataValidator,
    );
});

describe('createNewTask', () => {
    describe('with correct daa', () => {
        test('should successfully persist a new task', async () => {
            // Arrange
            const dto = createTaskDTOBuilder();
    
            // Act
            await taskService.createNewTask(dto);
    
            // Assert
            const task = await taskRepository.findTaskByName(dto.name);
    
            expect(task).toEqual({ id: taskRepository.nextIdentity(), ...dto });
            expect(taskRepository.tasks.length).toBe(1);

            expect(unitOfWorkFactory.didCommit).toBe(true);
            expect(unitOfWorkFactory.didRollback).toBe(false);
        });
    
        test('should dispatch the correct outbox messages to the outbox table', async () => {
            // Arrange
            const dto = createTaskDTOBuilder();
    
            // Act
            await taskService.createNewTask(dto);
    
            // Assert
            expect(outboxRepository.outboxMessages.length).toBe(1);
            expect(outboxRepository.outboxMessages[0]).toEqual({
                outbox_id: outboxRepository.nextIdentity(),
                domain: 'tasks',
                payload: JSON.stringify({
                    id: taskRepository.nextIdentity(),
                    name: dto.name,
                    dueDate: dto.dueDate
                })
            });
        });
    });

    test('should reject with a ValidationError if a task fails validation', async () => {
        // Arrange
        const dto = createTaskDTOBuilder({ name: '' });

        // Act, Assert
        await expect(taskService.createNewTask(dto))
            .rejects
            .toEqual(CommonErrors.ValidationError.create('Tasks', '"name" is not allowed to be empty'));
    });
});

describe('findTasksByOwnerId', () => {
    test('should return the correct array of tasks with the correct form', async () => {
        // Arrange
        const userOne = userBuilder({ id: 'user-one' });
        const userTwo = userBuilder({ id: 'user-two' });

        const taskOne = taskBuilder({ id: 'task-one', owner: userOne.id });
        const taskTwo = taskBuilder({ id: 'task-two' ,owner: userOne.id });
        const taskThree = taskBuilder();

        await userRepository.addUser(userOne);
        await userRepository.addUser(userTwo);

        await taskRepository.addTask(taskOne);
        await taskRepository.addTask(taskTwo);
        await taskRepository.addTask(taskThree);

        // Act
        const tasks = await taskService.findTasksByOwnerId(userOne.id);

        // Assert
        expect(tasks).toEqual({
            tasks: [taskOne, taskTwo]
        });
    });

    test('should return an empty array if no tasks exist', async () => {
        // Act
        const tasks = await taskService.findTasksByOwnerId(userBuilder().id);

        // Assert
        expect(tasks).toEqual({ tasks: [] });
    });
});

describe('findTaskByIdForOwner', () => {
    test('should return the correct task if one exists', async () => {
        // Arrange
        const userOne = userBuilder({ id: 'user-one' });
        const taskOne = taskBuilder({ owner: userOne.id });

        await userRepository.addUser(userOne);
        await taskRepository.addTask(taskOne);

        // Act
        const task = await taskService.findTaskByIdForOwner(taskOne.id, userOne.id);

        // Assert
        expect(task).toEqual({ task: taskOne })
    });

    test('should reject with a NotFoundError if no task exists', async () => {
        // Act, Assert
        await expect(taskService.findTaskByIdForOwner('any', 'any'))
            .rejects
            .toEqual(CommonErrors.NotFoundError.create('Users'));
    });
})



describe('updateTaskByIdForOwner', () => {
    test('should correctly update and persist a task', async () => {
        // Arrange
        const dto: UpdateTaskDTO = { completionStatus: TaskCompletionStatus.COMPLETE };

        const existingUser = userBuilder({ id: 'user-one' });
        const existingTask = taskBuilder({ owner: existingUser.id });

        await userRepository.addUser(existingUser);
        await taskRepository.addTask(existingTask);

        // Act
        await taskService.updateTaskByIdForOwner(existingTask.id, existingUser.id, dto);

        // Assert
        const updatedTask = await taskRepository.findTaskById(existingTask.id);

        expect(updatedTask).toEqual({ ...existingTask, ...dto });
        expect(taskRepository.tasks.length).toBe(1);
        expect(taskRepository.tasks[0]).toEqual({ ...existingTask, ...dto });
    });

    test('should reject with a ValidationError for bad task data', async () => {
        // Arrange
        const dto: UpdateTaskDTO = { completionStatus: 'NON-EXISTENT' };

        const existingUser = userBuilder({ id: 'user-one' });
        const existingTask = taskBuilder({ owner: existingUser.id });

        await userRepository.addUser(existingUser);
        await taskRepository.addTask(existingTask);

        // Act, Assert
        await expect(taskService.updateTaskByIdForOwner(existingTask.id, existingUser.id, dto))
            .rejects
            .toEqual(CommonErrors.ValidationError.create('Tasks', '"completionStatus" must be one of [COMPLETE, PENDING]'));

        const task = await taskRepository.findTaskById(existingTask.id);

        expect(task).toEqual(existingTask);
    });

    test('should reject with a NotFoundError if no task exists', async () => {
        // Arrange
        const dto: UpdateTaskDTO = { completionStatus: TaskCompletionStatus.PENDING };

        const existingUser = userBuilder({ id: 'user-one' });
        const taskId = 'anything';

        await userRepository.addUser(existingUser);

        // Act, Assert
        await expect(taskService.updateTaskByIdForOwner(taskId, existingUser.id, dto))
            .rejects
            .toEqual(CommonErrors.NotFoundError.create('Tasks'));

        expect(taskRepository.tasks.length).toBe(0);
    });
});

describe('deleteTask', () => {
    test('should correctly remove a task from persistence', async () => {
        // Arrange
        const userOne = userBuilder({ id: 'user-one' });
        const userTwo = userBuilder({ id: 'user-two' });

        const taskOne = taskBuilder({ id: 'task-one', owner: userOne.id });
        const taskTwo = taskBuilder({ id: 'task-two', owner: userTwo.id });

        await userRepository.addUser(userOne);
        await userRepository.addUser(userTwo);

        await taskRepository.addTask(taskOne);
        await taskRepository.addTask(taskTwo);

        // Act
        await taskService.deleteTaskByIdForOwner(taskOne.id, userOne.id);

        // Assert
        expect(taskRepository.tasks.length).toBe(1);
        expect(taskRepository.tasks[0]).toEqual(taskTwo);
    });

    test('should reject with a NotFoundError if no task exists', async () => {
        // Arrange
        const userOne = userBuilder();
        const taskOne = taskBuilder({ owner: 'not-user-one' });
        
        await userRepository.addUser(userOne);
        await taskRepository.addTask(taskOne);

        // Act, Assert
        await expect(taskService.deleteTaskByIdForOwner(taskOne.id, userOne.id))
            .rejects
            .toEqual(CommonErrors.NotFoundError.create('Tasks'));

        expect(taskRepository.tasks.length).toBe(1);
        expect(taskRepository.tasks[0]).toEqual(taskOne);
    });
    
});
