import WebSocket from 'ws';

const REALTIME_API_URL =
  'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17';

let ws: WebSocket | null = null;

export async function startServer({
  onOpen,
  onMessage,
}: {
  onOpen: () => void;
  onMessage: (message: string) => void;
}): Promise<void> {
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
}

export function sendMessage(message: string) {
  if (!ws) {
    console.error('🔌 Unable to send message, server was not started');
    return;
  }
  ws.send(message);
}

export function stopServer() {
  if (!ws) {
    console.error('🔌 Unable to stop server, server was not started');
    return;
  }
  ws.close();
}
