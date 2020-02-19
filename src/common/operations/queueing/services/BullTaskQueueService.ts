import { Queues } from "../../../../loaders/loadQueues";
import { retry as backOff, AttemptContext, AttemptOptions } from '@lifeomic/attempt';

export interface ITaskQueueService {
    addWelcomeEmail(firstName: string, lastName: string, emailAddress: string): Promise<void>;
    addAvatarProcessing(buffer: Buffer, username: string): Promise<void>;
    addTaskNotification(taskName: string, dueDate?: Date, retry?: boolean): Promise<void>;
}
let counter = 0;

const sleep = (milliseconds: number) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

export default class BullTaskQueueService implements ITaskQueueService {
    // Queue Retry Options
    private readonly retryOptions = { 
        delay: 2000,
        factor: 2,
        maxAttempts: 7
    };

    public async addWelcomeEmail(firstName: string, lastName: string, emailAddress: string, retry: boolean = true): Promise<void> {
        const execute = async (context?: AttemptContext) => {
            if (context) {
                //console.log('addWelcomeEmailAttempts:', context.attemptNum)
                if (context.attemptNum > 4) {
                    Queues.emailQueue.add({ firstName, lastName, emailAddress })
                } else {
                    return Promise.reject('Could not push email job')
                }
            }
        }
        retry === true ? await backOff(execute, this.retryOptions) : await execute();
    }

    public async addAvatarProcessing(buffer: Buffer, username: string, retry: boolean = true): Promise<void> {
        //await sleep(5000);
        const execute = async (context?: AttemptContext) => await Queues.imageQueue.add({ buffer, username });
        retry === true ? await backOff(execute, this.retryOptions) : await execute();
   
    }

    public async addTaskNotification(taskName: string, dueDate?: Date, retry: boolean = true): Promise<void> {
        console.log(`Task is due on ${dueDate}`)
    }
}