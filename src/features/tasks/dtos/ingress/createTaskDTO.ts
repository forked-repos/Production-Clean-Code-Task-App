export default interface CreateTaskDTO {
    name: string;
    description?: string;
    owner: string;
    dueDate?: string;
    priority: number;
    completionStatus: string;
}