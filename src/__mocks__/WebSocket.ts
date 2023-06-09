import { vi } from 'vitest';

type Writable<T> = T extends object ? { -readonly [K in keyof T]: Writable<T[K]> } : T;

type WebSocketMock = Partial<Writable<WebSocket>>;

const webSocketSpy = {
    onmessage: vi.fn(),
    onerror: vi.fn(),
    onclose: vi.fn(),
    onopen: vi.fn(),
    close: vi.fn(),
    send: vi.fn(),
    readyState: 1
};

const mockWebSocket = <WebSocketMock> vi.fn<[], WebSocketMock>(() => webSocketSpy);

mockWebSocket.CONNECTING = 0;
mockWebSocket.OPEN = 1;
mockWebSocket.CLOSING = 2;
mockWebSocket.CLOSED = 3;

export { webSocketSpy, mockWebSocket };
