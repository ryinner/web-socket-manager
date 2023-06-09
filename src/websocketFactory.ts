import WebSocketManager from './websocket';
import type { WebSocketManagerSettings } from './websocket.interface';

type WebSocketsConnections<T> = Record<keyof T, WebSocketManager>;

class WebSocketList<T> {
    private readonly webSockets!: WebSocketsConnections<T>;

    constructor (settings: Record<keyof T, WebSocketManagerSettings>) {
        for (const id in settings) {
            if (Object.prototype.hasOwnProperty.call(settings, id)) {
                const wsSettings = settings[id];
                this.webSockets[id] = new WebSocketManager(wsSettings);
            }
        }
    }

    public getConnection (id: keyof T): WebSocketManager {
        return this.webSockets[id];
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
