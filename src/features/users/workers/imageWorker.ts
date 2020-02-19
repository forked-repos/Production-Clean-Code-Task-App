import { Queues } from "../../../loaders/loadQueues";
import Bull from "bull";

export const imageWorkerProvider = () => {
    return (job: Bull.Job<any>) => {
        console.log(`Image process for ${job.data.username}`);
        return Promise.resolve();
    }
}
