import type { LyricLine } from "@applemusic-like-lyrics/core";
import {
	type LyricLine as RawLyricLine,
	parseLrc,
	parseYrc,
	parseLys,
	parseQrc,
} from "@applemusic-like-lyrics/lyric";

export const mapLyric = (line: RawLyricLine, i: number, lines: RawLyricLine[]): LyricLine => ({
    words: line.words,
    startTime: line.words[0]?.startTime ?? 0,
    endTime: line.words[line.words.length - 1]?.endTime ?? Infinity,
    translatedLyric: '',
    romanLyric: '',
    isBG: false,
    isDuet: false
});
