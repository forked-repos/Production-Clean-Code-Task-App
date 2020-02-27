export default interface TaskResponseDTO {
    task: {
        id: string;
        name: string;
        description?: string;
        owner: string;
        dueDate?: string;
        priority: number;
        completionStatus: string;
    }
}