
import * as Knex from 'knex';
import * as uuid from 'uuid';

import { IRepository } from './../../../common/repositories/repository';
import { IUnitOfWorkCapable } from './../../../common/unit-of-work/unit-of-work';
import { IUnitOfWork } from './../../../common/unit-of-work/unit-of-work';
import { Task } from './../models/domain/taskDomain';
import { BaseKnexRepository } from './../../../common/repositories/knex/BaseKnexRepository';
import { CommonErrors } from '../../../common/errors/errors';
import { IDomainPersistenceMapper } from './../../../common/mappers/domain-dal/mapper';
import { TaskDalEntity } from './../models/entity/taskEntity';
import { KnexUnitOfWork } from '../../../common/unit-of-work/knex/KnexUnitOfWork';

export interface ITaskRepository extends IRepository<Task>, IUnitOfWorkCapable {
    addTask(task: Task): Promise<void>;
    findTaskById(id: string): Promise<Task>;
    findTasksByOwnerId(id: string): Promise<Task[]>;
    findTaskByIdForOwner(taskId: string, ownerId: string): Promise<Task>;
    removeTasksByOwnerId(id: string): Promise<void>;
    removeTaskByIdForOwner(taskId: string, ownerId: string): Promise<void>;
    updateTaskByOwnerId(ownerId: string, task: Task): Promise<void>;
}

export default class TaskRepository extends BaseKnexRepository implements ITaskRepository {
    public tasks: Task[] = [];

    private readonly dbContext: Knex | Knex.Transaction;
    private readonly mapper: IDomainPersistenceMapper<Task, TaskDalEntity>;

    public constructor (
        knexInstance: Knex | Knex.Transaction,
        taskDomainPersistenceMapper: IDomainPersistenceMapper<Task, TaskDalEntity>
    ) {
        super();
        this.dbContext = knexInstance;
        this.mapper = taskDomainPersistenceMapper;
    }

    public async addTask(task: Task): Promise<void> {
        return this.handleErrors(async (): Promise<void> => {
            const dalTask = this.mapper.toPersistence(task);
            await this.dbContext<TaskDalEntity>('tasks').insert(dalTask);
        });
    }

    public async findTaskById(id: string): Promise<Task> {
        return this.handleErrors(async () => {
            const dalTask = await this.dbContext<TaskDalEntity>('tasks')
                .select()
                .where({ task_id: id })
                .first();

            if (!dalTask)
                return Promise.reject(CommonErrors.NotFoundError.create('Tasks'));

            return this.mapper.toDomain(dalTask);
        });
    }

    public async updateTaskByOwnerId(ownerId: string, task: Task): Promise<void> {
        return this.handleErrors(async () => {
            const dalUpdatedTask = this.mapper.toPersistence(task);
            const doesTaskExist = await this.existsById(dalUpdatedTask.task_id);

            if (!doesTaskExist)
                return Promise.reject(CommonErrors.NotFoundError.create('Tasks'));

            await this.dbContext<TaskDalEntity>('tasks')
                .select('*')
                .where({ 
                    task_id: dalUpdatedTask.task_id,
                    owner: ownerId
                })
                .update(dalUpdatedTask);
        });
    }

    public async removeTaskByIdForOwner(taskId: string, ownerId: string): Promise<void> {
        return this.handleErrors(async () => { 
            await this.dbContext<TaskDalEntity>('tasks').where({ 
                task_id: taskId,
                owner: ownerId
            })
            .del(); 
        });
    }

    public async removeTasksByOwnerId(ownerId: string): Promise<void> {
        return this.handleErrors(async () => {
            await this.dbContext<TaskDalEntity>('tasks')
                .where({ owner: ownerId })
                .del('*');
        });
    }

    public async exists(t: Task): Promise<boolean> {
        return this.handleErrors(async (): Promise<boolean> => {
            const dalTask = this.mapper.toPersistence(t);
            return !!await this.dbContext<TaskDalEntity>('tasks')
                .select()
                .where(dalTask)
                .first();
        });
    }

    public async existsById(id: string): Promise<boolean> {
        return this.handleErrors(async (): Promise<boolean> => {
            return !!await this.dbContext<TaskDalEntity>('tasks')
                .select()
                .where({ task_id: id })
                .first();
        });
    }

    public async findTasksByOwnerId(ownerId: string): Promise<Task[]> {
        return this.handleErrors(async (): Promise<Task[]> => {
            const dalTasks = await this.dbContext<TaskDalEntity>('tasks')
                .select()
                .where({ owner: ownerId });

            return dalTasks.map(dalTask => this.mapper.toDomain(dalTask));
        });
    }

    public async findTaskByIdForOwner(taskId: string, ownerId: string): Promise<Task> {
        return this.handleErrors(async (): Promise<Task> => {
            const dalTask = await this.dbContext<TaskDalEntity>('tasks')
                .select()
                .where({
                    owner: ownerId,
                    task_id: taskId
                })
                .first();

            if (!dalTask)
                return Promise.reject(CommonErrors.NotFoundError.create('Tasks'));

            return this.mapper.toDomain(dalTask);
        })
    }

    public nextIdentity(): string {
        return uuid.v4();
    }

    public forUnitOfWork(unitOfWork: IUnitOfWork): this {
        return new TaskRepository((unitOfWork as KnexUnitOfWork).trxContext, this.mapper) as this;
    }
}