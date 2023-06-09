/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, expect, test, vi } from 'vitest';
import { mockWebSocket } from './__mocks__/WebSocket';
import WebSocketManager from './websocket';
import createWebSocket, { WS_DOESNT_EXISTS } from './websocketFactory';

vi.stubGlobal('WebSocket', mockWebSocket);
describe('websocketFactory', () => {
    test('print one', () => {
        const wsManager = createWebSocket({ url: 'test' });

        expect(wsManager).toBeInstanceOf(WebSocketManager);
    });

    test('print many', () => {
        const wsList = createWebSocket({ test: { url: 'test' } });

        expect(wsList.getConnection('test')).toBeInstanceOf(WebSocketManager);
    });

    test('wsList removeHandler', () => {
        const wsList = createWebSocket({ test: { url: 'test' } });
        const handler = (): void => {};
        wsList.addOperation('test', {
            method: 'test',
            request: () => ({}),
            handlers: [handler]
        });
        wsList.removeHandler('test', 'test', handler);
        // @ts-expect-error
        expect(wsList.getConnection('test').findOperation('test')?.handlers?.length).toBe(0);
    });

    test('wsList addOperation', () => {
        const wsList = createWebSocket({ test: { url: 'test' } });
        wsList.addOperation('test', {
            method: 'test',
            request: () => ({}),
            handlers: [() => {}]
        });
        // @ts-expect-error
        expect(wsList.getConnection('test').findOperation('test')).not.toBe(undefined);
    });

    test('removeOperation', () => {
        const wsList = createWebSocket({ test: { url: 'test' } });
        wsList.addOperation('test', {
            method: 'test',
            request: () => ({}),
            handlers: [() => {}]
        });
        wsList.removeOperation('test', 'test');

        // @ts-expect-error
        expect(wsList.getConnection('test').findOperation('test')).toBe(undefined);
    });

    test('throw error if ws doesn\'t exists', () => {
        const wsList = createWebSocket({ test: { url: 'test' } });
        // @ts-expect-error
        expect(() => wsList.getConnection('test2')).toThrowError(WS_DOESNT_EXISTS);
    });
});
