import type { OperationRequest, WebSocketAnswerDecoded, WebSocketManagerSettings, WebSocketSend } from './websocket.interface';
import createWebSocket from './websocketFactory';

export default createWebSocket;
export type { WebSocketAnswerDecoded, WebSocketSend, WebSocketManagerSettings, OperationRequest };
