import { type WebSocketAnswerDecoded, type WebSocketCallback, type WebSocketMessageHandlerCallback, type WebSocketOperation } from './websocket.interface';

class WebSocketManager {
    private readonly isTesting: boolean = false;

    private webSocketInstance!: WebSocket;
    private readonly operations: WebSocketOperation[] = [];
    private readonly defaultInterval: number = 3000;
    private reconnectInterval!: number | NodeJS.Timer;
    private readonly openWebSocketStatuses: number[] = [WebSocket.CONNECTING, WebSocket.OPEN];
    private readonly closeWebSocketStatuses: number[] = [WebSocket.CLOSING, WebSocket.CLOSED];
    private readonly wss: string;

    constructor (webSocketUrl: string) {
        this.wss = webSocketUrl;
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

    public addOperation (method: string, callback: WebSocketCallback, handler: WebSocketMessageHandlerCallback): void {
        if (this.checkOperationUnique(method)) {
            const operationInterval = this.isOpen() ? setInterval(callback, this.defaultInterval, this.webSocket) : 0;
            this.operations.push({
                method,
                callback,
                handlers: [handler],
                interval: operationInterval
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
        if (this.isValidWebSocketAnswer(answerDecoded)) {
            const handlers = this.findOperation(answerDecoded.method)?.handlers;
            if (handlers instanceof Array) {
                handlers.forEach(handler => {
                    handler(answerDecoded.data);
                });
            }
        }
    }

    private onOpenHandler (): void {
        clearInterval(this.reconnectInterval);
        this.operations.forEach(webSocketOperation => {
            webSocketOperation.interval = setInterval(webSocketOperation.callback, this.defaultInterval, this.webSocket);
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
