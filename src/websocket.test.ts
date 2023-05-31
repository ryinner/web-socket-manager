import { afterEach, describe, expect, test, vi } from 'vitest';
import WebSocketManager from './websocket';

type Writable<T> = T extends object ? { -readonly [K in keyof T]: Writable<T[K]> } : T;

type WebSocketMock = Partial<Writable<WebSocket>> & { OPEN?: number };

const mockWebSocket = <WebSocketMock> vi.fn<[], WebSocketMock>(() => ({
    onmessage: vi.fn(),
    onerror: vi.fn(),
    readyState: 1
}));

mockWebSocket.CONNECTING = 0;
mockWebSocket.OPEN = 1;
mockWebSocket.CLOSING = 2;
mockWebSocket.CLOSED = 3;

vi.stubGlobal('WebSocket', mockWebSocket);
describe('WebsocketManager', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('start', () => {
        const webSocket = new WebSocketManager('test');

        webSocket.start();

        expect(WebSocket).toHaveBeenCalledOnce();
    });

    test('stop', () => {
        const webSocket = new WebSocketManager('test');

        webSocket.start();
        webSocket.stop();

        expect(WebSocket).toHaveBeenCalledTimes(1);
    });
});
