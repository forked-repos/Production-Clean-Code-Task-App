import { Task, TaskPriority, TaskCompletionStatus } from "../../models/domain/taskDomain";
import CreateTaskDTO from '../../dtos/ingress/createTaskDTO';
import { FakeTaskRepository } from './../../repositories/__tests__/FakeTaskRepository';
import { IUnitOfWorkFactory } from "../../../../common/unit-of-work/unit-of-work";
import { FakeDataValidator } from './../../../../utils/wrappers/joi/__tests__/FakeDataValidator';
import TaskService from './../TaskService';
import { mock, instance } from 'ts-mockito';
import { CommonErrors } from "../../../../common/errors/errors";

let taskRepository: FakeTaskRepository;
let unitOfWorkFactory: IUnitOfWorkFactory;
let dataValidator: FakeDataValidator;

let taskService: TaskService;

beforeEach(() => {
    taskRepository = new FakeTaskRepository();
    unitOfWorkFactory = mock<IUnitOfWorkFactory>();
    dataValidator = new FakeDataValidator();

    taskService = new TaskService(
        taskRepository,
        instance(unitOfWorkFactory),
        dataValidator
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
