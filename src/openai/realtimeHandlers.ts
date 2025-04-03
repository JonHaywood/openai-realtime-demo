import { ResponseAudioDeltaEvent } from 'openai/resources/responses/responses';
import { playAudio } from '../speaker';
import { createInstructionMessage } from './messages';
import { RealtimeContext } from './types';

export function wireupRealtimeHandlers(ctx: RealtimeContext) {
  ctx.registerHandler('session.created', () => handleSessionCreated(ctx));
  ctx.registerHandler('input_audio_buffer.speech_started', handleSpeechStarted);
  ctx.registerHandler(
    'response.audio.delta',
    (event: ResponseAudioDeltaEvent) => handleAudioDelta(event.delta),
  );
  ctx.registerHandler('error', handleError);
}

function handleSessionCreated(context: RealtimeContext) {
  console.log('[openai] 🕒 Session created. Sending update instructions.');

  const message = createInstructionMessage(
    'You name is Bailiwick. You are a helpful, personal home assistant.',
  );
  context.sendMessage(message);
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
