export interface WebSocketAnswerDecoded {
    method: string;
    data: WebSocketAnswerData;
}

export interface WebSocketOperation {
    method: string;
    callback: () => void;
    handlers: WebSocketMessageHandlerCallback[];
    interval: number | NodeJS.Timer;
    settings?: WebSocketOperationSetting;
}

export interface WebSocketManagerSettings {
    interval: number;
}

export interface WebSocketOperationSetting {
    isOnce?: boolean;
    interval?: number;
}

export type WebSocketAnswerData = Record<string, unknown>;
export type WebSocketCallback = () => object;
export type WebSocketMessageHandlerCallback = (data: WebSocketAnswerData) => void;
