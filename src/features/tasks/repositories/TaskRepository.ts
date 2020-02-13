import { IRepository } from './../../../common/repositories/repository';
import { IUnitOfWorkCapable } from './../../../common/unit-of-work/unit-of-work';
import { IUnitOfWork } from './../../../common/unit-of-work/unit-of-work';
import { Task } from './../models/domain/taskDomain';

export interface ITaskRepository extends IRepository<Task>, IUnitOfWorkCapable {
    addTask(task: Task): Promise<void>;
    removeTasksByOwnerId(id: string): Promise<void>;
}

export default class TaskRepository implements ITaskRepository {
    public readonly tasks: Task[] = [];

    public async addTask(task: Task): Promise<void> {
        this.tasks.push(task);
    }

    public async removeTasksByOwnerId(ownerId: string): Promise<void> {
        throw new Error('Not Implemented');
    }

    public async exists(t: Task): Promise<boolean> {
        return !!this.tasks.filter(task => t == task)[0];
    }

    public async existsById(id: string): Promise<boolean> {
        return !!this.tasks.filter(task => task.id === id)[0];
    }

    public forUnitOfWork(unitOfWork: IUnitOfWork): this {
        throw new Error('Not Implemented');
    }
}