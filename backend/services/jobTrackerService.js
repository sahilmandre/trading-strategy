// File: backend/services/jobTrackerService.js

// In-memory store for job statuses
const jobStatuses = {
    'Intraday Stock Update': { status: 'Idle', lastRun: null, error: null },
    'Daily Stock Analysis': { status: 'Idle', lastRun: null, error: null },
    'Daily Performance Update': { status: 'Idle', lastRun: null, error: null },
    'Monthly Portfolio Creation': { status: 'Idle', lastRun: null, error: null },
    'Price Alert Checks': { status: 'Idle', lastRun: null, error: null },
};

/**
 * Wraps a cron job function to track its execution status.
 * @param {string} jobName - The name of the job to track.
 * @param {Function} jobFn - The actual function to execute for the job.
 * @returns {Function} - The wrapped function.
 */
export const trackJob = (jobName, jobFn) => {
    return async () => {
        console.log(`[JOB_TRACKER] Starting job: ${jobName}`);
        jobStatuses[jobName] = { ...jobStatuses[jobName], status: 'Running' };

        try {
            await jobFn();
            jobStatuses[jobName] = { status: 'OK', lastRun: new Date(), error: null };
            console.log(`[JOB_TRACKER] Successfully finished job: ${jobName}`);
        } catch (error) {
            jobStatuses[jobName] = { status: 'Failed', lastRun: new Date(), error: error.message };
            console.error(`[JOB_TRACKER] Job failed: ${jobName}`, error);
        }
    };
};

/**
 * Gets the current status of all tracked jobs.
 * @returns {object} - An object containing the statuses of all jobs.
 */
export const getJobStatuses = () => {
    return jobStatuses;
};
