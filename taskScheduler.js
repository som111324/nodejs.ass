const { Queue, Worker } = require('bullmq');
const { handleGmail } = require('./emailHandler');

const emailQueue = new Queue('emailQueue', {
    connection: {
        host: '127.0.0.1',
        port: 6379,
    },
});

const addEmailTask = (tokens) => {
    emailQueue.add('emailTask', { tokens });
};

const worker = new Worker('emailQueue', async (job) => {
    const { tokens } = job.data;
    await handleGmail(tokens);
}, {
    connection: {
        host: '127.0.0.1',
        port: 6379,
    },
});

module.exports = {
    addEmailTask,
};
