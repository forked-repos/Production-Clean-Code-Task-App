import { Queues } from "../../../loaders/loadQueues";
import Bull from "bull";

export const emailWorkerProvider = (
    
) => {
    return (job: Bull.Job<any>) => {
        console.log(`Email Recipient: ${job.data.emailAddress}`);
        return Promise.resolve();
    }
}