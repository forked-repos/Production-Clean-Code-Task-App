import { Task, TaskPriority, TaskCompletionStatus } from "../../models/domain/taskDomain";
import CreateTaskDTO from '../../dtos/ingress/createTaskDTO';
import { FakeTaskRepository } from './../../repositories/__tests__/FakeTaskRepository';
import { IUnitOfWorkFactory } from "../../../../common/unit-of-work/unit-of-work";
import { FakeDataValidator } from './../../../../utils/wrappers/joi/__tests__/FakeDataValidator';
import TaskService from './../TaskService';
import { mock, instance } from 'ts-mockito';
import { CommonErrors } from "../../../../common/errors/errors";
import UpdateTaskDTO from './../../dtos/ingress/updateTaskDTO';
import { EventBusMaster } from "../../../../common/buses/MasterEventBus";
import { IEventBus } from "../../../../common/buses/EventBus";
import { TaskEvents } from "../../observers/events";

let taskRepository: FakeTaskRepository;
let unitOfWorkFactory: IUnitOfWorkFactory;
let dataValidator: FakeDataValidator;
let masterEventBus;

let taskService: TaskService;

beforeEach(() => {
    taskRepository = new FakeTaskRepository();
    unitOfWorkFactory = mock<IUnitOfWorkFactory>();
    dataValidator = new FakeDataValidator();
    masterEventBus = new EventBusMaster({ taskEventBus: mock<IEventBus<TaskEvents>>() });

    taskService = new TaskService(
        taskRepository,
        instance(unitOfWorkFactory),
        dataValidator,
        masterEventBus
    );
});

const taskBuilder = (opts?: Partial<Task>): Task => ({
    id: 'id',
    name: 'Task One',
    description: 'A desc.',
    owner: 'owner-id',
    dueDate: new Date().toISOString(),
    priority: TaskPriority.NOT_IMPORTANT,
    completionStatus: TaskCompletionStatus.PENDING,
    ...opts
});

const createTaskDTOBuilder = (opts?: Partial<CreateTaskDTO>): CreateTaskDTO => ({
    name: 'Task One',
    description: 'A desc.',
    owner: 'owner-id',
    dueDate: new Date().toISOString(),
    priority: 1,
    completionStatus: 'PENDING',
    ...opts
});

describe('createNewTask', () => {
    test('should successfully persist a new task', async () => {
        // Arrange
        const dto = createTaskDTOBuilder();

        // Act
        await taskService.createNewTask(dto);

        // Assert
        const task = await taskRepository.findTaskByName(dto.name);
        expect(task).toEqual({ id: 'create-an-id', ...dto });
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

describe('editTask', () => {
    test('should correctly persist an edited task', async () => {
        // Arrange
        const id = 'id';
        const existingTask = taskBuilder({ id });
        const dto: UpdateTaskDTO = { name: 'This is a name.' };

        await taskRepository.addTask(existingTask);

        // Act
        await taskService.editTask(id, dto);

        // Assert
        const updatedTask = await taskRepository.findTaskById(id);
        expect(updatedTask).toEqual({
            ...existingTask,
            ...dto
        });
    });

    test('should reject with a ValidationError if a new task fails validation', async () => {
        // Arrange
        const existingTask = taskBuilder();
        const dto: UpdateTaskDTO = { name: '' };

        await taskRepository.addTask(existingTask);

        // Act, Assert
        await expect(taskService.editTask(existingTask.id, dto))
            .rejects
            .toEqual(CommonErrors.ValidationError.create('Tasks', '"name" is not allowed to be empty'));

        const task = await taskRepository.findTaskById(existingTask.id);
        expect(task).toEqual(existingTask);
    });
});

describe('deleteTask', () => {
    test('should correctly remove a task from persistence', async () => {
        // Arrange
        const id = 'id';
        const existingTask = taskBuilder({ id });

        await taskRepository.addTask(existingTask);
        const currentNumberOfTasks = taskRepository.tasks.length;

        // Act
        await taskService.deleteTaskById(id);

        // Assert
        expect(taskRepository.tasks.length).toBe(currentNumberOfTasks - 1);
        expect(taskRepository.tasks.indexOf(existingTask)).toBe(-1);
    });
});
