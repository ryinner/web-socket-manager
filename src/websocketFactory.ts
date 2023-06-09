import WebSocketManager from './websocket';
import type { OperationsHandler, WebSocketManagerSettings, WebSocketSend } from './websocket.interface';

type WebSocketsConnections<T> = Map<keyof T, WebSocketManager>;

class WebSocketList<T> {
    private readonly webSockets: WebSocketsConnections<T> = new Map();

    constructor (settings: Record<keyof T, WebSocketManagerSettings>) {
        for (const id in settings) {
            if (Object.prototype.hasOwnProperty.call(settings, id)) {
                const wsSettings = settings[id];
                this.webSockets.set(id, new WebSocketManager(wsSettings));
            }
        }
    }

    public getConnection (id: keyof T): WebSocketManager {
        const webSocket = this.webSockets.get(id);
        if (webSocket !== undefined) {
            return webSocket;
        }
        throw new Error(WS_DOESNT_EXISTS);
    }

    public addOperation (id: keyof T, operationSetting: WebSocketSend): void {
        this.getConnection(id).addOperation(operationSetting);
    }

    public removeOperation (id: keyof T, method: string): void {
        this.getConnection(id).removeOperation(method);
    }

    public removeHandler (id: keyof T, method: string, handler: OperationsHandler): void {
        this.getConnection(id).removeHandler(method, handler);
    }
}

function createWebSocket <T extends Record<string, WebSocketManagerSettings>> (webSocketSettings: T): WebSocketList<T>;
function createWebSocket (webSocketSettings: WebSocketManagerSettings): WebSocketManager;
function createWebSocket <T extends Record<string, WebSocketManagerSettings>> (webSocketSettingsOneOrMultiply: WebSocketManagerSettings | T): WebSocketList<T> | WebSocketManager {
    if (isWebSocketSettings(webSocketSettingsOneOrMultiply)) {
        return new WebSocketManager(webSocketSettingsOneOrMultiply);
    } else {
        return new WebSocketList<T>(webSocketSettingsOneOrMultiply);
    }
}

function isWebSocketSettings (settings: object): settings is WebSocketManagerSettings {
    return 'url' in settings && typeof settings.url === 'string';
}

export default createWebSocket;
export const WS_DOESNT_EXISTS = 'WebSocket doesn\'t exists';
