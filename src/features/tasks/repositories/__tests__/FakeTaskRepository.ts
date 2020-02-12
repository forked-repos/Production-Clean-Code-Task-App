import { ITaskRepository } from './../TaskRepository';
import { Task } from './../../models/domain/taskDomain';
import { IUnitOfWork } from './../../../../common/unit-of-work/unit-of-work';

export class FakeTaskRepository implements ITaskRepository {
    removeTasksByOwnerId(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }    
    
    exists(t: Task): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    
    existsById(id: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    
    forUnitOfWork(unitOfWork: IUnitOfWork): this {
        throw new Error();
    }
}