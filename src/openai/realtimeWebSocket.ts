import { OpenAIRealtimeWS } from 'openai/beta/realtime/ws';
import { wireupRealtimeHandlers } from './realtimeHandlers';
import { RealtimeContext } from './types';

let rt: OpenAIRealtimeWS | null = null;

export async function startRealtimeWebSocket({
  onOpen,
}: {
  onOpen: (context: RealtimeContext) => void;
}): Promise<void> {
  rt = new OpenAIRealtimeWS({
    model: 'gpt-4o-realtime-preview-2024-12-17',
  });

  // Use context object to avoid passing around the OpenAIRealtimeWS instance
  const context: RealtimeContext = {
    sendMessage: (message) => {
      rt?.send(message);
    },
    registerHandler: (event, handler) => {
      rt?.on(event, handler);
    },
  };

  // wire up handlers for the web socket
  rt.socket.on('open', () => onOpen(context));

  // wire up handlers for incoming messages
  wireupRealtimeHandlers(context);

  return new Promise<void>((resolve) => {
    // resolve promise when the web socket is closed
    rt?.socket.on('close', () => {
      resolve();
      rt = null;
    });
  });
}

export function closeRealtimeWebSocket() {
  if (!rt) {
    console.error('🔌 Unable to stop web socket, server was not started');
    return;
  }
  rt.close();
}
