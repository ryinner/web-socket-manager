import parseQueryParams from './parseQueryParams';
import type { OperationsHandler, OperationsHandlers, WebSocketAnswerDecoded, WebSocketManagerSettings, WebSocketParsedOperation, WebSocketSend, WebSocketSendIntervaled } from './websocket.interface';

class WebSocketManager {
    private webSocketInstance?: WebSocket;
    private reconnectInterval!: number | NodeJS.Timer;
    private readonly operations = new Map<string, WebSocketParsedOperation>();

    private readonly wss!: string;
    private readonly defaultInterval!: number;
    // only for tests
    private readonly isTesting = false;

    private get ws (): WebSocket {
        if (!this.isWebSocket(this.webSocketInstance) || this.isClose()) {
            const openHandler = this.onOpenHandler.bind(this);
            const closeHandler = this.onCloseHandler.bind(this);
            const messageHandler = this.onMessageHandler.bind(this);
            const errorHandler = this.onErrorHandler.bind(this);

            this.webSocketInstance = new WebSocket(this.wss);
            this.webSocketInstance.onclose = closeHandler;
            this.webSocketInstance.onopen = openHandler;
            this.webSocketInstance.onmessage = messageHandler;
            this.webSocketInstance.onerror = errorHandler;
        }
        return this.webSocketInstance;
    }

    constructor (settings: WebSocketManagerSettings) {
        this.wss = settings.url + parseQueryParams(settings.additionalQueryParams);
        this.defaultInterval = settings.interval ?? DEFAULT_SOCKET_INTERVAL;
    }

    public open (): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.ws;
    }

    public close (): void {
        if (!this.isClose() && !this.isClosing()) {
            this.ws.close();
            clearInterval(this.reconnectInterval);
        }
    }

    public addOperation <T> (operationSetting: WebSocketSend <T>): void {
        const operation = this.findOperation(operationSetting.method);
        if (operation !== undefined && Array.isArray(operationSetting.handlers)) {
            this.addHandlers(operation, <OperationsHandlers> operationSetting.handlers);
        } else {
            const callback = (): void => {
                this.ws.send(JSON.stringify({ method: operationSetting.method, ...operationSetting.request() }));
            };
            this.operations.set(operationSetting.method, { ...<WebSocketSend> operationSetting, callback });
        }
        this.open();
    }

    public removeOperation (method: string): void {
        this.operations.delete(method);
    }

    public removeHandler (method: string, handler: OperationsHandler): void {
        const operation = this.findOperation(method);
        if (operation !== undefined && Array.isArray(operation?.handlers)) {
            const handlerIndex = operation.handlers.findIndex(existHandler => existHandler === handler);
            operation.handlers.splice(handlerIndex, 1);
        }
    }

    private findOperation (method: string): WebSocketParsedOperation | undefined {
        return this.operations.get(method);
    }

    private addHandlers (operation: WebSocketSend, handlers: OperationsHandlers): void {
        if (!Array.isArray(operation.handlers)) {
            operation.handlers = [];
        }
        operation.handlers.push(...handlers);
    }

    private onCloseHandler (event: CloseEvent): void {
        if (!event.wasClean) {
            this.reconnectInterval = setInterval(this.open, this.defaultInterval);
        }
        for (const operation of this.operations.values()) {
            if (this.isIntervaledOperation(operation)) {
                clearInterval(operation._interval);
            }
        }
    }

    private onOpenHandler (): void {
        clearInterval(this.reconnectInterval);
        for (const operation of this.operations.values()) {
            this.pickOperationStrategy(operation);
        }
    }

    private onMessageHandler (event: MessageEvent): void {
        const answer = JSON.parse(event.data);
        const operation = this.findOperation(answer.method);
        if (this.isValidWebSocketAnswer(answer) && operation !== undefined) {
            const { handlers } = operation;
            if (Array.isArray(handlers)) {
                handlers.forEach(handler => {
                    handler(answer.data);
                });
            }
        }
    }

    private onErrorHandler (error: Event): void {
        this.close();
        console.log(error);
    }

    private pickOperationStrategy (operation: WebSocketParsedOperation): void {
        if (this.isIntervaledOperation(operation)) {
            const interval = typeof operation.interval !== 'number' ? this.defaultInterval : operation.interval;
            operation._interval = setInterval(operation.callback, interval);
        } else {
            operation.callback();
        }
    }

    private isWebSocket (instance: unknown): instance is WebSocket {
        return instance instanceof WebSocket || this.isTesting;
    }

    private isClosing (): boolean {
        return this.webSocketInstance?.readyState === WebSocket.CLOSING;
    }

    private isClose (): boolean {
        return this.webSocketInstance?.readyState === WebSocket.CLOSED;
    }

    private isOpen (): boolean {
        return this.webSocketInstance?.readyState === WebSocket.OPEN;
    }

    private isIntervaledOperation (operation: WebSocketSend): operation is WebSocketSendIntervaled {
        return 'interval' in operation;
    }

    private isValidWebSocketAnswer (answer: unknown): answer is WebSocketAnswerDecoded {
        return typeof answer === 'object' && answer !== null && 'method' in answer;
    }
}

export default WebSocketManager;
export const DEFAULT_SOCKET_INTERVAL = 3000;
