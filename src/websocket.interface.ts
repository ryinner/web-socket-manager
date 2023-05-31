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

export type WebSocketAnswerData = Record<string, unknown>;
export type WebSocketCallback = (webSocket: WebSocket) => void;
export type WebSocketMessageHandlerCallback = (data: WebSocketAnswerData) => void;

export interface SessionUser {
    city_id: string;
    city_name: string;
    ip: string;
    open: boolean;
    sent: boolean;
    repeated: boolean;
    product_id: string;
    url: string;
    title: string;
    roistat: string;
    uid: string;
    um_id?: string;
    ym_uid: string;
    username?: string;
}

export type SessionAnswer = Record<string, SessionUser>;
