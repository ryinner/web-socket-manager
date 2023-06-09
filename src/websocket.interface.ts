export interface WebSocketManagerSettings {
    url: string;
    interval?: number;
    additionalQueryParams?: Record<string, string>;
}

export interface WebSocketOperation <T = unknown> {
    method: string;
    request: OperationRequest;
    handlers?: OperationsHandlers<T>;
}

export interface WebSocketSendIntervaled <T = unknown> extends WebSocketOperation <T> {
    interval: true | number;
    _interval?: number | NodeJS.Timer;
}

export type OperationRequest = () => object;
export type OperationsHandler <T = unknown> = (data: T) => void;
export type OperationsHandlers <T = unknown> = Array<OperationsHandler<T>>;
export type WebSocketSend <T = unknown> = WebSocketOperation <T> | WebSocketSendIntervaled <T>;
export type WebSocketParsedOperation<T = unknown> = WebSocketSend<T> & { callback: () => void };

export interface WebSocketAnswerDecoded <T = unknown> {
    method: string;
    data: T;
}
