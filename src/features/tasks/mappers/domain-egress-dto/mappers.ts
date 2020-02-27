
import { Task } from './../../models/domain/taskDomain';
import TaskResponseDTO from './../../dtos/egress/taskResponseDTO';
import TaskCollectionResponseDTO from './../../dtos/egress/taskCollectionResponseDTO';

export const mappers = {
    toTaskResponseDTO: (task: Task): TaskResponseDTO => ({
        task
    }),

    toTaskCollectionResponseDTO: (tasks: Task[]): TaskCollectionResponseDTO => ({
        tasks: tasks.map(task => task)
    })
}