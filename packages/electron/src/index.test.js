import { describe, it, expect } from 'vitest';
import formatDuration from '$lib/utils/formatDuration.js';
import { safePath } from '$lib/server/safePath';

describe('formatDuration test', () => {
    it('converts 120 seconds to "2:00"', () => {
        expect(formatDuration(120)).toBe('2:00');
    });

    it('converts 119.935429 seconds to "1:59"', () => {
        expect(formatDuration(119.935429)).toBe('1:59');
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

describe('safePath test', () => {
    const base = "data/subdir";
    it('rejects empty string', () => {
        expect(safePath('', { base })).toBe(null);
    });
    it('accepts a regular path', () => {
        expect(safePath('subsubdir/file.txt', { base })).toBe('data/subdir/subsubdir/file.txt');
    });
    it('rejects path with ..', () => {
        expect(safePath('../file.txt', { base })).toBe(null);
    });
    it('accepts path with .', () => {
        expect(safePath('./file.txt', { base })).toBe('data/subdir/file.txt');
    });
    it('accepts path traversal within base', () => {
        expect(safePath('subsubdir/../file.txt', { base })).toBe('data/subdir/file.txt');
    });
    it('rejects path with subdir if noSubDir is true', () => {
        expect(safePath('subsubdir/file.txt', { base, noSubDir: true })).toBe(null);
    });
});