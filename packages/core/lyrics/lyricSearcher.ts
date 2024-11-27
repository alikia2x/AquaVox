import type { LyricData } from "@alikia/aqualyrics";

export default function createLyricsSearcher(lrc: LyricData): (progress: number) => number {
    if (!lrc || !lrc.scripts) return () => 0;
    const startTimes: number[] = lrc.scripts.map(script => script.start);
    const endTimes: number[] = lrc.scripts.map(script => script.end);

    return function(progress: number): number {
        let left = 0;
        let right = startTimes.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);

            if (startTimes[mid] === progress) {
                return mid;
            } else if (startTimes[mid] < progress) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        if (left < startTimes.length && startTimes[left] > progress && (left === 0 || endTimes[left - 1] <= progress)) {
            return left;
        }

        return Math.max(0, right);
    };
}