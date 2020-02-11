export interface Task {
    id: string;
    name: string;
    description: string;
    owner: string;
    dueDate: string;
    priority: number;
    completionStatus: string;
}