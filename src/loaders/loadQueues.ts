import Queue from 'bull';
import { emailWorkerProvider } from './../features/users/workers/emailWorker';
import { imageWorkerProvider } from './../features/users/workers/imageWorker';

export namespace Queues {
    export const emailQueue = new Queue('email sending', 'redis://127.0.0.1:6379');
    export const imageQueue = new Queue('process images', 'redis://127.0.0.1:6379');

    emailQueue.process(emailWorkerProvider());
    imageQueue.process(imageWorkerProvider())
}