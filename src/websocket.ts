import type { WebSocketAnswerDecoded, WebSocketCallback, WebSocketManagerSettings, WebSocketMessageHandlerCallback, WebSocketOperation, WebSocketOperationSetting } from './websocket.interface';

class WebSocketManager {
    private readonly isTesting: boolean = false;

    private webSocketInstance!: WebSocket;
    private readonly operations: WebSocketOperation[] = [];
    private readonly defaultInterval: number;
    private reconnectInterval!: number | NodeJS.Timer;
    private readonly openWebSocketStatuses: number[] = [WebSocket.CONNECTING, WebSocket.OPEN];
    private readonly closeWebSocketStatuses: number[] = [WebSocket.CLOSING, WebSocket.CLOSED];
    private readonly wss: string;

    constructor (webSocketUrl: string, settings?: WebSocketManagerSettings) {
        this.wss = webSocketUrl;

        this.defaultInterval = settings?.interval ?? DEFAULT_SOCKET_INTERVAL;
    }

    private get webSocket (): WebSocket {
        if (this.webSocketInstance === undefined || !(this.isWebSocket(this.webSocketInstance)) || this.webSocketInstance.readyState === WebSocket.CLOSED) {
            this.webSocketInstance = new WebSocket(this.wss);
        }

        return this.webSocketInstance;
    }

    public stop (): void {
        this.operations.forEach(webSocketOperation => {
            clearInterval(webSocketOperation.interval);
        });
        clearInterval(this.reconnectInterval);
        if ((this.isWebSocket(this.webSocketInstance)) && !this.isClosed()) {
            this.webSocketInstance.close();
        }
    }

    public start (): void {
        if (this instanceof WebSocketManager && !this.isOpen() && this.isWebSocket(this.webSocket)) {
            this.webSocket.onopen = () => { this.onOpenHandler(); };
            this.webSocket.onerror = () => { this.stop(); };
            this.webSocket.onclose = (event) => { this.onCloseHandler(event); };
            this.webSocket.onmessage = (answer: MessageEvent) => { this.onMessageHandler(answer); };
        }
    }

    public addOperation (method: string, callback: WebSocketCallback, handler: WebSocketMessageHandlerCallback, settings?: WebSocketOperationSetting): void {
        if (this.checkOperationUnique(method)) {
            const needInterval = this.isOpen() && settings?.isOnce !== true;
            const parsedCallback = (): void => {
                if (this.isAvailableToSendMessages()) {
                    this.webSocket.send(JSON.stringify({ method, data: callback() }));
                } else {
                    if (settings?.isOnce === true) {
                        setTimeout(parsedCallback, 1000);
                    }
                }
            };

            const operationInterval = needInterval ? setInterval(parsedCallback, settings?.interval ?? this.defaultInterval, this.webSocket) : 0;
            this.operations.push({
                method,
                callback: parsedCallback,
                handlers: [handler],
                interval: operationInterval,
                settings
            });
        } else {
            this.addHandler(method, handler);
        }
    }

    public removeOperation (method: string): void {
        const operation = this.findOperation(method);
        if (operation !== undefined) {
            clearInterval(operation.interval);
            this.operations.splice(this.operations.indexOf(operation), 1);
        } else {
            throw new Error(OPERATION_DOESNT_EXIST_ERROR);
        }
    }

    public removeHandler (method: string, handler: WebSocketMessageHandlerCallback): void {
        const operation = this.findOperation(method);
        if (operation?.handlers.length === 1) {
            this.removeOperation(method);
        } else {
            operation?.handlers.splice(operation?.handlers.indexOf(handler), 1);
        }
    }

    public sendMessage (method: string, data: object, handler: WebSocketMessageHandlerCallback): void {
        this.addOperation(method, () => data, handler, {
            isOnce: true
        });
    }

    private addHandler (method: string, handler: WebSocketMessageHandlerCallback): void {
        const operation = this.findOperation(method);
        if (operation !== undefined) {
            operation.handlers.push(handler);
        } else {
            throw new Error(OPERATION_DOESNT_EXIST_ERROR);
        }
    }

    private onCloseHandler (event: CloseEvent): void {
        if (!event.wasClean) {
            this.reconnectInterval = setInterval(this.start, this.defaultInterval);
        }
    }

    private onMessageHandler (answer: MessageEvent): void {
        const answerDecoded = JSON.parse(answer.data);
        const operation = this.findOperation(answerDecoded.method);
        if (this.isValidWebSocketAnswer(answerDecoded) && operation !== undefined) {
            const { handlers, settings, method } = operation;
            if (handlers instanceof Array) {
                handlers.forEach(handler => {
                    handler(answerDecoded.data);
                });
                if (settings?.isOnce === true) {
                    this.removeOperation(method);
                }
            }
        }
    }

    private onOpenHandler (): void {
        clearInterval(this.reconnectInterval);
        this.operations.forEach(webSocketOperation => {
            if (webSocketOperation.settings?.isOnce !== true) {
                webSocketOperation.interval = setInterval(webSocketOperation.callback, webSocketOperation.settings?.interval ?? this.defaultInterval, this.webSocket);
            } else {
                webSocketOperation.callback();
            }
        });
    }

    private isValidWebSocketAnswer (answer: unknown): answer is WebSocketAnswerDecoded {
        return typeof answer === 'object' && answer !== null && 'method' in answer;
    }

    private findOperation (method: string): WebSocketOperation | undefined {
        return this.operations.find(webSocketExistingOperation => webSocketExistingOperation.method === method);
    }

    private checkOperationUnique (method: string): boolean {
        return this.findOperation(method) === undefined;
    }

    private isAvailableToSendMessages (): boolean {
        return this.webSocketInstance.readyState === WebSocket.OPEN;
    }

    private isOpen (): boolean {
        return this.openWebSocketStatuses.includes(this.webSocketInstance?.readyState);
    }

    private isClosed (): boolean {
        return this.closeWebSocketStatuses.includes(this.webSocketInstance?.readyState);
    }

    private isWebSocket (instance: unknown): instance is WebSocket {
        return instance instanceof WebSocket || this.isTesting;
    }
}

export default WebSocketManager;
export { type WebSocketAnswerDecoded, type WebSocketCallback, type WebSocketMessageHandlerCallback, type WebSocketOperation };
export const OPERATION_DOESNT_EXIST_ERROR = 'Operation doesn\'t exist';
export const DEFAULT_SOCKET_INTERVAL = 3000;
