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
});

//     test('checkOperationUnique', () => {
//         const websocket = new WebSocketManager('test');

//         websocket.addOperation('test', () => ({ data: 123 }), () => { });

//         // @ts-expect-error
//         expect(websocket.checkOperationUnique('test')).toBeFalsy();
//     });

//     test('findOperation', () => {
//         const websocket = new WebSocketManager('test');

//         const checkCallback = (): object => ({ data: 123 });

//         websocket.addOperation('test', checkCallback, () => { });

//         // @ts-expect-error
//         expect(websocket.findOperation('test')?.method).toBe('test');
//     });

//     test('isValidWebSocketAnswer', () => {
//         const websocket = new WebSocketManager('test');

//         // @ts-expect-error
//         expect(websocket.isValidWebSocketAnswer({ name: 'invalid' })).toBeFalsy();
//         // @ts-expect-error
//         expect(websocket.isValidWebSocketAnswer({ name: 'valid', method: 'check' })).toBeTruthy();
//     });

//     test('addHandler', () => {
//         const websocket = new WebSocketManager('test');

//         websocket.addOperation('test', () => ({ data: 123 }), () => { });
//         // @ts-expect-error
//         websocket.addHandler('test', () => { });

//         // @ts-expect-error
//         expect(websocket.findOperation('test')?.handlers.length).toBe(2);
//         // @ts-expect-error
//         expect(() => { websocket.addHandler('error', () => { }); }).throw(OPERATION_DOESNT_EXIST_ERROR);
//     });

//     test('removeHandler', () => {
//         const websocket = new WebSocketManager('test');

//         const testHandler = (): void => { };
//         const testHandler2 = (): void => { };

//         websocket.addOperation('test', () => ({ data: 123 }), testHandler);
//         websocket.addOperation('test', () => ({ data: 123 }), testHandler2);
//         websocket.removeHandler('test', testHandler2);
//         // @ts-expect-error
//         expect(websocket.findOperation('test')?.handlers.length).toBe(1);
//         websocket.removeHandler('test', testHandler);
//         // @ts-expect-error
//         expect(() => { websocket.addHandler('error', () => { }); }).throw(OPERATION_DOESNT_EXIST_ERROR);
//     });

//     test('removeOperation', () => {
//         const websocket = new WebSocketManager('test');

//         websocket.addOperation('test', () => ({ data: 123 }), () => { });
//         websocket.removeOperation('test');

//         // @ts-expect-error
//         expect(websocket.findOperation('test')).toBe(undefined);
//         expect(() => { websocket.removeOperation('test'); }).throw(OPERATION_DOESNT_EXIST_ERROR);
//     });

//     test('addOperation', () => {
//         const websocket = new WebSocketManager('test');

//         websocket.addOperation('test', () => ({ data: 123 }), () => { });

//         // @ts-expect-error
//         expect(websocket.findOperation('test')?.handlers.length).equal(1);

//         websocket.addOperation('test', () => ({ data: 123 }), () => { });

//         // @ts-expect-error
//         const operation = websocket.findOperation('test');

//         expect(operation?.handlers.length).equal(2);
//         expect(operation?.interval).equal(0);
//         // @ts-expect-error
//         websocket.webSocket.readyState = 1;

//         const spy = vi.fn();

//         websocket.addOperation('test2', spy, () => { }, { isOnce: false });
//         websocket.addOperation('test3', () => ({}), () => { }, { isOnce: true });

//         vi.advanceTimersToNextTimer();

//         expect(webSocketSpy.send).toHaveBeenCalledOnce();

//         expect(spy).toHaveBeenCalledOnce();
//         // @ts-expect-error
//         expect(websocket.findOperation('test2')?.interval).not.toBe(0);
//         // @ts-expect-error
//         expect(websocket.findOperation('test3')?.interval).toBe(0);
//     });

//     test('setOnOpenHandler', () => {
//         const webSocket = new WebSocketManager('test');

//         const spy = vi.fn();
//         const spy2 = vi.fn();

//         webSocket.addOperation('test', spy, () => { }, { isOnce: false });
//         webSocket.addOperation('test2', spy2, () => { }, { isOnce: true });

//         // @ts-expect-error
//         webSocket.onOpenHandler();

//         vi.advanceTimersToNextTimer();

//         expect(spy).toHaveBeenCalledOnce();
//         // @ts-expect-error
//         expect(webSocket.findOperation('test')?.interval).not.toBe(0);

//         // @ts-expect-error
//         expect(webSocket.findOperation('test2')?.interval).toBe(0);
//     });

//     test('onMessageHandler', () => {
//         const webSocket = new WebSocketManager('test');

//         const spy = vi.fn();

//         webSocket.addOperation('test', () => ({ data: 123 }), spy);
//         webSocket.addOperation('test2', () => ({ data: 123 }), spy, { isOnce: true });

//         const fixture = { method: 'test', data: { data: 'test' } };
//         const fixture2 = { method: 'test2', data: { data: 'test' } };

//         // @ts-expect-error
//         webSocket.onMessageHandler({ data: JSON.stringify(fixture) });
//         expect(spy).toHaveBeenCalledOnce();
//         // @ts-expect-error
//         webSocket.onMessageHandler({ data: JSON.stringify(fixture2) });
//         // @ts-expect-error
//         expect(webSocket.findOperation('test2')).toBe(undefined);
//     });

//     test('onCloseHandler', () => {
//         const webSocket = new WebSocketManager('test');

//         // @ts-expect-error
//         webSocket.onCloseHandler({ wasClean: true });
//         // @ts-expect-error
//         expect(webSocket.reconnectInterval).equal(undefined);
//         // @ts-expect-error
//         webSocket.onCloseHandler({ wasClean: false });
//         // @ts-expect-error
//         expect(webSocket.reconnectInterval).not.equal(undefined);
//     });

//     test('start', () => {
//         const webSocket = new WebSocketManager('test');

//         // @ts-expect-error
//         webSocket.isTesting = true;

//         webSocket.start();

//         expect(WebSocket).toHaveBeenCalledOnce();
//     });

//     test('stop', () => {
//         const webSocket = new WebSocketManager('test');

//         // @ts-expect-error
//         webSocket.isTesting = true;

//         webSocket.addOperation('test', () => ({ data: 123 }), () => { });

//         webSocket.start();
//         webSocket.stop();

//         expect(webSocketSpy.close).toHaveBeenCalledTimes(1);

//         // @ts-expect-error
//         expect(webSocket.findOperation('test')?.interval).equal(0);
//     });

//     test('settings', () => {
//         const webSocket = new WebSocketManager('test');

//         // @ts-expect-error
//         expect(webSocket.defaultInterval).equal(DEFAULT_SOCKET_INTERVAL);

//         const webSocket2 = new WebSocketManager('test', {
//             interval: 1000
//         });

//         // @ts-expect-error
//         expect(webSocket2.defaultInterval).equal(1000);
//     });

//     test('sendMessage', () => {
//         const webSocket = new WebSocketManager('test');

//         webSocket.sendMessage('test', { test: 'test' }, () => { });

//         // @ts-expect-error
//         expect(webSocket.findOperation('test')?.settings?.isOnce).toBeTruthy();
//     });
// });
