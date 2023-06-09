/* eslint-disable @typescript-eslint/ban-ts-comment */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import WebSocketManager from './websocket';

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

vi.stubGlobal('WebSocket', mockWebSocket);
describe('WebsocketManager', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('isOpen', () => {
        const webSocket = new WebSocketManager({ url: 'wss' });

        // @ts-expect-error
        webSocket.webSocketInstance = { readyState: mockWebSocket.OPEN };

        // @ts-expect-error
        expect(webSocket.isOpen()).toBeTruthy();
    });

    test('isClose', () => {
        const webSocket = new WebSocketManager({ url: 'wss' });

        // @ts-expect-error
        webSocket.webSocketInstance = { readyState: mockWebSocket.CLOSED };

        // @ts-expect-error
        expect(webSocket.isClose()).toBeTruthy();
    });

    test('isClosing', () => {
        const webSocket = new WebSocketManager({ url: 'wss' });

        // @ts-expect-error
        webSocket.webSocketInstance = { readyState: mockWebSocket.CLOSING };

        // @ts-expect-error
        expect(webSocket.isClosing()).toBeTruthy();
    });

    test('isValidWebSocketAnswer', () => {
        const webSocket = new WebSocketManager({ url: 'wss' });

        // @ts-expect-error
        expect(webSocket.isValidWebSocketAnswer({ method: test })).toBeTruthy();
    });

    test('isIntervaledOperation', () => {
        const webSocket = new WebSocketManager({ url: 'wss' });

        // @ts-expect-error
        expect(webSocket.isIntervaledOperation({ method: test, interval: true })).toBeTruthy();
    });

    test('isWebSocket', () => {
        const webSocket = new WebSocketManager({ url: 'wss' });

        // @ts-expect-error
        expect(webSocket.isWebSocket()).toBeFalsy();

        // @ts-expect-error
        webSocket.isTesting = true;
        // @ts-expect-error
        expect(webSocket.isWebSocket()).toBeTruthy();
    });

    test('pickOperationStrategy', () => {
        const webSocket = new WebSocketManager({ url: 'wss' });

        webSocket.addOperation({
            method: 'test',
            request: () => ({}),
            interval: true
        });
        webSocket.addOperation({
            method: 'test2',
            request: () => ({})
        });
        webSocket.addOperation({
            method: 'test3',
            request: () => ({}),
            interval: 1000
        });
        // @ts-expect-error
        webSocket.onOpenHandler();
        // @ts-expect-error
        const firstOperation = webSocket.findOperation('test');
        // @ts-expect-error
        expect(firstOperation._interval).not.toBe(undefined);
        // @ts-expect-error
        expect(webSocket.findOperation('test2')._interval).toBe(undefined);
        // @ts-expect-error
        expect(webSocket.findOperation('test3').interval).toBe(1000);
    });

    test('onErrorHandler', () => {
        const webSocket = new WebSocketManager({ url: 'wss' });
        // @ts-expect-error
        webSocket.onErrorHandler({});

        expect(webSocketSpy.close).toHaveBeenCalledOnce();
    });

    test('onMessageHandler', () => {
        const webSocket = new WebSocketManager({ url: 'wss' });

        const spy = vi.fn();

        webSocket.addOperation({
            method: 'test',
            request: () => ({ data: 123 }),
            handlers: [spy]
        });

        const fixture = { method: 'test', data: { data: 'test' } };

        // @ts-expect-error
        webSocket.onMessageHandler({ data: JSON.stringify(fixture) });
        expect(spy).toHaveBeenCalledOnce();
    });

    test('onCloseHandler', () => {
        const webSocket = new WebSocketManager({ url: 'wss' });
        webSocket.addOperation({
            method: 'test',
            request: () => ({ data: 123 }),
            handlers: [() => {}],
            interval: true
        });
        // @ts-expect-error
        webSocket.onOpenHandler();
        // @ts-expect-error
        webSocket.onCloseHandler({ wasClean: true });
        // @ts-expect-error
        expect(webSocket.reconnectInterval).equal(undefined);
        // @ts-expect-error
        webSocket.onCloseHandler({ wasClean: false });
        // @ts-expect-error
        expect(webSocket.reconnectInterval).not.equal(undefined);
        // @ts-expect-error
        expect(webSocket.findOperation('test')._interval).not.toBe(0);
    });

    test('addHandlers', () => {
        const webSocket = new WebSocketManager({ url: 'wss' });
        webSocket.addOperation({
            method: 'test',
            request: () => ({ data: 123 }),
            interval: true
        });
        // @ts-expect-error
        const operation = webSocket.findOperation('test');
        // @ts-expect-error
        webSocket.addHandlers(operation, [() => {}]);
        expect(operation?.handlers?.length).toBe(1);
    });

    test('removeHandler', () => {
        const webSocket = new WebSocketManager({ url: 'wss' });
        const handler = (): void => {};
        webSocket.addOperation({
            method: 'test',
            request: () => ({ data: 123 }),
            handlers: [handler]
        });
        webSocket.removeHandler('test', handler);
        // @ts-expect-error
        expect(webSocket.findOperation('test')?.handlers?.length).toBe(0);
    });

    test('removeOperation', () => {
        const webSocket = new WebSocketManager({ url: 'wss' });
        webSocket.addOperation({
            method: 'test',
            request: () => ({ data: 123 })
        });
        webSocket.removeOperation('test');
        // @ts-expect-error
        expect(webSocket.findOperation('test')).toBe(undefined);
    });

    test('addOperation', () => {
        const webSocket = new WebSocketManager({ url: 'wss' });
        webSocket.addOperation({
            method: 'test',
            request: () => ({ data: 123 }),
            handlers: [() => {}]
        });
        webSocket.addOperation({
            method: 'test',
            request: () => ({ data: 123 }),
            handlers: [() => {}]
        });
        // @ts-expect-error
        const operation = webSocket.findOperation('test');
        expect(operation).not.toBe(undefined);
        expect(operation?.handlers?.length).toBe(2);
    });

    test('getWs', () => {
        const webSocket = new WebSocketManager({ url: 'wss' });
        // @ts-expect-error
        webSocket.webSocketInstance = { readyState: mockWebSocket.OPEN };
        // @ts-expect-error
        webSocket.isTesting = true;

        webSocket.open();

        expect(mockWebSocket).toHaveBeenCalledTimes(0);

        // @ts-expect-error
        webSocket.webSocketInstance = { readyState: mockWebSocket.CLOSED };

        webSocket.open();

        expect(mockWebSocket).toHaveBeenCalledTimes(1);
    });
});
