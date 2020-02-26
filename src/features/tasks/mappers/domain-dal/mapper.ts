
import { IDomainPersistenceMapper } from './../../../../common/mappers/domain-dal/mapper';
import { Task } from './../../models/domain/taskDomain';
import { TaskDalEntity } from './../../models/entity/taskEntity';

export default (): IDomainPersistenceMapper<Task, TaskDalEntity> => ({
    toDomain: (raw: TaskDalEntity): Task => ({
        id: raw.task_id,
        name: raw.name,
        description: raw.description,
        owner: raw.owner,
        dueDate: raw.due_date,
        priority: raw.priority,
        completionStatus: raw.completion_status
    }),

    toPersistence: (task: Task): TaskDalEntity => ({
        task_id: task.id,
        name: task.name,
        description: task.description,
        owner: task.owner,
        due_date: task.dueDate,
        priority: task.priority,
        completion_status: task.completionStatus
    })
})