import { ITaskRepository } from './../TaskRepository';
import { Task } from './../../models/domain/taskDomain';
import { IUnitOfWork } from './../../../../common/unit-of-work/unit-of-work';
import { FakeBaseRepository } from './../../../../common/repositories/__tests__/FakeBaseRepository';
import { CommonErrors } from '../../../../common/errors/errors';

export class FakeTaskRepository extends FakeBaseRepository implements ITaskRepository {
    findTasksByOwnerId(id: string): Promise<Task[]> {
        throw new Error("Method not implemented.");
    }
    findTaskByIdForOwner(taskId: string, ownerId: string): Promise<Task> {
        throw new Error("Method not implemented.");
    }
    removeTaskByIdForOwner(taskId: string, ownerId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    updateTaskByOwnerId(ownerId: string, task: Task): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public tasks: Task[] = [];
    
    public async addTask(task: Task): Promise<void> {
        return this.handleErrors(
            async () => { this.tasks.push(task); },
            task.description
        );
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
        return this.handleErrors(async () => { this.tasks = this.tasks.filter(task => task.id !== id); });
    }

    public async findTaskByName(name: string): Promise<Task> {
        return this.handleErrors(
            async () => this.tasks.filter(task => task.name === name)[0],
            name
        );
    }

    removeTasksByOwnerId(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }    
    
    exists(t: Task): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    
    async existsById(id: string): Promise<boolean> {
        return this.handleErrors(
            async () => !!this.tasks.filter(task => task.id === id)[0],
            id
        );
    }

    nextIdentity(): string {
        return 'id';
    }
    
    forUnitOfWork(unitOfWork: IUnitOfWork): this {
        throw new Error();
    }
}