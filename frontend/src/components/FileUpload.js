import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('groqApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setTranscription('');
  };

  const handleApiKeyChange = (e) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    localStorage.setItem('groqApiKey', newApiKey);
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

    const API_URL = process.env.NODE_ENV === 'production' 
      ? '/api/transcribe' 
      : 'http://localhost:3000/api/transcribe';

    try {
      setLoading(true);
      console.log('Sending request to:', API_URL); // Add this log
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setTranscription(response.data.text);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      if (error.response) {
        console.log('Error response:', error.response); // Add this log
        alert(`Transcription failed: ${error.response.data.error || error.response.statusText}`);
      } else if (error.request) {
        console.log('Error request:', error.request); // Add this log
        alert('No response received from server. Please check your internet connection.');
      } else {
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
          <h2 className="text-lg font-medium text-gray-900
            block">
            <span className="text-sm text-gray-500">Transcription:</span>
            <p className="mt-2 text-sm text-gray-500">{transcription}</p>
          </h2>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
