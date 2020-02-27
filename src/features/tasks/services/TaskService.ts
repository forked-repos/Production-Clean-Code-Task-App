
import { ITaskRepository } from './../repositories/TaskRepository';
import { IUnitOfWorkFactory } from '../../../common/unit-of-work/unit-of-work';
import { IDataValidator } from './../../../common/operations/validation/validation';
import CreateTaskDTO from './../dtos/ingress/createTaskDTO';
import { TaskValidators } from '../validation/taskValidation';
import { CommonErrors } from '../../../common/errors/errors';
import { Task, taskFactory } from './../models/domain/taskDomain';
import UpdateTaskDTO from './../dtos/ingress/updateTaskDTO';
import { IEventBus } from '../../../common/buses/EventBus';
import { TaskEvents, TaskEventingChannel } from '../observers/events';
import { IEventBusMaster } from './../../../common/buses/MasterEventBus';
import TaskCollectionResponseDTO from './../dtos/egress/taskCollectionResponseDTO';
import { mappers } from './../../tasks/mappers/domain-egress-dto/mappers';
import TaskResponseDTO from './../dtos/egress/taskResponseDTO';
import { AuthorizationErrors } from '../../auth/errors/errors';

export interface ITaskService {
    createNewTask(createTaskDTO: CreateTaskDTO): Promise<void>;
    findTasksByOwnerId(ownerId: string): Promise<TaskCollectionResponseDTO>;
    findTaskByIdForOwner(taskId: string, ownerId: string): Promise<TaskResponseDTO>;
    updateTaskByIdForOwner(taskId: string, ownerId: string, updateTaskDTO: UpdateTaskDTO): Promise<void>;
    deleteTaskByIdForOwner(taskId: string, ownerId: string): Promise<void>;
}

export default class TaskService implements ITaskService  {
    private readonly taskEventBus: IEventBus<TaskEvents>;

    public constructor (
        private readonly taskRepository: ITaskRepository,
        private readonly unitOfWorkFactory: IUnitOfWorkFactory,
        private readonly dataValidator: IDataValidator,
        eventBusMaster: IEventBusMaster<{ taskEventBus: IEventBus<TaskEvents> }>
    ) {
        this.taskEventBus = eventBusMaster.getBus('taskEventBus');
    }

    public async createNewTask(createTaskDTO: CreateTaskDTO): Promise<void> {
        const validationResult = this.dataValidator.validate(TaskValidators.createTask, createTaskDTO);

        if (validationResult.isLeft()) 
            return Promise.reject(CommonErrors.ValidationError.create('Tasks', validationResult.value));

        const taskId = this.taskRepository.nextIdentity();
        const task: Task = taskFactory(createTaskDTO, taskId);
        
        await this.taskRepository.addTask(task);

        this.taskEventBus.dispatch(TaskEventingChannel.TASK_CREATED, {
            id: task.id,
            name: task.name,
            dueDate: task.dueDate
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

        try {
            await this.taskRepository.updateTaskByOwnerId(ownerId, updatedTask);
        } catch (e) {
            if (e instanceof CommonErrors.ValidationError) {
                return Promise.reject(AuthorizationErrors.AuthorizationError.create('Tasks'));
            } else {
                return Promise.reject(e);
            }
        }
    }

    public async deleteTaskByIdForOwner(taskId: string, ownerId: string): Promise<void> {
        await this.taskRepository.removeTaskByIdForOwner(taskId, ownerId);
    }
}