import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('groqApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const SUPPORTED_FORMATS = ['audio/flac', 'audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/mpga', 'audio/m4a', 'audio/ogg', 'audio/opus', 'audio/wav', 'audio/webm'];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && SUPPORTED_FORMATS.includes(selectedFile.type)) {
      setFile(selectedFile);
      setTranscription('');
    } else {
      alert('Please select a supported audio file format.');
      e.target.value = null; // Reset the file input
    }
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

    try {
      setLoading(true);
      const response = await axios.post('/api/submitJob', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setJobId(response.data.jobId);
      pollJobStatus(response.data.jobId);
    } catch (error) {
      console.error('Error submitting job:', error);
      alert('Error submitting transcription job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pollJobStatus = async (jobId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/getJobStatus?jobId=${jobId}`);
        if (response.data.status === 'completed') {
          setTranscription(response.data.result);
          clearInterval(pollInterval);
        } else if (response.data.status === 'failed') {
          alert(`Transcription failed: ${response.data.error}`);
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        clearInterval(pollInterval);
      }
    }, 5000); // Poll every 5 seconds
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
