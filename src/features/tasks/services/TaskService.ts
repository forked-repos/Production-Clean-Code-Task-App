// Repositories & UoW
import { ITaskRepository } from './../repositories/TaskRepository';
import { IOutboxRepository } from './../../../common/repositories/outbox/OutboxRepository';
import { IUnitOfWorkFactory } from '../../../common/unit-of-work/unit-of-work';

// DTOs - Ingress
import CreateTaskDTO from './../dtos/ingress/createTaskDTO';
import UpdateTaskDTO from './../dtos/ingress/updateTaskDTO';

// DTOs - Egress
import TaskResponseDTO from './../dtos/egress/taskResponseDTO';
import TaskCollectionResponseDTO from './../dtos/egress/taskCollectionResponseDTO';

// Data
import { mappers } from './../../tasks/mappers/domain-egress-dto/mappers';
import { outboxFactory } from '../../../common/outbox/outbox';

// Domain
import { Task, taskFactory } from './../models/domain/taskDomain';

// Errors
import { CommonErrors } from '../../../common/errors/errors';
import { AuthorizationErrors } from '../../auth/errors/errors';

// Validation
import { TaskValidators } from '../validation/taskValidation';
import { IDataValidator } from './../../../common/operations/validation/validation';

export interface ITaskService {
    createNewTask(createTaskDTO: CreateTaskDTO): Promise<void>;
    findTasksByOwnerId(ownerId: string): Promise<TaskCollectionResponseDTO>;
    findTaskByIdForOwner(taskId: string, ownerId: string): Promise<TaskResponseDTO>;
    updateTaskByIdForOwner(taskId: string, ownerId: string, updateTaskDTO: UpdateTaskDTO): Promise<void>;
    deleteTaskByIdForOwner(taskId: string, ownerId: string): Promise<void>;
}

export default class TaskService implements ITaskService  {
     public constructor (
        private readonly taskRepository: ITaskRepository,
        private readonly outboxRepository: IOutboxRepository,
        private readonly unitOfWorkFactory: IUnitOfWorkFactory,
        private readonly dataValidator: IDataValidator,
    ) {}

    public async createNewTask(createTaskDTO: CreateTaskDTO): Promise<void> {
        const validationResult = this.dataValidator.validate(TaskValidators.createTask, createTaskDTO);

        if (validationResult.isLeft()) 
            return Promise.reject(CommonErrors.ValidationError.create('Tasks', validationResult.value));

        const task: Task = taskFactory(createTaskDTO, this.taskRepository.nextIdentity());

        await this.unitOfWorkFactory.createUnderScope(async unitOfWork => {
            const boundTaskRepository = this.taskRepository.forUnitOfWork(unitOfWork);
            const boundOutboxRepository = this.outboxRepository.forUnitOfWork(unitOfWork);

            await boundTaskRepository.addTask(task);
            await boundOutboxRepository.addOutboxMessage(outboxFactory(
                'tasks',
                {
                    id: task.id,
                    name: task.name,
                    dueDate: task.dueDate
                },
                this.outboxRepository.nextIdentity()
            ));

            await unitOfWork.commit();
        });
    }

    public async findTasksByOwnerId(ownerId: string): Promise<TaskCollectionResponseDTO> {
        const tasks = await this.taskRepository.findTasksByOwnerId(ownerId);
        return mappers.toTaskCollectionResponseDTO(tasks);
    }

    public async findTaskByIdForOwner(taskId: string, ownerId: string): Promise<TaskResponseDTO> {
        const task = await this.taskRepository.findTaskByIdForOwner(taskId, ownerId);
        return mappers.toTaskResponseDTO(task);
    }

    public async updateTaskByIdForOwner(taskId: string, ownerId: string, updateTaskDTO: UpdateTaskDTO): Promise<void> {
        const validationResult = this.dataValidator.validate(TaskValidators.updateTask, updateTaskDTO);

        if (validationResult.isLeft())
            return Promise.reject(CommonErrors.ValidationError.create('Tasks', validationResult.value));

        const task = await this.taskRepository.findTaskById(taskId);

        const updatedTask = taskFactory({ ...task, ...updateTaskDTO }, task.id);

        await this.taskRepository.updateTaskByOwnerId(ownerId, updatedTask);
    }

    public async deleteTaskByIdForOwner(taskId: string, ownerId: string): Promise<void> {
        const task = await this.taskRepository.findTaskByIdForOwner(taskId, ownerId);

        await this.taskRepository.removeTaskByIdForOwner(taskId, ownerId);
    }
}