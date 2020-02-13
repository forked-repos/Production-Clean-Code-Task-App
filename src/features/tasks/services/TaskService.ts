
import { ITaskRepository } from './../repositories/TaskRepository';
import { IUnitOfWorkFactory } from '../../../common/unit-of-work/unit-of-work';
import { IDataValidator } from './../../../common/operations/validation/validation';
import CreateTaskDTO from './../dtos/ingress/createTaskDTO';
import { TaskValidators } from '../validation/taskValidation';
import { CommonErrors } from '../../../common/errors/errors';
import { Task } from './../models/domain/taskDomain';
import UpdateTaskDTO from './../dtos/ingress/updateTaskDTO';

export interface ITaskService {
    createNewTask(createTaskDTO: CreateTaskDTO): Promise<void>;
    editTask(targetId: string, updates: UpdateTaskDTO): Promise<void>;
}

export default class TaskService {
    public constructor (
        private readonly taskRepository: ITaskRepository,
        private readonly unitOfWorkFactory: IUnitOfWorkFactory,
        private readonly dataValidator: IDataValidator
    ) {}

    public async createNewTask(createTaskDTO: CreateTaskDTO): Promise<void> {
        const validationResult = this.dataValidator.validate(TaskValidators.createTask, createTaskDTO);

        if (validationResult.isLeft()) 
            return Promise.reject(CommonErrors.ValidationError.create('Tasks', validationResult.value));

        const task: Task = { id: 'create-an-id', ...createTaskDTO };
        
        await this.taskRepository.addTask(task);
    }

    public async editTask(targetId: string, updateTaskDTO: UpdateTaskDTO): Promise<void> {
        const validationResult = this.dataValidator.validate(TaskValidators.updateUser, updateTaskDTO);

        if (validationResult.isLeft())
            return Promise.reject(CommonErrors.ValidationError.create('Tasks', validationResult.value));

        const originalTask = await this.taskRepository.findTaskById(targetId);

        const updatedTask: Task = { ...originalTask, ...updateTaskDTO };

        await this.taskRepository.updateTask(updatedTask);
    }
}