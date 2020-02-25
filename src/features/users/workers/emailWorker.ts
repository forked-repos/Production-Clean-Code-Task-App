import { Queues } from "../../../loaders/loadQueues";
import Bull from "bull";
let attempts = 0;
export const emailWorkerProvider = (
    
) => {
    return (job: Bull.Job<any>) => {
        attempts++;
        console.log(`Try Email Recipient: ${job.data.emailAddress}`);

        if (attempts > 3) {
            return Promise.resolve();
        }

        console.log(attempts)
        return Promise.reject();
    }
}