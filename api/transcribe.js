const fs = require('fs');
const Groq = require('groq-sdk');
const ffmpeg = require('fluent-ffmpeg');
const { IncomingForm } = require('formidable');

const convertToMp3 = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('mp3')
      .on('end', () => {
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(err);
      })
      .save(outputPath);
  });
};

module.exports = async (req, res) => {
  console.log('API route hit:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      res.status(500).json({ error: 'Error parsing form data', details: err.message });
      return;
    }

    const file = files.audio;
    const apiKey = fields.apiKey;

    if (!file) {
      res.status(400).json({ error: 'No audio file uploaded' });
      return;
    }

    if (!apiKey) {
      res.status(400).json({ error: 'No API key provided' });
      return;
    }

    const inputPath = file.filepath;
    const outputPath = `${inputPath}.mp3`;

    try {
      // Initialize the Groq client with the user-provided API key
      const groq = new Groq({
        apiKey: apiKey,
      });

      // Convert to MP3
      await convertToMp3(inputPath, outputPath);

      console.log('Starting transcription...');

      // Create a transcription job
      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(outputPath),
        model: 'whisper-large-v3',
        response_format: 'json',
        temperature: 0.0,
        prompt: "Transcribe the following audio without translating it. Maintain the original language of the speech."
      });

      console.log('Transcription completed successfully');

      // Clean up files
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);

      res.status(200).json({ text: transcription.text });
    } catch (error) {
      console.error('Transcription error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      res.status(500).json({ error: 'Transcription failed', details: error.message });
    }
  });
};
