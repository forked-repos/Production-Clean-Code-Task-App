
import * as uuid from 'uuid';

import { IRepository } from './../../../common/repositories/repository';
import { IUnitOfWorkCapable } from './../../../common/unit-of-work/unit-of-work';
import { IUnitOfWork } from './../../../common/unit-of-work/unit-of-work';
import { Task } from './../models/domain/taskDomain';
import { BaseKnexRepository } from './../../../common/repositories/knex/BaseKnexRepository';
import { CommonErrors } from '../../../common/errors/errors';

export interface ITaskRepository extends IRepository<Task>, IUnitOfWorkCapable {
    addTask(task: Task): Promise<void>;
    updateTask(task: Task): Promise<void>;
    findTaskById(id: string): Promise<Task>;
    removeTaskById(id: string): Promise<void>;
    removeTasksByOwnerId(id: string): Promise<void>;
}

export default class TaskRepository extends BaseKnexRepository implements ITaskRepository {
    public tasks: Task[] = [];

    public async addTask(task: Task): Promise<void> {
        this.tasks.push(task);
    }

    public async findTaskById(id: string): Promise<Task> {
        return this.handleErrors(async () => {
            return this.tasks.filter(task => task.id === id)[0];
        });
    }

    public async updateTask(task: Task): Promise<void> {
        return this.handleErrors(async () => {
            const doesTaskExist = await this.existsById(task.id);

            if (!doesTaskExist)
                return Promise.reject(CommonErrors.NotFoundError.create('Tasks'));

            const taskIndex = this.tasks.indexOf(task);
            this.tasks[taskIndex] = task;

            console.log(this.tasks[taskIndex])
        });
    }

    public async removeTaskById(id: string): Promise<void> {
        return this.handleErrors(async () => { this.tasks = this.tasks.filter(task => task.id !== id); });
    }

    public async removeTasksByOwnerId(ownerId: string): Promise<void> {
        throw new Error('Not Implemented');
    }

    public async exists(t: Task): Promise<boolean> {
        return !!this.tasks.filter(task => t == task)[0];
    }

    public async existsById(id: string): Promise<boolean> {
        return this.handleErrors(async () => !!this.tasks.filter(task => task.id === id)[0]);
    }

    public nextIdentity(): string {
        return uuid.v4();
    }

    public forUnitOfWork(unitOfWork: IUnitOfWork): this {
        throw new Error('Not Implemented');
    }
}