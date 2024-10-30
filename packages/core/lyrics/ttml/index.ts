import type { LrcJsonData } from '../type';
import { parseTTML as ttmlParser } from './parser';
import type { LyricLine } from './ttml-types';

export type * from './ttml-types';

export function parseTTML(text: string) {
    let lyrics: LrcJsonData;
    const lyricLines = ttmlParser(text).lyricLines;
    lyrics = {
        scripts: lyricLines.map((value: LyricLine, index: number, array: LyricLine[]) => {
            let words = value.words.length == 0 ? undefined : value.words;
            if (words) {
                words = words.map((word) => {
                    let r = word;
                    r.startTime /= 1000;
                    r.endTime /= 1000;
                    return r;
                });
            }
            return {
                text: value.words.map((word) => word.word).join(''),
                start: value.startTime / 1000,
                end: value.endTime / 1000,
                translation: value.translatedLyric || undefined,
                singer: value.singer || undefined,
                words: words
            };
        })
    };
    return lyrics;
}
