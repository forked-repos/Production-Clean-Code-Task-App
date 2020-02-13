import { ITaskRepository } from './../TaskRepository';
import { Task } from './../../models/domain/taskDomain';
import { IUnitOfWork } from './../../../../common/unit-of-work/unit-of-work';
import { FakeBaseRepository } from './../../../../common/repositories/__tests__/FakeBaseRepository';

export class FakeTaskRepository extends FakeBaseRepository implements ITaskRepository {
    public readonly tasks: Task[] = [];
    
    public async addTask(task: Task): Promise<void> {
        return this.handleErrors(
            async () => { this.tasks.push(task); },
            task.description
        );
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
    
    existsById(id: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    
    forUnitOfWork(unitOfWork: IUnitOfWork): this {
        throw new Error();
    }
}