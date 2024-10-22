const { IncomingForm } = require('formidable');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// In-memory job queue (replace with a proper queue system for production)
const jobs = new Map();

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Error parsing form data' });
      return;
    }

    const file = files.audio;
    const apiKey = fields.apiKey;

    if (!file || !apiKey) {
      res.status(400).json({ error: 'Missing file or API key' });
      return;
    }

    const jobId = crypto.randomBytes(16).toString('hex');
    const fileBuffer = await fs.readFile(file.filepath);

    jobs.set(jobId, {
      status: 'pending',
      file: {
        buffer: fileBuffer,
        name: file.originalFilename,
        type: file.mimetype
      },
      apiKey
    });

    // Clean up the temporary file
    await fs.unlink(file.filepath);

    // Start processing the job (this would typically be done by a separate worker process)
    processJob(jobId);

    res.status(200).json({ jobId });
  });
};

async function processJob(jobId) {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = 'processing';

  try {
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: job.apiKey });

    const transcription = await groq.audio.transcriptions.create({
      file: job.file,
      model: 'whisper-large-v3',
      response_format: 'json',
      temperature: 0.0,
      prompt: "Transcribe the following audio without translating it. Maintain the original language of the speech."
    });

    job.status = 'completed';
    job.result = transcription.text;
  } catch (error) {
    job.status = 'failed';
    job.error = error.message;
  }
}
