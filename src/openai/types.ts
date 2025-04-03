import { OpenAIRealtimeWS } from 'openai/beta/realtime/ws';

export type Message = Parameters<OpenAIRealtimeWS['send']>[0];
export type Event = Parameters<OpenAIRealtimeWS['on']>[0];
export type Handler = Parameters<OpenAIRealtimeWS['on']>[1];

export interface RealtimeContext {
  sendMessage(message: Message): void;
  registerHandler(event: Event, handler: Handler): void;
}
