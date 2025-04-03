import { ResponseAudioDeltaEvent } from 'openai/resources/responses/responses';
import { playAudio } from '../speaker';
import {
  createInstructionMessage,
  createResponseCreateMessage,
  createToolResponseMessage,
} from './messages';
import { RealtimeContext } from './types';
import { INSTRUCTIONS } from '../env';
import { ResponseDoneEvent } from 'openai/resources/beta/realtime/realtime';
import { runTool } from './toolRunner';

export function wireupRealtimeHandlers(ctx: RealtimeContext) {
  ctx.registerHandler('session.created', () => handleSessionCreated(ctx));
  ctx.registerHandler('input_audio_buffer.speech_started', handleSpeechStarted);
  ctx.registerHandler('response.audio.delta', handleAudioDelta);
  ctx.registerHandler('response.done', (event: ResponseDoneEvent) =>
    handleResponseDone(ctx, event),
  );
  ctx.registerHandler('error', handleError);
}

function handleSessionCreated(context: RealtimeContext) {
  console.log('[openai] 🕒 Session created. Sending update instructions.');

  const message = createInstructionMessage(INSTRUCTIONS);
  context.sendMessage(message);
}

function handleSpeechStarted() {
  console.log('[openai] 🔊 Open AI Speech started');
}

function handleAudioDelta(event: ResponseAudioDeltaEvent) {
  const audioData = Buffer.from(event.delta, 'base64');
  playAudio(audioData);
}

/**
 * Handles the response.done event. This is primarily used to detect
 * when the model wants to call a function. It will run the function
 * and send the result back to Open AI.
 * @see https://platform.openai.com/docs/guides/realtime-conversations#detect-when-the-model-wants-to-call-a-function
 */
async function handleResponseDone(
  context: RealtimeContext,
  event: ResponseDoneEvent,
) {
  // pull out all function calls
  const functionCalls = event.response.output?.filter(
    (o) => o.type === 'function_call',
  );

  if (!functionCalls || functionCalls.length === 0) return;

  // run all tools and send the results back to Open AI
  for (const functionCall of functionCalls) {
    // this shouldn't happen, but if no call_id is present, can't do anything
    if (!functionCall.call_id) continue;

    // invoke the tool
    const result = await runTool(functionCall.name, functionCall.arguments);

    if (!result.wasSuccessful) {
      console.error(
        '[openai] ⚠️ Error running tool:',
        result.error || 'Unknown error',
      );
      continue;
    }

    // send the result back to Open AI
    const toolResponseMessage = createToolResponseMessage(
      functionCall.call_id,
      result.output,
    );
    context.sendMessage(toolResponseMessage);
  }

  // tell open AI we are done
  context.sendMessage(createResponseCreateMessage());
}

function handleError(payload: unknown) {
  console.error('[openai] ⚠️ Error received from Open AI:', payload);
}
