import { Queues } from "../../../../loaders/loadQueues";
import { retry as backOff, AttemptContext, AttemptOptions } from '@lifeomic/attempt';
import {Md5} from 'ts-md5/dist/md5'
import { JobOptions, Queue, Job } from "bull";

interface IAddEmailPayload {
    firstName: string, 
    lastName: string, 
    emailAddress: string
}

interface IAddAvatarProcessingPayload {
    username: string,
    buffer: Buffer
}

export interface ITaskQueueService {
    addWelcomeEmail(payload: IAddEmailPayload, retry?: boolean): Promise<void>;

    addAvatarProcessing(buffer: Buffer, username: string, retry?: boolean): Promise<void>;
    addTaskNotification(taskName: string, dueDate?: Date, retry?: boolean): Promise<void>;
}

export default class BullTaskQueueService implements ITaskQueueService {
    // Queue Retry Options
    private readonly retryOptions = { 
        delay: 2000,
        factor: 2,
        maxAttempts: 7
    };


    public async addWelcomeEmail(payload: IAddEmailPayload, retry: boolean = true): Promise<void> {
        const execute = async (context?: AttemptContext) => await this.enqueueJob(Queues.emailQueue, payload);
        retry === true ? await backOff(execute, this.retryOptions) : await execute();
    }

    public async addAvatarProcessing(buffer: Buffer, username: string, retry: boolean = true): Promise<void> {
        const execute = async (context?: AttemptContext) => await this.enqueueJob(Queues.imageQueue, { buffer, username });
        retry === true ? await backOff(execute, this.retryOptions) : await execute();
   
    }

    public async addTaskNotification(taskName: string, dueDate?: Date, retry: boolean = true): Promise<void> {
        console.log(`Task is due on ${dueDate}`)
    }

    private createJobId(payload: any): string {
        let toHash: string;

        if (typeof payload !== 'string') {
            toHash = JSON.stringify(payload);
        } else {
            toHash = payload;
        }

        return Md5.hashStr(toHash) as string;
    }

    private createJobOptions(payload: any): JobOptions {
        const id = this.createJobId(payload);
        return {
            jobId: id,
            attempts: 5
        };
    }

    private enqueueJob(queue: Queue<any>, payload: any): Promise<Job<any>> {
        return queue.add(payload, this.createJobOptions(payload));
    }
}