import {
  InputAudioBufferAppendEvent,
  TranscriptionSessionUpdate,
} from 'openai/resources/beta/realtime/realtime';

export function createAudioMessage(data: Buffer) {
  const serializedAudio = data.toString('base64');
  return {
    type: 'input_audio_buffer.append',
    audio: serializedAudio,
  } as unknown as InputAudioBufferAppendEvent;
}

export function createInstructionMessage(instructions: string) {
  return {
    type: 'session.update',
    session: {
      instructions,
      modalities: ['text', 'audio'],
      voice: 'echo',
      input_audio_format: 'pcm16',
      output_audio_format: 'pcm16',
    },
  } as unknown as TranscriptionSessionUpdate;
}
