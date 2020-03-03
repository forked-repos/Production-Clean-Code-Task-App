
import { Task } from '../../models/domain/taskDomain';
import TaskResponseDTO from '../../dtos/egress/taskResponseDTO';
import TaskCollectionResponseDTO from '../../dtos/egress/taskCollectionResponseDTO';
import CreateTaskDTO from './../../dtos/ingress/createTaskDTO';

export const mappers = {
    egress: {
        toTaskResponseDTO: (task: Task): TaskResponseDTO => ({
            task: {
                ...task,
                dueDate: task.dueDate ? task.dueDate.toISOString() : undefined
            }
        }),
    
        toTaskCollectionResponseDTO: (tasks: Task[]): TaskCollectionResponseDTO => ({
            tasks: tasks.map(task => mappers.egress.toTaskResponseDTO(task).task)
        })
    },
    
    ingress: {
        toTask: (createTaskDTO: CreateTaskDTO, id: string): Task => ({
            id,
            ...createTaskDTO,
            dueDate: createTaskDTO.dueDate ? new Date(createTaskDTO.dueDate) : undefined
        })
    }
}