import type { LyricLine } from '@applemusic-like-lyrics/core';
import type { ScriptItem } from '$lib/lyrics/LRCparser';

export default function mapLRCtoAMLL(line: ScriptItem, i: number, lines: ScriptItem[]): LyricLine {
    return {
        words: [
            {
                word: line.text,
                startTime: line.start * 1000,
                endTime: line.end * 1000
            }
        ],
        startTime: line.start * 1000,
        endTime: line.end * 1000,
        translatedLyric: line.translation ?? "",
        romanLyric: '',
        isBG: false,
        isDuet: false
    };
}
