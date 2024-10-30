import { describe, it, expect } from 'vitest';
import { safePath } from '@core/server/safePath.js';

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