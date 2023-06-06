/* eslint-disable @typescript-eslint/ban-ts-comment */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import WebSocketManager, { DEFAULT_SOCKET_INTERVAL, OPERATION_DOESNT_EXIST_ERROR } from './websocket';

type Writable<T> = T extends object ? { -readonly [K in keyof T]: Writable<T[K]> } : T;

type WebSocketMock = Partial<Writable<WebSocket>>;

const webSocketSpy = {
    onmessage: vi.fn(),
    onerror: vi.fn(),
    onclose: vi.fn(),
    onopen: vi.fn(),
    close: vi.fn(),
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
        const webSocket = new WebSocketManager('test');

        // @ts-expect-error
        webSocket.webSocketInstance = { readyState: 1 };

        // @ts-expect-error
        expect(webSocket.isOpen()).toBeTruthy();
    });

    test('isClosed', () => {
        const webSocket = new WebSocketManager('test');

        // @ts-expect-error
        webSocket.webSocketInstance = { readyState: 3 };

        // @ts-expect-error
        expect(webSocket.isClosed()).toBeTruthy();
    });

    test('checkOperationUnique', () => {
        const websocket = new WebSocketManager('test');

        websocket.addOperation('test', () => { }, () => { });

        // @ts-expect-error
        expect(websocket.checkOperationUnique('test')).toBeFalsy();
    });

    test('findOperation', () => {
        const websocket = new WebSocketManager('test');

        const checkCallback = (): void => { };

        websocket.addOperation('test', checkCallback, () => { });

        // @ts-expect-error
        expect(websocket.findOperation('test')?.callback).toBe(checkCallback);
    });

    test('isValidWebSocketAnswer', () => {
        const websocket = new WebSocketManager('test');

        // @ts-expect-error
        expect(websocket.isValidWebSocketAnswer({ name: 'invalid' })).toBeFalsy();
        // @ts-expect-error
        expect(websocket.isValidWebSocketAnswer({ name: 'valid', method: 'check' })).toBeTruthy();
    });

    test('addHandler', () => {
        const websocket = new WebSocketManager('test');

        websocket.addOperation('test', () => { }, () => { });
        // @ts-expect-error
        websocket.addHandler('test', () => { });

        // @ts-expect-error
        expect(websocket.findOperation('test')?.handlers.length).toBe(2);
        // @ts-expect-error
        expect(() => { websocket.addHandler('error', () => { }); }).throw(OPERATION_DOESNT_EXIST_ERROR);
    });

    test('removeHandler', () => {
        const websocket = new WebSocketManager('test');

        const testHandler = (): void => { };
        const testHandler2 = (): void => { };

        websocket.addOperation('test', () => { }, testHandler);
        websocket.addOperation('test', () => { }, testHandler2);
        websocket.removeHandler('test', testHandler2);
        // @ts-expect-error
        expect(websocket.findOperation('test')?.handlers.length).toBe(1);
        websocket.removeHandler('test', testHandler);
        // @ts-expect-error
        expect(() => { websocket.addHandler('error', () => { }); }).throw(OPERATION_DOESNT_EXIST_ERROR);
    });

    test('removeOperation', () => {
        const websocket = new WebSocketManager('test');

        websocket.addOperation('test', () => { }, () => { });
        websocket.removeOperation('test');

        // @ts-expect-error
        expect(websocket.findOperation('test')).toBe(undefined);
        expect(() => { websocket.removeOperation('test'); }).throw(OPERATION_DOESNT_EXIST_ERROR);
    });

    test('addOperation', () => {
        const websocket = new WebSocketManager('test');

        websocket.addOperation('test', () => {}, () => { });

        // @ts-expect-error
        expect(websocket.findOperation('test')?.handlers.length).equal(1);

        websocket.addOperation('test', () => {}, () => { });

        // @ts-expect-error
        const operation = websocket.findOperation('test');

        expect(operation?.handlers.length).equal(2);
        expect(operation?.interval).equal(0);
        // @ts-expect-error
        websocket.webSocket.readyState = 1;

        const spy = vi.fn();

        websocket.addOperation('test2', spy, () => { });

        vi.advanceTimersToNextTimer();

        expect(spy).toHaveBeenCalledOnce();
    });

    test('setOnOpenHandler', () => {
        const webSocket = new WebSocketManager('test');

        const spy = vi.fn();

        webSocket.addOperation('test', spy, () => {});

        // @ts-expect-error
        webSocket.onOpenHandler();

        vi.advanceTimersToNextTimer();

        expect(spy).toHaveBeenCalledOnce();
    });

    test('onMessageHandler', () => {
        const webSocket = new WebSocketManager('test');

        const spy = vi.fn();

        webSocket.addOperation('test', () => {}, spy);

        const fixture = { method: 'test', data: { data: 'test' } };

        // @ts-expect-error
        webSocket.onMessageHandler({ data: JSON.stringify(fixture) });
        expect(spy).toHaveBeenCalledOnce();
    });

    test('onCloseHandler', () => {
        const webSocket = new WebSocketManager('test');

        // @ts-expect-error
        webSocket.onCloseHandler({ wasClean: true });
        // @ts-expect-error
        expect(webSocket.reconnectInterval).equal(undefined);
        // @ts-expect-error
        webSocket.onCloseHandler({ wasClean: false });
        // @ts-expect-error
        expect(webSocket.reconnectInterval).not.equal(undefined);
    });

    test('start', () => {
        const webSocket = new WebSocketManager('test');

        // @ts-expect-error
        webSocket.isTesting = true;

        webSocket.start();

        expect(WebSocket).toHaveBeenCalledOnce();
    });

    test('stop', () => {
        const webSocket = new WebSocketManager('test');

        // @ts-expect-error
        webSocket.isTesting = true;

        webSocket.addOperation('test', () => {}, () => {});

        webSocket.start();
        webSocket.stop();

        expect(webSocketSpy.close).toHaveBeenCalledTimes(1);

        // @ts-expect-error
        expect(webSocket.findOperation('test')?.interval).equal(0);
    });

    test('settings', () => {
        const webSocket = new WebSocketManager('test');

        // @ts-expect-error
        expect(webSocket.defaultInterval).equal(DEFAULT_SOCKET_INTERVAL);

        const webSocket2 = new WebSocketManager('test', {
            interval: 1000
        });

        // @ts-expect-error
        expect(webSocket2.defaultInterval).equal(1000);
    });
});
