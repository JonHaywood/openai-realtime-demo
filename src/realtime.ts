import { convertBase64StringToBuffer } from './audio';
import { Server } from './server';
import { playAudio } from './speaker';

interface MessageBase {
  event_id: string;
  type: string;
}

interface ResponseAudioDelta extends MessageBase {
  type: 'response.audio.delta';
  delta: string; // base64-encoded audio data
}

export async function handleOpenAIMessage(message: string, server: Server) {
  const payload = JSON.parse(message);

  console.log('🧠 Received message from Open AI. Type:', payload.type);

  if (payload.type === 'session.created') {
    console.log('🧠 Session created. Sending udate instructions.');
    server.sendInstructions(
      "You're name is Bailiwick. You are a helpful, personal home assistant.",
    );
  } else if (payload.type === 'input_audio_buffer.speech_started') {
    console.log('🧠 Open AI Speech started');
    // TODO: interrupt any ongoing speech
  } else if (payload.type === 'response.audio.delta') {
    const response = payload as ResponseAudioDelta;
    const audioData = convertBase64StringToBuffer(response.delta);
    console.log('🧠 Received audio data from Open AI:', audioData.length);
    playAudio(audioData);
  } else if (payload.type === 'error') {
    console.error('🧠 Error received from Open AI:', payload);
  }
}
