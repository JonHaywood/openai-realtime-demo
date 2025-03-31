import { sendMessage } from './server';
import { playAudio } from './speaker';

export function createAudioMessage(data: Buffer) {
  const serializedAudio = data.toString('base64');
  return JSON.stringify({
    type: 'input_audio_buffer.append',
    audio: serializedAudio,
  });
}

export function createInstructionMessage(instructions: string) {
  return JSON.stringify({
    type: 'session.update',
    session: {
      instructions,
      modalities: ['text', 'audio'],
      voice: 'echo',
      input_audio_format: 'pcm16',
      output_audio_format: 'pcm16',
    },
  });
}

function handleSessionCreated() {
  console.log('[openai] 🕒 Session created. Sending update instructions.');
  const message = createInstructionMessage(
    'You name is Bailiwick. You are a helpful, personal home assistant.',
  );
  sendMessage(message);
}

function handleSpeechStarted() {
  console.log('[openai] 🔊 Open AI Speech started');
}

function handleAudioDelta(delta: string) {
  const audioData = Buffer.from(delta, 'base64');
  playAudio(audioData);
}

function handleError(payload: unknown) {
  console.error('[openai] ⚠️ Error received from Open AI:', payload);
}

export function handleOpenAIMessages(message: string) {
  const payload = JSON.parse(message);

  switch (payload.type) {
    case 'session.created':
      handleSessionCreated();
      break;
    case 'input_audio_buffer.speech_started':
      handleSpeechStarted();
      break;
    case 'response.audio.delta':
      handleAudioDelta(payload.delta);
      break;
    case 'error':
      handleError(payload);
      break;
  }
}
