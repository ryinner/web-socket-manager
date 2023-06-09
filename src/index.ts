import type { WebSocketAnswerData, WebSocketManagerSettings, WebSocketSend } from './websocket.interface';
import createWebSocket from './websocketFactory';

export default createWebSocket;
export type { WebSocketAnswerData, WebSocketSend, WebSocketManagerSettings };
