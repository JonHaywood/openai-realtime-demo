import { convertAudioToBase64String } from './audio';
import { createMicrophone, Microphone } from './microphone';
import { handleOpenAIMessage } from './realtime';
import { createServer, Server } from './server';

function wireupShutdownHandlers(onShutdown: () => void) {
  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down...');
    onShutdown();
  });
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down...');
    onShutdown();
  });
  process.on('uncaughtException', async (err) => {
    console.error('Uncaught exception:', err);
    onShutdown();
  });
}

function streamMicrophoneDataToServer(server: Server, microphone: Microphone) {
  microphone.startRecording(async (data) => {
    console.log('➡️ Received audio data from mic:', data.length);
    // serialize audio data to send to server
    const serializedAudio = await convertAudioToBase64String(data);
    server.sendAudio(serializedAudio);
  });
}

async function main() {
  // create microphone instance
  const microphone = createMicrophone();

  // create server instance
  const server = createServer({
    onOpen: () => {
      console.log('➡️ Server started. Press Ctrl+C to stop.');

      // once connected, start streaming microphone data
      streamMicrophoneDataToServer(server, microphone);
    },
    onMessage: (message) => {
      // all incoming messages are handled here
      handleOpenAIMessage(message, server);
    },
  });

  // when the user stops the app, run the below code
  wireupShutdownHandlers(() => {
    microphone.stopRecording();
    server.close();
  });

  // start server and wait until is stops
  console.log('➡️ Starting server...');
  await server.start();

  console.log('➡️ Server has stopped. Shutdown complete.');
}

main();
