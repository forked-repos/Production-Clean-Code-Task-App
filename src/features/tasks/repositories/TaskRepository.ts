import { IRepository } from './../../../common/repositories/repository';
import { IUnitOfWorkCapable } from './../../../common/unit-of-work/unit-of-work';
import { Task } from './../models/domain/taskDomain';

export interface ITaskRepository extends IRepository<Task>, IUnitOfWorkCapable {
    removeTasksByOwnerId(id: string): Promise<void>;
}

export default class TaskRepository {
    
}