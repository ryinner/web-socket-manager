import { describe, expect, test } from 'vitest';
import parseQueryParams from './parseQueryParams';

describe('parseQueryParams', () => {
    test('empty', () => {
        expect(parseQueryParams()).toBe('');
    });

    test('queryObject', () => {
        expect(parseQueryParams({ term: 'me' })).toBe('?term=me');
    });
});
