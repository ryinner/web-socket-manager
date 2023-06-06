export interface WebSocketAnswerDecoded {
    method: string;
    data: WebSocketAnswerData;
}

export interface WebSocketOperation {
    method: string;
    callback: WebSocketCallback;
    handlers: WebSocketMessageHandlerCallback[];
    interval: number | NodeJS.Timer;
}

export interface WebSocketManagerSettings {
    interval: number;
}

export type WebSocketAnswerData = Record<string, unknown>;
export type WebSocketCallback = (webSocket: WebSocket) => void;
export type WebSocketMessageHandlerCallback = (data: WebSocketAnswerData) => void;
