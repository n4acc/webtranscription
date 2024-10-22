const fs = require('fs');
const Groq = require('groq-sdk');
const { IncomingForm } = require('formidable');
const path = require('path');

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB in bytes

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

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const form = new IncomingForm({ 
    maxFileSize: MAX_FILE_SIZE,
    keepExtensions: true
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      res.status(500).json({ error: 'Error parsing form data', details: err.message });
      return;
    }

    const file = files.audio;
    const apiKey = fields.apiKey;
    const language = fields.language;

    if (!file || !apiKey) {
      res.status(400).json({ error: 'Missing file or API key' });
      return;
    }

    try {
      const groq = new Groq({ apiKey });

      console.log('Starting transcription...');
      console.log('File details:', { 
        name: file.originalFilename, 
        type: file.mimetype, 
        size: file.size,
        path: file.filepath
      });
      console.log('Selected language:', language);

      const transcriptionOptions = {
        file: fs.createReadStream(file.filepath),
        model: "whisper-large-v3-turbo",
        response_format: "json",
        temperature: 0.0,
      };

      // Add language to the request if it's specified
      if (language) {
        transcriptionOptions.language = language;
      }

      const transcription = await groq.audio.transcriptions.create(transcriptionOptions);

      console.log('Transcription completed successfully');

      fs.unlink(file.filepath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });

      res.status(200).json({ text: transcription.text });
    } catch (error) {
      console.error('Transcription error:', error);
      res.status(500).json({ 
        error: 'Transcription failed', 
        details: error.message,
        stack: error.stack
      });
    }
  });
};
