import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB in bytes

const SUPPORTED_FORMATS = [
  'audio/flac', 'audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/mpga',
  'audio/m4a', 'audio/ogg', 'audio/opus', 'audio/wav', 'audio/webm'
];

const LANGUAGES = [
  { code: '', name: 'Auto-detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'ca', name: 'Catalan' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  // Add more languages as needed
];

function FileUpload() {
  const [file, setFile] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('');

  useEffect(() => {
    const savedApiKey = localStorage.getItem('groqApiKey');
    if (savedApiKey) setApiKey(savedApiKey);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && SUPPORTED_FORMATS.includes(selectedFile.type)) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        alert(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024} MB limit. Please choose a smaller file.`);
        e.target.value = null;
        return;
      }
      setFile(selectedFile);
      setTranscription('');
    } else {
      alert('Please select a supported audio file format.');
      e.target.value = null;
    }
  };

  const handleApiKeyChange = (e) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    localStorage.setItem('groqApiKey', newApiKey);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !apiKey) {
      alert('Please provide both an audio file and a Groq API key.');
      return;
    }

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('apiKey', apiKey);
    formData.append('language', language);

    const API_URL = process.env.NODE_ENV === 'production' 
      ? '/api/transcribe' 
      : 'http://localhost:3000/api/transcribe';

    try {
      setLoading(true);
      console.log('Sending request to:', API_URL);
      console.log('File details:', { name: file.name, type: file.type, size: file.size });
      console.log('Selected language:', language);
      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      console.log('Response:', response.data);
      setTranscription(response.data.text);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        alert(`Transcription failed: ${error.response.data.error || error.response.statusText}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        alert('No response received from server. Please check your internet connection.');
      } else {
        console.error('Error message:', error.message);
        alert('Error setting up the request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">Groq API Key:</label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={handleApiKeyChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="audio" className="block text-sm font-medium text-gray-700">Upload Audio File:</label>
          <input
            type="file"
            id="audio"
            accept="audio/*"
            onChange={handleFileChange}
            required
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
          />
        </div>
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700">Select Language:</label>
          <select
            id="language"
            value={language}
            onChange={handleLanguageChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {loading ? 'Transcribing...' : 'Transcribe'}
        </button>
      </form>
      {transcription && (
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 block">
            <span className="text-sm text-gray-500">Transcription:</span>
            <p className="mt-2 text-sm text-gray-500">{transcription}</p>
          </h2>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
