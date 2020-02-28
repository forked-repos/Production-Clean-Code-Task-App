import { ITaskRepository } from './../TaskRepository';
import { Task } from './../../models/domain/taskDomain';
import { IUnitOfWork } from './../../../../common/unit-of-work/unit-of-work';
import { FakeBaseRepository } from './../../../../common/repositories/__tests__/FakeBaseRepository';
import { CommonErrors } from '../../../../common/errors/errors';

export class FakeTaskRepository extends FakeBaseRepository implements ITaskRepository {
    public tasks: Task[] = [];

    public async addTask(task: Task): Promise<void> {
        return this.handleErrors(
            async () => { this.tasks.push(task); },
            task.description
        );
    }
    
    public async findTasksByOwnerId(id: string): Promise<Task[]> {
        return this.handleErrors(
            async () => this.tasks.filter(task => task.owner === id),
            id
        );
    }

    public async findTaskByIdForOwner(taskId: string, ownerId: string): Promise<Task> {
        return this.handleErrors(
            async () => {
                const task = this.tasks.filter(task => task.id === taskId && task.owner === ownerId)[0];

                if (!task)
                    return Promise.reject(CommonErrors.NotFoundError.create('Tasks'));

                return task;
            },
            taskId
        );
    }

    public async updateTaskByOwnerId(ownerId: string, updatedTask: Task): Promise<void> {
        return this.handleErrors(
            async () => {
                const doesTaskExist = await this.existsById(updatedTask.id);

                if (!doesTaskExist)
                    return Promise.reject(CommonErrors.NotFoundError.create('Users'));
        
                const taskToUpdate = await this.findTaskById(updatedTask.id);
                const taskToUpdateIndex = this.tasks.indexOf(taskToUpdate);
        
                this.tasks[taskToUpdateIndex] = updatedTask;
            },
            ownerId
        )
    }

    public async removeTaskByIdForOwner(taskId: string, ownerId: string): Promise<void> {
        this.handleErrors(async () => {
            this.tasks = this.tasks.filter(task => task.id !== taskId && task.owner !== ownerId)
        }, taskId);
    }

    

    public async findTaskById(id: string): Promise<Task> {
        return this.handleErrors(async () => {
            const task = this.tasks.filter(task => task.id === id)[0];

            if (!task)
                return Promise.reject(CommonErrors.NotFoundError.create('Tasks'));

            return task;
        }, id);
    }

    public async updateTask(updatedTask: Task): Promise<void> {
        return this.handleErrors(async () => {
            const doesTaskExist = await this.existsById(updatedTask.id);

            if (!doesTaskExist)
                return Promise.reject(CommonErrors.NotFoundError.create('Tasks'));

            const taskToUpdate = await this.findTaskById(updatedTask.id);
            const taskToUpdateIndex = this.tasks.indexOf(taskToUpdate);
    
            this.tasks[taskToUpdateIndex] = updatedTask;
        }, updatedTask.name);
    }

    public async removeTaskById(id: string): Promise<void> {
        return this.handleErrors(
            async () => { this.tasks = this.tasks.filter(task => task.id !== id); },
            id
        );
    }

    public async removeTasksByOwnerId(id: string): Promise<void> {
        return this.handleErrors(
            async () => { this.tasks = this.tasks.filter(task => task.owner !== id); },
            id
        );
    }   

    public async findTaskByName(name: string): Promise<Task> {
        return this.handleErrors(
            async () => this.tasks.filter(task => task.name === name)[0],
            name
        );
    }

    public exists(t: Task): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    
    public async existsById(id: string): Promise<boolean> {
        return this.handleErrors(
            async () => !!this.tasks.filter(task => task.id === id)[0],
            id
        );
    }

    public nextIdentity(): string {
        return 'id';
    }
    
    public forUnitOfWork(unitOfWork: IUnitOfWork): this {
        return this;
    }
}