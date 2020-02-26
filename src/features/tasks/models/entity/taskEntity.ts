export interface TaskDalEntity {
    task_id: string;
    name: string;
    description?: string;
    owner: string;
    due_date?: string;
    priority: number;
    completion_status: string;
}