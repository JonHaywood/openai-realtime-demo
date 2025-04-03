import { createMicrophone, Microphone } from './microphone';
import { createAudioMessage } from './openai/messages';
import {
  closeRealtimeWebSocket,
  startRealtimeWebSocket,
} from './openai/realtimeWebSocket';
import { RealtimeContext } from './openai/types';

function setupProcessShutdownHandlers() {
  const shutdown = () => {
    closeRealtimeWebSocket();
  };

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down...');
    shutdown();
  });
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down...');
    shutdown();
  });
  process.on('uncaughtException', async (err) => {
    console.error('Uncaught exception:', err);
    shutdown();
  });
}

function streamMicrophoneDataToServer(
  context: RealtimeContext,
  microphone: Microphone,
) {
  microphone.startRecording(async (data) => {
    // continuously stream microphone data to Open AI
    const audioMessage = createAudioMessage(data);
    context.sendMessage(audioMessage);
  });
}

async function main() {
  // create microphone instance
  const microphone = createMicrophone();

  // handlers for when user presses Ctrl+C or errors occur
  setupProcessShutdownHandlers();

  // start server and wait until is stops
  console.log('[main] 🤖 Starting web socket...');
  await startRealtimeWebSocket({
    onOpen: (context) => {
      console.log('[main] 🤖 Web socket started. Press Ctrl+C to stop.');

      // once connected, immedately start streaming microphone data
      streamMicrophoneDataToServer(context, microphone);
    },
    onClose: () => {
      console.log('[main] 🤖 Web socket closed.');

      // stop the microphone
      microphone.stopRecording();
    },
  });

  console.log('[main] 🤖 Shutdown complete, exiting.');
}

main();
