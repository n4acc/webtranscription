# Audio Transcription App

## Description

This is a web application that allows users to transcribe audio files using the Groq API. Users can upload an audio file and receive a text transcription of its content.

## Features

- Audio file upload
- Transcription using Groq API
- Secure API key handling
- Responsive design

## Technologies Used

- Frontend:
  - React.js
  - Axios for API requests
  - Tailwind CSS for styling

- Backend:
  - Node.js
  - Vercel Serverless Functions
  - Groq SDK for transcription
  - Fluent-ffmpeg for audio processing

- Deployment:
  - Vercel

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/audio-transcription-app.git
   cd audio-transcription-app
   ```

2. Install dependencies:
   ```
   npm install
   cd frontend
   npm install
   cd ..
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Groq API key:
   ```
   GROQ_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open `http://localhost:3000` in your browser to view the app.

## Deployment

This app is configured for deployment on Vercel. To deploy:

1. Push your code to a GitHub repository.
2. Connect your GitHub repository to Vercel.
3. Vercel will automatically deploy your app.

## Usage

1. Open the app in your browser.
2. Enter your Groq API key (it will be saved locally for future use).
3. Upload an audio file.
4. Click "Transcribe" and wait for the transcription to complete.
5. View the transcribed text on the page.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
