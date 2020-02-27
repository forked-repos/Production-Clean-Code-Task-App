import TaskResponseDTO from './taskResponseDTO';

export default interface TaskCollectionResponseDTO {
    tasks: TaskResponseDTO['task'][]
}