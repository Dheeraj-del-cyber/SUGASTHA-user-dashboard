import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { SarvamAIClient } from 'sarvamai';

const sarvamSpeechToText = (apiKey: string): Plugin => ({
  name: 'sarvam-speech-to-text',
  configureServer(server) {
    server.middlewares.use('/api/sarvam/transcribe', async (req, res, next) => {
      if (req.method !== 'POST') {
        next();
        return;
      }

      try {
        const chunks: Buffer[] = [];
        let totalBytes = 0;

        for await (const chunk of req) {
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          totalBytes += buffer.length;
          if (totalBytes > 15 * 1024 * 1024) {
            res.statusCode = 413;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Recording is too large.' }));
            return;
          }
          chunks.push(buffer);
        }

        if (!chunks.length) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'No audio recording was received.' }));
          return;
        }

        const client = new SarvamAIClient({ apiSubscriptionKey: apiKey });
        const response = await client.speechToText.transcribe({
          file: new Blob([Buffer.concat(chunks)], { type: req.headers['content-type'] || 'audio/webm' }),
          model: 'saaras:v3',
          mode: 'transcribe',
          language_code: 'unknown',
        });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ transcript: response.transcript }));
      } catch {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Speech transcription failed. Please try again.' }));
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), sarvamSpeechToText(env.SARVAM_API_KEY)],
    server: {
      port: 5173,
      host: true,
    },
  };
});
