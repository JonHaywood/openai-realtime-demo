import { createMicrophone, Microphone } from './microphone';
import { createAudioMessage } from './openai/messages';
import {
  closeRealtimeWebSocket,
  startRealtimeWebSocket,
} from './openai/realtimeWebSocket';
import { RealtimeContext } from './openai/types';

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

  // when the user stops the app, run the callback
  wireupShutdownHandlers(() => {
    microphone.stopRecording();
    closeRealtimeWebSocket();
  });

  // start server and wait until is stops
  console.log('🖥️ Starting web socket...');
  await startRealtimeWebSocket({
    onOpen: (context) => {
      console.log('🖥️ Web socket started. Press Ctrl+C to stop.');

      // once connected, immedately start streaming microphone data
      streamMicrophoneDataToServer(context, microphone);
    },
  });

  console.log('🖥️ Web socket closed. Shutdown complete.');
}

main();
