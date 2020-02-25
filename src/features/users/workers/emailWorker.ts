import Bull from "bull";

export const emailWorkerProvider = (
    
) => {
    return (job: Bull.Job<any>) => {
        console.log(`Email Recipient: ${job.data.emailAddress}`);
        return Promise.resolve();
    }
}