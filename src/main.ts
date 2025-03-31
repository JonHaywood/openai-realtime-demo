import { createAudioMessage, handleOpenAIMessages } from './messages';
import { createMicrophone, Microphone } from './microphone';
import { sendMessage, startServer, stopServer } from './server';

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

function streamMicrophoneDataToServer(microphone: Microphone) {
  microphone.startRecording(async (data) => {
    // continuously stream microphone data to Open AI
    const audioMessage = createAudioMessage(data);
    sendMessage(audioMessage);
  });
}

async function main() {
  // create microphone instance
  const microphone = createMicrophone();

  // when the user stops the app, run the callback
  wireupShutdownHandlers(() => {
    microphone.stopRecording();
    stopServer();
  });

  // start server and wait until is stops
  console.log('🖥️ Starting server...');
  await startServer({
    onOpen: () => {
      console.log('🖥️ Server started. Press Ctrl+C to stop.');

      // once connected, start streaming microphone data
      streamMicrophoneDataToServer(microphone);
    },
    onMessage: (message) => {
      // all incoming messages are handled here
      handleOpenAIMessages(message);
    },
  });

  console.log('🖥️ Server has stopped. Shutdown complete.');
}

main();
