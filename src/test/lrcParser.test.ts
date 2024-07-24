import { describe, expect, it } from 'vitest';
import fs from 'fs';
import { ExtractIDTags, splitLine } from '$lib/lyrics/parser';

describe('LRC parser test', () => {
    const test01Buffer = fs.readFileSync('./src/test/resources/test-01.lrc');
    const test01Text = test01Buffer.toString('utf-8');
    it('Line Split', () => {
        const lyrics = test01Text;
        const lines = splitLine(lyrics);
        expect(lines[26]).toBe('[01:52.991]');
    });
    it('IDTag Extract', () => {
        const lyrics = test01Text;
        const lines = splitLine(lyrics);
        const idTags = ExtractIDTags(lines);
        expect(idTags['ar']).toBe('洛天依');
    });
});