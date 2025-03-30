import WebSocket from 'ws';

const REALTIME_API_URL =
  'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17';

export interface Server {
  start: () => Promise<void>;
  sendAudio: (serializedAudio: string) => void;
  sendInstructions: (instructions: string) => void;
  close: () => void;
}

export function createServer({
  onOpen,
  onMessage,
}: {
  onOpen: () => void;
  onMessage: (message: string) => void;
}): Server {
  let ws: WebSocket | null = null;

  return {
    start() {
      if (ws) throw new Error('Server already started');

      // initialize WebSocket connection
      ws = new WebSocket(REALTIME_API_URL, {
        headers: {
          Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
          'OpenAI-Beta': 'realtime=v1',
        },
      });

      // wire up handlers
      ws.on('open', onOpen);
      ws.on('message', onMessage);

      return new Promise<void>((resolve) => {
        // resolve promise when the web socket is closed
        ws?.on('close', () => {
          resolve();
          ws = null;
        });
      });
    },
    sendInstructions: (instructions: string) => {
      if (!ws) {
        console.error('🔌 sendInstructions: WebSocket not initialized');
        return;
      }

      const event = {
        type: 'session.update',
        session: {
          instructions,
          modalities: ['text', 'audio'],
          voice: 'echo',
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
        },
      };
      ws.send(JSON.stringify(event));
    },
    sendAudio: (serializedAudio: string) => {
      if (!ws) {
        console.error('🔌 sendAudio: WebSocket not initialized');
        return;
      }

      ws.send(
        JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: serializedAudio,
        }),
      );
    },
    close: () => {
      if (!ws) {
        console.error('🔌 close: WebSocket not initialized');
        return;
      }

      ws.close();
    },
  };
}
