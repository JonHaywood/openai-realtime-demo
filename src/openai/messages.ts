import {
  ConversationItemCreateEvent,
  InputAudioBufferAppendEvent,
  ResponseCreateEvent,
  SessionUpdateEvent,
} from 'openai/resources/beta/realtime/realtime';
import tools from './tools';
import { VOICE } from '../env';

export function createAudioMessage(data: Buffer): InputAudioBufferAppendEvent {
  const serializedAudio = data.toString('base64');
  return {
    type: 'input_audio_buffer.append',
    audio: serializedAudio,
  };
}

export function createInstructionMessage(
  instructions: string,
): SessionUpdateEvent {
  return {
    type: 'session.update',
    session: {
      instructions,
      modalities: ['text', 'audio'],
      voice: VOICE,
      input_audio_format: 'pcm16',
      output_audio_format: 'pcm16',
      tools: tools.map((tool) => ({
        type: 'function',
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters,
      })),
      tool_choice: 'auto',
    },
  };
}

export function createToolResponseMessage(
  callId: string,
  output: string,
): ConversationItemCreateEvent {
  return {
    type: 'conversation.item.create',
    item: {
      type: 'function_call_output',
      call_id: callId,
      output,
    },
  };
}

export function createResponseCreateMessage(): ResponseCreateEvent {
  return {
    type: 'response.create',
  };
}
