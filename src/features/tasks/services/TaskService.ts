
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

export interface ITaskService {
    createNewTask(createTaskDTO: CreateTaskDTO): Promise<void>;
    editTask(targetId: string, updates: UpdateTaskDTO): Promise<void>;
}

export default class TaskService {
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

    public async editTask(targetId: string, updateTaskDTO: UpdateTaskDTO): Promise<void> {
        const validationResult = this.dataValidator.validate(TaskValidators.updateUser, updateTaskDTO);

        if (validationResult.isLeft())
            return Promise.reject(CommonErrors.ValidationError.create('Tasks', validationResult.value));

        const originalTask = await this.taskRepository.findTaskById(targetId);

        const updatedTask: Task = { ...originalTask, ...updateTaskDTO };

        await this.taskRepository.updateTask(updatedTask);
    }

    public async deleteTaskById(id: string): Promise<void> {
        await this.taskRepository.removeTaskById(id);
    }
}