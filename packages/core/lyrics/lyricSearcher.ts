import type { LrcJsonData } from "lrc-parser-ts";

export default function createLyricsSearcher(lrc: LrcJsonData): (progress: number) => number {
    if (!lrc || !lrc.scripts) return () => 0;
    const startTimes: number[] = lrc.scripts.map(script => script.start);
    const endTimes: number[] = lrc.scripts.map(script => script.end);

    return function(progress: number): number {
        // 使用二分查找定位 progress 对应的歌词索引
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

        // 循环结束后，检查 left 索引
        if (left < startTimes.length && startTimes[left] > progress && (left === 0 || endTimes[left - 1] <= progress)) {
            return left;
        }

        // 如果没有找到确切的 progress，返回小于等于 progress 的最大索引
        return Math.max(0, right);
    };
}