import Bee from 'bee-queue';

import SubscriptionMail from '../app/jobs/SubscriptionMail';
import redisConfig from '../config/redis';

const jobs = [SubscriptionMail];

class Queue {
  constructor() {
    this.queue = {};

    this.init();
  }

  // Initializes a queue
  init() {
    jobs.forEach(({ key, handle }) => {
      this.queue[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  // Add a job to the queue
  add(queue, job) {
    return this.queue[queue].bee.createJob(job).save();
  }

  // Process a queue
  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queue[job.key];

      bee.on('failed', this.handleFailed).process(handle);
    });
  }

  handleFailed(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
