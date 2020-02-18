import { Queues } from "../../../../loaders/loadQueues";
import { backOff } from 'exponential-backoff';

export interface ITaskQueueService {
    addWelcomeEmail(firstName: string, lastName: string, emailAddress: string): Promise<void>;
    addAvatarProcessing(buffer: Buffer): Promise<void>;
}

export default class BullTaskQueueService implements ITaskQueueService {
    private readonly backOffOptions = { timeMultiple: 4 };

    public async addWelcomeEmail(firstName: string, lastName: string, emailAddress: string, retry: boolean = true): Promise<void> {
        const execute = () => Queues.emailQueue.add({ firstName, lastName, emailAddress });

        try {
            await retry === true ? backOff(execute, this.backOffOptions) : execute(); 
        } catch (e) {
            console.log(e)
        }
    }

    public async addAvatarProcessing(buffer: Buffer, retry: boolean = true): Promise<void> {
        const execute = () => Queues.imageQueue.add({ buffer });

        try {
            await retry === true ? backOff(execute, this.backOffOptions) : execute(); 
        } catch (e) {
            console.log(e)
        }
    }
}