// Access to the same in-memory job queue
const jobs = require('./submitJob').jobs;

module.exports = (req, res) => {
  const { jobId } = req.query;

  if (!jobId) {
    res.status(400).json({ error: 'Missing job ID' });
    return;
  }

  const job = jobs.get(jobId);

  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.status(200).json({
    status: job.status,
    result: job.result,
    error: job.error
  });
};
