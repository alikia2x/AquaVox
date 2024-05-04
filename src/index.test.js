import { describe, it, expect } from 'vitest';
import formatDuration from '$lib/formatDuration';

describe('formatDuration test', () => {
    it('converts 120 seconds to "2:00"', () => {
        expect(formatDuration(120)).toBe('2:00');
    });

    it('converts 185 seconds to "3:05"', () => {
        expect(formatDuration(185)).toBe('3:05');
    });

    it('converts 601 seconds to "10:01"', () => {
        expect(formatDuration(601)).toBe('10:01');
    });

    it('converts 3601 seconds to "1:00:01"', () => {
        expect(formatDuration(3601)).toBe('1:00:01');
    });
});